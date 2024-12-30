import { Request, Response, NextFunction } from 'express';

export const telegramAuthMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const token = req.headers['x-telegram-bot-api-secret-token'];
  
  if (!token || token !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};