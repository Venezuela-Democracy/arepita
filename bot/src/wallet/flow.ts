import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { flowConfig } from './config';
import { WalletResponse } from "./types";
import { CREATE_LISTING_TRANSACTION, PURCHASE_LISTING_TRANSACTION, SETUP_STOREFRONT_TRANSACTION } from "./transactions";

export class FlowWallet {
  // -------------------------
  // Private Constants
  // -------------------------
  private INITIAL_FUNDING = "50.0";
  private NFT_CONTRACT_NAME = "VenezuelaNFT_19";

  // -------------------------
  // Private Variables
  // -------------------------
  private ec: EC;
  private serviceAccount: typeof flowConfig.serviceAccount;

  constructor() {
    this.ec = new EC('p256');
    this.serviceAccount = flowConfig.serviceAccount;
  }

  // -------------------------
  // Private Helper Methods
  // -------------------------

  // Signs a message with the provided private key using SHA3 and elliptic curve.
  private signWithKey(privateKey: string, message: string): string {
    const hash = new SHA3(256);
    hash.update(Buffer.from(message, 'hex'));
    const msgHash = hash.digest();
    
    const key = this.ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
    const sig = key.sign(msgHash);
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, 'be', n);
    const s = sig.s.toArrayLike(Buffer, 'be', n);
    return Buffer.concat([r, s]).toString('hex');
  }

  // Returns an authorization function for Flow transactions. Uses provided authData or falls back to service account.
  private async getAuthorization(authData?: { address: string; privateKey: string; keyIndex?: number }) {
    return async (account: any) => {
      const address = authData?.address || this.serviceAccount.address;
      const privateKey = authData?.privateKey || this.serviceAccount.privateKey;
      const keyIndex = authData?.keyIndex || this.serviceAccount.keyIndex;
  
      const user = await fcl.account(address);
      const key = user.keys[keyIndex];
  
      return {
        ...account,
        tempId: `${address}-${keyIndex}`,
        addr: fcl.sansPrefix(address),
        keyId: key.index,
        signingFunction: (signable: any) => {
          return {
            addr: fcl.withPrefix(address),
            keyId: key.index,
            signature: this.signWithKey(privateKey, signable.message)
          };
        }
      };
    };
  }

  // A generic helper to execute a transaction with given cadence, args, and optional auth options.
  private async executeTransaction(params: {
    cadence: string,
    argsFn?: (arg: any, t: any) => any[],
    authOptions?: { address: string; privateKey: string; keyIndex?: number },
    limit?: number
  }): Promise<string> {
    const { cadence, argsFn, authOptions, limit = 1000 } = params;
    const authorization = await this.getAuthorization(authOptions);
    return await fcl.mutate({
      cadence,
      args: argsFn,
      payer: authorization,
      proposer: authorization,
      authorizations: [authorization],
      limit: limit
    });
  }

  // -------------------------
  // Account Operations
  // -------------------------

  // Verifies that the service account is correctly configured.
  async verifyServiceAccount(): Promise<boolean> {
    try {
      const account = await fcl.account(this.serviceAccount.address);
      const key = account.keys[this.serviceAccount.keyIndex];
      
      if (!key || !key.publicKey) {
        throw new Error('Invalid key configuration');
      }
      return true;
    } catch (error) {
      console.error('Service account verification failed:', error);
      return false;
    }
  }

  // Creates a new wallet and corresponding Flow account.
  async createWallet(): Promise<WalletResponse> {
    try {
      const keyPair = this.ec.genKeyPair();
      const privateKey = keyPair.getPrivate('hex');
      
      // Format the public key correctly
      const publicKeyPoint = keyPair.getPublic();
      const publicKey = Buffer.concat([
        publicKeyPoint.getX().toArrayLike(Buffer, 'be', 32),
        publicKeyPoint.getY().toArrayLike(Buffer, 'be', 32)
      ]).toString('hex');
  
      console.log('🔑 Generated keys:', {
        privateKey,
        publicKey,
        publicKeyLength: publicKey.length
      });
  
      const authorization = await this.getAuthorization();

      const cadence = `
          transaction(publicKey: String) {
            prepare(signer: auth(BorrowValue) &Account) {
              let account = Account(payer: signer)
              
              let key = PublicKey(
                publicKey: publicKey.decodeHex(),
                signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
              )
              
              account.keys.add(
                publicKey: key,
                hashAlgorithm: HashAlgorithm.SHA3_256,
                weight: 1000.0
              )
  
              log("New account created")
              log(account.address)
            }
          }
        `;
  
      const transactionId = await fcl.mutate({
        cadence,
        args: (arg: any, t: any) => [ arg(publicKey, t.String) ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      console.log('📝 Transaction ID:', transactionId);
  
      // Wait for the transaction to be sealed and process the result
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Transaction Result:', JSON.stringify(txResult, null, 2));
      
      const events = txResult.events;
      console.log('📊 Events:', JSON.stringify(events, null, 2));
  
      const accountCreatedEvent = events.find((e: any) => 
        e.type === 'flow.AccountCreated' || 
        e.type.includes('AccountCreated')
      );
  
      if (!accountCreatedEvent) {
        throw new Error('No account creation event found');
      }
  
      console.log('🎉 Account Created Event:', JSON.stringify(accountCreatedEvent, null, 2));
  
      const newAddress = accountCreatedEvent.data.address;
      console.log('📫 New Address:', newAddress);
  
      // Fund the account in testnet
      if (process.env.FLOW_NETWORK === 'testnet') {
        try {
          const txId = await this.fundWallet(newAddress, this.INITIAL_FUNDING);
          await fcl.tx(txId).onceSealed();
          console.log(`✅ Wallet ${newAddress} fondeada exitosamente`);
        } catch (fundingError) {
          console.error('❌ Error en el fondeo inicial:', fundingError);
        }
      }
      
      const walletResponse = {
        address: newAddress,
        privateKey,
        publicKey
      };
  
      console.log('📱 Wallet Response:', JSON.stringify(walletResponse, null, 2));
      
      return walletResponse;
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error('Failed to create Flow wallet');
    }
  }

  // Queries the balance of a Flow account.
  async getBalance(address: string): Promise<string> {
    try {
      const cadence = `
          import FungibleToken from ${flowConfig.fungibleToken}
          import FlowToken from ${flowConfig.flowToken}
  
          access(all) 
          fun main(address: Address): UFix64 {
            let account = getAccount(address)
            
            let vaultRef = account.capabilities
              .get<&{FungibleToken.Balance}>(
                /public/flowTokenBalance
              )
              .borrow()
              ?? panic("Could not borrow a balance reference to the account's Flow Token Vault")
  
            return vaultRef.balance
          }
        `;
  
      const balance = await fcl.query({
        cadence,
        args: (arg: any, t: any) => [ arg(address, t.Address) ]
      });
  
      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  // Funds a Flow account with a specified amount.
  async fundWallet(toAddress: string, amount: string): Promise<string> {
    try {
      console.log(`💰 Fondeando wallet ${toAddress} con ${amount} FLOW...`);
      
      const authorization = await this.getAuthorization();
      
      const cadence = `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868
  
          transaction(amount: UFix64, recipient: Address) {
            prepare(signer: auth(BorrowValue) &Account) {
              // Get a reference to the signer's stored vault
              let vaultRef = signer.storage
                .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                  from: /storage/flowTokenVault
                ) ?? panic("Could not borrow a reference to the owner's vault")
  
              // Withdraw tokens from the signer's stored vault
              let sentVault <- vaultRef.withdraw(amount: amount)
  
              // Get the recipient's public account object
              let recipient = getAccount(recipient)
              
              let receiverRef = recipient.capabilities
                .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                ?? panic("Could not borrow receiver reference")
  
              // Deposit the withdrawn tokens
              receiverRef.deposit(from: <-sentVault)
  
              log("Transfer succeeded!")
            }
          }
        `;
  
      const transactionId = await fcl.mutate({
        cadence,
        args: (arg: any, t: any) => [
          arg(amount, t.UFix64),
          arg(toAddress, t.Address)
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      console.log(`✅ Transacción de fondeo iniciada: ${transactionId}`);
      
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Resultado de la transacción:', txResult);
      
      return transactionId;
    } catch (error) {
      console.error('❌ Error fondeando wallet:', error);
      throw error;
    }
  }

  // -------------------------
  // NFT Operations
  // -------------------------

  // Buys NFT packs for a user.
  async buyPack(userAddress: string, privateKey: string, amount: number = 1): Promise<string> {
    try {
      const authorization = await this.getAuthorization({ 
        address: userAddress, 
        privateKey: privateKey 
      });
  
      const cadence = `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
          import NonFungibleToken from ${flowConfig.nonFungibleToken}
          import MetadataViews from ${flowConfig.metadataViews}
          import FlowToken from ${flowConfig.flowToken}
          import FungibleToken from ${flowConfig.fungibleToken}
  
          transaction(setID: UInt32, amount: Int) {
            prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
              let collectionData = ${this.NFT_CONTRACT_NAME}.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
                ?? panic("ViewResolver does not resolve NFTCollectionData view")
              
              if signer.storage.borrow<&${this.NFT_CONTRACT_NAME}.Collection>(from: collectionData.storagePath) == nil {
                let collection <- ${this.NFT_CONTRACT_NAME}.createEmptyCollection(nftType: Type<@${this.NFT_CONTRACT_NAME}.NFT>())
                signer.storage.save(<-collection, to: collectionData.storagePath)
                let oldLink = signer.capabilities.unpublish(collectionData.publicPath)
                let collectionCap = signer.capabilities.storage.issue<&${this.NFT_CONTRACT_NAME}.Collection>(collectionData.storagePath)
                signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
              }
  
              if signer.storage.type(at: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePath) == nil {
                let storage <- ${this.NFT_CONTRACT_NAME}.createEmptyStorage()
                signer.storage.save(<- storage, to: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePath)
                let storageCap = signer.capabilities.storage.issue<&${this.NFT_CONTRACT_NAME}.ReceiptStorage>(${this.NFT_CONTRACT_NAME}.ReceiptStoragePath)
                signer.capabilities.publish(storageCap, at: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePublic)
              }
  
              let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                ?? panic("Could not borrow Flow Token Vault reference")
  
              let storageRef = signer.storage.borrow<&${this.NFT_CONTRACT_NAME}.ReceiptStorage>(from: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePath)
                ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")
              
              var counter = 0
              while counter < amount {
                let receipt <- ${this.NFT_CONTRACT_NAME}.buyPackFlow(setID: setID, payment: <- vaultRef.withdraw(amount: 1.0))
                storageRef.deposit(receipt: <- receipt)
                counter = counter + 1
              }
            }
          }
        `;
  
      const transactionId = await fcl.mutate({
        cadence,
        args: (arg: any, t: any) => [
          arg(0, t.UInt32),
          arg(amount, t.Int)
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error buying pack:', error);
      throw new Error('Failed to buy pack');
    }
  }
  
  // Reveals an owned NFT pack.
  async revealPack(userAddress: string, privateKey: string): Promise<string> {
    try {
      const authorization = await this.getAuthorization({
        address: userAddress,
        privateKey: privateKey
      });
  
      const cadence = `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
          import NonFungibleToken from ${flowConfig.nonFungibleToken}
          import MetadataViews from ${flowConfig.metadataViews}
  
          transaction {
            prepare(signer: auth(BorrowValue, LoadValue) &Account) {
              let storageRef = signer.storage.borrow<&${this.NFT_CONTRACT_NAME}.ReceiptStorage>(from: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePath)
                  ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")
              
              let receipt <- storageRef.withdraw()
  
              ${this.NFT_CONTRACT_NAME}.revealPack(
                receipt: <-receipt, 
                minter: signer.address,
                emptyDict: {}
              )
            }
          }
        `;
  
      const transactionId = await fcl.mutate({
        cadence,
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error revealing pack:', error);
      throw new Error('Failed to reveal pack');
    }
  }
  
  // Retrieves metadata for an NFT based on its card ID.
  async getNFTMetadata(cardID: number): Promise<any> {
    try {
      console.log("Obteniendo tipo para Card ID:", cardID);
      
      const cardType = await fcl.query({
        cadence: `
            import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
            
            access(all) fun main(cardID: UInt32): Type {
              return ${this.NFT_CONTRACT_NAME}.getCardType(cardID: cardID)
            }
          `,
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });
  
      console.log("Tipo de carta:", cardType.typeID);
  
      const metadata = await fcl.query({
        cadence: `
            import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
            
            access(all) fun main(cardID: UInt32): AnyStruct {
              return ${this.NFT_CONTRACT_NAME}.getCardMetadata(cardID: cardID, cardType: ${this.NFT_CONTRACT_NAME}.getCardType(cardID: cardID))
            }
          `,
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });
      return {
        cardType: cardType.typeID,
        metadata: metadata
      };
  
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw new Error('Failed to get NFT metadata');
    }
  }
  
  // Fetches the NFT IDs associated with an account.
  async getNFTIds(address: string): Promise<number[]> {
    try {
      const ids = await fcl.query({
        cadence: `
                  import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
  
                  access(all) fun main(account: Address): [UInt64] {
                      let account = getAccount(account)
                      
                      let cap = account.capabilities
                          .borrow<&${this.NFT_CONTRACT_NAME}.Collection>(${this.NFT_CONTRACT_NAME}.CollectionPublicPath)
                          ?? panic("Could not borrow collection capability")
  
                      return cap.getIDs()
                  }
              `,
        args: (arg: any, t: any) => [ arg(address, t.Address) ]
      });
  
      console.log("NFT IDs encontrados:", ids);
      return ids;
    } catch (error) {
      console.error('Error getting NFT IDs:', error);
      throw new Error('Failed to get NFT IDs');
    }
  }
  
  // Retrieves the card type for a given NFT card ID.
  async getCardType(cardID: number): Promise<any> {
    try {
      console.log("Intentando obtener tipo para Card ID:", cardID);
      
      const cardType = await fcl.query({
        cadence: `
                  import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
                  
                  access(all) fun main(cardID: UInt32): Type {
                      return ${this.NFT_CONTRACT_NAME}.getCardType(cardID: cardID)
                  }
              `,
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });
  
      console.log(`Card ID ${cardID} tiene tipo:`, cardType);
      return cardType;
    } catch (error) {
      console.error(`Error obteniendo tipo para Card ID ${cardID}:`, error);
      return null;
    }
  }
  
  // Retrieves and classifies the NFT collection from an account.
  async getNFTCollection(address: string): Promise<{ 
    locations: any[], 
    characters: any[], 
    culturalItems: any[] 
  }> {
    try {
      const nfts = await fcl.query({
        cadence: `
                  import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
                  import MetadataViews from ${flowConfig.metadataViews}
  
                  access(all) fun main(account: Address): [AnyStruct]? {
                      let account = getAccount(account)
                      let answer: [AnyStruct] = []
                      var nft: AnyStruct = nil
  
                      let cap = account.capabilities
                          .borrow<&${this.NFT_CONTRACT_NAME}.Collection>(${this.NFT_CONTRACT_NAME}.CollectionPublicPath)!
  
                      let ids = cap.getIDs()
  
                      for id in ids {
                          let nftRef = cap.borrowVenezuelaNFT(id: id)!
                          let resolver = cap.borrowViewResolver(id: id)!
                          let displayView = MetadataViews.getDisplay(resolver)!
                          let serialView = MetadataViews.getSerial(resolver)!
                          let traits = MetadataViews.getTraits(resolver)!
                          let cardType = ${this.NFT_CONTRACT_NAME}.getCardType(cardID: UInt32(nftRef.cardID))
  
                          nft = {
                              "cardMetadataID": nftRef.cardID,
                              "display": displayView,
                              "nftID": nftRef.id,
                              "serial": serialView,
                              "traits": traits,
                              "type": cardType
                          }
                          
                          answer.append(nft)
                      }
                      return answer
                  }
              `,
        args: (arg: any, t: any) => [ arg(address, t.Address) ]
      });
  
      const groupedNFTs = {
        locations: [] as any[],
        characters: [] as any[],
        culturalItems: [] as any[]
      };
  
      if (!nfts) {
        console.log('No NFTs found for address:', address);
        return groupedNFTs;
      } else {
        console.log('NFTs found for address:', JSON.stringify(nfts, null, 2));
      }
  
      // Group NFTs by metadata ID
      const nftsByMetadataId = new Map();
  
      for (const nft of nfts) {
        const metadataId = nft.cardMetadataID;
        if (!nftsByMetadataId.has(metadataId)) {
          nftsByMetadataId.set(metadataId, {
            metadataId,
            display: nft.display,
            type: nft.type,
            instances: [],
            count: 0
          });
        }
        
        const group = nftsByMetadataId.get(metadataId);
        group.instances.push({
          nftID: nft.nftID,
          serial: nft.serial,
          traits: nft.traits
        });
        group.count++;
      }
  
      // Classify NFTs into categories
      for (const [_, nftGroup] of nftsByMetadataId) {
        const typeID = nftGroup.type.typeID;
        console.log('Procesando NFT:', {
          name: nftGroup.display.name,
          typeID: typeID
        });
        
        if (!typeID) {
          console.log('⚠️ NFT sin typeID:', nftGroup);
          continue;
        }
  
        const cardType = typeID.split('.').pop() || '';
        
        if (cardType.includes('LocationCard')) {
          console.log('→ Agregando location:', nftGroup.display.name);
          groupedNFTs.locations.push(nftGroup);
        } else if (cardType.includes('CharacterCard')) {
          console.log('→ Agregando character:', nftGroup.display.name);
          groupedNFTs.characters.push(nftGroup);
        } else if (cardType.includes('CulturalItemCard')) {
          console.log('→ Agregando cultural item:', nftGroup.display.name);
          groupedNFTs.culturalItems.push(nftGroup);
        } else {
          console.log('⚠️ Tipo no reconocido:', cardType);
        }
      }
      console.log('Clasificación final:', {
        locations: groupedNFTs.locations.map(n => n.display.name),
        characters: groupedNFTs.characters.map(n => n.display.name),
        culturalItems: groupedNFTs.culturalItems.map(n => n.display.name)
      });
      return groupedNFTs;
    } catch (error) {
      console.error('Error getting NFT collection:', error);
      throw new Error('Failed to get NFT collection');
    }
  }
  
  // Retrieves the number of unrevealed NFT packs for an account.
  async getUnrevealedPacks(address: string): Promise<number> {
    try {
      const cadence = `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
  
          access(all) fun main(account: Address): Int {
            let account = getAccount(account)
            let cap = account.capabilities
              .borrow<&${this.NFT_CONTRACT_NAME}.ReceiptStorage>(${this.NFT_CONTRACT_NAME}.ReceiptStoragePublic)!
            return cap.getBalance()
          }
        `;
      const packs = await fcl.query({
        cadence,
        args: (arg: any, t: any) => [ arg(address, t.Address) ]
      });
  
      return packs;
    } catch (error) {
      console.error('Error getting unrevealed packs:', error);
      throw new Error('Failed to get unrevealed packs');
    }
  }
  
  // Reveals multiple NFT packs for a user.
  async revealPacks(userAddress: string, privateKey: string, amount: number): Promise<string> {
    try {
      const authorization = await this.getAuthorization({ 
        address: userAddress, 
        privateKey: privateKey 
      });
  
      const cadence = `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
  
          transaction(amount: Int) {
            prepare(signer: auth(BorrowValue, LoadValue) &Account) {
              let storageRef = signer.storage
                .borrow<&${this.NFT_CONTRACT_NAME}.ReceiptStorage>(from: ${this.NFT_CONTRACT_NAME}.ReceiptStoragePath)
                ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")
  
              var counter = 0
              while counter < amount {
                let receipt <- storageRef.withdraw()
                ${this.NFT_CONTRACT_NAME}.revealPack(
                  receipt: <- receipt, 
                  minter: signer.address, 
                  emptyDict: {}
                )
                counter = counter + 1
              }
            }
          }
        `;
  
      const transactionId = await fcl.mutate({
        cadence,
        args: (arg: any, t: any) => [ arg(amount, t.Int) ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error revealing packs:', error);
      throw new Error('Failed to reveal packs');
    }
  }

  // -------------------------
  // Storefront & Listing Operations
  // -------------------------

  // Sets up the storefront for a given account.
  async setupStorefront(address: string, privateKey: string): Promise<string> {
    try {
      const authorization = await this.getAuthorization({
        address: address,
        privateKey: privateKey
      });
  
      const transactionId = await fcl.mutate({
        cadence: SETUP_STOREFRONT_TRANSACTION,
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error setting up storefront:', error);
      throw new Error('Failed to setup storefront');
    }
  }
  
  // Creates a listing for an NFT.
  async createListing(
    address: string, 
    privateKey: string, 
    nftId: number, 
    saleItemPrice: number,
    marketplacesAddress: string[]
  ): Promise<string> {
    try {
      const authorization = await this.getAuthorization({
        address: address,
        privateKey: privateKey
      });
  
      const transactionId = await fcl.mutate({
        cadence: CREATE_LISTING_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(nftId, t.UInt64),
          arg(saleItemPrice.toFixed(8), t.UFix64),
          arg(null, t.Optional(t.String)),
          arg("0.0", t.UFix64),
          arg(marketplacesAddress, t.Array(t.Address))
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }
  
  // Purchases an NFT listing.
  async purchaseListing(
    buyerAddress: string,
    buyerPrivateKey: string,
    listingId: number,
    sellerAddress: string
  ): Promise<string> {
    try {
      const authorization = await this.getAuthorization({
        address: buyerAddress,
        privateKey: buyerPrivateKey
      });
  
      const transactionId = await fcl.mutate({
        cadence: PURCHASE_LISTING_TRANSACTION,
        args: (arg: any, t: any) => [
          arg(listingId, t.UInt64),
          arg(sellerAddress, t.Address),
          arg(null, t.Optional(t.Address))
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error purchasing listing:', error);
      throw new Error('Failed to purchase listing');
    }
  }
}