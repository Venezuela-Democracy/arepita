import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import * as fcl from "@onflow/fcl";
import { flowConfig } from '../config';

export class FlowAuth {
  private ec: EC;
  private serviceAccount: typeof flowConfig.serviceAccount;

  constructor() {
    this.ec = new EC('p256');
    this.serviceAccount = flowConfig.serviceAccount;
  }

  private signWithKey(privateKey: string, message: string): string {
    const hash = new SHA3(256);
    hash.update(Buffer.from(message, 'hex'));
    const msgHash = hash.digest();
    
    const key = this.ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
    const sig = key.sign(msgHash);
    const n = 32;
    const r = sig.r.toArrayLike(Buffer, 'be', n);
    const s = sig.s.toArrayLike(Buffer, 'be', n);
    return Buffer.concat([r, s]).toString('hex');
  }

  async getAuthorization(authData?: { address: string; privateKey: string; keyIndex?: number }) {
    return async (account: any) => {
      const address = authData?.address || this.serviceAccount.address;
      const privateKey = authData?.privateKey || this.serviceAccount.privateKey;
      const keyIndex = authData?.keyIndex || this.serviceAccount.keyIndex;
  
      const user = await fcl.account(address);
      const key = user.keys[keyIndex];
  
      return {
        ...account,
        tempId: `${address}-${keyIndex}`,
        addr: fcl.sansPrefix(address),
        keyId: key.index,
        signingFunction: (signable: any) => {
          return {
            addr: fcl.withPrefix(address),
            keyId: key.index,
            signature: this.signWithKey(privateKey, signable.message)
          };
        }
      };
    };
  }

  async executeTransaction(params: {
    cadence: string,
    argsFn?: (arg: any, t: any) => any[],
    authOptions?: { address: string; privateKey: string; keyIndex?: number },
    limit?: number
  }): Promise<string> {
    const { cadence, argsFn, authOptions, limit = 1000 } = params;
    const authorization = await this.getAuthorization(authOptions);
    return await fcl.mutate({
      cadence,
      args: argsFn,
      payer: authorization,
      proposer: authorization,
      authorizations: [authorization],
      limit: limit
    });
  }
}

export const flowAuth = new FlowAuth(); 