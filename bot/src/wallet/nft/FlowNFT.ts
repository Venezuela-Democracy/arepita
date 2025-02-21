import * as fcl from "@onflow/fcl";
import { flowAuth } from '../utils/auth';
import { buyPack, revealPack, revealPacks } from "./transactions";
import { getNFTMetadata, getNFTCardType, getNFTIds, getNFTCollection, getUnrevealedPacks } from "./scripts";


export class FlowNFT {
  private NFT_CONTRACT_NAME = "VenezuelaNFT_20";
  ///                          ///
  ///// CADENCE TRANSACTIONS /////
  ///                          ///

  // Buy any amount of Packs
  async buyPack(userAddress: string, privateKey: string, amount: number = 1): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: buyPack(this.NFT_CONTRACT_NAME),
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
  // Reveal one(1) pack
  async revealPack(userAddress: string, privateKey: string): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: revealPack(this.NFT_CONTRACT_NAME),
        authOptions: { address: userAddress, privateKey },
        limit: 999
      });

      return transactionId;
    } catch (error) {
      console.error('Error revealing pack:', error);
      throw new Error('Failed to reveal pack');
    }
  }
  // Reveal any amount of packs
  async revealPacks(userAddress: string, privateKey: string, amount: number): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: revealPacks(this.NFT_CONTRACT_NAME),
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
  ///                     ///
  ///// CADENCE SCRIPTS /////
  ///                    ///
  async getNFTMetadata(cardID: number): Promise<any> {
    try {
      console.log("Getting type for Card ID:", cardID);
      
      const cardType = await fcl.query({
        cadence: getNFTCardType(this.NFT_CONTRACT_NAME),
        args: (arg: any, t: any) => [ arg(cardID, t.UInt32) ]
      });

      console.log("Card type:", cardType.typeID);

      const metadata = await fcl.query({
        cadence: getNFTMetadata(this.NFT_CONTRACT_NAME),
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
        cadence: getNFTIds(this.NFT_CONTRACT_NAME),
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
        cadence: getNFTCardType(this.NFT_CONTRACT_NAME),
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
        cadence: getNFTCollection(this.NFT_CONTRACT_NAME),
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
      const packs = await fcl.query({
        cadence: getUnrevealedPacks(this.NFT_CONTRACT_NAME),
        args: (arg: any, t: any) => [ arg(address, t.Address) ]
      });

      return packs;
    } catch (error) {
      console.error('Error getting unrevealed packs:', error);
      throw new Error('Failed to get unrevealed packs');
    }
  }


}

export const flowNFT = new FlowNFT(); 