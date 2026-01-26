/**
 * Theme Utility Functions
 * 
 * Helper functions to get theme colors for use in components
 */

import { getThemeColors } from './themeConfig'

/**
 * Get the primary color (main brand color)
 */
export const getPrimaryColor = (variant: 'lighter' | 'light' | 'DEFAULT' | 'dark' | 'darker' = 'DEFAULT'): string => {
  const colors = getThemeColors()
  return colors.primary[variant === 'DEFAULT' ? 'DEFAULT' : variant]
}

/**
 * Get the secondary color
 */
export const getSecondaryColor = (variant: 'lighter' | 'light' | 'DEFAULT' | 'dark' | 'darker' = 'DEFAULT'): string => {
  const colors = getThemeColors()
  return colors.secondary[variant === 'DEFAULT' ? 'DEFAULT' : variant]
}

/**
 * Get the accent color
 */
export const getAccentColor = (variant: 'lighter' | 'light' | 'DEFAULT' | 'dark' | 'darker' = 'DEFAULT'): string => {
  const colors = getThemeColors()
  return colors.accent[variant === 'DEFAULT' ? 'DEFAULT' : variant]
}

/**
 * Get semantic colors
 */
export const getSemanticColors = () => {
  const colors = getThemeColors()
  return {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  }
}

/**
 * Get chart colors array (for pie charts, bar charts, etc.)
 */
export const getChartColorArray = (): string[] => {
  const theme = getThemeColors()
  return [
    theme.primary.DEFAULT,
    theme.primary.darker,
    theme.primary.light,
    theme.primary.lighter,
    theme.secondary.DEFAULT,
    theme.secondary.dark,
    theme.accent.DEFAULT,
    theme.accent.dark,
  ]
}

/**
 * Get all theme colors
 */
export const getAllThemeColors = () => {
  return getThemeColors()
}

