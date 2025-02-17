// La URL base para los logs será la misma que donde está hosteada la miniapp
const LOG_URL = 'https://venezuela-dao-miniapp.vercel.app/api/log';

export const logger = {
  log: (message: string, data?: any) => {
    // Log local
    console.log(message, data);
    
    // Enviar a endpoint de logging de Vercel (miniapp)
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        data, 
        level: 'info',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  },
  
  error: (message: string, error?: any) => {
    // Log local
    console.error(message, error);
    
    // Enviar a endpoint de logging de Vercel (miniapp)
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        error: error?.toString(), 
        level: 'error',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  }
};