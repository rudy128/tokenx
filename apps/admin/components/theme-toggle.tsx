"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button 
        className="btn btn-secondary"
        style={{ 
          width: '2.5rem', 
          height: '2.5rem', 
          padding: '0',
          minWidth: 'unset',
          opacity: 0.5
        }}
        disabled
      >
        <Sun style={{ height: '1.2rem', width: '1.2rem' }} />
      </button>
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme
  
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor style={{ height: '1.2rem', width: '1.2rem' }} />
    }
    
    if (currentTheme === 'dark') {
      return <Moon style={{ height: '1.2rem', width: '1.2rem' }} />
    }
    
    return <Sun style={{ height: '1.2rem', width: '1.2rem' }} />
  }

  const getLabel = () => {
    if (theme === 'system') return 'System theme (click for light)'
    if (currentTheme === 'dark') return 'Dark theme (click for system)'
    return 'Light theme (click for dark)'
  }

  return (
    <button
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem', 
        height: '2.5rem', 
        padding: '0',
        minWidth: 'unset',
        backgroundColor: 'var(--interactive-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: '0.5rem',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--interactive-secondary-hover)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--interactive-secondary)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {getIcon()}
    </button>
  )
}
