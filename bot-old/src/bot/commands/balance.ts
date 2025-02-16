import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';

const flowWallet = new FlowWallet();

export const balanceHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
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

    const balance = await flowWallet.getBalance(address);
    
    // Usar el mensaje de balance en el idioma correspondiente
    const message = MESSAGES[userLanguage].BALANCE_MESSAGE
      .replace('{balance}', balance);

    await ctx.reply(message, { parse_mode: 'Markdown' });
    
    await UserService.updateLastActive(telegramId);
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};