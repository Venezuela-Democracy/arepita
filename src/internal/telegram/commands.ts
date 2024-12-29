import { Telegraf } from 'telegraf';
import { BotContext } from './types';
import { BOT_COMMANDS, MESSAGES } from './constants';

export const registerCommands = (bot: Telegraf<BotContext>) => {
  bot.command(BOT_COMMANDS.START, async (ctx) => {
    await ctx.reply(MESSAGES.WELCOME);
  });

  bot.command(BOT_COMMANDS.HELP, async (ctx) => {
    await ctx.reply(MESSAGES.HELP);
  });

  bot.command(BOT_COMMANDS.STATUS, async (ctx) => {
    await ctx.reply('🟢 Bot funcionando correctamente');
  });

  // Configurar comandos en el menú del bot
  bot.telegram.setMyCommands([
    { command: BOT_COMMANDS.START, description: 'Iniciar bot' },
    { command: BOT_COMMANDS.HELP, description: 'Ver ayuda' },
    { command: BOT_COMMANDS.STATUS, description: 'Ver estado del bot' },
  ]);
};