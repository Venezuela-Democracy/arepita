import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { VENEZUELA_REGIONS_DISPLAY } from '../regions';
import { UserService } from '../../services';


export const statusHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    const isRegistered = await UserService.isRegistered(telegramId);
    
    if (!isRegistered) {
      await ctx.reply(`
🟢 *Estado del Sistema*

❌ No estás registrado
➡️ Usa /register para comenzar`, { parse_mode: 'Markdown' });
      return;
    }

    // Obtener la región del usuario
    const region = await UserService.getRegion(telegramId);
    
    if (!region) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    await ctx.reply(`
🟢 *Estado del Sistema*

👤 *Tu Información*
🏠 Región: ${VENEZUELA_REGIONS_DISPLAY[region]}
✅ Bot funcionando correctamente`, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error en status command:', error);
    await ctx.reply(ERROR_MESSAGES.GENERIC);
  }
};