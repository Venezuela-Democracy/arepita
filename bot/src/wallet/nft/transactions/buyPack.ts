import { flowConfig } from '../../config';

export const buyPack = (contractName: string): string => {
    return `
        import ${contractName} from ${flowConfig.venezuelaNFTAddress}
        import NonFungibleToken from ${flowConfig.nonFungibleToken}
        import MetadataViews from ${flowConfig.metadataViews}
        import FlowToken from ${flowConfig.flowToken}
        import FungibleToken from ${flowConfig.fungibleToken}

        transaction(setID: UInt32, amount: Int) {
          prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
            if signer.storage.type(at: ${contractName}.ReceiptStoragePath) == nil {
              let storage <- ${contractName}.createEmptyStorage()
              signer.storage.save(<- storage, to: ${contractName}.ReceiptStoragePath)
              let storageCap = signer.capabilities.storage.issue<&${contractName}.ReceiptStorage>(${contractName}.ReceiptStoragePath)
              signer.capabilities.publish(storageCap, at: ${contractName}.ReceiptStoragePublic)
            }

            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow Flow Token Vault reference")

            let storageRef = signer.storage.borrow<&${contractName}.ReceiptStorage>(from: ${contractName}.ReceiptStoragePath)
              ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")
            
            var counter = 0
            while counter < amount {
              let receipt <- ${contractName}.buyPackFlow(setID: setID, payment: <- vaultRef.withdraw(amount: 1.0))
              storageRef.deposit(receipt: <- receipt)
              counter = counter + 1
            }
          }
        }
      `
}