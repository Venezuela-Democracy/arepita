import { Telegraf } from 'telegraf';
import { BotContext, CommandValue } from './types';
import { BOT_COMMANDS, ERROR_MESSAGES, MESSAGES } from './constants';
import { formatMessage, isValidCommand, extractCommandArgs } from './utils';
import { Update } from '@telegraf/types';

export class TelegramBot {
  private bot: Telegraf<BotContext>;

  constructor(token: string) {
    this.bot = new Telegraf<BotContext>(token);
    this.initialize();
  }

  private initialize() {
    this.setupCommands();
    this.setupMessageHandlers();
    this.setupErrorHandler();
  }

  private setupCommands() {
    this.bot.command(BOT_COMMANDS.START, async (ctx) => {
      try {
        await ctx.reply(MESSAGES.WELCOME);
      } catch (error) {
        console.error('Error in start command:', error);
      }
    });

    this.bot.command(BOT_COMMANDS.HELP, async (ctx) => {
      try {
        await ctx.reply(MESSAGES.HELP);
      } catch (error) {
        console.error('Error in help command:', error);
      }
    });

    // Configurar menú de comandos en Telegram
    this.bot.telegram.setMyCommands([
      { command: BOT_COMMANDS.START, description: 'Iniciar bot' },
      { command: BOT_COMMANDS.HELP, description: 'Ver ayuda' }
    ]);
  }

  private setupMessageHandlers() {
    // Manejar mensajes de texto
    this.bot.on('text', async (ctx) => {
      try {
        const message = formatMessage(ctx.message.text);
        const commands = Object.values(BOT_COMMANDS) as CommandValue[];

        // Si es un comando no registrado
        if (isValidCommand(message) && !commands.includes(message.slice(1) as CommandValue)) {
            await ctx.reply(ERROR_MESSAGES.INVALID_COMMAND);
            return;
          }

        // Si es un mensaje normal
        if (!isValidCommand(message)) {
          await ctx.reply(`Recibí tu mensaje: ${message}`);
        }

      } catch (error) {
        console.error('Error handling message:', error);
        await ctx.reply(ERROR_MESSAGES.GENERIC);
      }
    });
  }

  private setupErrorHandler() {
    this.bot.catch((error: any, ctx: BotContext) => {
      console.error('Bot error:', error);
      ctx.reply(ERROR_MESSAGES.GENERIC).catch(console.error);
    });
  }

  public getBot() {
    return this.bot;
  }

  public async launch() {
    try {
      await this.bot.launch();
      console.log('Bot started successfully');
    } catch (error) {
      console.error('Failed to start bot:', error);
      throw error;
    }
  }

  public async stop(reason?: string) {
    try {
      await this.bot.stop(reason);
      console.log(`Bot stopped: ${reason || 'No reason provided'}`);
    } catch (error) {
      console.error('Error stopping bot:', error);
      throw error;
    }
  }

  public async handleUpdate(update: Update) {
    try {
      await this.bot.handleUpdate(update);
    } catch (error) {
      console.error('Error handling webhook update:', error);
      throw error;
    }
  }
}