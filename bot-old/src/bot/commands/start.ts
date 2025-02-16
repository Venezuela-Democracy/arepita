import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { MESSAGES } from '../constants';
import { UserService } from '../../services';
import { ENV } from '../../config/env';

const getLanguageKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇪🇸 Español', 'language:es'),
      Markup.button.callback('🇺🇸 English', 'language:en')
    ]
  ]);
};

const getMiniAppKeyboard = (language: 'es' | 'en') => {
  return Markup.keyboard([
    [
      Markup.button.webApp(
        language === 'es' ? '🎮 Abrir VzlaDAO App' : '🎮 Open VzlaDAO App',
        ENV.MINI_APP_URL
      )
    ]
  ]).resize();
};

export const startHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    // Verificar si el usuario ya tiene idioma configurado
    const userLanguage = await UserService.getUserLanguage(telegramId);
    
    if (userLanguage) {
      // Si ya tiene idioma, mostrar mensaje de bienvenida y botón de mini app
      await ctx.reply(
        MESSAGES[userLanguage].WELCOME,
        getMiniAppKeyboard(userLanguage)
      );
      return;
    }

    // Si no tiene idioma, mostrar selector
    ctx.session = { registrationStep: 'WAITING_LANGUAGE' };
    await ctx.reply(
      MESSAGES.es.WELCOME,
      getLanguageKeyboard()
    );
  } catch (error) {
    console.error('Error en start command:', error);
  }
};

export const languageActionHandler = async (ctx: BotContext) => {
  try {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const match = ctx.callbackQuery.data.match(/language:(\w+)/);
    if (!match) return;

    const [_, language] = match;
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    // Guardar el idioma en la BD
    await UserService.setUserLanguage(telegramId, language as 'es' | 'en');

    // Actualizar mensaje con el siguiente paso y mostrar botón de mini app
    await ctx.editMessageText(
      MESSAGES[language as 'es' | 'en'].LANGUAGE_SELECTED,
      { parse_mode: 'Markdown' }
    );

    // Enviar nuevo mensaje con el botón de la mini app
    await ctx.reply(
      MESSAGES[language as 'es' | 'en'].WELCOME_MINI_APP,
      getMiniAppKeyboard(language as 'es' | 'en')
    );

  } catch (error) {
    console.error('Error en language action:', error);
  }
};