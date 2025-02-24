import { flowConfig } from '../../config';

export const getRegions = (governanceContract: string): string => {
    return `
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}

        access(all) fun main(): {String: UInt64} {
            return ${governanceContract}.getRegions()
        }
      `
}