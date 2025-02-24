import { flowConfig } from '../../config';

export const dailyPacks = (governanceContract: string, venezuelaNFTContract: string): string => {
    return `
        import ${venezuelaNFTContract} from ${flowConfig.venezuelaNFTAddress}
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}
        import NonFungibleToken from ${flowConfig.nonFungibleToken}
        import MetadataViews from ${flowConfig.metadataViews}
        import FlowToken from ${flowConfig.flowToken}
        import FungibleToken from ${flowConfig.fungibleToken}

        transaction() {

            prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {

                let collectionData = VenezuelaNFT_20.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
                    ?? panic("ViewResolver does not resolve NFTCollectionData view")
                // Check if the account already has a collection
                if signer.storage.borrow<&VenezuelaNFT_20.Collection>(from: collectionData.storagePath) == nil {
                    // Create a new empty collection
                    let collection <- VenezuelaNFT_20.createEmptyCollection(nftType: Type<@VenezuelaNFT_20.NFT>())
                    // save it to the account
                    signer.storage.save(<-collection, to: collectionData.storagePath)
                    // the old "unlink"
                    let oldLink = signer.capabilities.unpublish(collectionData.publicPath)
                    // create a public capability for the collection
                    let collectionCap = signer.capabilities.storage.issue<&VenezuelaNFT_20.Collection>(collectionData.storagePath)
                    signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
                }
                if signer.storage.type(at: VenezuelaNFT_20.ReceiptStoragePath) == nil {
                    let storage <- VenezuelaNFT_20.createEmptyStorage()
                    signer.storage.save(<- storage, to: VenezuelaNFT_20.ReceiptStoragePath)
                    // create a public capability for the storage
                    let storageCap = signer.capabilities.storage.issue<&VenezuelaNFT_20.ReceiptStorage>(VenezuelaNFT_20.ReceiptStoragePath)
                    signer.capabilities.publish(storageCap, at: VenezuelaNFT_20.ReceiptStoragePublic)
                }

                // Return early if the account already stores a Vzla-Arsenal resource
                if signer.storage.borrow<&Governance.Vzla_Arsenal>(from: Governance.ArsenalPath) == nil {
                    // create empty arsenal
                    let arsenal <- Governance.createEmptyArsenal()
                    // Store the Arsenal inside the signer's storage
                    signer.storage.save(<- arsenal, to: Governance.ArsenalPath)
                }
                // get ref to ReceiptStorage
                let storageRef = signer.storage.borrow<&VenezuelaNFT_20.ReceiptStorage>(from: VenezuelaNFT_20.ReceiptStoragePath)
                    ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT_20 ReceiptStorage")
                
                // Commit my bet and get a receipt
                storageRef.getDaily()
            }
        }
      `
}