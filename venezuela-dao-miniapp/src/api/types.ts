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
}

export interface CreateListingRequest {
  nftId: string;
  price: number;
  marketplaceAddress: string;
  privateKey: string;
}

export interface RevealPacksRequest {
  amount?: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NFTTrait {
  name: string;
  value: string;
}

export interface NFTInstance {
  id: string;
  serial: {
    number: number;
  };
  traits: {
    traits: NFTTrait[];
  };
}

export interface NFTDisplay {
  name: string;
  description?: string;
  thumbnail?: {
    url: string;
  };
}

export interface NFTGroup {
  metadataId: string;
  display: NFTDisplay;
  type: any; // Mantenemos any por la compleja estructura
  instances: NFTInstance[];
  count: number; // Total de NFTs en este grupo
}

export interface NFTCollection {
  locations: NFTGroup[];  // Array de grupos de locations
  characters: NFTGroup[]; // Array de grupos de characters
  culturalItems: NFTGroup[]; // Array de grupos de items
}