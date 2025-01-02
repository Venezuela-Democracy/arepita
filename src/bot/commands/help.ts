import { BotContext } from '../types';
import { MESSAGES } from '../constants';

export const helpHandler = async (ctx: BotContext) => {
  await ctx.reply(MESSAGES.HELP);
};