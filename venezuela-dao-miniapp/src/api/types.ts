// Interfaces base
export interface User {
  id: string;
  avatarUrl: string;
  username: string;
  address: string;
  language: string;
  region: string;
  hasWallet: boolean;
}

export interface WalletInfo {
  address: string;
  balance: number;
}

export interface NFT {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
}

export interface Pack {
  id: string;
  isRevealed: boolean;
}

export interface Listing {
  nftId: string;
  price: number;
  marketplaceAddress: string;
}

// Request/Response types
export interface BuyPackRequest {
  amount?: number;
  privateKey: string;
}

export interface CreateListingRequest {
  nftId: string;
  price: number;
  marketplaceAddress: string;
  privateKey: string;
}

export interface RevealPacksRequest {
  amount?: number;
  privateKey: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}