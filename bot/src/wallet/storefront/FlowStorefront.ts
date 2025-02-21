import { flowAuth } from '../utils/auth';
import { SETUP_STOREFRONT_TRANSACTION, CREATE_LISTING_TRANSACTION, PURCHASE_LISTING_TRANSACTION } from './transactions';

export class FlowStorefront {
  async setupStorefront(address: string, privateKey: string): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: SETUP_STOREFRONT_TRANSACTION,
        authOptions: { address, privateKey },
        limit: 1000
      });

      return transactionId;
    } catch (error) {
      console.error('Error setting up storefront:', error);
      throw new Error('Failed to setup storefront');
    }
  }

  async createListing(
    address: string, 
    privateKey: string, 
    nftId: number, 
    saleItemPrice: number,
    marketplacesAddress: string[]
  ): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: CREATE_LISTING_TRANSACTION,
        argsFn: (arg: any, t: any) => [
          arg(nftId, t.UInt64),
          arg(saleItemPrice.toFixed(8), t.UFix64),
          arg(null, t.Optional(t.String)),
          arg("0.0", t.UFix64),
          arg(marketplacesAddress, t.Array(t.Address))
        ],
        authOptions: { address, privateKey },
        limit: 1000
      });

      return transactionId;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }

  async purchaseListing(
    buyerAddress: string,
    buyerPrivateKey: string,
    listingId: number,
    sellerAddress: string
  ): Promise<string> {
    try {
      const transactionId = await flowAuth.executeTransaction({
        cadence: PURCHASE_LISTING_TRANSACTION,
        argsFn: (arg: any, t: any) => [
          arg(listingId, t.UInt64),
          arg(sellerAddress, t.Address),
          arg(null, t.Optional(t.Address))
        ],
        authOptions: { address: buyerAddress, privateKey: buyerPrivateKey },
        limit: 1000
      });

      return transactionId;
    } catch (error) {
      console.error('Error purchasing listing:', error);
      throw new Error('Failed to purchase listing');
    }
  }
}

export const flowStorefront = new FlowStorefront(); 