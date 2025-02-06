export interface User {
    id: string;
    avatarUrl: string;
    username: string;
  }
  
  export interface WalletInfo {
    address: string;
    balance: number;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }