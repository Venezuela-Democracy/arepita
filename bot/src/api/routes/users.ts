import { Router } from 'express';
import { UserService } from '../../services';

export const userRoutes = () => {
  const router = Router();

  router.get('/:telegramId', async (req, res) => {
    try {
      console.log('🔍 Getting user info for telegramId:', req.params.telegramId);
      const { telegramId } = req.params;
      
      console.log('👤 Fetching wallet address...');
      const address = await UserService.getWalletAddress(telegramId);
      
      console.log('🗣️ Fetching user language...');
      const language = await UserService.getUserLanguage(telegramId);
      
      console.log('🌎 Fetching user region...');
      const region = await UserService.getRegion(telegramId);
      
      if (!address) {
        console.log('❌ User not found');
        return res.status(404).json({ 
          success: false, 
          error: 'Usuario no encontrado' 
        });
      }
  
      console.log('✅ User info retrieved successfully');
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
      console.error('💥 Error getting user info:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener información del wallet
  router.get('/:telegramId/wallet', async (req, res) => {
    try {
      console.log('🔍 Getting wallet info for telegramId:', req.params.telegramId);
      const { telegramId } = req.params;
      
      console.log('💳 Fetching wallet address...');
      const address = await UserService.getWalletAddress(telegramId);
      
      if (!address) {
        console.log('❌ Wallet not found');
        return res.status(404).json({ 
          success: false, 
          error: 'Wallet no encontrada' 
        });
      }

      console.log('✅ Wallet info retrieved successfully');
      return res.json({
        success: true,
        data: { address }
      });
    } catch (error) {
      console.error('💥 Error getting wallet:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener idioma del usuario
  router.get('/:telegramId/language', async (req, res) => {
    try {
      console.log('🔍 Getting language for telegramId:', req.params.telegramId);
      const { telegramId } = req.params;
      
      console.log('🗣️ Fetching user language...');
      const language = await UserService.getUserLanguage(telegramId);
      
      console.log('✅ Language retrieved successfully');
      return res.json({
        success: true,
        data: { language }
      });
    } catch (error) {
      console.error('💥 Error getting language:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  // Obtener región del usuario
  router.get('/:telegramId/region', async (req, res) => {
    try {
      console.log('🔍 Getting region for telegramId:', req.params.telegramId);
      const { telegramId } = req.params;
      
      console.log('🌎 Fetching user region...');
      const region = await UserService.getRegion(telegramId);
      
      console.log('✅ Region retrieved successfully');
      return res.json({
        success: true,
        data: { region }
      });
    } catch (error) {
      console.error('💥 Error getting region:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  });

  return router;
};