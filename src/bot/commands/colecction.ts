import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';

const flowWallet = new FlowWallet();

const getCollectionKeyboard = (
  totalLocations: number,
  totalCharacters: number,
  totalItems: number
) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`📍 Ubicaciones (${totalLocations})`, 'collection:locations:0'),
      Markup.button.callback(`👤 Personajes (${totalCharacters})`, 'collection:characters:0')
    ],
    [
      Markup.button.callback(`🎨 Items Culturales (${totalItems})`, 'collection:items:0')
    ]
  ]);
};

const formatNFTMessage = (nft: any, type: string) => {
    try {
      // Verificar que tenemos los datos necesarios
      if (!nft || !nft.display) {
        console.error('NFT data is invalid:', nft);
        return '❌ Error: No se pudieron cargar los datos del NFT';
      }
  
      // Inicio del mensaje con manejo seguro de la imagen
      let message = '';
      if (nft.display.thumbnail?.url) {
        message += `[⚜️](${nft.display.thumbnail.url})`;
      }
      message += `*${nft.display.name || 'NFT'}*\n`;
      message += `━━━━━━━━━━━━━━━\n\n`;
  
      // Obtener los traits como un objeto para fácil acceso
      const traits = nft.traits?.traits?.reduce((acc: any, trait: any) => {
        acc[trait.name] = trait.value;
        return acc;
      }, {}) || {};
  
      switch (type) {
        case 'locations':
          message += `📍 *UBICACIÓN*\n`;
          message += `🌎 Región: ${traits.region || 'N/A'}\n`;
          message += `━━━━ ESTADÍSTICAS ━━━━\n`;
          message += `⚡ Poder de Influencia: ${traits.influence_generation || '0'}/día\n`;
          message += `🏗️ Desarrollo Regional: ${traits.regional_generation || '0'}/día\n`;
          message += `🎯 Especialidad: ${traits.type || 'N/A'}\n`;
          break;
  
        case 'characters':
          message += `👤 *PERSONAJE*\n`;
          message += `🎭 Clase: ${traits.characterTypes || 'N/A'}\n`;
          message += `━━━━ ESTADÍSTICAS ━━━━\n`;
          message += `⚡ Influencia: ${traits.influence_generation || '0'}/día\n`;
          message += `💰 Costo de Campaña: ${traits.launchCost || '0'}\n\n`;
          
          if (traits.presidentEffects) {
            message += `👑 *HABILIDADES DE LIDERAZGO*\n`;
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
          message += `🎨 *ITEM CULTURAL*\n`;
          message += `🎯 Categoría: ${traits.type || 'N/A'}\n`;
          message += `━━━━ ESTADÍSTICAS ━━━━\n`;
          message += `⚡ Influencia: ${traits.influence_generation || '0'}/día\n\n`;
          
          if (traits.specialEffects) {
            try {
              const effects = JSON.parse(traits.specialEffects);
              if (effects.votingEffect) {
                message += `🗳️ *EFECTOS*\n`;
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
  
      // Añadir descripción si existe
      if (nft.display.description) {
        message += `\n📝 *Descripción*\n${nft.display.description}\n`;
      }
  
      return message;
    } catch (error) {
      console.error('Error formatting NFT message:', error, '\nNFT data:', nft);
      return '❌ Error al formatear los datos del NFT';
    }
  };
const getNavigationKeyboard = (currentIndex: number, totalItems: number, type: string) => {
  const buttons = [];
  
  if (currentIndex > 0) {
    buttons.push(Markup.button.callback('⬅️ Anterior', `collection:${type}:${currentIndex - 1}`));
  }
  
  if (currentIndex < totalItems - 1) {
    buttons.push(Markup.button.callback('➡️ Siguiente', `collection:${type}:${currentIndex + 1}`));
  }
  
  buttons.push(Markup.button.callback('🔙 Volver', 'collection:main'));
  
  return Markup.inlineKeyboard([buttons]);
};

export const collectionHandler = async (ctx: BotContext) => {
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

    const collection = await flowWallet.getNFTCollection(address);
    
    await ctx.reply(
      `🗂 *Tu Colección de NFTs*\n\n` +
      `📍 Ubicaciones: ${collection.locations.length}\n` +
      `👤 Personajes: ${collection.characters.length}\n` +
      `🎨 Items Culturales: ${collection.culturalItems.length}\n\n` +
      `Selecciona una categoría para ver tus NFTs:`,
      {
        parse_mode: 'Markdown',
        ...getCollectionKeyboard(
          collection.locations.length,
          collection.characters.length,
          collection.culturalItems.length
        )
      }
    );

  } catch (error) {
    console.error('Error en collection command:', error);
    await ctx.reply(ERROR_MESSAGES.GENERIC);
  }
};

// Handler para las acciones de los botones
export const collectionActionHandler = async (ctx: BotContext) => {
    try {
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
      // Modificar el regex para hacer el índice opcional
      const match = ctx.callbackQuery.data.match(/collection:(\w+)(?::(\d+))?/);
      if (!match) return;
  
      const [_, type, indexStr] = match;
      const numIndex = indexStr ? parseInt(indexStr) : 0;
  
      const address = await UserService.getWalletAddress(ctx.from?.id.toString() || '');
      if (!address) {
        await ctx.answerCbQuery('Error: Usuario no registrado');
        return;
      }
  
      // Añadir logs para debug
      console.log('Obteniendo colección para address:', address);
      const collection = await flowWallet.getNFTCollection(address);
      console.log('Colección obtenida:', JSON.stringify(collection, null, 2));
  
      // Si el tipo es 'main' o no hay índice, mostrar el menú principal
      if (type === 'main') {
        await ctx.editMessageText(
          `🗂 *Tu Colección de NFTs*\n\n` +
          `📍 Ubicaciones: ${collection.locations.length}\n` +
          `👤 Personajes: ${collection.characters.length}\n` +
          `🎨 Items Culturales: ${collection.culturalItems.length}\n\n` +
          `Selecciona una categoría para ver tus NFTs:`,
          {
            parse_mode: 'Markdown',
            ...getCollectionKeyboard(
              collection.locations.length,
              collection.characters.length,
              collection.culturalItems.length
            )
          }
        );
        return;
      }
  
      const nfts = type === 'locations' ? collection.locations :
                   type === 'characters' ? collection.characters :
                   collection.culturalItems;
  
      if (nfts.length === 0) {
        await ctx.answerCbQuery('No tienes NFTs en esta categoría');
        return;
      }
  
      if (numIndex >= nfts.length) {
        await ctx.answerCbQuery('Índice no válido');
        return;
      }
  
      const nft = nfts[numIndex];
      console.log('NFT a mostrar:', JSON.stringify(nft, null, 2));
  
      const message = formatNFTMessage(nft, type);
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...getNavigationKeyboard(numIndex, nfts.length, type)
      });
  
    } catch (error) {
      console.error('Error en collection action:', error);
      await ctx.answerCbQuery('Error procesando la acción');
      try {
        await ctx.editMessageText(
          '❌ Ocurrió un error al cargar los datos del NFT.\nPor favor, intenta de nuevo.',
          { parse_mode: 'Markdown' }
        );
      } catch (e) {
        console.error('Error sending error message:', e);
      }
    }
  };