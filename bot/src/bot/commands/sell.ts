import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';

const flowWallet = new FlowWallet();

// Estado para mantener los precios temporalmente
const priceState: { [key: string]: number } = {};

const getSellKeyboard = (
  totalLocations: number,
  totalCharacters: number,
  totalItems: number,
  userLanguage: 'es' | 'en'
) => {
  const labels = {
    es: {
      locations: `📍 Vender Ubicaciones (${totalLocations})`,
      characters: `👤 Vender Personajes (${totalCharacters})`,
      items: `🎨 Vender Items Culturales (${totalItems})`
    },
    en: {
      locations: `📍 Sell Locations (${totalLocations})`,
      characters: `👤 Sell Characters (${totalCharacters})`,
      items: `🎨 Sell Cultural Items (${totalItems})`
    }
  };

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(labels[userLanguage].locations, 'sell:locations:0'),
      Markup.button.callback(labels[userLanguage].characters, 'sell:characters:0')
    ],
    [
      Markup.button.callback(labels[userLanguage].items, 'sell:items:0')
    ],
    [
      Markup.button.callback('🔙 Back', 'sell:main')
    ]
  ]);
};

const getNavigationKeyboard = (
  currentIndex: number,
  totalItems: number,
  type: string,
  userLanguage: 'es' | 'en',
  showSellButton: boolean = true
) => {
  const buttons = [];
  const navigationRow = [];

  if (currentIndex > 0) {
    navigationRow.push(
      Markup.button.callback('⬅️', `sell:${type}:${currentIndex - 1}`)
    );
  }

  navigationRow.push(
    Markup.button.callback('🔙', 'sell:main')
  );

  if (currentIndex < totalItems - 1) {
    navigationRow.push(
      Markup.button.callback('➡️', `sell:${type}:${currentIndex + 1}`)
    );
  }

  buttons.push(navigationRow);

  if (showSellButton) {
    buttons.push([
      Markup.button.callback(
        userLanguage === 'es' ? '💰 Establecer Precio' : '💰 Set Price',
        `sell:setprice:${type}:${currentIndex}`
      )
    ]);
  }

  return Markup.inlineKeyboard(buttons);
};

