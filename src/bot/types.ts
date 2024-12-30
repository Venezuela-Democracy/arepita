import { Context } from 'telegraf';
import { BOT_COMMANDS } from './constants';

export interface BotContext extends Context {
  // Puedes extender el contexto si necesitas datos adicionales
}

export interface CommandConfig {
  name: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}

export type BotCommand = keyof typeof BOT_COMMANDS;
export type CommandValue = typeof BOT_COMMANDS[BotCommand];