import { Request, Response } from 'express';
import { flowWallet } from '../../wallet/flow';

export const nftHandler = {
  async buyPacks(req: Request, res: Response) {
    try {
      const { address, privateKey, amount = 1 } = req.body;

      if (!address || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Address and privateKey are required'
        });
      }

      const transactionId = await flowWallet.nft.buyPack(address, privateKey, amount);

      return res.json({
        success: true,
        data: {
          transactionId
        }
      });
    } catch (error) {
      console.error('Error buying packs:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  async revealPacks(req: Request, res: Response) {
    try {
      const { address, privateKey, amount = 1 } = req.body;

      if (!address || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Address and privateKey are required'
        });
      }

      const transactionId = await flowWallet.nft.revealPacks(address, privateKey, amount);

      return res.json({
        success: true,
        data: {
          transactionId
        }
      });
    } catch (error) {
      console.error('Error revealing packs:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  async getUnrevealedPacks(req: Request, res: Response) {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: 'Address is required'
        });
      }

      const packs = await flowWallet.nft.getUnrevealedPacks(address);

      return res.json({
        success: true,
        data: {
          unrevealedPacks: packs
        }
      });
    } catch (error) {
      console.error('Error getting unrevealed packs:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}; 