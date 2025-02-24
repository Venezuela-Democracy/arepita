import { flowConfig } from '../../config';

export const getVotes = (governanceContract: string): string => {
    return `
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}

        access(all) 
        fun main(regionName: String, topicID: UInt64): {String: Int} {
            let regionPath = StoragePath(identifier: ${governanceContract}.regionIdentifier.concat(regionName))!

            return ${governanceContract}.getVotes(regionPath: regionPath, topicID: topicID)
        }
      `
}