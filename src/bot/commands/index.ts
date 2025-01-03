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
import { setupChatMemberListener } from '../listeners';

export const registerCommands = (bot: Telegraf<BotContext>, groupManager: TelegramGroupManager) => {
    console.log('📝 Registrando comandos y eventos...');

    // Comandos básicos
    bot.command([BOT_COMMANDS.START, BOT_COMMANDS.REGISTER], registerHandler);
    bot.action(/^region:(.+)$/, registerActionHandler(groupManager));
    
    bot.command(BOT_COMMANDS.BALANCE, balanceHandler);
    bot.command(BOT_COMMANDS.WALLET, walletHandler);
    bot.command(BOT_COMMANDS.HELP, helpHandler);
    bot.command(BOT_COMMANDS.STATUS, statusHandler);
    bot.command(BOT_COMMANDS.BUYPACK, buyPackHandler);

    // Configurar comandos en el menú
    bot.telegram.setMyCommands([
        { command: BOT_COMMANDS.START, description: 'Iniciar bot' },
        { command: BOT_COMMANDS.REGISTER, description: 'Registrarse en VenezuelaDAO' },
        { command: BOT_COMMANDS.HELP, description: 'Ver ayuda' },
        { command: BOT_COMMANDS.STATUS, description: 'Ver estado del bot' },
        { command: BOT_COMMANDS.BALANCE, description: 'Ver tu balance de FLOW' },
        { command: BOT_COMMANDS.WALLET, description: 'Ver información de tu wallet' },
        { command: BOT_COMMANDS.BUYPACK, description: 'Comprar un pack de NFTs' },
    ]);

    console.log('✅ Comandos y eventos registrados correctamente');
};