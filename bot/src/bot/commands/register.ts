import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { VENEZUELA_REGIONS, VENEZUELA_REGIONS_DISPLAY } from '../regions';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';
import { VenezuelaRegion } from '../regions';
import { Context } from 'telegraf';
import { TelegramGroupManager } from '../managers/group';

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
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    // Obtener el idioma del usuario (que ya debería estar configurado desde /start)
    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
    console.log('🌍 Idioma del usuario en register:', userLanguage);
    const isRegistered = await UserService.isRegistered(telegramId);

    if (isRegistered) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].ALREADY_REGISTERED);
      return;
    }

    // Iniciar selección de región
    ctx.session = {
      registrationStep: 'WAITING_REGION',
      selectedLanguage: userLanguage
    };

    await ctx.reply(
      MESSAGES[userLanguage].REGISTER_START + '\n\n' +
      MESSAGES[userLanguage].SELECT_REGION,
      {
        parse_mode: 'Markdown',
        ...getRegionsKeyboard()
      }
    );
  } catch (error) {
    console.error('Error en comando register:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};

type RegionActionContext = Context & {
  match: RegExpExecArray;
} & BotContext;

export const registerActionHandler = (groupManager: TelegramGroupManager) => async (ctx: RegionActionContext) => {
  try {
    
    if (!ctx.session || ctx.session.registrationStep !== 'WAITING_REGION') {
      const userLanguage = ctx.session?.selectedLanguage || 'es';
      await ctx.answerCbQuery(MESSAGES[userLanguage].INVALID_SESSION);
      return;
    }

    const selectedRegion = ctx.match[1];
    const telegramId = ctx.from?.id.toString();
    const userLanguage = await UserService.getUserLanguage(telegramId as string) || 'es';
    console.log('🌍 Idioma del usuario en registerAction:', userLanguage); // Debug log

    if (!telegramId || !ctx.from) {
      await ctx.answerCbQuery(ERROR_MESSAGES[userLanguage].GENERIC);
      return;
    }

    await ctx.answerCbQuery(
      MESSAGES[userLanguage].REGION_SELECTED
        .replace('{region}', VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY])
    );

    await ctx.editMessageText(
      MESSAGES[userLanguage].PROCESSING_REGISTRATION
        .replace('{region}', VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY]),
      { parse_mode: 'Markdown' }
    );

    const wallet = await flowWallet.account.createWallet();
    
    // Crear usuario con el idioma ya seleccionado
    await UserService.createUser({
      telegramId,
      region: selectedRegion as VenezuelaRegion,
      language: userLanguage,
      wallet: {
        address: wallet.address,
        privateKey: wallet.privateKey
      }
    });

    // Añadir usuario a los grupos
    await groupManager.addUserToGroups(ctx.from.id, selectedRegion);

    ctx.session.registrationStep = 'COMPLETED';
    ctx.session.selectedRegion = selectedRegion as VenezuelaRegion;

    await ctx.editMessageText(
      MESSAGES[userLanguage].REGISTER_SUCCESS
        .replace('{region}', VENEZUELA_REGIONS_DISPLAY[selectedRegion as keyof typeof VENEZUELA_REGIONS_DISPLAY]),
      { parse_mode: 'Markdown' }
    );

    await ctx.telegram.sendMessage(
      ctx.from.id,
      MESSAGES[userLanguage].WALLET_DETAILS
        .replace('{address}', wallet.address),
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    const userLanguage = ctx.session?.selectedLanguage || 'es';
    await ctx.editMessageText(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};