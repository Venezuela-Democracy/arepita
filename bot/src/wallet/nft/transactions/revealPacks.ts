import { flowConfig } from '../../config';

export const revealPacks = (contractName: string): string => {
    return `
        import ${contractName} from ${flowConfig.venezuelaNFTAddress}

        transaction(amount: Int) {
          prepare(signer: auth(BorrowValue, LoadValue) &Account) {
            let storageRef = signer.storage
              .borrow<&${contractName}.ReceiptStorage>(from: ${contractName}.ReceiptStoragePath)
              ?? panic("Cannot borrow a reference to the recipient's VenezuelaNFT ReceiptStorage")

            var counter = 0
            while counter < amount {
              let receipt <- storageRef.withdraw()
              ${contractName}.revealPack(
                receipt: <- receipt, 
                minter: signer.address, 
                emptyDict: {}
              )
              counter = counter + 1
            }
          }
        }
      `
}