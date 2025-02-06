import axios from 'axios';
import { ApiResponse, User, WalletInfo } from './types';
import WebApp from '@twa-dev/sdk';


// Crear instancia de axios con configuración base
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
  // Obtener información del usuario
  getUserInfo: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error fetching user info',
      };
    }
  },

  // Obtener información de la wallet
  getWalletInfo: async (): Promise<ApiResponse<WalletInfo>> => {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error fetching wallet info',
      };
    }
  },
};