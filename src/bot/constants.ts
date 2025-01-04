export const BOT_COMMANDS = {
  START: 'start',
  HELP: 'help',
  STATUS: 'status',
  BALANCE: 'balance',
  WALLET: 'wallet',
  REGISTER: 'register',
  BUYPACK: 'buypack',
  COLLECTION: 'collection',
} as const;

export const ERROR_MESSAGES = {
  es: {
    GENERIC: '❌ Ocurrió un error inesperado. Por favor intenta de nuevo.',
    INVALID_COMMAND: '❌ Comando no válido. Usa /help para ver los comandos disponibles.',
    NOT_REGISTERED: '❌ Necesitas registrarte primero.\n\n➡️ Usa /register para comenzar.',
    ALREADY_REGISTERED: '✅ Ya estás registrado.\n\n💡 Usa /help para ver los comandos disponibles.',
    NETWORK_ERROR: '🌐 Error de conexión. Por favor intenta de nuevo en unos momentos.',
  },
  en: {
    GENERIC: '❌ An unexpected error occurred. Please try again.',
    INVALID_COMMAND: '❌ Invalid command. Use /help to see available commands.',
    NOT_REGISTERED: '❌ You need to register first.\n\n➡️ Use /register to start.',
    ALREADY_REGISTERED: '✅ You are already registered.\n\n💡 Use /help to see available commands.',
    NETWORK_ERROR: '🌐 Connection error. Please try again in a few moments.',
  }
} as const;

export const MESSAGES = {
  es: {
    WELCOME: `
🌟 *¡Bienvenido a VenezuelaDAO Bot!*

Soy tu asistente para gestionar tus NFTs de Venezuela. 
Para comenzar, necesitas registrarte usando /register.

ℹ️ Usa /help en cualquier momento para ver todos los comandos disponibles.`,

    LANGUAGE_SELECTED: `
✅ *¡Idioma configurado a Español!*

Ahora puedes comenzar a usar el bot.
Usa /register para crear tu wallet y comenzar.`,

    HELP: `
🔍 *Comandos Disponibles:*

🚀 *Inicio*
/start - Iniciar el bot
/register - Crear tu wallet y registrarte

💼 *Gestión de Wallet*
/balance - Ver tu balance de FLOW
/wallet - Ver información de tu wallet

🎮 *NFTs*
/buypack - Comprar un pack de NFTs
/collection - Ver tu colección

ℹ️ *Otros*
/help - Ver este mensaje de ayuda
/status - Verificar estado del bot`,

    WALLET_INFO: '🔒 La información de tu wallet ha sido enviada por mensaje privado.',

    BUYPACK_WAITING: `
⏳ *Procesando compra...*
Por favor espera mientras procesamos tu transacción.`,

    BUYPACK_SUCCESS: `
✨ *¡Pack comprado exitosamente!*

Tu pack ha sido añadido a tu colección.
¡Pronto podrás revelar su contenido!`,

    BUYPACK_ERROR: `
❌ *Error al comprar el pack.*

Por favor intenta de nuevo. Si el problema persiste, contacta con el equipo de VenezuelaDAO.`,

    SELECT_LANGUAGE: `
🌍 *Selecciona tu idioma preferido*
Please select your preferred language:`,

    RECEIVED_MESSAGE: 'He recibido tu mensaje',
    STATUS_MESSAGE: `
📊 *Estado del Bot*
✅ Bot en funcionamiento
🔄 Versión: 1.0.0
⚡ Latencia: {latency}ms`,
    BALANCE_MESSAGE: `
💰 *Tu Balance*
FLOW: {balance} FLOW`,
    COLLECTION_EMPTY: '🎨 Aún no tienes NFTs en tu colección.',
    COLLECTION_MESSAGE: `
🖼 *Tu Colección de NFTs*
Total: {total} NFTs

{nftList}`,
    REGISTER_START: `
📝 *Proceso de Registro*
Vamos a crear tu wallet en Flow.
Por favor, sigue los siguientes pasos:`,
    REGISTER_SUCCESS: `
✅ *¡Registro Completado!*
Tu wallet ha sido creada exitosamente.

💡 Usa /help para ver todos los comandos disponibles.`,
    STATUS_NOT_REGISTERED: `
🟢 *Estado del Sistema*

❌ No estás registrado
➡️ Usa /register para comenzar`,
    STATUS_INFO: `
🟢 *Estado del Sistema*

👤 *Tu Información*
🏠 Región: {region}
✅ Bot funcionando correctamente`,
  },

  en: {
    WELCOME: `
🌟 *Welcome to VenezuelaDAO Bot!*

I'm your assistant for managing your Venezuela NFTs.
To get started, you need to register using /register.

ℹ️ Use /help at any time to see all available commands.`,

    LANGUAGE_SELECTED: `
✅ *Language set to English!*

You can now start using the bot.
Use /register to create your wallet and begin.`,

    HELP: `
🔍 *Available Commands:*

🚀 *Getting Started*
/start - Start the bot
/register - Create your wallet and register

💼 *Wallet Management*
/balance - Check your FLOW balance
/wallet - View your wallet information

🎮 *NFTs*
/buypack - Buy an NFT pack
/collection - View your collection

ℹ️ *Others*
/help - See this help message
/status - Check bot status`,

    WALLET_INFO: '🔒 Your wallet information has been sent via private message.',

    BUYPACK_WAITING: `
⏳ *Processing purchase...*
Please wait while we process your transaction.`,

    BUYPACK_SUCCESS: `
✨ *Pack purchased successfully!*

Your pack has been added to your collection.
You'll be able to reveal its contents soon!`,

    BUYPACK_ERROR: `
❌ *Error purchasing pack.*

Please try again. If the problem persists, contact the VenezuelaDAO team.`,

    SELECT_LANGUAGE: `
🌍 *Select your preferred language*
Selecciona tu idioma preferido:`,
    RECEIVED_MESSAGE: 'I received your message',
    STATUS_MESSAGE: `
📊 *Bot Status*
✅ Bot is running
🔄 Version: 1.0.0
⚡ Latency: {latency}ms`,
    BALANCE_MESSAGE: `
💰 *Your Balance*
FLOW: {balance} FLOW`,
    COLLECTION_EMPTY: '🎨 You don\'t have any NFTs in your collection yet.',
    COLLECTION_MESSAGE: `
🖼 *Your NFT Collection*
Total: {total} NFTs

{nftList}`,
    REGISTER_START: `
📝 *Registration Process*
We'll create your Flow wallet.
Please follow these steps:`,
    REGISTER_SUCCESS: `
✅ *Registration Completed!*
Your wallet has been created successfully.

💡 Use /help to see all available commands.`,
    STATUS_NOT_REGISTERED: `
🟢 *System Status*

❌ You are not registered
➡️ Use /register to start`,
    STATUS_INFO: `
🟢 *System Status*

👤 *Your Information*
🏠 Region: {region}
✅ Bot working correctly`,
  }
} as const;