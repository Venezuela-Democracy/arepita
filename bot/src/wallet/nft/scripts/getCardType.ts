import { flowConfig } from '../../config';

export const getNFTCardType = (contractName: string): string => {
    return `
          import ${contractName} from ${flowConfig.venezuelaNFTAddress}
          
          access(all) fun main(cardID: UInt32): AnyStruct {
            return ${contractName}.getCardMetadata(cardID: cardID, cardType: ${contractName}.getCardType(cardID: cardID))
          }
    `
}