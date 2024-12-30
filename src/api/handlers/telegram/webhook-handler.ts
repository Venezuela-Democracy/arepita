import { Request, Response } from 'express';
import { TelegramBot } from '../../../bot';

export const handleWebhook = (bot: TelegramBot) => 
  async (req: Request, res: Response) => {
    try {
      await bot.handleUpdate(req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  };