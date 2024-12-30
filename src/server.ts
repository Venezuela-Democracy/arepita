import express from 'express';
import { TelegramBot } from './bot';
import { createRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/error';

export const createServer = (telegramBot: TelegramBot) => {
  const app = express();

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_, res) => res.send('OK'));

  // API routes
  app.use('/api', createRoutes({ bot: telegramBot }));

  // Error handling
  app.use(errorHandler);

  return app;
};