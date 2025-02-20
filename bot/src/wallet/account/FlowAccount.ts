import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import { flowConfig } from '../config';
import { WalletResponse } from "../types";
import { flowAuth } from '../utils/auth';

export class FlowAccount {
  private ec: EC;
  private INITIAL_FUNDING = "50.0";

  constructor() {
    this.ec = new EC('p256');
  }

  async verifyServiceAccount(): Promise<boolean> {
    try {
      const account = await fcl.account(flowConfig.serviceAccount.address);
      const key = account.keys[flowConfig.serviceAccount.keyIndex];
      
      if (!key || !key.publicKey) {
        throw new Error('Invalid key configuration');
      }
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
      
      // Format the public key correctly
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

      const cadence = `
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
      `;

      const transactionId = await flowAuth.executeTransaction({
        cadence,
        argsFn: (arg: any, t: any) => [arg(publicKey, t.String)],
      });
  
      console.log('📝 Transaction ID:', transactionId);
  
      // Wait for the transaction to be sealed and process the result
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Transaction Result:', JSON.stringify(txResult, null, 2));
      
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
  
      // Fund the account in testnet
      if (process.env.FLOW_NETWORK === 'testnet') {
        try {
          const txId = await this.fundWallet(newAddress, this.INITIAL_FUNDING);
          await fcl.tx(txId).onceSealed();
          console.log(`✅ Wallet ${newAddress} funded successfully`);
        } catch (fundingError) {
          console.error('❌ Error in initial funding:', fundingError);
        }
      }
      
      return {
        address: newAddress,
        privateKey,
        publicKey
      };
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error('Failed to create Flow wallet');
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const cadence = `
        import FungibleToken from ${flowConfig.fungibleToken}
        import FlowToken from ${flowConfig.flowToken}

        access(all) 
        fun main(address: Address): UFix64 {
          let account = getAccount(address)
          
          let vaultRef = account.capabilities
            .get<&{FungibleToken.Balance}>(
              /public/flowTokenBalance
            )
            .borrow()
            ?? panic("Could not borrow a balance reference to the account's Flow Token Vault")

          return vaultRef.balance
        }
      `;

      const balance = await fcl.query({
        cadence,
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
      console.log(`💰 Funding wallet ${toAddress} with ${amount} FLOW...`);
      
      const cadence = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868

        transaction(amount: UFix64, recipient: Address) {
          prepare(signer: auth(BorrowValue) &Account) {
            let vaultRef = signer.storage
              .borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                from: /storage/flowTokenVault
              ) ?? panic("Could not borrow a reference to the owner's vault")

            let sentVault <- vaultRef.withdraw(amount: amount)

            let recipient = getAccount(recipient)
            
            let receiverRef = recipient.capabilities
              .borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
              ?? panic("Could not borrow receiver reference")

            receiverRef.deposit(from: <-sentVault)

            log("Transfer succeeded!")
          }
        }
      `;

      const transactionId = await flowAuth.executeTransaction({
        cadence,
        argsFn: (arg: any, t: any) => [
          arg(amount, t.UFix64),
          arg(toAddress, t.Address)
        ],
      });

      console.log(`✅ Funding transaction initiated: ${transactionId}`);
      
      const txResult = await fcl.tx(transactionId).onceSealed();
      console.log('🔍 Transaction result:', txResult);
      
      return transactionId;
    } catch (error) {
      console.error('❌ Error funding wallet:', error);
      throw error;
    }
  }
}

export const flowAccount = new FlowAccount(); 