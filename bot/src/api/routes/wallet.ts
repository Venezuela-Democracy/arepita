import { Router } from 'express';
import { FlowWallet } from '../../wallet';

export const walletRoutes = () => {
  const router = Router();
  const flowWallet = new FlowWallet();

  // Crear nueva wallet
  router.post('/create', async (req, res) => {
    try {
      const wallet = await flowWallet.createWallet();
      return res.json({
        success: true,
        data: wallet
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating wallet'
      });
    }
  });

  // Obtener balance
  router.get('/:address/balance', async (req, res) => {
    try {
      const { address } = req.params;
      const balance = await flowWallet.getBalance(address);
      return res.json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting wallet balance'
      });
    }
  });

  // Obtener NFTs
  router.get('/:address/nfts', async (req, res) => {
    try {
      const { address } = req.params;
      const nfts = await flowWallet.getNFTCollection(address);
      return res.json({
        success: true,
        data: nfts
      });
    } catch (error) {
      console.error('Error getting NFTs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting NFT collection'
      });
    }
  });

  // Comprar pack
  router.post('/:address/buy-pack', async (req, res) => {
    try {
      const { address } = req.params;
      const { privateKey, amount = 1 } = req.body;
      
      if (!privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Private key is required'
        });
      }

      const txId = await flowWallet.buyPack(address, privateKey, amount);
      return res.json({
        success: true,
        data: { transactionId: txId }
      });
    } catch (error) {
      console.error('Error buying pack:', error);
      return res.status(500).json({
        success: false,
        error: 'Error buying pack'
      });
    }
  });

  // Revelar packs
  router.post('/:address/reveal-packs', async (req, res) => {
    try {
      const { address } = req.params;
      const { privateKey, amount = 1 } = req.body;

      if (!privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Private key is required'
        });
      }

      const txId = await flowWallet.revealPacks(address, privateKey, amount);
      return res.json({
        success: true,
        data: { transactionId: txId }
      });
    } catch (error) {
      console.error('Error revealing packs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error revealing packs'
      });
    }
  });

  // Obtener packs sin revelar
  router.get('/:address/unrevealed-packs', async (req, res) => {
    try {
      const { address } = req.params;
      const packs = await flowWallet.getUnrevealedPacks(address);
      return res.json({
        success: true,
        data: { unrevealedPacks: packs }
      });
    } catch (error) {
      console.error('Error getting unrevealed packs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error getting unrevealed packs'
      });
    }
  });

  // Configurar storefront
  router.post('/:address/setup-storefront', async (req, res) => {
    try {
      const { address } = req.params;
      const { privateKey } = req.body;

      if (!privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Private key is required'
        });
      }

      const txId = await flowWallet.setupStorefront(address, privateKey);
      return res.json({
        success: true,
        data: { transactionId: txId }
      });
    } catch (error) {
      console.error('Error setting up storefront:', error);
      return res.status(500).json({
        success: false,
        error: 'Error setting up storefront'
      });
    }
  });

  // Crear listing
  router.post('/:address/create-listing', async (req, res) => {
    try {
      const { address } = req.params;
      const { privateKey, nftId, price, marketplacesAddress } = req.body;

      if (!privateKey || !nftId || !price || !marketplacesAddress) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      const txId = await flowWallet.createListing(
        address,
        privateKey,
        nftId,
        price,
        marketplacesAddress
      );

      return res.json({
        success: true,
        data: { transactionId: txId }
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creating listing'
      });
    }
  });

  return router;
};