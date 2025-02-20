import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';

const flowWallet = new FlowWallet();

const getCollectionKeyboard = (
  totalLocations: number,
  totalCharacters: number,
  totalItems: number,
  userLanguage: 'es' | 'en'
) => {
  const labels = {
    es: {
      locations: `📍 Ubicaciones (${totalLocations})`,
      characters: `👤 Personajes (${totalCharacters})`,
      items: `🎨 Items Culturales (${totalItems})`
    },
    en: {
      locations: `📍 Locations (${totalLocations})`,
      characters: `👤 Characters (${totalCharacters})`,
      items: `🎨 Cultural Items (${totalItems})`
    }
  };

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(labels[userLanguage].locations, 'collection:locations:0'),
      Markup.button.callback(labels[userLanguage].characters, 'collection:characters:0')
    ],
    [
      Markup.button.callback(labels[userLanguage].items, 'collection:items:0')
    ]
  ]);
};

const formatNFTMessage = (nftGroup: any, type: string, userLanguage: 'es' | 'en') => {
  try {
    if (!nftGroup || !nftGroup.display) {
      console.error('NFT data is invalid:', nftGroup);
      return userLanguage === 'es' ? 
        '❌ Error: No se pudieron cargar los datos del NFT' :
        '❌ Error: Could not load NFT data';
    }

    const labels = {
      es: {
        copies: 'Copias',
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
        effects: 'EFECTOS',
        description: 'Descripción'
      },
      en: {
        copies: 'Copies',
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
        effects: 'EFFECTS',
        description: 'Description'
      }
    };

    let message = '';
    if (nftGroup.display.thumbnail?.url) {
      message += `[⚜️](${nftGroup.display.thumbnail.url})`;
    }
    message += `*${nftGroup.display.name || 'NFT'}*`;
    message += nftGroup.count > 1 ? ` (x${nftGroup.count})` : '';
    message += `\n━━━━━━━━━━━━━━━\n\n`;

    // Obtener los traits de manera correcta
    const traits = nftGroup.instances[0].traits.traits.reduce((acc: any, trait: any) => {
      acc[trait.name] = trait.value;
      return acc;
    }, {});

    console.log('Traits procesados:', traits); // Debug

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
        
        if (traits.presidentEffects) {
          message += `👑 *${labels[userLanguage].leadership}*\n`;
          try {
            const effects = JSON.parse(traits.presidentEffects);
            if (effects.effectCostReduction) {
              Object.entries(effects.effectCostReduction).forEach(([key, value]) => {
                message += `• ${key}: -${value}%\n`;
              });
            }
            if (effects.developmentEffect) {
              Object.entries(effects.developmentEffect).forEach(([key, value]) => {
                message += `• ${key}: +${value}%\n`;
              });
            }
          } catch (e) {
            console.error('Error parsing president effects:', e);
          }
        }
        break;

      case 'items':
        message += `🎨 *${labels[userLanguage].cultural}*\n`;
        message += `🎯 ${labels[userLanguage].category}: ${traits.type || 'N/A'}\n`;
        message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
        message += `⚡ ${labels[userLanguage].influence_gen}: ${traits.influence_generation || '0'}/día\n\n`;
        
        if (traits.specialEffects) {
          try {
            const effects = JSON.parse(traits.specialEffects);
            if (effects.votingEffect) {
              message += `🗳️ *${labels[userLanguage].effects}*\n`;
              Object.entries(effects.votingEffect).forEach(([key, value]) => {
                message += `• ${key}: +${value}%\n`;
              });
            }
          } catch (e) {
            console.error('Error parsing special effects:', e);
          }
        }
        break;
    }

    if (nftGroup.display.description) {
      message += `\n📝 *${labels[userLanguage].description}*\n${nftGroup.display.description}\n`;
    }

    if (nftGroup.count > 1) {
      message += `\n🔢 *${labels[userLanguage].copies}:*\n`;
      nftGroup.instances.forEach((instance: any) => {
        message += `• #${instance.serial.number}\n`;
      });
    }

    return message;
  } catch (error) {
    console.error('Error formatting NFT message:', error, '\nNFT data:', nftGroup);
    return userLanguage === 'es' ? 
      '❌ Error al formatear los datos del NFT' :
      '❌ Error formatting NFT data';
  }
};

const getNavigationKeyboard = (currentIndex: number, totalItems: number, type: string, userLanguage: 'es' | 'en') => {
  const buttons = [];
  const labels = {
    es: {
      previous: '⬅️ Anterior',
      next: '➡️ Siguiente',
      back: '🔙 Volver'
    },
    en: {
      previous: '⬅️ Previous',
      next: '➡️ Next',
      back: '🔙 Back'
    }
  };
  
  if (currentIndex > 0) {
    buttons.push(Markup.button.callback(labels[userLanguage].previous, `collection:${type}:${currentIndex - 1}`));
  }
  
  if (currentIndex < totalItems - 1) {
    buttons.push(Markup.button.callback(labels[userLanguage].next, `collection:${type}:${currentIndex + 1}`));
  }
  
  buttons.push(Markup.button.callback(labels[userLanguage].back, 'collection:main'));
  
  return Markup.inlineKeyboard([buttons]);
};

