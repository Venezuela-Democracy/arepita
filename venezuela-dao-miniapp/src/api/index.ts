import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import {
  ApiResponse,
  User,
  WalletInfo,
  NFT,
  Pack,
  BuyPackRequest,
  CreateListingRequest,
  RevealPacksRequest,
  NFTCollection,
  NFTGroup
} from './types';


// Configuración de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuración de axios para los logs (Vercel)
const logApi = axios.create({
  baseURL: 'https://venezuela-dao-miniapp.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir datos de Telegram
api.interceptors.request.use((config) => {
  if (WebApp.initData) {
    config.headers['X-Telegram-Init-Data'] = WebApp.initData;
  }
  return config;
});

export const apiService = {

  sendLog: async (message: string, data?: any, level: 'info' | 'error' = 'info'): Promise<void> => {
    try {
      await logApi.post('/api/log', {
        message,
        data,
        level,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Solo log local si falla el envío al servidor
      console.error('Error sending log:', error);
    }
  },

  // User endpoints
  getUserInfo: async (): Promise<ApiResponse<User>> => {
    try {
      await apiService.sendLog('Iniciando getUserInfo');
      
      if (!WebApp.initDataUnsafe?.user) {
        throw new Error('No se pudo acceder a los datos del usuario de Telegram');
      }

      const telegramUser = WebApp.initDataUnsafe.user;
      
      const { data: userApiData } = await api.get(`/users/${telegramUser.id}`);
      
      const userData: User = {
        id: telegramUser.id.toString(),
        avatarUrl: telegramUser.photo_url || 'https://via.placeholder.com/150',
        username: telegramUser.username || telegramUser.first_name,
        address: userApiData?.data?.address || '',
        language: userApiData?.data?.language || 'es',
        region: userApiData?.data?.region || 'CARACAS',
        hasWallet: !!userApiData?.data?.address
      };


      return {
        success: true,
        data: userData
      };
    } catch (error) {
      await apiService.sendLog('Error en getUserInfo:', error, 'error');
      return {
        success: false,
        error: 'Error al obtener información del usuario'
      };
    }
  },


  getBalance: async (address: string): Promise<ApiResponse<{ balance: number }>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/balance`);
      console.log('💰 Balance retrieved successfully:', data);
      return {
        ...data,
        data: {
          balance: parseFloat(data.data.balance) // Convierte el string "35.00095053" a number 35.00095053
        }
      };
    } catch (error) {
      await apiService.sendLog('Error getting balance:', error, 'error');
      return {
        success: false,
        error: 'Error al obtener balance'
      };
    }
  },

  // Wallet endpoints
  getWalletInfo: async (address: string): Promise<ApiResponse<WalletInfo>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/balance`);
      return data;
    } catch (error) {
      console.error('Error al obtener información del wallet:', error);
      return {
        success: false,
        error: 'Error al obtener información del wallet'
      };
    }
  },

  getNFTs: async (address: string): Promise<ApiResponse<NFT[]>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/nfts`);
      return data;
    } catch (error) {
      console.error('Error al obtener NFTs:', error);
      return {
        success: false,
        error: 'Error al obtener NFTs'
      };
    }
  },

  buyPack: async (address: string, request: BuyPackRequest): Promise<ApiResponse<{ transactionId: string }>> => {
    try {
      const { data } = await api.post(`/wallet/${address}/buy-pack`, request);
      return data;
    } catch (error) {
      console.error('Error al comprar pack:', error);
      return {
        success: false,
        error: 'Error al comprar pack'
      };
    }
  },

  revealPacks: async (address: string, request: RevealPacksRequest): Promise<ApiResponse<{ transactionId: string }>> => {
    try {
      const { data } = await api.post(`/wallet/${address}/reveal-packs`, request);
      return data;
    } catch (error) {
      console.error('Error al revelar packs:', error);
      return {
        success: false,
        error: 'Error al revelar packs'
      };
    }
  },

  getUnrevealedPacks: async (address: string): Promise<ApiResponse<Pack[]>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/unrevealed-packs`);
      return data;
    } catch (error) {
      console.error('Error al obtener packs sin revelar:', error);
      return {
        success: false,
        error: 'Error al obtener packs sin revelar'
      };
    }
  },

  setupStorefront: async (address: string, privateKey: string): Promise<ApiResponse<{ transactionId: string }>> => {
    try {
      const { data } = await api.post(`/wallet/${address}/setup-storefront`, { privateKey });
      return data;
    } catch (error) {
      console.error('Error al configurar storefront:', error);
      return {
        success: false,
        error: 'Error al configurar storefront'
      };
    }
  },

  createListing: async (address: string, request: CreateListingRequest): Promise<ApiResponse<{ transactionId: string }>> => {
    try {
      const { data } = await api.post(`/wallet/${address}/create-listing`, request);
      return data;
    } catch (error) {
      console.error('Error al crear listing:', error);
      return {
        success: false,
        error: 'Error al crear listing'
      };
    }
  },

  getNFTCollection: async (address: string): Promise<ApiResponse<NFTCollection>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/nfts`);
      console.log('🎨 Collection retrieved successfully:', data);
      return {
        success: true,
        // Aquí retornamos directamente data.data en lugar de todo el objeto data
        data: data.data
      };
    } catch (error) {
      console.error('Error getting collection:', error);
      return {
        success: false,
        error: 'Error al obtener la colección'
      };
    }
  },

  getNFTsByType: async (
    address: string, 
    type: 'locations' | 'characters' | 'items',
    index: number
  ): Promise<ApiResponse<NFTGroup>> => {
    try {
      const { data } = await api.get(`/wallet/${address}/nfts/${type}/${index}`);
      //console.log('🎨 NFTs by type retrieved successfully:', data);
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting NFTs by type:', error);
      return {
        success: false,
        error: 'Error al obtener los NFTs por tipo'
      };
    }
  }
};