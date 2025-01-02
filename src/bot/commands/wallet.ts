import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';

export const walletHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId || !ctx.from || !ctx.chat) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    const address = await UserService.getWalletAddress(telegramId);
    
    if (!address) {
      await ctx.reply(ERROR_MESSAGES.NOT_REGISTERED);
      return;
    }

    const walletInfo = `🔐 Información de tu wallet:\n\n` +
                      `📫 Dirección: ${address}\n\n` +
                      `⚠️ Nunca compartas información sensible.`;

    if (ctx.chat.type !== 'private') {
      await ctx.reply(MESSAGES.WALLET_INFO);
      await ctx.telegram.sendMessage(
        ctx.from.id,
        walletInfo
      );
    } else {
      await ctx.reply(walletInfo);
    }
  } catch (error) {
    console.error('Error obteniendo info de wallet:', error);
    await ctx.reply(ERROR_MESSAGES.GENERIC);
  }
};