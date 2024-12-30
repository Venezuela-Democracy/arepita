import { ENV } from './src/config/env';
import { TelegramBot } from './src/bot';
import { createServer } from './src/server';

async function bootstrap() {
  try {
    const telegramBot = new TelegramBot(ENV.BOT_TOKEN);

    if (ENV.NODE_ENV === 'development') {
      console.log('🤖 Starting bot in development mode (polling)');
      await telegramBot.launch();
    } else {
      console.log('🚀 Starting bot in production mode (webhook)');
      const app = createServer(telegramBot);
      
      app.listen(ENV.PORT, () => {
        console.log(`🌐 Server is running on port ${ENV.PORT}`);
        console.log(`📡 Webhook URL: ${ENV.WEBHOOK_DOMAIN}/api/telegram/webhook`);
      });
    }

    process.once('SIGINT', () => telegramBot.stop('SIGINT'));
    process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));

  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

bootstrap();