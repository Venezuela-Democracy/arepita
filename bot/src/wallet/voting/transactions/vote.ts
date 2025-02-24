import { flowConfig } from '../../config';

export const vote = (governanceContract: string, venezuelaNFTContract: string, IPContractName: string): string => {
    return `
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}
        import ${IPContractName} from ${flowConfig.venezuelaNFTAddress}
        import ViewResolver from ${flowConfig.viewResolver}
        import FungibleToken from ${flowConfig.fungibleToken}
        import FungibleTokenMetadataViews from ${flowConfig.fungibleTokenMetadataViews}
        
        // This transaction is a transaction to allow
        // anyone to add a Vault resource to their account so that
        // they can use the InfluencePoint and Vote


        transaction (regionName: String, topicID: UInt64, option: String) {
            let signerAddress: Address
            let regionPath: StoragePath
            let arsenalRef: &${governanceContract}.Vzla_Arsenal

            prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {

                let vaultData = ${IPContractName}.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
                    ?? panic("Could not resolve FTVaultData view. The ${IPContractName}"
                        .concat(" contract needs to implement the FTVaultData Metadata view in order to execute this transaction."))

                // Create a IP vault if it doesn't already stores a ${IPContractName} Vault
                if signer.storage.borrow<&${IPContractName}.Vault>(from: vaultData.storagePath) == nil {
                    // Create a new ${IPContractName} Vault and put it in storage
                    let vault <- ${IPContractName}.createEmptyVault(vaultType: Type<@${IPContractName}.Vault>())
                    signer.storage.save(<-vault, to: vaultData.storagePath)
                    // Create a public capability to the Vault that exposes the Vault interfaces
                    let vaultCap = signer.capabilities.storage.issue<&${IPContractName}.Vault>(
                        vaultData.storagePath
                    )
                    signer.capabilities.publish(vaultCap, at: vaultData.metadataPath)

                    // Create a public Capability to the Vault's Receiver functionality
                    let receiverCap = signer.capabilities.storage.issue<&${IPContractName}.Vault>(
                        vaultData.storagePath
                    )
                    signer.capabilities.publish(receiverCap, at: vaultData.receiverPath)
                }
                self.arsenalRef = signer.storage.borrow<&${governanceContract}.Vzla_Arsenal>(from: ${governanceContract}.ArsenalPath)!
                    

                self.regionPath = StoragePath(identifier: ${governanceContract}.regionIdentifier.concat(regionName))!
                self.signerAddress = signer.address
        
                // submit the vote
                self.arsenalRef.vote(regionPath: self.regionPath, topicID: topicID, option: option)
            }
        }
      `
}