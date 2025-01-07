// Constantes para las direcciones de los contratos
const STOREFRONT_ADDRESS = "0x94b06cfca1d8a476";
const NFT_CONTRACT_NAME = "VenezuelaNFT_14"; 

// Las transacciones Cadence necesitarán este import
const SETUP_STOREFRONT_TRANSACTION = `
  import NFTStorefront from ${STOREFRONT_ADDRESS}

  transaction {
    prepare(acct: auth(IssueStorageCapabilityController, PublishCapability, Storage) &Account) {
      if acct.storage.borrow<&NFTStorefront.Storefront>(from: NFTStorefront.StorefrontStoragePath) == nil {
        let storefront <- NFTStorefront.createStorefront()
        acct.storage.save(<-storefront, to: NFTStorefront.StorefrontStoragePath)
        
        let storefrontPublicCap = acct.capabilities.storage.issue<&{NFTStorefront.StorefrontPublic}>(
          NFTStorefront.StorefrontStoragePath
        )
        acct.capabilities.publish(storefrontPublicCap, at: NFTStorefront.StorefrontPublicPath)
      }
    }
  }
`;

const CREATE_LISTING_TRANSACTION = `
  import FlowToken from 0x7e60df042a9c0868
  import FungibleToken from 0x9a0766d93b6608b7
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import MetadataViews from 0x631e88ae7f1d7c20
  import NFTStorefront from ${STOREFRONT_ADDRESS}
  import ${NFT_CONTRACT_NAME} from 0x5643fd47a29770e8
transaction(
    saleItemID: UInt64,
    saleItemPrice: UFix64,
    customID: String?,
    commissionAmount: UFix64,
    marketplacesAddress: [Address]
) {
    
    let tokenReceiver: Capability<&{FungibleToken.Receiver}>
    let VenezuelaNFTProvider: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>
    let storefront: auth(NFTStorefront.CreateListing) &NFTStorefront.Storefront
    var saleCuts: [NFTStorefront.SaleCut]
    var marketplacesCapability: [Capability<&{FungibleToken.Receiver}>]

    prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        self.saleCuts = []
        self.marketplacesCapability = []

        let collectionData = ${NFT_CONTRACT_NAME}.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("ViewResolver does not resolve NFTCollectionData view")

        // Receiver for the sale cut.
        self.tokenReceiver = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        assert(self.tokenReceiver.borrow() != nil, message: "Missing or mis-typed FlowToken receiver")

        self.VenezuelaNFTProvider = acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                collectionData.storagePath
            )
        assert(self.VenezuelaNFTProvider.check(), message: "Missing or mis-typed VenezuelaNFT provider")

        let collection = acct.capabilities.borrow<&{NonFungibleToken.Collection}>(
                collectionData.publicPath
            ) ?? panic("Could not borrow a reference to the signer's collection")

        var totalRoyaltyCut = 0.0
        let effectiveSaleItemPrice = saleItemPrice - commissionAmount
        let nft = collection.borrowNFT(saleItemID)!
        // Check whether the NFT implements the MetadataResolver or not.
        if nft.getViews().contains(Type<MetadataViews.Royalties>()) {
            let royaltiesRef = nft.resolveView(Type<MetadataViews.Royalties>())?? panic("Unable to retrieve the royalties")
            let royalties = (royaltiesRef as! MetadataViews.Royalties).getRoyalties()
            for royalty in royalties {
                // TODO - Verify the type of the vault and it should exists
                self.saleCuts.append(
                    NFTStorefront.SaleCut(
                        receiver: royalty.receiver,
                        amount: royalty.cut * effectiveSaleItemPrice
                    )
                )
                totalRoyaltyCut = totalRoyaltyCut + (royalty.cut * effectiveSaleItemPrice)
            }
        }
        // Append the cut for the seller.
        self.saleCuts.append(
            NFTStorefront.SaleCut(
                receiver: self.tokenReceiver,
                amount: effectiveSaleItemPrice - totalRoyaltyCut
            )
        )

        self.storefront = acct.storage.borrow<auth(NFTStorefront.CreateListing) &NFTStorefront.Storefront>(
                from: NFTStorefront.StorefrontStoragePath
            ) ?? panic("Missing or mis-typed NFTStorefront Storefront")

        for marketplace in marketplacesAddress {
            // Here we are making a fair assumption that all given addresses would have
            // the capability to receive the FlowToken
            self.marketplacesCapability.append(
                getAccount(marketplace).capabilities.get<&{FungibleToken.Receiver}>(/public/FlowTokenReceiver)
            )
        }
    }

    execute {
        // Create listing
        let listingID = self.storefront.createListing(
            nftProviderCapability: self.VenezuelaNFTProvider,
            nftType: Type<@${NFT_CONTRACT_NAME}.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: self.saleCuts,
        )
    }
}`;

