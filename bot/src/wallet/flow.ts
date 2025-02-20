import { flowAccount } from './account/FlowAccount';
import { flowNFT } from './nft/FlowNFT';
import { flowStorefront } from './storefront/FlowStorefront';
import { flowAuth } from './utils/auth';

export class FlowWallet {
  public readonly account = flowAccount;
  public readonly nft = flowNFT;
  public readonly storefront = flowStorefront;
  public readonly auth = flowAuth;
}

export const flowWallet = new FlowWallet();

// Re-export types for convenience
export * from './types';