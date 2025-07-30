import React, { createContext, useContext, useEffect, useState } from 'react'

export interface Theme {
  id: string
  name: string
  colors: {
    background: string
    card: string
    border: string
    text: string
    textSecondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
}

export const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#0d1117',
      card: '#161b22',
      border: '#30363d',
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#ffffff',
      card: '#f8fafc',
      border: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#64748b',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  {
    id: 'auto',
    name: 'Auto',
    colors: {
      background: '#0d1117', // Will be overridden by system preference
      card: '#161b22',
      border: '#30363d',
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  }
]

interface ThemeContextType {
  currentTheme: Theme
  themeId: string
  setTheme: (themeId: string) => void
  isSystemDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('dashboard-theme')
    return saved || 'dark'
  })
  
  const [isSystemDark, setIsSystemDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Get the actual theme to use
  const getCurrentTheme = (): Theme => {
    if (themeId === 'auto') {
      return isSystemDark ? themes[0] : themes[1] // dark : light
    }
    return themes.find(theme => theme.id === themeId) || themes[0]
  }

  const currentTheme = getCurrentTheme()

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    const theme = currentTheme
    
    root.style.setProperty('--color-background', theme.colors.background)
    root.style.setProperty('--color-card', theme.colors.card)
    root.style.setProperty('--color-border', theme.colors.border)
    root.style.setProperty('--color-text', theme.colors.text)
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--color-accent', theme.colors.accent)
    root.style.setProperty('--color-success', theme.colors.success)
    root.style.setProperty('--color-warning', theme.colors.warning)
    root.style.setProperty('--color-error', theme.colors.error)
    
    // Update body background
    document.body.style.backgroundColor = theme.colors.background
    document.body.style.color = theme.colors.text
  }, [currentTheme])

  const setTheme = (newThemeId: string) => {
    setThemeId(newThemeId)
    localStorage.setItem('dashboard-theme', newThemeId)
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeId,
      setTheme,
      isSystemDark
    }}>
      {children}
    </ThemeContext.Provider>
  )
}