"use client"

import { ThemeProvider } from "next-themes"
import { SessionProvider } from "next-auth/react"

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="tokenx-admin-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
