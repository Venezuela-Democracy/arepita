import axios from 'axios';
import { ApiResponse, User, WalletInfo } from './types';
import WebApp from '@twa-dev/sdk';

console.log('Telegram WebApp Data:', {
  user: WebApp.initDataUnsafe?.user,
  initData: WebApp.initData
});

const telegramUser = WebApp.initDataUnsafe?.user || {
  id: 0,
  first_name: 'Demo',
  username: 'demo_user',
  photo_url: 'https://via.placeholder.com/150'
};

const MOCK_DATA = {
  user: {
    id: telegramUser.id.toString(),
    avatarUrl: telegramUser.photo_url || 'https://via.placeholder.com/150', // Valor por defecto si photo_url es undefined
    username: telegramUser.username || telegramUser.first_name
  },
  wallet: {
    address: '0x1234567890abcdef',
    balance: 150.75
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (WebApp.initData) {
    config.headers['X-Telegram-Init-Data'] = WebApp.initData;
  }
  return config;
});

export const apiService = {
  getUserInfo: async (): Promise<ApiResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: MOCK_DATA.user
    };
  },

  getWalletInfo: async (): Promise<ApiResponse<WalletInfo>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: MOCK_DATA.wallet
    };
  },
};