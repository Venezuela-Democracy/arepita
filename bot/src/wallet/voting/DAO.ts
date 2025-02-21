import { flowAuth } from '../utils/auth';
import { equipLocation, vote } from './transactions';

export class DAO {
    private Governance_CONTRACT_NAME = "Governance";
    private VenezuelaNFT_CONTRACT_NAME = "VenezuelaNFT_20";
    private IP_CONTRACT_NAME = "InfluencePoint";
  ///                          ///
  ///// CADENCE TRANSACTIONS /////
  ///                          ///

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

}

export const flowAccount = new DAO(); 