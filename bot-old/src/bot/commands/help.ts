import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';

export const helpHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    // Obtener el idioma del usuario
    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';

    // Enviar el mensaje de ayuda en el idioma correspondiente
    await ctx.reply(MESSAGES[userLanguage].HELP, { 
      parse_mode: 'Markdown' 
    });

  } catch (error) {
    console.error('Error en help command:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};