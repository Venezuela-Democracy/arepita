import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { WalletResponse } from "./types";

export class FlowWallet {
  private ec: EC;

  constructor() {
    this.ec = new EC('p256');
  }

  /**
   * Crea una nueva wallet de Flow
   */
  async createWallet(): Promise<WalletResponse> {
    try {
      // Generar par de claves
      const keyPair = this.ec.genKeyPair();
      const privateKey = keyPair.getPrivate('hex');
      const publicKey = keyPair.getPublic('hex');

      // Crear cuenta en Flow
      const response = await fcl.send([
        fcl.transaction`
          transaction(publicKey: String) {
            prepare(signer: AuthAccount) {
              let account = AuthAccount(payer: signer)
              account.addPublicKey(publicKey.decodeHex())
            }
          }
        `,
        fcl.args([fcl.arg(publicKey, t.String)]),
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz])
      ]);

      const { address } = await fcl.decode(response);

      return {
        address,
        privateKey
      };
    } catch (error) {
      console.error('Error creating Flow wallet:', error);
      throw new Error('Failed to create Flow wallet');
    }
  }

  /**
   * Obtiene el balance de una dirección
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await fcl.query({
        cadence: `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868

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

  /**
   * Envía una transacción
   */
  async sendTransaction(
    fromAddress: string, 
    toAddress: string, 
    amount: string
  ): Promise<string> {
    try {
      const transactionId = await fcl.mutate({
        cadence: `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868

          transaction(amount: UFix64, to: Address) {
            prepare(signer: AuthAccount) {
              let payment <- signer
                .borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
                .withdraw(amount: amount)

              getAccount(to)
                .getCapability(/public/flowTokenReceiver)
                .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()!
                .deposit(from: <-payment)
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(amount, t.UFix64),
          arg(toAddress, t.Address)
        ],
        limit: 500
      });

      return transactionId;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }
}