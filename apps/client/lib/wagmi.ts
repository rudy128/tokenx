import { createConfig, http, type Config } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config: Config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    metaMask(),
    // Temporarily disabled walletConnect due to EventEmitter2 compatibility issues
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    // }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // ✅ Enable SSR support for Next.js
})

// ✅ TypeScript module declaration for better type safety
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
