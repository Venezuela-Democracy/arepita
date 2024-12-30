import { Router } from 'express';
import { telegramRoutes } from './telegram';

export const createRoutes = (deps: any) => {
  const router = Router();
  router.use('/telegram', telegramRoutes(deps));
  return router;
};