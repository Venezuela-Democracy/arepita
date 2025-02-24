import { flowConfig } from '../../config';

export const getNFTCollection = (contractName: string): string => {
    return `
          import ${contractName} from ${flowConfig.venezuelaNFTAddress}
          import MetadataViews from ${flowConfig.metadataViews}

          access(all) fun main(account: Address): [AnyStruct]? {
            let account = getAccount(account)
            let answer: [AnyStruct] = []
            var nft: AnyStruct = nil

            let cap = account.capabilities
              .borrow<&${contractName}.Collection>(${contractName}.CollectionPublicPath)!

            let ids = cap.getIDs()

            for id in ids {
              let nftRef = cap.borrowVenezuelaNFT_20(id: id)!
              let resolver = cap.borrowViewResolver(id: id)!
              let displayView = MetadataViews.getDisplay(resolver)!
              let serialView = MetadataViews.getSerial(resolver)!
              let traits = MetadataViews.getTraits(resolver)!
              let nftType = ${contractName}.getNFTType(cardID: id)
              let locationMetadata = ${contractName}.getLocationMetaData(cardID: UInt32(id))

              nft = {
                "cardMetadataID": nftRef.cardID,
                "display": displayView,
                "nftID": nftRef.id,
                "serial": serialView,
                "traits": traits,
                "type": nftType,
                "locationMetadata": locationMetadata
              }
              
              answer.append(nft)
            }
            return answer
          }
    `
}