import { flowConfig } from '../../config';

export const getTopics = (governanceContract: string): string => {
    return `
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}

        access(all) fun main(regionName: String): {UInt64: ${governanceContract}.Topic} {
            let regionPath = StoragePath(identifier: ${governanceContract}.regionIdentifier.concat(regionName))!
            
            return ${governanceContract}.getTopics(regionPath: regionPath)
        }
      `
}