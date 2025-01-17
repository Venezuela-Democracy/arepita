import { db } from '../config/firebase';
import { VENEZUELA_REGIONS } from '../bot/regions';
import { IUser } from './types';

export interface IUserModel {
  findByTelegramId(telegramId: string): Promise<IUser | null>;
  createUser(userData: {
    telegramId: string;
    region: string;
    language: 'es' | 'en';
    wallet: {
      address: string;
      privateKey: string;
    };
  }): Promise<IUser>;
  setUserLanguage(telegramId: string, language: 'es' | 'en'): Promise<IUser | null>;
  getUserLanguage(telegramId: string): Promise<string | null>;
}

const userModel: IUserModel = {
  async findByTelegramId(telegramId: string) {
    const doc = await db.collection('users').doc(telegramId).get();
    return doc.exists ? (doc.data() as IUser) : null;
  },

  async createUser(userData) {
    const user: IUser = {
      telegramId: userData.telegramId,
      region: userData.region as keyof typeof VENEZUELA_REGIONS,
      language: userData.language,
      wallet: {
        ...userData.wallet,
        createdAt: new Date()
      },
      lastActive: new Date(),
      createdAt: new Date()
    };

    await db.collection('users').doc(userData.telegramId).set(user, { merge: true });
    return user;
  },

  async setUserLanguage(telegramId: string, language: 'es' | 'en') {
    const ref = db.collection('users').doc(telegramId);
    await ref.update({ language });
    const doc = await ref.get();
    return doc.exists ? (doc.data() as IUser) : null;
  },

  async getUserLanguage(telegramId: string) {
    const doc = await db.collection('users').doc(telegramId).get();
    return doc.exists ? (doc.data() as IUser).language : null;
  }
};

export default userModel;