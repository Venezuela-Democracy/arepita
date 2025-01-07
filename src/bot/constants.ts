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

    STATUS_NOT_REGISTERED: `
🟢 *Estado del Sistema*

❌ No estás registrado
➡️ Usa /register para comenzar`,
    STATUS_INFO: `
🟢 *Estado del Sistema*

👤 *Tu Información*
🏠 Región: {region}
✅ Bot funcionando correctamente`,
SELECT_REGION: '🗺 Por favor, selecciona tu región de Venezuela:',
INVALID_SESSION: 'Sesión inválida. Por favor, inicia el registro nuevamente.',
REGION_SELECTED: 'Has seleccionado: {region}',
PROCESSING_REGISTRATION: `🎯 Has seleccionado: *{region}*\n\nProcesando registro y añadiéndote a los grupos...`,
REGISTER_SUCCESS: `✅ ¡Registro exitoso!\n\n
🏠 Región: {region}
💫 Tu wallet ha sido creada exitosamente
👥 Te he enviado los enlaces de los grupos por mensaje privado\n
Usa /help para ver los comandos disponibles.`,
WALLET_DETAILS: `🔐 Guarda esta información en un lugar seguro:\n\n📫 Dirección: {address}\n`,
NOT_REGISTERED_BUY_PACK: `
❌ *No estás registrado*

Para comprar packs necesitas:
1️⃣ Registrarte en VenezuelaDAO
2️⃣ Tener una wallet de Flow

➡️ Usa /register para comenzar`,
    BUYING_PACK_PROCESSING: `
🎁 *Comprando Pack de NFTs*

⏳ Procesando tu transacción...
_Este proceso puede tomar unos segundos._`,
    BUY_PACK_ERROR: 'Error en la compra del pack. Estado: {status}',
    BUY_PACK_EVENT_NOT_FOUND: 'No se encontró el evento de compra del pack',
    PACK_BOUGHT_WAITING_BLOCKS: `
✨ *Pack comprado exitosamente*

⏳ _Esperando bloques necesarios para revelar..._
Bloque actual: {currentBlock}
Bloque necesario: {commitBlock}

Te notificaré cuando pueda ser revelado.`,
    WAIT_TIME_EXCEEDED: 'Tiempo de espera agotado. Por favor, intenta revelar el pack más tarde.',
    REVEALING_PACK: `
🎉 *¡Revelando pack!*

⏳ _Procesando revelación..._`,
    REVEAL_PACK_ERROR: 'Error al revelar el pack. Estado: {status}',
    REVEAL_EVENT_NOT_FOUND: 'No se pudo obtener la información del NFT revelado',
    UNKNOWN_ERROR: 'Error desconocido',
    BUY_PACK_ERROR_MESSAGE: `
❌ *Error en la operación*

{error}

Por favor, intenta nuevamente en unos momentos.
Si el problema persiste, contacta a soporte.`,
STOREFRONT_SETUP_SUCCESS: '🏪 ¡Tu tienda NFT ha sido configurada! Ahora puedes comerciar tus NFTs usando /marketplace',
STOREFRONT_SETUP_ERROR: '⚠️ No se pudo configurar tu tienda NFT. Podrás intentarlo más tarde usando /marketplace',
SELL_NFT_TITLE: '💰 Vender NFTs',
SELL_NFT_SELECT: 'Selecciona el NFT que quieres vender:',
SELL_NFT_SET_PRICE: '💵 Por favor, envía el precio en FLOW para este NFT:',
SELL_NFT_CONFIRM: '⚠️ ¿Confirmas poner a la venta este NFT por {price} FLOW?',
SELL_NFT_SUCCESS: '✅ NFT puesto a la venta exitosamente',
SELL_NFT_ERROR: '❌ Error al poner el NFT a la venta',
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
    STATUS_NOT_REGISTERED: `
🟢 *System Status*

❌ You are not registered
➡️ Use /register to start`,
    STATUS_INFO: `
🟢 *System Status*

👤 *Your Information*
🏠 Region: {region}
✅ Bot working correctly`,
SELECT_REGION: '🗺 Please select your region in Venezuela:',
INVALID_SESSION: 'Invalid session. Please start the registration again.',
REGION_SELECTED: 'You selected: {region}',
PROCESSING_REGISTRATION: `🎯 You selected: *{region}*\n\nProcessing registration and adding you to groups...`,
REGISTER_SUCCESS: `✅ Registration successful!\n\n
🏠 Region: {region}
💫 Your wallet has been created successfully
👥 I've sent you the group links via private message\n
Use /help to see available commands.`,
WALLET_DETAILS: `🔐 Save this information in a safe place:\n\n📫 Address: {address}\n`,
NOT_REGISTERED_BUY_PACK: `
❌ *You are not registered*

To buy packs you need:
1️⃣ Register in VenezuelaDAO
2️⃣ Have a Flow wallet

➡️ Use /register to start`,
    BUYING_PACK_PROCESSING: `
🎁 *Buying NFT Pack*

⏳ Processing your transaction...
_This process may take a few seconds._`,
    BUY_PACK_ERROR: 'Error buying the pack. Status: {status}',
    BUY_PACK_EVENT_NOT_FOUND: 'Pack purchase event not found',
    PACK_BOUGHT_WAITING_BLOCKS: `
✨ *Pack successfully purchased*

⏳ _Waiting for required blocks to reveal..._
Current block: {currentBlock}
Required block: {commitBlock}

I'll notify you when it can be revealed.`,
    WAIT_TIME_EXCEEDED: 'Wait time exceeded. Please try to reveal the pack later.',
    REVEALING_PACK: `
🎉 *Revealing pack!*

⏳ _Processing revelation..._`,
    REVEAL_PACK_ERROR: 'Error revealing the pack. Status: {status}',
    REVEAL_EVENT_NOT_FOUND: 'Could not get revealed NFT information',
    UNKNOWN_ERROR: 'Unknown error',
    BUY_PACK_ERROR_MESSAGE: `
❌ *Operation Error*

{error}

Please try again in a few moments.
If the problem persists, contact support.`,  
STOREFRONT_SETUP_SUCCESS: '🏪 Your NFT store has been set up! You can now trade your NFTs using /marketplace',
STOREFRONT_SETUP_ERROR: '⚠️ Could not set up your NFT store. You can try again later using /marketplace',
SELL_NFT_TITLE: '💰 Sell NFTs',
SELL_NFT_SELECT: 'Select the NFT you want to sell:',
SELL_NFT_SET_PRICE: '💵 Please send the price in FLOW for this NFT:',
SELL_NFT_CONFIRM: '⚠️ Do you confirm listing this NFT for {price} FLOW?',
SELL_NFT_SUCCESS: '✅ NFT successfully listed for sale',
SELL_NFT_ERROR: '❌ Error listing NFT for sale',
}
} as const;