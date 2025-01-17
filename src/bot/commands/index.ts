import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { BOT_COMMANDS } from '../constants';
import { registerHandler, registerActionHandler } from './register';
import { balanceHandler } from './balance';
import { walletHandler } from './wallet';
import { helpHandler } from './help';
import { statusHandler } from './status';
import { buyPackHandler } from './buypack';
import { TelegramGroupManager } from '../managers/group';
import { collectionActionHandler, collectionHandler } from './colecction';
import { languageActionHandler, startHandler } from './start';
import { sellHandler, sellActionHandler, handlePrice } from './sell';

export const registerCommands = (bot: Telegraf<BotContext>, groupManager: TelegramGroupManager) => {
    console.log('📝 Registrando comandos y eventos...');

    // Comandos básicos
    bot.command([BOT_COMMANDS.START], startHandler);
    bot.action(/^language:(\w+)$/, languageActionHandler);
    bot.command([BOT_COMMANDS.REGISTER], registerHandler);
    bot.action(/^region:(.+)$/, registerActionHandler(groupManager));
    bot.command(BOT_COMMANDS.COLLECTION, collectionHandler);
    bot.action(/^collection:(\w+)(?::(\d+))?$/, collectionActionHandler);
    bot.command(BOT_COMMANDS.BALANCE, balanceHandler);
    bot.command(BOT_COMMANDS.WALLET, walletHandler);
    bot.command(BOT_COMMANDS.HELP, helpHandler);
    bot.command(BOT_COMMANDS.STATUS, statusHandler);
    bot.command(BOT_COMMANDS.BUYPACK, buyPackHandler);
    bot.command(BOT_COMMANDS.SELL, sellHandler);
    bot.action(/^sell:(\w+)(?::(\w+))?(?::(\d+))?$/, sellActionHandler);
    bot.on('text', handlePrice);

    // Configurar comandos en el menú con descripciones bilingües
    bot.telegram.setMyCommands([
        { 
            command: BOT_COMMANDS.START, 
            description: 'Start bot / Iniciar bot' 
        },
        { 
            command: BOT_COMMANDS.REGISTER, 
            description: 'Register in VzlaDAO / Registrarse en VzlaDAO' 
        },
        { 
            command: BOT_COMMANDS.COLLECTION, 
            description: 'View your NFTs / Ver tus NFTs' 
        },
        { 
            command: BOT_COMMANDS.BALANCE, 
            description: 'Check FLOW balance / Ver balance de FLOW' 
        },
        { 
            command: BOT_COMMANDS.WALLET, 
            description: 'Wallet info / Info de wallet' 
        },
        { 
            command: BOT_COMMANDS.BUYPACK, 
            description: 'Buy NFT pack / Comprar pack de NFTs' 
        },
        { 
            command: BOT_COMMANDS.HELP, 
            description: 'Get help / Ver ayuda' 
        },
        { 
            command: BOT_COMMANDS.STATUS, 
            description: 'Bot status / Estado del bot' 
        },
        { 
            command: BOT_COMMANDS.COLLECTION, 
            description: 'View your NFTs / Ver tus NFTs' 
        },
        { 
            command: BOT_COMMANDS.SELL, 
            description: 'Sell NFTs / Vender NFTs' 
        },
    ]);

    console.log('✅ Comandos y eventos registrados correctamente');
};