import * as fcl from "@onflow/fcl";
import { ec as EC } from "elliptic";
import { SHA3 } from "sha3";
import { flowConfig } from './config';
import { FlowAuthorization, WalletResponse} from "./types";

export class FlowWallet {
  private ec: EC;
  private serviceAccount: typeof flowConfig.serviceAccount;
  private INITIAL_FUNDING = "5.0";

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

  private async getAuthorization(authData?: { address: string; privateKey: string; keyIndex?: number }) {
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

  async verifyServiceAccount(): Promise<boolean> {
    try {
      const account = await fcl.account(this.serviceAccount.address);
      const key = account.keys[this.serviceAccount.keyIndex];
      
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

  async buyPack(userAddress: string, privateKey: string): Promise<string> {
    try {
      const authorization = await this.getAuthorization({ 
        address: userAddress, 
        privateKey: privateKey 
      });
  
      const transactionId = await fcl.mutate({
        cadence: `
          import VenezuelaNFT_13 from ${flowConfig.venezuelaNFTAddress}
          import NonFungibleToken from ${flowConfig.nonFungibleToken}
          import MetadataViews from ${flowConfig.metadataViews}
  
          transaction(setID: UInt32) {
            prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
              let collectionData = VenezuelaNFT_13.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
                ?? panic("ViewResolver does not resolve NFTCollectionData view")
  
              // Return early if the account already has a collection
              if signer.storage.borrow<&VenezuelaNFT_13.Collection>(from: collectionData.storagePath) != nil {
                return
              }
              // Create a new empty collection
              let collection <- VenezuelaNFT_13.createEmptyCollection(nftType: Type<@VenezuelaNFT_13.NFT>())
  
              // save it to the account
              signer.storage.save(<-collection, to: collectionData.storagePath)
  
              // create a public capability for the collection
              let collectionCap = signer.capabilities.storage.issue<&VenezuelaNFT_13.Collection>(collectionData.storagePath)
              signer.capabilities.publish(collectionCap, at: collectionData.publicPath)
              
              // Commit my bet and get a receipt
              let receipt <- VenezuelaNFT_13.buyPack(setID: setID)
              
              // Check that I don't already have a receipt stored
              if signer.storage.type(at: VenezuelaNFT_13.ReceiptStoragePath) != nil {
                panic("Storage collision at path=".concat(VenezuelaNFT_13.ReceiptStoragePath.toString()).concat(" a Receipt is already stored!"))
              }
  
              // Save that receipt to my storage
              signer.storage.save(<-receipt, to: VenezuelaNFT_13.ReceiptStoragePath)
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg(0, t.UInt32) // Usando setID 0
        ],
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error buying pack:', error);
      throw new Error('Failed to buy pack');
    }
  }
  
  async revealPack(userAddress: string, privateKey: string): Promise<string> {
    try {
      const authorization = await this.getAuthorization({
        address: userAddress,
        privateKey: privateKey
      });
  
      const transactionId = await fcl.mutate({
        cadence: `
          import VenezuelaNFT_13 from ${flowConfig.venezuelaNFTAddress}
          import NonFungibleToken from ${flowConfig.nonFungibleToken}
          import MetadataViews from ${flowConfig.metadataViews}
  
          transaction {
            prepare(signer: auth(BorrowValue, LoadValue) &Account) {
              let receiverRef = signer.capabilities.borrow<&{VenezuelaNFT_13.VenezuelaNFT_13CollectionPublic}>(VenezuelaNFT_13.CollectionPublicPath)
                  ?? panic("Cannot borrow a reference to the recipient's moment collection")
              
              // Load receipt from storage
              let receipt <- signer.storage.load<@VenezuelaNFT_13.Receipt>(from: VenezuelaNFT_13.ReceiptStoragePath)
                  ?? panic("No Receipt found in storage")
  
              // Reveal by redeeming receipt
              VenezuelaNFT_13.revealPack(
                receipt: <-receipt, 
                minter: signer.address,
                emptyDict: {}
              )
            }
          }
        `,
        payer: authorization,
        proposer: authorization,
        authorizations: [authorization],
        limit: 999
      });
  
      return transactionId;
    } catch (error) {
      console.error('Error revealing pack:', error);
      throw new Error('Failed to reveal pack');
    }
  }

  async getNFTMetadata(cardID: number): Promise<any> {
    try {
      console.log("Obteniendo tipo para Card ID:", cardID);
      
      // Primero obtenemos el tipo específico de esta carta
      const cardType = await fcl.query({
        cadence: `
          import VenezuelaNFT_13 from ${flowConfig.venezuelaNFTAddress}
          
          access(all) fun main(cardID: UInt32): Type {
            return VenezuelaNFT_13.getCardType(cardID: cardID)
          }
        `,
        args: (arg: any, t: any) => [
          arg(cardID, t.UInt32)
        ]
      });
  
      console.log("Tipo de carta:", cardType);
  
      // Según el tipo, obtenemos la metadata específica
      const metadata = await fcl.query({
        cadence: `
          import VenezuelaNFT_13 from ${flowConfig.venezuelaNFTAddress}
          
          access(all) fun main(cardID: UInt32): AnyStruct {
            return VenezuelaNFT_13.getCardMetadata(cardID: cardID, cardType: VenezuelaNFT_13.getCardType(cardID: cardID))
          }
        `,
        args: (arg: any, t: any) => [
          arg(cardID, t.UInt32)
        ]
      });
  
      return {
        cardType: cardType.typeID,
        metadata: metadata
      };
  
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw new Error('Failed to get NFT metadata');
    }
  }
}