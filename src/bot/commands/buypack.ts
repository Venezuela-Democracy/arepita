import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { FlowWallet } from '../../wallet';
import { UserService } from '../../services';

export async function buyPackHandler(ctx: BotContext) {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    // Verificar que el usuario esté registrado
    const isRegistered = await UserService.isRegistered(telegramId);
    if (!isRegistered) {
      await ctx.reply(ERROR_MESSAGES.NOT_REGISTERED);
      return;
    }

    await ctx.reply(MESSAGES.BUYPACK_WAITING);

    // Obtener datos de autenticación del usuario
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    // Ejecutar la transacción
    const wallet = new FlowWallet();
    const txId = await wallet.buyPack(
      authData.address,
      authData.privateKey
    );

    await ctx.reply(MESSAGES.BUYPACK_SUCCESS);

  } catch (error) {
    console.error('Error en buyPack command:', error);
    await ctx.reply(MESSAGES.BUYPACK_ERROR);
  }
}