import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { FlowWallet } from '../../wallet';
import { UserService } from '../../services';
import * as fcl from "@onflow/fcl";

const MAX_WAIT_TIME = 3 * 60 * 1000; // 3 minutos en milisegundos

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

    const processingMessage = await ctx.reply(MESSAGES[userLanguage].BUYING_PACK_PROCESSING, 
    { parse_mode: 'Markdown' });

    // Obtener datos de autenticación del usuario
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
      return;
    }

    // 1. Comprar el pack
    const wallet = new FlowWallet();
    const buyTxId = await wallet.buyPack(
      authData.address,
      authData.privateKey
    );

    // Esperar a que se complete la compra
    const buyTxStatus = await fcl.tx(buyTxId).onceSealed();
    
    if (buyTxStatus.status !== 4) {
      throw new Error(MESSAGES[userLanguage].BUY_PACK_ERROR.replace('{status}', buyTxStatus.status.toString()));
    }

    // Obtener el evento BoughtPack
    const boughtPackEvent = buyTxStatus.events.find(
      (e: any) => e.type.includes('BoughtPack')
    );

    if (!boughtPackEvent) {
      throw new Error(MESSAGES[userLanguage].BUY_PACK_EVENT_NOT_FOUND);
    }

    const commitBlock = boughtPackEvent.data.commitBlock;
    const currentBlock = await fcl.block();

    console.log(`Bloque actual: ${currentBlock.height}, Bloque necesario: ${commitBlock}`);

    if (currentBlock.height < commitBlock) {
      await ctx.reply(
        MESSAGES[userLanguage].PACK_BOUGHT_WAITING_BLOCKS
          .replace('{currentBlock}', currentBlock.height.toString())
          .replace('{commitBlock}', commitBlock.toString()),
        { parse_mode: 'Markdown' }
      );

      // Esperar a que llegue al bloque necesario
      const startTime = Date.now();
      let lastBlock = currentBlock.height;

      while (lastBlock < commitBlock) {
        if (Date.now() - startTime > MAX_WAIT_TIME) {
          throw new Error(MESSAGES[userLanguage].WAIT_TIME_EXCEEDED);
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
        const newBlock = await fcl.block();
        lastBlock = newBlock.height;
        
        console.log(`Esperando bloques... Actual: ${lastBlock}, Necesario: ${commitBlock}`);
      }
    }

    console.log('Esperando 10 segundos adicionales para asegurar disponibilidad del receipt...');
    await new Promise(resolve => setTimeout(resolve, 25000));

    await ctx.reply(MESSAGES[userLanguage].REVEALING_PACK, 
    { parse_mode: 'Markdown' });

    // 2. Revelar el pack
    const revealTxId = await wallet.revealPack(
      authData.address,
      authData.privateKey
    );

    // Esperar a que se complete la revelación
    const revealTxStatus = await fcl.tx(revealTxId).onceSealed();
    
    if (revealTxStatus.status !== 4) {
      throw new Error(MESSAGES[userLanguage].REVEAL_PACK_ERROR.replace('{status}', revealTxStatus.status.toString()));
    }

    // Buscar el evento de revelación para obtener el ID del NFT
    const events = revealTxStatus.events;
    const revealEvent = events.find((e: any) => e.type.includes('PackRevealed'));

    if (revealEvent) {
      const nftID = revealEvent.data.cardID;
      const { cardType, metadata } = await wallet.getNFTMetadata(nftID);
      //console.log(JSON.stringify(metadata, null, 2));
      // try {
      //   await wallet.setupStorefront(
      //     authData.address,
      //     authData.privateKey
      //   );
      //   console.log('✅ Storefront configurado exitosamente');
      //   await ctx.reply(MESSAGES[userLanguage].STOREFRONT_SETUP_SUCCESS, { parse_mode: 'Markdown' });

      // } catch (error) {
      //   // Si falla la configuración del Storefront, solo lo logueamos pero no interrumpimos el flujo
      //   console.error('Error configurando Storefront:', error);
      //   await ctx.reply(MESSAGES[userLanguage].STOREFRONT_SETUP_ERROR, { parse_mode: 'Markdown' });

      // }
      const message = formatNFTRevealMessage(metadata, cardType, userLanguage);
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } else {
      throw new Error(MESSAGES[userLanguage].REVEAL_EVENT_NOT_FOUND);
    }

  } catch (error: any) {
    console.error('Error en buyPack command:', error);
    
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';

    // Sanitizar mensaje de error para Markdown
    let errorMessage = error.message || MESSAGES[userLanguage].UNKNOWN_ERROR;
    errorMessage = errorMessage.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    await ctx.reply(
      MESSAGES[userLanguage].BUY_PACK_ERROR_MESSAGE
        .replace('{error}', errorMessage), 
      { parse_mode: 'Markdown' }
    );
  }
}

