export const BOT_COMMANDS = {
    START: 'start',
    HELP: 'help',
    STATUS: 'status',
  } as const;
  
  export const ERROR_MESSAGES = {
    GENERIC: 'Ocurrió un error inesperado',
    INVALID_COMMAND: 'Comando no válido',
  } as const;
  
  export const MESSAGES = {
    WELCOME: '👋 ¡Bienvenido al bot!',
    HELP: `Comandos disponibles:
    /start - Iniciar bot
    /help - Ver ayuda
    /status - Ver estado del bot`,
  } as const;