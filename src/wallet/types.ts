export interface WalletResponse {
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface ServiceAccount {
  address: string;
  privateKey: string;
  keyIndex: number;
}

export interface FlowConfig {
  accessNode: string;
  discoveryWallet: string;
  fungibleToken: string;
  flowToken: string;
  serviceAccount: ServiceAccount;
  venezuelaNFTAddress: string;
  nonFungibleToken: string;
  metadataViews: string;
}

export type TransactionStatus = 'pending' | 'success' | 'error';

export interface FlowAuthorization {
  addr: string;
  keyId: number;
  signingFunction: (data: any) => Promise<{ signature: string }>;
}

export interface TransactionResult {
  transactionId: string;
  status: TransactionStatus;
}