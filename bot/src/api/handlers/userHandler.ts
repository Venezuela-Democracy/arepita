import { Request, Response } from 'express';
import { UserService } from '../../services';
import { FlowWallet } from '../../wallet';
import { VenezuelaRegion } from '../../bot/regions';

const flowWallet = new FlowWallet();

export const userHandler = {
  async registerUser(req: Request, res: Response) {
    try {
      console.log('👤 Iniciando registro de usuario...');
      const { telegramId, region, language = 'es' } = req.body;

      if (!telegramId || !region) {
        return res.status(400).json({
          success: false,
          error: 'telegramId y region son requeridos'
        });
      }

      // Verificar si el usuario ya está registrado
      const isRegistered = await UserService.isRegistered(telegramId);
      if (isRegistered) {
        return res.status(400).json({
          success: false,
          error: 'Usuario ya registrado'
        });
      }

      // Crear wallet
      console.log('💰 Creando wallet...');
      const wallet = await flowWallet.account.createWallet();
      console.log('✅ Wallet creada:', wallet.address);

      // Registrar usuario
      console.log('📝 Registrando usuario...');
      await UserService.createUser({
        telegramId,
        region: region as VenezuelaRegion,
        language,
        wallet: {
          address: wallet.address,
          privateKey: wallet.privateKey
        }
      });

      return res.json({
        success: true,
        data: {
          telegramId,
          region,
          language,
          address: wallet.address
        }
      });
    } catch (error) {
      console.error('💥 Error en registro:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};