import { flowConfig } from '../../config';

export const revealPack = (contractName: string): string => {
    return `
        import ${contractName} from ${flowConfig.venezuelaNFTAddress}
        import NonFungibleToken from ${flowConfig.nonFungibleToken}
        import MetadataViews from ${flowConfig.metadataViews}

        transaction {
          prepare(signer: auth(BorrowValue, LoadValue) &Account) {
            let storageRef = signer.storage.borrow<&${contractName}.ReceiptStorage>(from: ${contractName}.ReceiptStoragePath)
                ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")
            
            let receipt <- storageRef.withdraw()

            ${contractName}.revealPack(
              receipt: <-receipt, 
              minter: signer.address,
              emptyDict: {}
            )
          }
        }
      `
}