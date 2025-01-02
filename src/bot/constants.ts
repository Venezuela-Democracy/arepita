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
  GENERIC: 'Ocurrió un error inesperado',
  INVALID_COMMAND: 'Comando no válido',
  NOT_REGISTERED: 'Necesitas registrarte primero. Usa /register para comenzar.',
  ALREADY_REGISTERED: 'Ya estás registrado.',
} as const;

export const MESSAGES = {
  WELCOME: '👋 ¡Bienvenido a VenezuelaDAO Bot!\nUsa /register para comenzar.',
  HELP: `Comandos disponibles:
  /start - Iniciar bot
  /register - Registrarse en VenezuelaDAO
  /help - Ver ayuda
  /status - Ver estado del bot
  /balance - Ver tu balance de FLOW
  /wallet - Ver información de tu wallet`,
  WALLET_INFO: '🔒 La información de tu wallet ha sido enviada por mensaje privado.',
  BUYPACK_WAITING: '🎲 Comprando pack...',
  BUYPACK_SUCCESS: '🎁 ¡Pack comprado exitosamente! Usa /reveal para abrirlo.',
  BUYPACK_ERROR: '❌ Error al comprar el pack. Por favor intenta de nuevo.',
} as const;