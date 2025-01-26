import { Router } from 'express';
import { handleWebhook } from '../handlers/telegram/webhook-handler';
import { telegramAuthMiddleware } from '../middlewares/telegram';

export const telegramRoutes = ({ bot }: { bot: any }) => {
  const router = Router();
  
  router.post('/webhook', telegramAuthMiddleware, handleWebhook(bot));
  
  return router;
};