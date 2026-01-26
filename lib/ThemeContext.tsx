'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeColors, getThemeColors, ACTIVE_THEME } from './themeConfig'

interface ThemeContextType {
  colors: ThemeColors
  themeName: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(getThemeColors())
  const [themeName, setThemeName] = useState<string>(ACTIVE_THEME)

  useEffect(() => {
    // Update colors when theme changes
    const currentColors = getThemeColors()
    setColors(currentColors)
    setThemeName(ACTIVE_THEME)
    
    // Apply CSS variables for dynamic styling (matching template system)
    const root = document.documentElement
    
    // Primary colors
    root.style.setProperty('--theme-primary-lighter', currentColors.primary.lighter)
    root.style.setProperty('--theme-primary-light', currentColors.primary.light)
    root.style.setProperty('--theme-primary', currentColors.primary.DEFAULT)
    root.style.setProperty('--theme-primary-dark', currentColors.primary.dark)
    root.style.setProperty('--theme-primary-darker', currentColors.primary.darker)
    
    // Secondary colors
    root.style.setProperty('--theme-secondary-lighter', currentColors.secondary.lighter)
    root.style.setProperty('--theme-secondary-light', currentColors.secondary.light)
    root.style.setProperty('--theme-secondary', currentColors.secondary.DEFAULT)
    root.style.setProperty('--theme-secondary-dark', currentColors.secondary.dark)
    root.style.setProperty('--theme-secondary-darker', currentColors.secondary.darker)
    
    // Accent colors
    root.style.setProperty('--theme-accent-lighter', currentColors.accent.lighter)
    root.style.setProperty('--theme-accent-light', currentColors.accent.light)
    root.style.setProperty('--theme-accent', currentColors.accent.DEFAULT)
    root.style.setProperty('--theme-accent-dark', currentColors.accent.dark)
    root.style.setProperty('--theme-accent-darker', currentColors.accent.darker)
    
    // Status colors
    root.style.setProperty('--theme-success', currentColors.success)
    root.style.setProperty('--theme-warning', currentColors.warning)
    root.style.setProperty('--theme-error', currentColors.error)
    root.style.setProperty('--theme-info', currentColors.info)
    
    // Neutral colors
    root.style.setProperty('--theme-neutral-dark', currentColors.neutral.dark)
    root.style.setProperty('--theme-neutral', currentColors.neutral.DEFAULT)
    root.style.setProperty('--theme-neutral-light', currentColors.neutral.light)
    root.style.setProperty('--theme-neutral-border', currentColors.neutral.border)
    root.style.setProperty('--theme-neutral-input', currentColors.neutral.input)
    
    // Legacy support - map to chula-pink for backward compatibility
    root.style.setProperty('--chula-pink-lighter', currentColors.primary.lighter)
    root.style.setProperty('--chula-pink-light', currentColors.primary.light)
    root.style.setProperty('--chula-pink', currentColors.primary.DEFAULT)
    root.style.setProperty('--chula-pink-dark', currentColors.primary.dark)
    root.style.setProperty('--chula-pink-darker', currentColors.primary.darker)
    
    root.style.setProperty('--chula-gray-dark', currentColors.neutral.dark)
    root.style.setProperty('--chula-gray', currentColors.neutral.DEFAULT)
    root.style.setProperty('--chula-gray-light', currentColors.neutral.light)
    root.style.setProperty('--chula-gray-border', currentColors.neutral.border)
    root.style.setProperty('--chula-gray-input', currentColors.neutral.input)
  }, [])

  return (
    <ThemeContext.Provider value={{ colors, themeName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}