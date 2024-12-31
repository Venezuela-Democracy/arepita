import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { flowConfig } from './config';
import { WalletResponse} from "./types";

export class FlowWallet {
  private ec: EC;
  private serviceAccount: typeof flowConfig.serviceAccount;
  private INITIAL_FUNDING = "5";

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

  private async getAuthorization() {
    return async (account: any) => {
      const user = await fcl.account(this.serviceAccount.address);
      const key = user.keys[this.serviceAccount.keyIndex];

      return {
        ...account,
        tempId: `${this.serviceAccount.address}-${this.serviceAccount.keyIndex}`,
        addr: fcl.sansPrefix(this.serviceAccount.address),
        keyId: key.index,
        signingFunction: (signable: any) => {
          return {
            addr: fcl.withPrefix(this.serviceAccount.address),
            keyId: key.index,
            signature: this.signWithKey(this.serviceAccount.privateKey, signable.message)
          };
        }
      };
    };
  }

  async verifyServiceAccount(): Promise<boolean> {
    try {
      const account = await fcl.account(this.serviceAccount.address);
      const key = account.keys[this.serviceAccount.keyIndex];
      
      if (!key || !key.publicKey) {
        throw new Error('Invalid key configuration');
      }

      console.log(`✅ Service account verified:
        Address: ${this.serviceAccount.address}
        Key Index: ${this.serviceAccount.keyIndex}
        Public Key: ${key.publicKey}
        Weight: ${key.weight}
        Revoked: ${key.revoked}
      `);

      return true;
    } catch (error) {
      console.error('Service account verification failed:', error);
      return false;
    }
  }

  async createWallet(): Promise<WalletResponse> {
    try {
      const keyPair = this.ec.genKeyPair();
      const privateKey = keyPair.getPrivate('hex');
      
      // Formatear la clave pública correctamente
      const publicKeyPoint = keyPair.getPublic();
      const publicKey = Buffer.concat([
        publicKeyPoint.getX().toArrayLike(Buffer, 'be', 32),
        publicKeyPoint.getY().toArrayLike(Buffer, 'be', 32)
      ]).toString('hex');
  
      console.log('🔑 Generated keys:', {
        privateKey,
        publicKey,
        publicKeyLength: publicKey.length
      });
  
      const authorization = await this.getAuthorization();

      const transactionId = await fcl.mutate({
        cadence: `
          transaction(publicKey: String) {
            prepare(signer: auth(BorrowValue) &Account) {
              let account = Account(payer: signer)
              
              let key = PublicKey(
                publicKey: publicKey.decodeHex(),
                signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
              )
              
              account.keys.add(
                publicKey: key,
                hashAlgorithm: HashAlgorithm.SHA3_256,
                weight: 1000.0
              )
  
              log("New account created")
              log(account.address)
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(publicKey, t.String)
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      console.log('📝 Transaction ID:', transactionId);
  
      // Esperar a que la transacción se complete
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Transaction Result:', JSON.stringify(txResult, null, 2));
      
      // Buscar el evento de creación de cuenta
      const events = txResult.events;
      console.log('📊 Events:', JSON.stringify(events, null, 2));
  
      const accountCreatedEvent = events.find((e: any) => 
        e.type === 'flow.AccountCreated' || 
        e.type.includes('AccountCreated')
      );
  
      if (!accountCreatedEvent) {
        throw new Error('No account creation event found');
      }
  
      console.log('🎉 Account Created Event:', JSON.stringify(accountCreatedEvent, null, 2));
  
      const newAddress = accountCreatedEvent.data.address;
      console.log('📫 New Address:', newAddress);
  
      // Fondear la cuenta en testnet
      if (process.env.FLOW_NETWORK === 'testnet') {
        try {
          const txId = await this.fundWallet(newAddress, this.INITIAL_FUNDING);
          await fcl.tx(txId).onceSealed();
          console.log(`✅ Wallet ${newAddress} fondeada exitosamente`);
        } catch (fundingError) {
          console.error('❌ Error en el fondeo inicial:', fundingError);
        }
      }
      
      const walletResponse = {
        address: newAddress,
        privateKey,
        publicKey
      };
  
      console.log('📱 Wallet Response:', JSON.stringify(walletResponse, null, 2));
      
      return walletResponse;
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error('Failed to create Flow wallet');
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await fcl.query({
        cadence: `
          import FungibleToken from ${flowConfig.fungibleToken}
          import FlowToken from ${flowConfig.flowToken}

          pub fun main(address: Address): UFix64 {
            let account = getAccount(address)
            let vaultRef = account
              .getCapability(/public/flowTokenBalance)
              .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
              ?? panic("Could not borrow Balance reference")

            return vaultRef.balance
          }
        `,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      });

      return balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  async fundWallet(toAddress: string, amount: string): Promise<string> {
    try {
      console.log(`💰 Fondeando wallet ${toAddress} con ${amount} FLOW...`);
      
      const authorization = await this.getAuthorization();
      
      const transactionId = await fcl.mutate({
        cadence: `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868
  
          transaction(amount: UFix64, recipient: Address) {
            prepare(signer: auth(BorrowValue) &Account) {
              // Get a reference to the signer's stored vault
              let vaultRef = signer.storage
                .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                  from: /storage/flowTokenVault
                ) ?? panic("Could not borrow a reference to the owner's vault")
  
              // Withdraw tokens from the signer's stored vault
              let sentVault <- vaultRef.withdraw(amount: amount)
  
              // Get the recipient's public account object
              let recipient = getAccount(recipient)
              
              // Get their public receiver reference
              let receiverRef = recipient.capabilities
                .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                ?? panic("Could not borrow receiver reference")
  
              // Deposit the withdrawn tokens
              receiverRef.deposit(from: <-sentVault)
  
              log("Transfer succeeded!")
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(amount, t.UFix64),
          arg(toAddress, t.Address)
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 1000
      });
  
      console.log(`✅ Transacción de fondeo iniciada: ${transactionId}`);
      
      // Esperar a que la transacción se complete
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Resultado de la transacción:', txResult);
      
      return transactionId;
    } catch (error) {
      console.error('❌ Error fondeando wallet:', error);
      throw error;
    }
  }
}