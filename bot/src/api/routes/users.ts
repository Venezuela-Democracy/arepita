import { Router } from 'express';
import { UserService } from '../../services';

export const userRoutes = () => {
  const router = Router();

  router.get('/:telegramId', async (req, res) => {
    try {
      const { telegramId } = req.params;
      const address = await UserService.getWalletAddress(telegramId);
      const language = await UserService.getUserLanguage(telegramId);
      const region = await UserService.getRegion(telegramId);
      
      if (!address) {
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }
  
      return res.json({
        success: true,
        data: {
          telegramId,
          address,
          language,
          region
        }
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener información del wallet
  router.get('/:telegramId/wallet', async (req, res) => {
    try {
      const { telegramId } = req.params;
      const address = await UserService.getWalletAddress(telegramId);
      
      if (!address) {
        return res.status(404).json({ 
          success: false, 
          error: 'Wallet no encontrada' 
        });
      }

      return res.json({
        success: true,
        data: { address }
      });
    } catch (error) {
      console.error('Error getting wallet:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener idioma del usuario
  router.get('/:telegramId/language', async (req, res) => {
    try {
      const { telegramId } = req.params;
      const language = await UserService.getUserLanguage(telegramId);
      
      return res.json({
        success: true,
        data: { language }
      });
    } catch (error) {
      console.error('Error getting language:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener región del usuario
  router.get('/:telegramId/region', async (req, res) => {
    try {
      const { telegramId } = req.params;
      const region = await UserService.getRegion(telegramId);
      
      return res.json({
        success: true,
        data: { region }
      });
    } catch (error) {
      console.error('Error getting region:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  return router;
};