import { flowConfig } from '../../config';

export const resetDaily = (governanceContract: string): string => {

    return `
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}

        access(all)
        fun main(regionName: String): UFix64 {
            let regionPath = StoragePath(identifier: ${governanceContract}.regionIdentifier.concat(regionName))!

            return ${governanceContract}.getRegionDP(regionPath: regionPath)
        }
    `
}