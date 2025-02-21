import { Router } from 'express';
import { nftHandler } from '../handlers/nftHandler';

const router = Router();

// POST /api/nft/buy - Buy NFT packs
router.post('/buy/:telegramId', nftHandler.buyPacks);

// POST /api/nft/reveal - Reveal NFT packs
router.post('/reveal/:telegramId', nftHandler.revealPacks);

// GET /api/nft/unrevealed/:address - Get number of unrevealed packs
router.get('/unrevealed/:telegramId', nftHandler.getUnrevealedPacks);

export default router; 