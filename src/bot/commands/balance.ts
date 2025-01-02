import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';

const flowWallet = new FlowWallet();

export const balanceHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    const address = await UserService.getWalletAddress(telegramId);
    
    if (!address) {
      await ctx.reply(ERROR_MESSAGES.NOT_REGISTERED);
      return;
    }

    const balance = await flowWallet.getBalance(address);
    await ctx.reply(`
        💰 *Balance de tu Wallet*
        
        ${balance} FLOW
        
        💡 _Necesitas FLOW para comprar packs de NFTs_`, 
            { parse_mode: 'Markdown' });
    
    await UserService.updateLastActive(telegramId);
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    await ctx.reply(ERROR_MESSAGES.GENERIC);
  }
};