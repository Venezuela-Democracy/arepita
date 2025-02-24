import { flowConfig } from '../../config';

export const getNFTMetadata = (contractName: string): string => {
    return `
              import ${contractName} from ${flowConfig.venezuelaNFTAddress}
              
              access(all) fun main(cardID: UInt32): Type {
                return ${contractName}.getCardType(cardID: cardID)
              }
    `
}