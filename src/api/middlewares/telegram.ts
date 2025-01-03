import { Request, Response, NextFunction } from 'express';

export const telegramAuthMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.log('🔐 Verificando autenticación del webhook');
  console.log('Headers recibidos:', req.headers);
  
  const token = req.headers['x-telegram-bot-api-secret-token'];
  
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  if (token !== process.env.WEBHOOK_SECRET) {
    console.error('❌ Token inválido:', {
      received: token,
      expected: process.env.WEBHOOK_SECRET
    });
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
  
  console.log('✅ Autenticación exitosa');
  next();
};