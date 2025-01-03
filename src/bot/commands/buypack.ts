import { BotContext } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { FlowWallet } from '../../wallet';
import { UserService } from '../../services';
import * as fcl from "@onflow/fcl";

const MAX_WAIT_TIME = 3 * 60 * 1000; // 5 minutos en milisegundos

export async function buyPackHandler(ctx: BotContext) {
  try {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
      return;
    }

    // Verificar que el usuario esté registrado
    const isRegistered = await UserService.isRegistered(telegramId);
    if (!isRegistered) {
      await ctx.reply(`
❌ *No estás registrado*

Para comprar packs necesitas:
1️⃣ Registrarte en VenezuelaDAO
2️⃣ Tener una wallet de Flow

➡️ Usa /register para comenzar`, 
      { parse_mode: 'Markdown' });
      return;
    }

    const processingMessage = await ctx.reply(`
🎁 *Comprando Pack de NFTs*

⏳ Procesando tu transacción...
_Este proceso puede tomar unos segundos._`, 
    { parse_mode: 'Markdown' });

    // Obtener datos de autenticación del usuario
    const authData = await UserService.getFlowAuthData(telegramId);
    if (!authData) {
      await ctx.reply(ERROR_MESSAGES.GENERIC);
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
      throw new Error(`Error en la compra del pack. Estado: ${buyTxStatus.status}`);
    }

    // Obtener el evento BoughtPack
    const boughtPackEvent = buyTxStatus.events.find(
      (e: any) => e.type.includes('BoughtPack')
    );

    if (!boughtPackEvent) {
      throw new Error('No se encontró el evento de compra del pack');
    }

    const commitBlock = boughtPackEvent.data.commitBlock;
    const currentBlock = await fcl.block();

    console.log(`Bloque actual: ${currentBlock.height}, Bloque necesario: ${commitBlock}`);

    if (currentBlock.height < commitBlock) {
      await ctx.reply(`
✨ *Pack comprado exitosamente*

⏳ _Esperando bloques necesarios para revelar..._
Bloque actual: ${currentBlock.height}
Bloque necesario: ${commitBlock}

Te notificaré cuando pueda ser revelado.`, 
      { parse_mode: 'Markdown' });

      // Esperar a que llegue al bloque necesario
      const startTime = Date.now();
      let lastBlock = currentBlock.height;

      while (lastBlock < commitBlock) {
        if (Date.now() - startTime > MAX_WAIT_TIME) {
          throw new Error('Tiempo de espera agotado. Por favor, intenta revelar el pack más tarde.');
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
        const newBlock = await fcl.block();
        lastBlock = newBlock.height;
        
        console.log(`Esperando bloques... Actual: ${lastBlock}, Necesario: ${commitBlock}`);
      }
    }

    console.log('Esperando 10 segundos adicionales para asegurar disponibilidad del receipt...');
    await new Promise(resolve => setTimeout(resolve, 25000));

    await ctx.reply(`
🎉 *¡Revelando pack!*

⏳ _Procesando revelación..._`, 
    { parse_mode: 'Markdown' });

    // 2. Revelar el pack
    const revealTxId = await wallet.revealPack(
      authData.address,
      authData.privateKey
    );

    // Esperar a que se complete la revelación
    const revealTxStatus = await fcl.tx(revealTxId).onceSealed();
    
    if (revealTxStatus.status !== 4) {
      throw new Error(`Error al revelar el pack. Estado: ${revealTxStatus.status}`);
    }

    // Buscar el evento de revelación para obtener el ID del NFT
    const events = revealTxStatus.events;
    const revealEvent = events.find((e: any) => e.type.includes('PackRevealed'));

    if (revealEvent) {
        const nftID = revealEvent.data.cardID;
        const { cardType, metadata } = await wallet.getNFTMetadata(nftID);
        
        let message = `🎉 *¡NUEVA CARTA!*\n\n`;
        message += `[⚜️](${metadata.image}) *${metadata.name}* #${metadata.serial}\n`;
        message += `━━━━━━━━━━━━━━━\n\n`;
      
        switch (cardType) {
          case 'A.826dae42290107c3.VenezuelaNFT_13.LocationCard':
            message += `📍 *UBICACIÓN*\n`;
            message += `🌎 Región: ${metadata.region}\n`;
            message += `━━━━ ESTADÍSTICAS ━━━━\n`;
            message += `⚡ Poder de Influencia: ${metadata.influencePointsGeneration}/día\n`;
            message += `🏗️ Desarrollo Regional: ${metadata.regionalGeneration}/día\n`;
            message += `🎯 Especialidad: ${metadata.type}\n`;
            break;
      
          case 'A.826dae42290107c3.VenezuelaNFT_13.CharacterCard':
            message += `👤 *PERSONAJE*\n`;
            message += `🎭 Clase: ${metadata.characterTypes.join(' / ')}\n`;
            message += `━━━━ ESTADÍSTICAS ━━━━\n`;
            message += `⚡ Influencia: ${metadata.influencePointsGeneration}/día\n`;
            message += `💰 Costo de Campaña: ${metadata.launchCost}\n\n`;
            
            if (metadata.presidentEffects) {
              message += `👑 *HABILIDADES DE LIDERAZGO*\n`;
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
      
          case 'A.826dae42290107c3.VenezuelaNFT_13.CulturalItemCard':
            message += `🎨 *ITEM CULTURAL*\n`;
            message += `🎯 Categoría: ${metadata.type}\n`;
            message += `━━━━ ESTADÍSTICAS ━━━━\n`;
            message += `⚡ Influencia: ${metadata.influencePointsGeneration}/día\n\n`;
            
            if (metadata.specialEffects && Object.keys(metadata.specialEffects.votingEffect).length > 0) {
              message += `🗳️ *EFECTOS*\n`;
              Object.entries(metadata.specialEffects.votingEffect).forEach(([key, value]) => {
                message += `• ${key}: +${value}%\n`;
              });
            }
            break;
        }
      
        message += `\n━━━━━━━━━━━━━━━\n`;
        message += `🎴 Set: ${metadata.setId} • ID: ${nftID}\n`;
        message += `💡 _Usa /collection para ver tu colección_`;
      
        await ctx.reply(message, { 
          parse_mode: 'Markdown'
        });
    }else {
      throw new Error('No se pudo obtener la información del NFT revelado');
    }

  } catch (error: any  ) {
    console.error('Error en buyPack command:', error);
    
    // Sanitizar mensaje de error para Markdown
    let errorMessage = error.message || 'Error desconocido';
    errorMessage = errorMessage.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    await ctx.reply(`
❌ *Error en la operación*

${errorMessage}

Por favor, intenta nuevamente en unos momentos.
Si el problema persiste, contacta a soporte.`, 
    { parse_mode: 'Markdown' });
  }
}