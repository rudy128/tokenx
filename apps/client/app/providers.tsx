"use client"

import type React from "react"
import { WagmiProvider, cookieToInitialState } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// @ts-ignore - @rainbow-me/rainbowkit is installed but VS Code hasn't refreshed module resolution
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { SessionProvider } from "next-auth/react"
import { config } from "@/lib/wagmi"
import { TokenXThemeProvider } from "@/components/enhanced-theme-provider"

// ✅ Create QueryClient outside component to prevent re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
  cookie?: string | null
  session?: any
}

export function Providers({ children, cookie, session }: ProvidersProps) {
  // ✅ Initialize wagmi state from cookie for persistence
  const initialState = cookieToInitialState(config, cookie)

  return (
    <SessionProvider session={session}>
      <WagmiProvider config={config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#0E76FD",
              accentColorForeground: "white",
              borderRadius: "large",
              fontStack: "system",
            })}
            showRecentTransactions={true}
          >
            <TokenXThemeProvider
              attribute="data-theme"
              defaultTheme="system"
              enableSystem
              enableColorScheme={false}
              storageKey="tokenx-theme"
              themes={['light', 'dark', 'system']}
            >
              {children}
            </TokenXThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  )
}