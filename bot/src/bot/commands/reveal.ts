import { Markup } from 'telegraf';
import { BotContext } from '../types';
import { ERROR_MESSAGES, MESSAGES } from '../constants';
import { FlowWallet } from '../../wallet';
import { UserService } from '../../services';
import * as fcl from "@onflow/fcl";

const getRevealAmountKeyboard = (totalPacks: number) => {
  const buttons = [];
  if (totalPacks >= 1) buttons.push(Markup.button.callback('1 Pack', 'reveal:1'));
  if (totalPacks >= 5) buttons.push(Markup.button.callback('5 Packs', 'reveal:5'));
  if (totalPacks >= 10) buttons.push(Markup.button.callback('10 Packs', 'reveal:10'));
  if (totalPacks > 1) buttons.push(Markup.button.callback('Todos', `reveal:${totalPacks}`));
  
  return Markup.inlineKeyboard(buttons.length > 0 ? [buttons] : []);
};

export async function revealHandler(ctx: BotContext) {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
      return;
    }

    const wallet = new FlowWallet();
    const unrevealedPacks = 10;

    // if (unrevealedPacks == 0) {
    //   await ctx.reply(MESSAGES[userLanguage].NO_PACKS_TO_REVEAL);
    //   return;
    // }

    await ctx.reply(
      MESSAGES[userLanguage].PACKS_TO_REVEAL.replace('{amount}', unrevealedPacks.toString()),
      getRevealAmountKeyboard(unrevealedPacks)
    );

  } catch (error) {
    console.error('Error en reveal command:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
  }
}

export async function revealActionHandler(ctx: BotContext & { match: RegExpExecArray }) {
  try {
    if (!ctx.match) {
      throw new Error('Invalid callback data');
    }

    const amount = parseInt(ctx.match[1]);
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.es.GENERIC);
      return;
    }

    const userLanguage = await UserService.getUserLanguage(telegramId) || 'es';
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
      return;
    }

    const processingMessage = await ctx.reply(
      MESSAGES[userLanguage].REVEALING_PACKS.replace('{amount}', amount.toString())
    );

    const wallet = new FlowWallet();
    const revealTxId = await wallet.nft.revealPacks(
      authData.address,
      authData.privateKey,
      amount
    );

    const revealTxStatus = await fcl.tx(revealTxId).onceSealed();
    
    if (revealTxStatus.status !== 4) {
      throw new Error(MESSAGES[userLanguage].REVEAL_PACK_ERROR);
    }

    // Procesar cada evento de revelación
    const revealEvents = revealTxStatus.events.filter((e: any) => 
      e.type.includes('PackRevealed')
    );

    for (const event of revealEvents) {
      const cardID = event.data.cardID;
      const { cardType, metadata } = await wallet.nft.getNFTMetadata(cardID);
      const message = formatNFTRevealMessage(metadata, cardType, userLanguage);
      await ctx.reply(message, { parse_mode: 'Markdown' });
    }

  } catch (error) {
    console.error('Error en reveal action:', error);
    const userLanguage = ctx.from?.id ? 
      await UserService.getUserLanguage(ctx.from.id.toString()) || 'es' 
      : 'es';
    await ctx.reply(ERROR_MESSAGES[userLanguage].GENERIC);
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
      case 'A.826dae42290107c3.VenezuelaNFT_19.LocationCard':
        message += `📍 *${labels[userLanguage].location}*\n`;
        message += `🌎 ${labels[userLanguage].region}: ${metadata.region}\n`;
        message += `━━━━ ${labels[userLanguage].stats} ━━━━\n`;
        message += `⚡ ${labels[userLanguage].influence}: ${metadata.influencePointsGeneration}/día\n`;
        message += `🏗️ ${labels[userLanguage].development}: ${metadata.regionalGeneration}/día\n`;
        message += `🎯 ${labels[userLanguage].specialty}: ${metadata.type}\n`;
        break;
  
      case 'A.826dae42290107c3.VenezuelaNFT_19.CharacterCard':
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
  
      case 'A.826dae42290107c3.VenezuelaNFT_19.CulturalItemCard':
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
}