export const BOT_COMMANDS = {
  START: 'start',
  HELP: 'help',
  STATUS: 'status',
  BALANCE: 'balance',
  WALLET: 'wallet',
  REGISTER: 'register',
  BUYPACK: 'buypack',
} as const;

export const ERROR_MESSAGES = {
  GENERIC: '❌ Ocurrió un error inesperado. Por favor intenta de nuevo.',
  INVALID_COMMAND: '❌ Comando no válido. Usa /help para ver los comandos disponibles.',
  NOT_REGISTERED: '❌ Necesitas registrarte primero.\n\n➡️ Usa /register para comenzar.',
  ALREADY_REGISTERED: '✅ Ya estás registrado.\n\n💡 Usa /help para ver los comandos disponibles.',
  NETWORK_ERROR: '🌐 Error de conexión. Por favor intenta de nuevo en unos momentos.',
} as const;

export const MESSAGES = {
  WELCOME: `
🌟 *¡Bienvenido a VenezuelaDAO Bot!*

Soy tu asistente para gestionar tus NFTs de Venezuela. 
Para comenzar, necesitas registrarte usando /register.

ℹ️ Usa /help en cualquier momento para ver todos los comandos disponibles.`,
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
} as const;
