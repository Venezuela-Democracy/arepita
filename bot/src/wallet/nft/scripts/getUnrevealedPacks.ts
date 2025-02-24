import { flowConfig } from '../../config';

export const getUnrevealedPacks = (contractName: string): string => {
    return `
        import ${contractName} from ${flowConfig.venezuelaNFTAddress}

        access(all) fun main(account: Address): Int {
          let account = getAccount(account)
          let cap = account.capabilities
            .borrow<&${contractName}.ReceiptStorage>(${contractName}.ReceiptStoragePublic)!
          return cap.getBalance()
        }
    `
}