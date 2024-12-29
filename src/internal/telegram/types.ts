import { Context } from 'telegraf';

export interface BotContext extends Context {
  // Puedes extender el contexto si necesitas datos adicionales
}

export interface CommandConfig {
  name: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}