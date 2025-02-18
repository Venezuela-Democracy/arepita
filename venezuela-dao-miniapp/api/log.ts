import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, data, level, timestamp } = request.body;
    
    // Formatear el log para mejor visibilidad
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Esto aparecerá en los logs de Vercel
    if (level === 'error') {
      console.error(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing log:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}