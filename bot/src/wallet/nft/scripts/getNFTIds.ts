import { flowConfig } from '../../config';

export const getNFTIds = (contractName: string): string => {
    return `
          import ${contractName} from ${flowConfig.venezuelaNFTAddress}

          access(all) fun main(account: Address): [UInt64] {
            let account = getAccount(account)
            
            let cap = account.capabilities
              .borrow<&${contractName}.Collection>(${contractName}.CollectionPublicPath)
              ?? panic("Could not borrow collection capability")

            return cap.getIDs()
          }
    `
}