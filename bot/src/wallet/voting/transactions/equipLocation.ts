import { flowConfig } from '../../config';

export const equipLocation = (governanceContract: string, venezuelaNFTContract: string): string => {
    return `
        import ${venezuelaNFTContract} from ${flowConfig.venezuelaNFTAddress}
        import ${governanceContract} from ${flowConfig.venezuelaNFTAddress}
        import NonFungibleToken from ${flowConfig.nonFungibleToken}

        transaction(nftID: UInt64) {
            let withdrawRef: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}
            let arsenalRef: &Governance.Vzla_Arsenal
            let cap: &${venezuelaNFTContract}.Collection

            prepare(signer: auth(BorrowValue, SaveValue) &Account) {

                self.withdrawRef = signer.storage.borrow< auth(NonFungibleToken.Withdraw) &${venezuelaNFTContract}.Collection>(from: ${venezuelaNFTContract}.CollectionStoragePath)!
                
                self.arsenalRef = signer.storage.borrow<&${governanceContract}.Vzla_Arsenal>(from: ${governanceContract}.ArsenalPath)!
                self.cap = signer.capabilities.borrow<&${venezuelaNFTContract}.Collection>(${venezuelaNFTContract}.CollectionPublicPath)!

            }

            execute {
                
                // Withdraw the NFT from ${venezuelaNFTContract} collection
                let nftRef = self.cap.borrow${venezuelaNFTContract}(id: nftID)!
                let locationData = nftRef.get_LocationCard()
                let region = locationData.region
                let nft <- self.withdrawRef.withdraw(withdrawID: nftID) as! @${venezuelaNFTContract}.NFT
                // Deposit into Governance Cultural Arsenal
                self.arsenalRef.depositLocationCard(card: <- nft, region: region)

            }

        }
      `
}