export const collectionHandler = async (ctx: BotContext) => {
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
    
    const labels = {
      es: {
        title: '🗂 Tu Colección de NFTs',
        locations: '📍 Ubicaciones',
        characters: '👤 Personajes',
        items: '🎨 Items Culturales',
        select: 'Selecciona una categoría para ver tus NFTs:',
        unique: 'únicos',
        total: 'total'
      },
      en: {
        title: '🗂 Your NFT Collection',
        locations: '📍 Locations',
        characters: '👤 Characters',
        items: '🎨 Cultural Items',
        select: 'Select a category to view your NFTs:',
        unique: 'unique',
        total: 'total'
      }
    };

    const getTotalCount = (items: any[]) => items.reduce((sum, item) => sum + item.count, 0);

    await ctx.reply(
      `${labels[userLanguage].title}\n\n` +
      `${labels[userLanguage].locations}: ${collection.locations.length} ${labels[userLanguage].unique} (${getTotalCount(collection.locations)} ${labels[userLanguage].total})\n` +
      `${labels[userLanguage].characters}: ${collection.characters.length} ${labels[userLanguage].unique} (${getTotalCount(collection.characters)} ${labels[userLanguage].total})\n` +
      `${labels[userLanguage].items}: ${collection.culturalItems.length} ${labels[userLanguage].unique} (${getTotalCount(collection.culturalItems)} ${labels[userLanguage].total})\n\n` +
      `${labels[userLanguage].select}`,
      {
        parse_mode: 'Markdown',
        ...getCollectionKeyboard(
          collection.locations.length,
          collection.characters.length,
          collection.culturalItems.length,
          userLanguage
        )
      }
    );

  } catch (error) {
    console.error('Error en collection command:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
};

export const collectionActionHandler = async (ctx: BotContext) => {
  try {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
    const callbackData = ctx.callbackQuery.data;
    console.log('Callback data recibido:', callbackData);

    const match = ctx.callbackQuery.data.match(/collection:(\w+)(?::(\d+))?/);
    if (!match) return;

    const [_, type, indexStr] = match;
    const numIndex = indexStr ? parseInt(indexStr) : 0;

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

    console.log('Obteniendo colección para address:', address);
    const collection = await flowWallet.nft.getNFTCollection(address);

    if (type === 'main') {
      const labels = {
        es: {
          title: '🗂 Tu Colección de NFTs',
          locations: '📍 Ubicaciones',
          characters: '👤 Personajes',
          items: '🎨 Items Culturales',
          select: 'Selecciona una categoría para ver tus NFTs:',
          unique: 'únicos',
          total: 'total'
        },
        en: {
          title: '🗂 Your NFT Collection',
          locations: '📍 Locations',
          characters: '👤 Characters',
          items: '🎨 Cultural Items',
          select: 'Select a category to view your NFTs:',
          unique: 'unique',
          total: 'total'
        }
      };

      const getTotalCount = (items: any[]) => items.reduce((sum, item) => sum + item.count, 0);

      await ctx.editMessageText(
        `${labels[userLanguage].title}\n\n` +
        `${labels[userLanguage].locations}: ${collection.locations.length} ${labels[userLanguage].unique} (${getTotalCount(collection.locations)} ${labels[userLanguage].total})\n` +
        `${labels[userLanguage].characters}: ${collection.characters.length} ${labels[userLanguage].unique} (${getTotalCount(collection.characters)} ${labels[userLanguage].total})\n` +
        `${labels[userLanguage].items}: ${collection.culturalItems.length} ${labels[userLanguage].unique} (${getTotalCount(collection.culturalItems)} ${labels[userLanguage].total})\n\n` +
        `${labels[userLanguage].select}`,
        {
          parse_mode: 'Markdown',
          reply_markup: getCollectionKeyboard(
            collection.locations.length,
            collection.characters.length,
            collection.culturalItems.length,
            userLanguage
          ).reply_markup
        }
      );
      return;
    }

    const nfts = type === 'locations' ? collection.locations :
                 type === 'characters' ? collection.characters :
                 collection.culturalItems;

    if (nfts.length === 0) {
      const emptyMessages = {
        es: 'No tienes NFTs en esta categoría',
        en: 'You don\'t have any NFTs in this category'
      };
      await ctx.answerCbQuery(emptyMessages[userLanguage]);
      return;
    }

    if (numIndex >= nfts.length) {
      const invalidIndexMessages = {
        es: 'Índice no válido',
        en: 'Invalid index'
      };
      await ctx.answerCbQuery(invalidIndexMessages[userLanguage]);
      return;
    }

    const nft = nfts[numIndex];
    const message = formatNFTMessage(nft, type, userLanguage);
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: getNavigationKeyboard(numIndex, nfts.length, type, userLanguage).reply_markup
    });

  } catch (error) {
    console.error('Error en collection action:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.answerCbQuery(ERROR_MESSAGES[userLanguage].GENERIC);
    try {
      const errorMessages = {
        es: '❌ Ocurrió un error al cargar los datos del NFT.\nPor favor, intenta de nuevo.',
        en: '❌ An error occurred while loading the NFT data.\nPlease try again.'
      };
      await ctx.editMessageText(
        errorMessages[userLanguage],
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }
};