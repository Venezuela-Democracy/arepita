import { flowAuth } from '../utils/auth';
import { equipLocation, vote, resetDaily } from './transactions';
import * as fcl from "@onflow/fcl";
import { getVotes, getTopics, getRegionDP, getRegions } from './scripts';

export class DAO {
    private Governance_CONTRACT_NAME = "Governance";
    private VenezuelaNFT_CONTRACT_NAME = "VenezuelaNFT_20";
    private IP_CONTRACT_NAME = "InfluencePoint";
  ///                          ///
  ///// CADENCE TRANSACTIONS /////
  ///                          ///
  // Reset de daily counter for free packs
  async resetDaily(address: string, privateKey: string):  Promise<any>{
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: resetDaily(this.Governance_CONTRACT_NAME),
        authOptions: { address, privateKey },
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error equipping a Location card:', error);
      throw new Error('Failed to equip a Location card');
    }      
  }
  // Equip a Location card in order to be able to vote
  async equipLocation(address: string, privateKey: string, nftID: number): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: equipLocation(this.Governance_CONTRACT_NAME, this.VenezuelaNFT_CONTRACT_NAME),
        argsFn: (arg: any, t: any) => [
            arg(nftID, t.UInt64),
          ],
        authOptions: { address, privateKey },
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error equipping a Location card:', error);
      throw new Error('Failed to equip a Location card');
    }
  }
  // Vote on a topic 
  async vote(address: string, privateKey: string, regionName: string, topicID: number, option: string): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: vote(this.Governance_CONTRACT_NAME, this.VenezuelaNFT_CONTRACT_NAME, this.IP_CONTRACT_NAME),
        argsFn: (arg: any, t: any) => [
            arg(regionName, t.String),
            arg(topicID, t.UInt64),
            arg(option, t.String),
          ],
        authOptions: { address, privateKey },
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error equipping a Location card:', error);
      throw new Error('Failed to equip a Location card');
    }
  } 
  ///                     ///
  ///// CADENCE SCRIPTS /////
  ///                    ///

  // Get vote count on a Topic from a Region
  async getVotes(topicID: number, regionName: string): Promise<any> {
      try {
        console.log("Getting votes for Topic:", topicID, " in region: ", regionName);
        
        const votes = await fcl.query({
          cadence: getVotes(this.Governance_CONTRACT_NAME),
          args: (arg: any, t: any) => [ 
            arg(regionName, t.String),
            arg(topicID, t.UInt64)
          ]
        });

        return {
          votes: votes,
        };
  
      } catch (error) {
        console.error('Error getting votes for this region:', error);
        throw new Error('Error getting votes');
      }
    }
  // Get all topics in 
  async getTopics(regionName: string): Promise<any> {
      try {
        console.log("Getting all Topics in region: ", regionName);
        
        const topics = await fcl.query({
          cadence: getTopics(this.Governance_CONTRACT_NAME),
          args: (arg: any, t: any) => [ 
            arg(regionName, t.String),
          ]
        });
        
        return {
          topics: topics,
        };
  
      } catch (error) {
        console.error('Error getting topics for this region:', error);
        throw new Error('Error getting votes');
      }
    }
  async getRegions(): Promise<any> {
      try {
        console.log("Getting all registered Regions");
        
        const regions = await fcl.query({
          cadence: getRegions(this.Governance_CONTRACT_NAME),
        });
        
        return {
          regions: regions,
        };
  
      } catch (error) {
        console.error('Error getting regions in contract:', error);
        throw new Error('Error getting regions');
      }
    }
    // Get a region's DP
    async getRegionDP(regionName: string): Promise<any> {
      try {
        console.log("Getting all Development Points in region: ", regionName);
        
        const topics = await fcl.query({
          cadence: getRegionDP(this.Governance_CONTRACT_NAME),
          args: (arg: any, t: any) => [ 
            arg(regionName, t.String),
          ]
        });
        
        return {
          topics: topics,
        };
  
      } catch (error) {
        console.error('Error getting DPs for this region:', error);
        throw new Error('Error getting DP');
      }
    }

}

export const flowAccount = new DAO(); 