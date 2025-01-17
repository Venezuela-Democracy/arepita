import { Telegraf, session } from 'telegraf'; // Añadir importación de session
import { BotContext, CommandValue } from './types';
import { registerCommands } from './commands';
import { BOT_COMMANDS, ERROR_MESSAGES, MESSAGES } from './constants';
import { formatMessage, isValidCommand } from './utils';
import { TelegramGroupManager } from './managers/group';
import { UserService } from '../services/user/index.';

export class TelegramBot {
  private bot: Telegraf<BotContext>;
  private groupManager: TelegramGroupManager;
  private messageHandlers: Map<string, boolean> = new Map();

  constructor(token: string) {
    this.bot = new Telegraf<BotContext>(token, {
      handlerTimeout: 180000 // 3 minutos para handlers
    });
    this.groupManager = new TelegramGroupManager(this.bot); // Inicializar el manager

    // Configurar middleware de sesión
    this.bot.use(session());

    // Middleware para prevenir duplicados
    this.bot.use(async (ctx, next) => {
      const messageId = ctx.message?.message_id 
        ? `${ctx.message.message_id}-${ctx.message.date}`
        : ctx.callbackQuery?.id;

      if (!messageId) return next();

      if (this.messageHandlers.has(messageId)) {
        console.log('🚫 Mensaje duplicado detectado:', messageId);
        return;
      }

      this.messageHandlers.set(messageId, true);
      
      // Limpiar mensajes antiguos cada 30 segundos
      setTimeout(() => {
        this.messageHandlers.delete(messageId);
      }, 30000);

      return next();
    });

    // Registrar comandos
    try {
      registerCommands(this.bot, this.groupManager);
      console.log('🤖 Comandos registrados en constructor');
    } catch (error) {
      console.error('❌ Error registrando comandos:', error);
      throw error;
    }

    // Configurar manejadores
    this.setupMessageHandlers();
    this.setupErrorHandler();
  }

  getGroupManager() {
    return this.groupManager;
  }

  private setupMessageHandlers() {
    // Manejar mensajes de texto
    this.bot.on('text', async (ctx) => {
      try {
        const message = formatMessage(ctx.message.text);
        const commands = Object.values(BOT_COMMANDS) as CommandValue[];
        const telegramId = ctx.from?.id.toString();

        if (!telegramId) return;
        const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';


        // Si es un comando no registrado
        if (isValidCommand(message) && !commands.includes(message.slice(1) as CommandValue)) {
          await ctx.reply(ERROR_MESSAGES[userLanguage].INVALID_COMMAND);
          return;
        }

        // Si es un mensaje normal
        if (!isValidCommand(message)) {
          await ctx.reply(`${MESSAGES[userLanguage].RECEIVED_MESSAGE}: ${message}`);
        }

      } catch (error) {
        console.error('❌ Error handling message:', error);
        const userLanguage = ctx.from?.id ? 
          await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
          : 'es';
        await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
      }
    });
  }

  private setupErrorHandler() {
    this.bot.catch(async (err: any, ctx: BotContext) => {
      console.error('❌ Bot error:', err);
      const userLanguage = ctx.from?.id ? 
        await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
        : 'es';
      ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC).catch(console.error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
    });
  }

  getBot() {
    return this.bot;
  }

  async launch() {
    try {
      await this.bot.launch({
        allowedUpdates: ['message', 'callback_query', 'chat_member']
      });
      console.log('🚀 Bot launched successfully');
    } catch (error) {
      console.error('❌ Error launching bot:', error);
      throw error;
    }
  }

  async stop(reason?: string) {
    try {
      await this.bot.stop(reason);
      console.log('🛑 Bot stopped:', reason || 'No reason provided');
    } catch (error) {
      console.error('❌ Error stopping bot:', error);
      throw error;
    }
  }

  async handleUpdate(update: any) {
    try {
      return await this.bot.handleUpdate(update);
    } catch (error) {
      console.error('❌ Error handling update:', error);
      throw error;
    }
  }

  async setCommands() {
    try {
      await this.bot.telegram.setMyCommands([
        { command: BOT_COMMANDS.START, description: 'Iniciar bot' },
        { command: BOT_COMMANDS.REGISTER, description: 'Registrarse en VenezuelaDAO' },
        { command: BOT_COMMANDS.HELP, description: 'Ver ayuda' },
        { command: BOT_COMMANDS.STATUS, description: 'Ver estado del bot' },
        { command: BOT_COMMANDS.BALANCE, description: 'Ver tu balance de FLOW' },
        { command: BOT_COMMANDS.WALLET, description: 'Ver información de tu wallet' },
      ]);
      console.log('✅ Bot commands menu updated');
    } catch (error) {
      console.error('❌ Error setting bot commands:', error);
      throw error;
    }
  }
}