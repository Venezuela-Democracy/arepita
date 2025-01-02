import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { VENEZUELA_REGIONS, VENEZUELA_REGIONS_DISPLAY } from '../regions';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';
import { VenezuelaRegion } from '../regions';
import { Context } from 'telegraf';

const flowWallet = new FlowWallet();

const getRegionsKeyboard = () => {
  const regions = Object.entries(VENEZUELA_REGIONS);
  const COLUMNS = 2;
  const buttons = [];
  
  for (let i = 0; i < regions.length; i += COLUMNS) {
    const row = regions.slice(i, i + COLUMNS).map(([key, _]) => 
      Markup.button.callback(VENEZUELA_REGIONS_DISPLAY[key as keyof typeof VENEZUELA_REGIONS_DISPLAY], `region:${key}`)
    );
    buttons.push(row);
  }

  return Markup.inlineKeyboard(buttons);
};

export const registerHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    const isRegistered = await UserService.isRegistered(telegramId);

    if (isRegistered) {
      await ctx.reply(ERROR_MESSAGES.ALREADY_REGISTERED);
      return;
    }

    ctx.session = {
      registrationStep: 'WAITING_REGION'
    };

    await ctx.reply(
        `🗺 *¡Bienvenido al registro de VenezuelaDAO!*

        🔸 *Proceso de registro:*
          1️⃣ Seleccionar tu región
          2️⃣ Crear tu wallet de Flow
          3️⃣ ¡Listo para comprar NFTs!
        
        Por favor, selecciona tu región de Venezuela:`,
      {
        parse_mode: 'Markdown',
        ...getRegionsKeyboard()
      }
    );
  } catch (error) {
    console.error('Error en comando register:', error);
    await ctx.reply(ERROR_MESSAGES.GENERIC);
  }
};

// Extendemos el tipo Context para incluir el match
type RegionActionContext = Context & {
  match: RegExpExecArray;
} & BotContext;

export const registerActionHandler = async (ctx: RegionActionContext) => {
  try {
    if (!ctx.session || ctx.session.registrationStep !== 'WAITING_REGION') {
      await ctx.answerCbQuery('Sesión inválida. Por favor, inicia el registro nuevamente.');
      return;
    }

    const selectedRegion = ctx.match[1];
    const telegramId = ctx.from?.id.toString();

    if (!telegramId || !ctx.from) {
      await ctx.answerCbQuery('Error: ID de usuario no encontrado');
      return;
    }

    await ctx.answerCbQuery(`Has seleccionado: ${VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY]}`);

    await ctx.editMessageText(
      `🎯 Has seleccionado: *${VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY]}*\n\n` +
      'Procesando registro...',
      { parse_mode: 'Markdown' }
    );

    const wallet = await flowWallet.createWallet();
    
    await UserService.createUser({
      telegramId,
      region: selectedRegion as VenezuelaRegion,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey
      }
    });

    ctx.session.registrationStep = 'COMPLETED';
    ctx.session.selectedRegion = selectedRegion as VenezuelaRegion;

    await ctx.editMessageText(
      `✅ ¡Registro exitoso!\n\n` +
      `🏠 Región: ${VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY]}\n` +
      `💫 Tu wallet ha sido creada exitosamente.\n\n` +
      `Usa /help para ver los comandos disponibles.`
    );

    await ctx.telegram.sendMessage(
      ctx.from.id,
      `🔐 Guarda esta información en un lugar seguro:\n\n` +
      `📫 Dirección: ${wallet.address}\n` +
      `🔑 Private Key: ${wallet.privateKey}\n\n` +
      `⚠️ NUNCA compartas tu Private Key con nadie.`
    );

  } catch (error) {
    console.error('Error en registro:', error);
    await ctx.editMessageText(ERROR_MESSAGES.GENERIC);
  }
};