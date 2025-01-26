import { ENV } from './src/config/env';
import { TelegramBot } from './src/bot';
import { createServer } from './src/server';
import { connectDB } from './src/config/firebase';
import { initializeFlow } from './src/wallet';

async function bootstrap() {
  try {
    // Conectar a Firestore
    await connectDB();
    console.log('📦 Firestore conectado exitosamente');

    // Inicializar Flow
    initializeFlow();
    console.log('🌊 Flow inicializado');

    // Iniciar bot de Telegram
    const telegramBot = new TelegramBot(ENV.BOT_TOKEN);

    // Siempre crear el servidor Express
    const app = createServer(telegramBot);
    
    // Iniciar el servidor
    app.listen(ENV.PORT, () => {
      console.log(`🌐 Server is running on port ${ENV.PORT}`);
    });

    // En desarrollo, usar polling además del servidor
    if (ENV.NODE_ENV === 'development') {
      console.log('🤖 Starting bot in development mode (polling)');
      await telegramBot.launch();
    } else {
      console.log('🚀 Starting bot in production mode (webhook)');
      console.log(`📡 Webhook URL: ${ENV.WEBHOOK_DOMAIN}/api/telegram/webhook`);
    }

    // Manejadores de cierre
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} recibido. Cerrando servicios...`);
      await telegramBot.stop(signal);
      process.exit(0);
    };

    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

bootstrap();