const formatNFTMessage = (nft: any, type: string, userLanguage: 'es' | 'en') => {
  try {
    if (!nft || !nft.display) {
      return userLanguage === 'es' ? 
        '❌ Error: No se pudieron cargar los datos del NFT' :
        '❌ Error: Could not load NFT data';
    }

    let message = '';
    if (nft.display.thumbnail?.url) {
      message += `[⚜️](${nft.display.thumbnail.url})`;
    }
    message += `*${nft.display.name || 'NFT'}*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;

    const traits = nft.traits?.traits?.reduce((acc: any, trait: any) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {}) || {};

    const labels = {
      es: {
        location: 'UBICACIÓN',
        region: 'Región',
        stats: 'ESTADÍSTICAS',
        influence: 'Poder de Influencia',
        development: 'Desarrollo Regional',
        specialty: 'Especialidad',
        character: 'PERSONAJE',
        class: 'Clase',
        influence_gen: 'Influencia',
        campaign_cost: 'Costo de Campaña',
        leadership: 'HABILIDADES DE LIDERAZGO',
        cultural: 'ITEM CULTURAL',
        category: 'Categoría',
        effects: 'EFECTOS'
      },
      en: {
        location: 'LOCATION',
        region: 'Region',
        stats: 'STATISTICS',
        influence: 'Influence Power',
        development: 'Regional Development',
        specialty: 'Specialty',
        character: 'CHARACTER',
        class: 'Class',
        influence_gen: 'Influence',
        campaign_cost: 'Campaign Cost',
        leadership: 'LEADERSHIP ABILITIES',
        cultural: 'CULTURAL ITEM',
        category: 'Category',
        effects: 'EFFECTS'
      }
    };

    switch (type) {
      case 'locations':
        message += `📍 *${labels[userLanguage].location}*\n`;
        message += `🌎 ${labels[userLanguage].region}: ${traits.region || 'N/A'}\n`;
        message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
        message += `⚡ ${labels[userLanguage].influence}: ${traits.influence_generation || '0'}/día\n`;
        message += `🏗️ ${labels[userLanguage].development}: ${traits.regional_generation || '0'}/día\n`;
        message += `🎯 ${labels[userLanguage].specialty}: ${traits.type || 'N/A'}\n`;
        break;

      case 'characters':
        message += `👤 *${labels[userLanguage].character}*\n`;
        message += `🎭 ${labels[userLanguage].class}: ${traits.characterTypes || 'N/A'}\n`;
        message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
        message += `⚡ ${labels[userLanguage].influence_gen}: ${traits.influence_generation || '0'}/día\n`;
        message += `💰 ${labels[userLanguage].campaign_cost}: ${traits.launchCost || '0'}\n\n`;
        break;

      case 'items':
        message += `🎨 *${labels[userLanguage].cultural}*\n`;
        message += `🎯 ${labels[userLanguage].category}: ${traits.type || 'N/A'}\n`;
        message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
        message += `⚡ ${labels[userLanguage].influence_gen}: ${traits.influence_generation || '0'}/día\n\n`;
        break;
    }

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `🆔 NFT ID: ${nft.id}`;

    return message;
  } catch (error) {
    console.error('Error formatting NFT message:', error);
    return userLanguage === 'es' ? 
      '❌ Error al formatear el NFT' :
      '❌ Error formatting NFT';
  }
};

export const sellHandler = async (ctx: BotContext) => {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
    const address = await UserService.getWalletAddress(telegramId);
    
    if (!address) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].NOT_REGISTERED);
      return;
    }

    const collection = await flowWallet.nft.getNFTCollection(address);
    
    await ctx.reply(
      MESSAGES[userLanguage].SELL_NFT_TITLE + '\n\n' + 
      MESSAGES[userLanguage].SELL_NFT_SELECT,
      {
        parse_mode: 'Markdown',
        ...getSellKeyboard(
          collection.locations.length,
          collection.characters.length,
          collection.culturalItems.length,
          userLanguage
        )
      }
    );

  } catch (error) {
    console.error('Error en sell command:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};

export const sellActionHandler = async (ctx: BotContext) => {
  try {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    
    const match = ctx.callbackQuery.data.match(/sell:(\w+)(?::(\w+))?(?::(\d+))?/);
    if (!match) return;

    const [_, action, type, param] = match;
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.answerCbQuery(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
    const address = await UserService.getWalletAddress(telegramId);
    
    if (!address) {
      await ctx.answerCbQuery(ERROR_MESSAGES[userLanguage].NOT_REGISTERED);
      return;
    }

    // Manejar la acción principal del menú
    if (action === 'main') {
      const collection = await flowWallet.nft.getNFTCollection(address);
      await ctx.editMessageText(
        MESSAGES[userLanguage].SELL_NFT_TITLE + '\n\n' + 
        MESSAGES[userLanguage].SELL_NFT_SELECT,
        {
          parse_mode: 'Markdown',
          reply_markup: getSellKeyboard(
            collection.locations.length,
            collection.characters.length,
            collection.culturalItems.length,
            userLanguage
          ).reply_markup
        }
      );
      return;
    }

    // Manejar la configuración de precio
    if (action === 'setprice') {
      const collection = await flowWallet.nft.getNFTCollection(address);
      const nfts = type === 'locations' ? collection.locations :
                   type === 'characters' ? collection.characters :
                   collection.culturalItems;
      
      const nft = nfts[parseInt(param)];
      
      if(ctx.session){
      // Guardar el NFT ID en el estado temporal
      ctx.session.selectedNFTId = nft.id;
      ctx.session.selectedNFTType = type;

      await ctx.editMessageText(
        MESSAGES[userLanguage].SELL_NFT_SET_PRICE,
        { parse_mode: 'Markdown' }
      );

      // Establecer el estado para esperar el precio
      ctx.session.awaitingPrice = true;
    }
      return;
    }

    // Manejar la navegación y visualización de NFTs
    const collection = await flowWallet.nft.getNFTCollection(address);
    const nfts = action === 'locations' ? collection.locations :
                 action === 'characters' ? collection.characters :
                 collection.culturalItems;

    if (nfts.length === 0) {
      await ctx.answerCbQuery(
        userLanguage === 'es' ? 
          'No tienes NFTs en esta categoría' :
          'You don\'t have any NFTs in this category'
      );
      return;
    }

    const index = parseInt(param || '0');
    if (index >= nfts.length) {
      await ctx.answerCbQuery(
        userLanguage === 'es' ? 
          'Índice no válido' :
          'Invalid index'
      );
      return;
    }

    const nft = nfts[index];
    const message = formatNFTMessage(nft, action, userLanguage);
    
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getNavigationKeyboard(index, nfts.length, action, userLanguage).reply_markup
    });

  } catch (error) {
    console.error('Error en sell action:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.answerCbQuery(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};

// Manejador para procesar el precio ingresado
export const handlePrice = async (ctx: BotContext) => {
  if (!ctx.message || !('text' in ctx.message)) return;
  if (!ctx.session?.awaitingPrice) return;

  const telegramId = ctx.from?.id.toString();
  if (!telegramId) {
    await ctx.reply(ERROR_MESSAGES.es.GENERIC);
    return;
  }

  const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
  const price = parseFloat(ctx.message.text);

  if (isNaN(price) || price <= 0) {
    await ctx.reply(
      userLanguage === 'es' ?
        '❌ Por favor, ingresa un precio válido mayor a 0' :
        '❌ Please enter a valid price greater than 0'
    );
    return;
  }

  try {
    const address = await UserService.getWalletAddress(telegramId);
    const privateKey = await UserService.getPrivateKey(telegramId);

    if (!address || !privateKey) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].NOT_REGISTERED);
      return;
    }

    // Crear el listing
    await flowWallet.storefront.createListing(
      address,
      privateKey,
      ctx.session.selectedNFTId as number,
      price,
      [] // marketplacesAddress vacío por ahora
    );

    // Limpiar el estado
    ctx.session.awaitingPrice = false;
    ctx.session.selectedNFTId = undefined;
    ctx.session.selectedNFTType = undefined;

    await ctx.reply(MESSAGES[userLanguage].SELL_NFT_SUCCESS);
  } catch (error) {
    console.error('Error creating listing:', error);
    await ctx.reply(MESSAGES[userLanguage].SELL_NFT_ERROR);
  }
};