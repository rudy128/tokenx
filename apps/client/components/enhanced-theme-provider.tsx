"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

interface EnhancedThemeContextType {
  theme?: string
  setTheme: (theme: string) => void
  systemTheme?: string
  resolvedTheme?: string
  themes: string[]
  forcedTheme?: string
  isLoading: boolean
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined)

export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext)
  if (context === undefined) {
    throw new Error("useEnhancedTheme must be used within an EnhancedThemeProvider")
  }
  return context
}

function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const nextTheme = useNextTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const enhancedSetTheme = (theme: string) => {
    // Add theme switching class temporarily for performance
    document.documentElement.classList.add('theme-switching')
    
    nextTheme.setTheme(theme)
    
    // Remove the class after transition
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching')
    }, 200)
  }

  const value: EnhancedThemeContextType = {
    ...nextTheme,
    setTheme: enhancedSetTheme,
    isLoading,
  }

  return (
    <EnhancedThemeContext.Provider value={value}>
      {children}
    </EnhancedThemeContext.Provider>
  )
}

interface TokenXThemeProviderProps {
  children: React.ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: string
  enableSystem?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  themes?: string[]
}

export function TokenXThemeProvider({ 
  children,
  attribute = "data-theme",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = false,
  storageKey = "tokenx-theme",
  themes = ['light', 'dark', 'system'],
  ...props 
}: TokenXThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      enableColorScheme={enableColorScheme}
      storageKey={storageKey}
      themes={themes}
      {...props}
    >
      <EnhancedThemeProvider>
        {children}
      </EnhancedThemeProvider>
    </NextThemesProvider>
  )
}

// Export useTheme for backward compatibility
export { useNextTheme as useTheme }