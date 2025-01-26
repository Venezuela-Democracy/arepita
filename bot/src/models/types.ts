import { VENEZUELA_REGIONS } from '../bot/regions';

// Interfaces base (sin Document de Mongoose)
export interface IUser {
  telegramId: string;
  language: 'es' | 'en';
  region: keyof typeof VENEZUELA_REGIONS;
  wallet: {
    address: string;
    privateKey: string;
    createdAt: Date;
  };
  lastActive: Date;
  createdAt: Date;
}

export interface IGroup {
  groupId: string;
  name: string;
  type: 'GENERAL' | 'REGIONAL';
  createdAt: Date;
  updatedAt: Date;
}