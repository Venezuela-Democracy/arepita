import express from 'express';
import { TelegramBot } from './bot/bot';
import { createRoutes } from './api/routes';
import { errorHandler } from './api/middlewares/error';
import cors from 'cors';
export const createServer = (telegramBot: TelegramBot) => {
  const app = express();

  console.log('🚀 Iniciando servidor Express');

  // Configurar CORS antes de cualquier ruta
  app.use(cors({
    origin: [
      'https://venezuela-dao-miniapp.vercel.app',
      'http://localhost:5173', // Para desarrollo local
      'https://web.telegram.org' // Para el WebApp de Telegram
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Telegram-Init-Data',
      'x-telegram-init-data'
    ],
    credentials: true
  }));

  // Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path}`, {
      headers: req.headers,
      query: req.query,
      body: req.body
    });
    next();
  });

  // Health check
  app.get('/health', (_, res) => {
    console.log('💓 Health check solicitado');
    res.send('OK');
  });

  // API routes
  app.use('/api', createRoutes({ bot: telegramBot }));

  // Error handling
  app.use(errorHandler);

  console.log('✅ Servidor configurado correctamente');

  return app;
};