/**
 * Theme Configuration - Template Blue Theme
 * 
 * This theme matches the template's blue color scheme.
 * Primary color is blue[900] (#1e3a8a)
 */

export interface ThemeColors {
  primary: {
    lighter: string
    light: string
    DEFAULT: string
    dark: string
    darker: string
  }
  secondary: {
    lighter: string
    light: string
    DEFAULT: string
    dark: string
    darker: string
  }
  accent: {
    lighter: string
    light: string
    DEFAULT: string
    dark: string
    darker: string
  }
  success: string
  warning: string
  error: string
  info: string
  neutral: {
    dark: string
    DEFAULT: string
    light: string
    border: string
    input: string
  }
}

// Template Blue Theme - matches template/src/pages/DashboardOverview1
const templateBlueTheme: ThemeColors = {
  primary: {
    lighter: '#dbeafe', // blue[100]
    light: '#93c5fd',   // blue[300]
    DEFAULT: '#1e3a8a', // blue[900] - Template primary
    dark: '#1e40af',     // blue[800]
    darker: '#1e3a8a',   // blue[900]
  },
  secondary: {
    lighter: '#f1f5f9', // slate[100]
    light: '#e2e8f0',   // slate[200] - Template secondary
    DEFAULT: '#e2e8f0', // slate[200]
    dark: '#cbd5e1',     // slate[300]
    darker: '#94a3b8',   // slate[400]
  },
  accent: {
    lighter: '#fef3c7',  // yellow[100]
    light: '#fde68a',    // yellow[200]
    DEFAULT: '#facc15',  // yellow[400] - Template warning
    dark: '#eab308',     // yellow[500]
    darker: '#ca8a04',   // yellow[600]
  },
  success: '#84cc16',    // lime[500] - Template success
  warning: '#facc15',    // yellow[400] - Template warning
  error: '#dc2626',      // red[600] - Template danger
  info: '#06b6d4',       // cyan[500] - Template info
  neutral: {
    dark: '#1e293b',     // slate[800]
    DEFAULT: '#64748b',  // slate[500]
    light: '#94a3b8',    // slate[400]
    border: '#e2e8f0',   // slate[200]
    input: '#f1f5f9',    // slate[100]
  },
}

// Export theme
export const themes = {
  templateBlue: templateBlueTheme,
}

// Active theme - Template Blue
export const ACTIVE_THEME = 'templateBlue'

// Get the active theme colors
export const getThemeColors = (): ThemeColors => {
  return themes[ACTIVE_THEME as keyof typeof themes]
}

// Get a specific color from the active theme
export const getThemeColor = (path: string): string => {
  const themeColors = getThemeColors()
  const keys = path.split('.')
  let value: any = themeColors
  
  for (const key of keys) {
    if (key === 'DEFAULT') {
      value = value.DEFAULT || value
    } else {
      value = value[key]
    }
    if (value === undefined) {
      console.warn(`Theme color path "${path}" not found`)
      return '#000000' // fallback
    }
  }
  
  return typeof value === 'string' ? value : value.DEFAULT || '#000000'
}

// Helper to get chart colors array (for pie charts, etc.)
export const getChartColors = (): string[] => {
  const theme = getThemeColors()
  return [
    theme.primary.DEFAULT,
    theme.primary.dark,
    theme.primary.light,
    theme.primary.lighter,
    theme.secondary.DEFAULT,
    theme.secondary.dark,
    theme.accent.DEFAULT,
    theme.accent.dark,
  ]
}