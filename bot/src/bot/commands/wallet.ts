import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';

export const walletHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId || !ctx.from || !ctx.chat) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    // Obtener el idioma del usuario
    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';

    const address = await UserService.getWalletAddress(telegramId);
    
    if (!address) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].NOT_REGISTERED);
      return;
    }

    // Usar el mensaje de wallet details con el idioma del usuario
    const walletInfo = MESSAGES[userLanguage].WALLET_DETAILS
      .replace('{address}', address);

    if (ctx.chat.type !== 'private') {
      // Si no es chat privado, enviar mensaje de privacidad y la info por privado
      await ctx.reply(MESSAGES[userLanguage].WALLET_INFO);
      await ctx.telegram.sendMessage(
        ctx.from.id,
        walletInfo,
        { parse_mode: 'Markdown' }
      );
    } else {
      // Si es chat privado, enviar la info directamente
      await ctx.reply(walletInfo, { parse_mode: 'Markdown' });
    }

    await UserService.updateLastActive(telegramId);
  } catch (error) {
    console.error('Error obteniendo info de wallet:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};