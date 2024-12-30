import * as fcl from "@onflow/fcl";

// Configuración para testnet
export const flowConfig = {
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "app.detail.title": "VenezuelaDAO",
  "app.detail.icon": "https://venezueladao.com/icon.png"
} as const;

// Inicializar FCL con la configuración
export const initializeFlow = () => {
  fcl.config(flowConfig);
};