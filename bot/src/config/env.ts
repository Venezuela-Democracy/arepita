import { config } from 'dotenv';

config();

export const ENV = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT || '',
  // Flow configs
  FLOW_SERVICE_ADDRESS: process.env.FLOW_SERVICE_ADDRESS!,
  FLOW_SERVICE_PRIVATE_KEY: process.env.FLOW_SERVICE_PRIVATE_KEY!,
  FLOW_SERVICE_KEY_INDEX: Number(process.env.FLOW_SERVICE_KEY_INDEX || 0),
  FLOW_NETWORK: process.env.FLOW_NETWORK as 'testnet' | 'mainnet',
  MINI_APP_URL: process.env.MINI_APP_URL || ''
};