import * as fcl from "@onflow/fcl";
import { flowConfig } from '../config';
import { flowAuth } from '../utils/auth';

export class FlowNFT {
  private NFT_CONTRACT_NAME = "VenezuelaNFT_19";

  async buyPack(userAddress: string, privateKey: string, amount: number = 1): Promise<string> {
    try {
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

      const transactionId = await flowAuth.executeTransaction({
        cadence,
        argsFn: (arg: any, t: any) => [
          arg(0, t.UInt32),
          arg(amount, t.Int)
        ],
        authOptions: { address: userAddress, privateKey },
        limit: 999
      });

      return transactionId;
    } catch (error) {
      console.error('Error buying pack:', error);
      throw new Error('Failed to buy pack');
    }
  }

  async revealPack(userAddress: string, privateKey: string): Promise<string> {
    try {
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

      const transactionId = await flowAuth.executeTransaction({
        cadence,
        authOptions: { address: userAddress, privateKey },
        limit: 999
      });

      return transactionId;
    } catch (error) {
      console.error('Error revealing pack:', error);
      throw new Error('Failed to reveal pack');
    }
  }

  async getNFTMetadata(cardID: number): Promise<any> {
    try {
      console.log("Getting type for Card ID:", cardID);
      
      const cardType = await fcl.query({
        cadence: `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
          
          access(all) fun main(cardID: UInt32): Type {
            return ${this.NFT_CONTRACT_NAME}.getCardType(cardID: cardID)
          }
        `,
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });

      console.log("Card type:", cardType.typeID);

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

      console.log("NFT IDs found:", ids);
      return ids;
    } catch (error) {
      console.error('Error getting NFT IDs:', error);
      throw new Error('Failed to get NFT IDs');
    }
  }

  async getCardType(cardID: number): Promise<any> {
    try {
      console.log("Attempting to get type for Card ID:", cardID);
      
      const cardType = await fcl.query({
        cadence: `
          import ${this.NFT_CONTRACT_NAME} from ${flowConfig.venezuelaNFTAddress}
          
          access(all) fun main(cardID: UInt32): Type {
            return ${this.NFT_CONTRACT_NAME}.getCardType(cardID: cardID)
          }
        `,
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });

      console.log(`Card ID ${cardID} has type:`, cardType);
      return cardType;
    } catch (error) {
      console.error(`Error getting type for Card ID ${cardID}:`, error);
      return null;
    }
  }

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
        if (!typeID) {
          console.log('⚠️ NFT without typeID:', nftGroup);
          continue;
        }

        const cardType = typeID.split('.').pop() || '';
        
        if (cardType.includes('LocationCard')) {
          groupedNFTs.locations.push(nftGroup);
        } else if (cardType.includes('CharacterCard')) {
          groupedNFTs.characters.push(nftGroup);
        } else if (cardType.includes('CulturalItemCard')) {
          groupedNFTs.culturalItems.push(nftGroup);
        } else {
          console.log('⚠️ Unrecognized type:', cardType);
        }
      }

      return groupedNFTs;
    } catch (error) {
      console.error('Error getting NFT collection:', error);
      throw new Error('Failed to get NFT collection');
    }
  }

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

  async revealPacks(userAddress: string, privateKey: string, amount: number): Promise<string> {
    try {
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

      const transactionId = await flowAuth.executeTransaction({
        cadence,
        argsFn: (arg: any, t: any) => [ arg(amount, t.Int) ],
        authOptions: { address: userAddress, privateKey },
        limit: 999
      });

      return transactionId;
    } catch (error) {
      console.error('Error revealing packs:', error);
      throw new Error('Failed to reveal packs');
    }
  }
}

export const flowNFT = new FlowNFT(); 