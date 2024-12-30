export interface WalletResponse {
    address: string;
    privateKey: string;
  }
  
  export interface FlowConfig {
    accessNode: string;
    discoveryWallet: string;
  }
  
  export type TransactionStatus = 'pending' | 'success' | 'error';