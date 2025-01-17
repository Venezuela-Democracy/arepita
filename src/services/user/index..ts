import { User, IUser } from '../../models';
import { VenezuelaRegion, SupportedLanguage } from '../../bot/types';
import { FlowAuthData } from './types';

export class UserService {
  /**
   * Busca un usuario por su Telegram ID
   */
  static async findByTelegramId(telegramId: string) {
    return User.findOne({ telegramId });
  }

  /**
   * Crea o actualiza un usuario
   */
  static async createUser(userData: {
    telegramId: string;
    language: SupportedLanguage;
    region: VenezuelaRegion;
    wallet: {
      address: string;
      privateKey: string;
    };
  }) {
    return User.upsert(userData.telegramId, userData);
  }

  /**
   * Actualiza la última actividad del usuario
   */
  static async updateLastActive(telegramId: string) {
    return User.upsert(telegramId, { lastActive: new Date() });
  }

  /**
   * Obtiene la dirección de la wallet del usuario
   */
  static async getWalletAddress(telegramId: string): Promise<string | null> {
    const user = await User.findOne({ telegramId });
    return user?.wallet?.address || null;
  }

  /**
   * Obtiene la clave privada de la wallet del usuario
   */
  static async getPrivateKey(telegramId: string): Promise<string | null> {
    const user = await User.findOne({ telegramId });
    return user?.wallet?.privateKey || null;
  }

  /**
   * Verifica si un usuario está registrado
   */
  static async isRegistered(telegramId: string): Promise<boolean> {
    const user = await User.findOne({ telegramId });
    return !!(user?.wallet?.address);
  }

  /**
   * Obtiene usuarios por región
   */
  static async getUsersByRegion(region: VenezuelaRegion) {
    return User.find({ region });
  }

  /**
   * Obtiene estadísticas de usuarios por región
   */
  static async getRegionStats(): Promise<Record<VenezuelaRegion, number>> {
    return User.getStats('region') as Promise<Record<VenezuelaRegion, number>>;
  }

  /**
   * Obtiene los datos de autenticación para Flow
   */
  static async getFlowAuthData(telegramId: string): Promise<FlowAuthData | null> {
    const user = await User.findOne({ telegramId });
    if (!user?.wallet) return null;

    return {
      address: user.wallet.address,
      privateKey: user.wallet.privateKey,
      keyId: 0
    };
  }

  /**
   * Obtiene la región del usuario
   */
  static async getRegion(telegramId: string): Promise<VenezuelaRegion | null> {
    const user = await User.findOne({ telegramId });
    return user?.region || null;
  }

  /**
   * Obtiene el idioma del usuario
   */
  static async getUserLanguage(telegramId: string): Promise<SupportedLanguage | null> {
    const user = await User.findOne({ telegramId });
    return user?.language || null;
  }

  /**
   * Actualiza el idioma del usuario
   */
  static async setUserLanguage(telegramId: string, language: SupportedLanguage) {
    return User.upsert(telegramId, { language });
  }
}