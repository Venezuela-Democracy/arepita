import { Context } from 'telegraf';
import { BOT_COMMANDS } from './constants';
import { VENEZUELA_REGIONS } from './regions';

// Definir estados posibles de registro
export type RegistrationStep = 'WAITING_REGION' | 'COMPLETED';

// Definir estructura de la sesión
export interface BotSession {
  registrationStep?: RegistrationStep;
  selectedRegion?: keyof typeof VENEZUELA_REGIONS;
}

// Extender el contexto con nuestra sesión
export interface BotContext extends Context {
  session?: BotSession;
}

export interface CommandConfig {
  name: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}

export type BotCommand = keyof typeof BOT_COMMANDS;
export type CommandValue = typeof BOT_COMMANDS[BotCommand];
export type VenezuelaRegion = keyof typeof VENEZUELA_REGIONS;