function formatNFTRevealMessage(metadata: any, cardType: string, userLanguage: 'es' | 'en'): string {
  const labels = {
    es: {
      newCard: '🎉 ¡NUEVA CARTA!',
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
      viewCollection: '💡 Usa /collection para ver tu colección'
    },
    en: {
      newCard: '🎉 NEW CARD!',
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
      viewCollection: '💡 Use /collection to view your collection'
    }
  };

  let message = `${labels[userLanguage].newCard}\n\n`;
  message += `[⚜️](${metadata.image}) *${metadata.name}*\n`;
  message += `━━━━━━━━━━━━━━━\n\n`;

  switch (cardType) {
    case 'A.826dae42290107c3.VenezuelaNFT_16.LocationCard':
      message += `📍 *${labels[userLanguage].location}*\n`;
      message += `🌎 ${labels[userLanguage].region}: ${metadata.region}\n`;
      message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
      message += `⚡ ${labels[userLanguage].influence}: ${metadata.influencePointsGeneration}/día\n`;
      message += `🏗️ ${labels[userLanguage].development}: ${metadata.regionalGeneration}/día\n`;
      message += `🎯 ${labels[userLanguage].specialty}: ${metadata.type}\n`;
      break;

    case 'A.826dae42290107c3.VenezuelaNFT_16.CharacterCard':
      message += `👤 *${labels[userLanguage].character}*\n`;
      message += `🎭 ${labels[userLanguage].class}: ${metadata.characterTypes.join(' / ')}\n`;
      message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
      message += `⚡ ${labels[userLanguage].influence_gen}: ${metadata.influencePointsGeneration}/día\n`;
      message += `💰 ${labels[userLanguage].campaign_cost}: ${metadata.launchCost}\n\n`;
      
      if (metadata.presidentEffects) {
        message += `👑 *${labels[userLanguage].leadership}*\n`;
        if (Object.keys(metadata.presidentEffects.effectCostReduction).length > 0) {
          Object.entries(metadata.presidentEffects.effectCostReduction).forEach(([key, value]) => {
            message += `• ${key}: -${value}%\n`;
          });
        }
        if (Object.keys(metadata.presidentEffects.developmentEffect).length > 0) {
          Object.entries(metadata.presidentEffects.developmentEffect).forEach(([key, value]) => {
            message += `• ${key}: +${value}%\n`;
          });
        }
      }
      break;

    case 'A.826dae42290107c3.VenezuelaNFT_16.CulturalItemCard':
      message += `🎨 *${labels[userLanguage].cultural}*\n`;
      message += `🎯 ${labels[userLanguage].category}: ${metadata.type}\n`;
      message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
      message += `⚡ ${labels[userLanguage].influence_gen}: ${metadata.influencePointsGeneration}/día\n\n`;
      
      if (metadata.specialEffects && Object.keys(metadata.specialEffects.votingEffect).length > 0) {
        message += `🗳️ *${labels[userLanguage].effects}*\n`;
        Object.entries(metadata.specialEffects.votingEffect).forEach(([key, value]) => {
          message += `• ${key}: +${value}%\n`;
        });
      }
      break;
  }

  message += `\n━━━━━━━━━━━━━━━\n`;
  message += `${labels[userLanguage].viewCollection}`;

  return message;
}