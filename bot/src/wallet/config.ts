import * as fcl from "@onflow/fcl";
import { ENV } from '../config/env';
import { FlowConfig } from './types';

// Validar variables de entorno
if (!ENV.FLOW_SERVICE_ADDRESS || !ENV.FLOW_SERVICE_PRIVATE_KEY) {
  throw new Error('Flow service account credentials not configured');
}

export const flowConfig: FlowConfig = {
  accessNode: ENV.FLOW_NETWORK === 'testnet' 
    ? "https://rest-testnet.onflow.org"
    : "https://rest-mainnet.onflow.org",
  
  discoveryWallet: ENV.FLOW_NETWORK === 'testnet'
    ? "https://fcl-discovery.onflow.org/testnet/authn"
    : "https://fcl-discovery.onflow.org/authn",
  
  // Contratos según network
  fungibleToken: ENV.FLOW_NETWORK === 'testnet' 
    ? "0x9a0766d93b6608b7" 
    : "0xf233dcee88fe0abe",
  flowToken: ENV.FLOW_NETWORK === 'testnet'
    ? "0x7e60df042a9c0868"
    : "0x1654653399040a61",
  venezuelaNFTAddress: ENV.FLOW_NETWORK === 'testnet'
    ? "0x826dae42290107c3"
    : "0x826dae42290107c3",
  nonFungibleToken: ENV.FLOW_NETWORK === 'testnet'
    ? "0x631e88ae7f1d7c20"
    : "0x1d7e57aa55817448",
  metadataViews: ENV.FLOW_NETWORK === 'testnet'
    ? "0x631e88ae7f1d7c20"
    : "0x1d7e57aa55817448",
  fungibleTokenMetadataViews: ENV.FLOW_NETWORK == 'testnet'
    ? "0x9a0766d93b6608b7"
    : "0xf233dcee88fe0abe",
  viewResolver: ENV.FLOW_NETWORK == 'testnet'
    ? "0x631e88ae7f1d7c20"
    : "0x1d7e57aa55817448",
  // Cuenta de servicio
  serviceAccount: {
    address: ENV.FLOW_SERVICE_ADDRESS,
    privateKey: ENV.FLOW_SERVICE_PRIVATE_KEY,
    keyIndex: ENV.FLOW_SERVICE_KEY_INDEX || 0
  },
} as const;

export const initializeFlow = async () => {
  fcl.config({
    "accessNode.api": flowConfig.accessNode,
    "discovery.wallet": flowConfig.discoveryWallet,
    "0xFungibleToken": flowConfig.fungibleToken,
    "0xFlowToken": flowConfig.flowToken,
    "app.detail.title": "VenezuelaDAO",
    "app.detail.icon": "https://venezueladao.com/icon.png"
  });

  console.log(`🌊 Flow initialized on ${ENV.FLOW_NETWORK}`);
  console.log(`📦 Service Account: ${flowConfig.serviceAccount.address}`);
};