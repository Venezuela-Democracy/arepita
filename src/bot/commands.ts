import { Telegraf } from 'telegraf';
import { BotContext } from './types';
import { BOT_COMMANDS, MESSAGES } from './constants';
import { User } from '../models';
import { FlowWallet } from '../wallet';

const flowWallet = new FlowWallet();

export const registerCommands = (bot: Telegraf<BotContext>) => {
  bot.command(BOT_COMMANDS.START, async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    let user = await User.findOne({ telegramId });
    if (!user) {
      // Crear nueva wallet
      const wallet = await flowWallet.createWallet();
      
      // Guardar usuario
      user = await User.create({
        telegramId,
        wallet: {
          address: wallet.address,
          privateKey: wallet.privateKey
        }
      });
    }

    await ctx.reply(
      `¡Bienvenido a VenezuelaDAO!\n` +
      `Tu wallet de Flow: ${user.wallet.address}`
    );

    await ctx.reply(
      "Tu private key es: " + user.wallet.privateKey + "\n" +
      "Guardala en un lugar seguro y no compartas con nadie."
    )
  });

  bot.command(BOT_COMMANDS.HELP, async (ctx) => {
    await ctx.reply(MESSAGES.HELP);
  });

  bot.command(BOT_COMMANDS.STATUS, async (ctx) => {
    await ctx.reply('🟢 Bot funcionando correctamente');
  });

  // Configurar comandos en el menú del bot
  bot.telegram.setMyCommands([
    { command: BOT_COMMANDS.START, description: 'Iniciar bot' },
    { command: BOT_COMMANDS.HELP, description: 'Ver ayuda' },
    { command: BOT_COMMANDS.STATUS, description: 'Ver estado del bot' },
  ]);
};