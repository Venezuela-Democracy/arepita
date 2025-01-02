import { BotContext } from '../types';

export const statusHandler = async (ctx: BotContext) => {
  await ctx.reply('🟢 Bot funcionando correctamente');
};