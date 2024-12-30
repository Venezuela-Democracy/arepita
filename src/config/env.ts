import { config } from 'dotenv';

config();

export const ENV = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET
};