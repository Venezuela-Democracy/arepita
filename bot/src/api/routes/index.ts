import { Router } from 'express';
import { telegramRoutes } from './telegram';
import { userRoutes } from './users';
import { walletRoutes } from './wallet';
import nftRoutes from './nftRoutes';

export const createRoutes = (deps: any) => {
  const router = Router();
  router.use('/telegram', telegramRoutes(deps));
  router.use('/users', userRoutes());
  router.use('/wallet', walletRoutes());
  router.use('/nft', nftRoutes);

  return router;
};

export default createRoutes;