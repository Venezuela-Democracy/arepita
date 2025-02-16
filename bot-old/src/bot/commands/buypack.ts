import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { FlowWallet } from '../../wallet';
import { UserService } from '../../services';
import * as fcl from "@onflow/fcl";

import { Markup } from 'telegraf';


const getPackAmountKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('1 Pack', 'buy_pack:1'),
      Markup.button.callback('5 Packs', 'buy_pack:5'),
    ],
    [
      Markup.button.callback('10 Packs', 'buy_pack:10'),
      Markup.button.callback('15 Packs', 'buy_pack:15'),
    ]
  ]);
};

export async function buyPackHandler(ctx: BotContext) {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';

    // Verificar que el usuario esté registrado
    const isRegistered = await UserService.isRegistered(telegramId);
    if (!isRegistered) {
      await ctx.reply(MESSAGES[userLanguage].NOT_REGISTERED_BUY_PACK, 
      { parse_mode: 'Markdown' });
      return;
    }

    // Mostrar opciones de cantidad
    await ctx.reply(
      MESSAGES[userLanguage].SELECT_PACK_AMOUNT,
      getPackAmountKeyboard()
    );

  } catch (error) {
    console.error('Error en buyPack command:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
}

// Nuevo handler para el callback de compra
export async function buyPackActionHandler(ctx: BotContext) {
  try {
    const amount = parseInt(ctx.match?.[1] ?? '0');
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';

    const processingMessage = await ctx.reply(
      MESSAGES[userLanguage].BUYING_PACKS_PROCESSING.replace('{amount}', amount.toString()), 
      { parse_mode: 'Markdown' }
    );

    // Obtener datos de autenticación del usuario
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
      return;
    }

    // Comprar los packs
    const wallet = new FlowWallet();
    const buyTxId = await wallet.buyPack(
      authData.address,
      authData.privateKey,
      amount
    );

    // Esperar a que se complete la compra
    const buyTxStatus = await fcl.tx(buyTxId).onceSealed();
    
    if (buyTxStatus.status !== 4) {
      throw new Error(MESSAGES[userLanguage].BUY_PACK_ERROR);
    }

    await ctx.reply(
      MESSAGES[userLanguage].PACKS_BOUGHT_SUCCESS
        .replace('{amount}', amount.toString())
        .replace('{txId}', buyTxId),
      { parse_mode: 'Markdown' }
    );

    await ctx.reply(MESSAGES[userLanguage].USE_REVEAL_COMMAND);

  } catch (error) {
    console.error('Error en buyPack action:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
}