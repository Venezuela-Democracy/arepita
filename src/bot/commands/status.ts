import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { VENEZUELA_REGIONS_DISPLAY } from '../regions';
import { UserService } from '../../services';


export const statusHandler = async (ctx: BotContext) => {
    try {
      const telegramId = ctx.from?.id.toString();
      
      if (!telegramId) {
        await ctx.reply(ERROR_MESSAGES.es.GENERIC);
        return;
      }
  
      const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
      const isRegistered = await UserService.isRegistered(telegramId);
      
      if (!isRegistered) {
        await ctx.reply(MESSAGES[userLanguage].STATUS_NOT_REGISTERED, { parse_mode: 'Markdown' });
        return;
      }
  
      const region = await UserService.getRegion(telegramId);
      
      if (!region) {
        await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
        return;
      }
  
      const message = MESSAGES[userLanguage].STATUS_INFO
        .replace('{region}', VENEZUELA_REGIONS_DISPLAY[region]);
  
      await ctx.reply(message, { parse_mode: 'Markdown' });
  
    } catch (error) {
      console.error('Error en status command:', error);
      const userLanguage = ctx.from?.id ? 
        await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
        : 'es';
      await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
    }
  };