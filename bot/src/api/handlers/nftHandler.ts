import { Request, Response } from 'express';
import { flowWallet } from '../../wallet/flow';
import { UserService } from '../../services';


export const nftHandler = {
  async buyPacks(req: Request, res: Response) {
    try {
      console.log('🛒 Iniciando compra de packs...');
      const { amount = 1 } = req.body;
      const { telegramId } = req.params;

      console.log('📥 Parámetros recibidos:', { telegramId, amount });
      
      if (!telegramId) {
        console.log('❌ Error: telegramId no proporcionado');
        return res.status(400).json({
          success: false,
          error: 'telegramId es requerido'
        });
      }

      console.log('🔍 Buscando usuario:', telegramId);
      const [address, privateKey] = await Promise.all([
        UserService.getWalletAddress(telegramId),
        UserService.getPrivateKey(telegramId)
      ]);

      console.log('🔑 Datos obtenidos:', { address, privateKey: privateKey ? '*****' : 'no encontrada' });
      
      if (!address || !privateKey) {
        console.log('❌ Wallet no registrada para usuario:', telegramId);
        return res.status(400).json({
          success: false,
          error: 'Usuario no tiene wallet registrada'
        });
      }

      console.log('⚡ Ejecutando transacción...');
      const transactionId = await flowWallet.nft.buyPack(address, privateKey, amount);
      console.log('✅ Transacción exitosa ID:', transactionId);

      return res.json({ success: true, data: { transactionId } });
    } catch (error) {
      console.error('💥 Error en buyPacks:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  async revealPacks(req: Request, res: Response) {
    try {
      const { amount = 1 } = req.body; 
      const telegramId = req.params.telegramId; 

      if (!telegramId) {
        return res.status(400).json({
          success: false,
          error: 'telegramId es requerido'
        });
      }

      // Obtener datos del usuario
      const [address, privateKey] = await Promise.all([
        UserService.getWalletAddress(telegramId),
        UserService.getPrivateKey(telegramId)
      ]);

      if (!address || !privateKey) {
        return res.status(400).json({
          success: false,
          error: 'Usuario no tiene wallet registrada'
        });
      }

      const transactionId = await flowWallet.nft.revealPacks(address, privateKey, amount);

      return res.json({
        success: true,
        data: {
          transactionId
        }
      });
    } catch (error) {
      console.error('Error revealing packs:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  },

  async getUnrevealedPacks(req: Request, res: Response) {
    try {
      console.log('📦 Obteniendo packs sin revelar...');
      const { telegramId } = req.params;
      console.log('👤 Telegram ID recibido:', telegramId);

      if (!telegramId) {
        console.log('❌ Error: telegramId no proporcionado');
        return res.status(400).json({
          success: false,
          error: 'telegramId es requerido'
        });
      }

      console.log('🔍 Buscando dirección del usuario...');
      const address = await UserService.getWalletAddress(telegramId);
      console.log('🏷️ Dirección obtenida:', address);
      
      if (!address) {
        console.log('❌ No hay dirección registrada');
        return res.status(400).json({
          success: false,
          error: 'Usuario no tiene wallet registrada'
        });
      }

      const formattedAddress = address.startsWith('0x') ? address : `0x${address}`;
      console.log('🔧 Dirección formateada:', formattedAddress);
      
      console.log('🔍 Consultando blockchain...');
      const packs = await flowWallet.nft.getUnrevealedPacks(formattedAddress);
      console.log('📦 Packs obtenidos:', packs);

      return res.json({ success: true, data: { unrevealedPacks: packs } });
    } catch (error) {
      console.error('💥 Error en getUnrevealedPacks:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}; 