const PURCHASE_LISTING_TRANSACTION = `
  import FlowToken from 0x7e60df042a9c0868
  import FungibleToken from 0x9a0766d93b6608b7
  import NonFungibleToken from 0x631e88ae7f1d7c20
  import MetadataViews from 0x631e88ae7f1d7c20
  import NFTStorefront from ${STOREFRONT_ADDRESS}
  import ${NFT_CONTRACT_NAME} from 0x5643fd47a29770e8

transaction(listingResourceID: UInt64, storefrontAddress: Address, commissionRecipient: Address?) {

    let paymentVault: @{FungibleToken.Vault}
    let nftReceiver: &{NonFungibleToken.Receiver} // Updated variable name
    let storefront: &{NFTStorefront.StorefrontPublic}
    let listing: &{NFTStorefront.ListingPublic}
    var commissionRecipientCap: Capability<&{FungibleToken.Receiver}>?

    prepare(acct: auth(BorrowValue) &Account) {
        self.commissionRecipientCap = nil
        // Access the storefront public resource of the seller to purchase the listing.
        self.storefront = getAccount(storefrontAddress).capabilities.borrow<&{NFTStorefront.StorefrontPublic}>(
                NFTStorefront.StorefrontPublicPath
            ) ?? panic("Could not borrow Storefront from provided address")

        // Borrow the listing
        self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
            ?? panic("No Offer with that ID in Storefront")
        let price = self.listing.getDetails().salePrice

        // Access the vault of the buyer to pay the sale price of the listing.
        let mainVault = acct.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow FlowToken vault from acct storage")
        self.paymentVault <- mainVault.withdraw(amount: price)

        // Access the buyer's NFT collection to store the purchased NFT.
        let collectionData = ${NFT_CONTRACT_NAME}.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("ViewResolver does not resolve NFTCollectionData view")
        self.nftReceiver = acct.capabilities.borrow<&{NonFungibleToken.Receiver}>(collectionData.publicPath)
            ?? panic("Cannot borrow NFT collection receiver from account")

        // Fetch the commission amt.
        // let commissionAmount = self.listing.getDetails().commissionAmount

/*         if commissionRecipient != nil && commissionAmount != 0.0 {
            // Access the capability to receive the commission.
            let _commissionRecipientCap = getAccount(commissionRecipient!).capabilities.get<&{FungibleToken.Receiver}>(
                    /public/FlowTokenReceiver
                )
            assert(_commissionRecipientCap.check(), message: "Commission Recipient doesn't have FlowToken receiving capability")
            self.commissionRecipientCap = _commissionRecipientCap
        } else if commissionAmount == 0.0 {
            self.commissionRecipientCap = nil
        } else {
            panic("Commission recipient can not be empty when commission amount is non zero")
        } */
    }

    execute {
        // Purchase the NFT
        let item <- self.listing.purchase(
            payment: <-self.paymentVault,
        )
        // Deposit the NFT in the buyer's collection.
        self.nftReceiver.deposit(token: <-item)
    }
}
`;

export { SETUP_STOREFRONT_TRANSACTION, PURCHASE_LISTING_TRANSACTION, CREATE_LISTING_TRANSACTION}