import { Telegraf } from 'telegraf';
import { BotContext } from './types';
import { ERROR_MESSAGES, MESSAGES } from './constants';
import { registerCommands } from './commands';

export class TelegramBot {
  private bot: Telegraf<BotContext>;

  constructor(token: string) {
    this.bot = new Telegraf<BotContext>(token);
    this.initialize();
  }

  private initialize() {
    // Registrar comandos
    registerCommands(this.bot);

    // Manejar mensajes de texto
    this.bot.on('text', async (ctx) => {
      try {
        await ctx.reply(`Recibí tu mensaje: ${ctx.message.text}`);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Manejar errores
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply(ERROR_MESSAGES.GENERIC);
    });
  }

  public getBot() {
    return this.bot;
  }

  public async launch() {
    await this.bot.launch();
    console.log('Bot started successfully');
  }

  public async stop(reason?: string) {
    await this.bot.stop(reason);
    console.log(`Bot stopped: ${reason || 'No reason provided'}`);
  }
}