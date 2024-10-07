import { dasApi } from "@metaplex-foundation/digital-asset-standard-api"
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import {
  createNoopSigner,
  createNullSigner,
  publicKey,
  Signer,
  signerIdentity,
  Umi,
} from "@metaplex-foundation/umi"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromWalletAdapter } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { WalletAdapter } from "@solana/wallet-adapter-base"
import { create } from "zustand"

interface UmiState {
  umi: ReturnType<typeof createUmi>
  signer: Signer | undefined
  updateSigner: (signer: WalletAdapter) => void
}

const useUmiStore = create<UmiState>()((set) => {
  return {
    umi: createUmi("https://api.mainnet-beta.solana.com")
      .use(
        signerIdentity(
          createNoopSigner(publicKey("11111111111111111111111111111111"))
        )
      )
      .use(mplTokenMetadata())
      .use(dasApi()),
    signer: undefined,
    updateSigner: (signer) => {
      set(() => ({ signer: createSignerFromWalletAdapter(signer) }))
    },
  }
})

export default useUmiStore
