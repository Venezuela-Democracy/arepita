import { User, IUser } from '../../models';
import { VenezuelaRegion } from '../../bot/types';
import { FlowAuthData } from './types';



export class UserService {
  /**
   * Busca un usuario por su Telegram ID
   */
  static async findByTelegramId(telegramId: string): Promise<IUser | null> {
    try {
      return await User.findByTelegramId(telegramId);
    } catch (error) {
      console.error('Error finding user by telegram ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  static async createUser(userData: {
    telegramId: string;
    region: VenezuelaRegion;
    wallet: {
      address: string;
      privateKey: string;
    };
  }): Promise<IUser> {
    try {
      return await User.createUser(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Actualiza la última actividad del usuario
   */
  static async updateLastActive(telegramId: string): Promise<void> {
    try {
      await User.updateOne(
        { telegramId },
        { $set: { lastActive: new Date() } }
      );
    } catch (error) {
      console.error('Error updating last active:', error);
      throw error;
    }
  }

  /**
   * Obtiene la dirección de la wallet del usuario
   */
  static async getWalletAddress(telegramId: string): Promise<string | null> {
    try {
      const user = await User.findByTelegramId(telegramId);
      return user?.wallet.address || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario está registrado
   */
  static async isRegistered(telegramId: string): Promise<boolean> {
    try {
      const user = await User.findByTelegramId(telegramId);
      return !!user;
    } catch (error) {
      console.error('Error checking registration:', error);
      throw error;
    }
  }

  /**
   * Obtiene usuarios por región
   */
  static async getUsersByRegion(region: VenezuelaRegion): Promise<IUser[]> {
    try {
      return await User.find({ region });
    } catch (error) {
      console.error('Error getting users by region:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios por región
   */
  static async getRegionStats(): Promise<Record<VenezuelaRegion, number>> {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: '$region',
            count: { $sum: 1 }
          }
        }
      ]);

      return stats.reduce((acc, curr) => {
        acc[curr._id as VenezuelaRegion] = curr.count;
        return acc;
      }, {} as Record<VenezuelaRegion, number>);
    } catch (error) {
      console.error('Error getting region stats:', error);
      throw error;
    }
  }

    /**
   * Obtiene los datos de autenticación necesarios para transacciones Flow/Cadence
   * Solo usar este método para operaciones que requieran firmar transacciones
   */
    static async getFlowAuthData(telegramId: string): Promise<FlowAuthData | null> {
      try {
        const user = await User.findOne({ telegramId })
          .select('+wallet.privateKey')
          .lean();
  
        if (!user) return null;
  
        return {
          address: user.wallet.address,
          privateKey: user.wallet.privateKey,
          keyId: 0  // Por defecto usamos keyId 0
        };
      } catch (error) {
        console.error('Error getting Flow auth data:', error);
        throw error;
      }
    }

    static async getRegion(telegramId: string): Promise<VenezuelaRegion | null> {
      try {
        const user = await User.findByTelegramId(telegramId);
        return user?.region || null;
      } catch (error) {
        console.error('Error getting user region:', error);
        throw error;
      }
    }
}