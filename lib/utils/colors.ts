import { toRGB } from "./helper";

// Template Blue Theme Colors
const colors = {
  primary: "#1e3a8a",      // blue[900] - Template primary
  secondary: "#e2e8f0",   // slate[200] - Template secondary
  success: "#84cc16",     // lime[500] - Template success
  info: "#06b6d4",        // cyan[500] - Template info
  warning: "#facc15",     // yellow[400] - Template warning
  pending: "#f97316",     // orange[500] - Template pending
  danger: "#dc2626",     // red[600] - Template danger
  light: "#f1f5f9",       // slate[100]
  dark: "#1e293b",       // slate[800]
  white: "#ffffff",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  darkmode: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
};

/** Get a color value with optional opacity */
const getColor = (colorKey: string, opacity: number = 1): string => {
  // Parse the color key (e.g., "slate.500" or "primary")
  const keys = colorKey.split(".");
  let color: any = colors;
  
  for (const key of keys) {
    if (color && typeof color === "object" && key in color) {
      color = color[key];
    } else {
      // If color not found, return a fallback
      console.warn(`Color not found: ${colorKey}`);
      return `rgb(0 0 0 / ${opacity})`;
    }
  }
  
  // If we have a hex color, convert it to RGB
  if (typeof color === "string" && color.startsWith("#")) {
    return `rgb(${toRGB(color)} / ${opacity})`;
  }
  
  // If it's already in a different format or not found
  return `rgb(0 0 0 / ${opacity})`;
};

/** Chart.js on home + risk: slightly softer than full-opacity fills, but still solid (not “washed out”) */
export const CHART = {
  barFill: 0.74,
  barBorder: 0.92,
  pieSlice: 0.8,
  pieSliceHover: 0.9,
  bubbleFill: 0.58,
  bubbleBorder: 0.88,
  scaleDot: 0.78,
} as const

const DEFAULT_PIE_COLOR_KEYS = [
  "primary",
  "pending",
  "warning",
  "success",
  "danger",
  "info",
] as const

export function chartBarDataset(colorKey: string = "primary") {
  return {
    backgroundColor: getColor(colorKey, CHART.barFill),
    borderColor: getColor(colorKey, CHART.barBorder),
    borderWidth: 1 as const,
  }
}

export function chartPieBackgroundColors(propColorKeys?: string[]) {
  const keys =
    propColorKeys && propColorKeys.length > 0 ? propColorKeys : [...DEFAULT_PIE_COLOR_KEYS]
  return keys.map((k) => getColor(k, CHART.pieSlice))
}

export function chartPieHoverBackgroundColors(propColorKeys?: string[]) {
  const keys =
    propColorKeys && propColorKeys.length > 0 ? propColorKeys : [...DEFAULT_PIE_COLOR_KEYS]
  return keys.map((k) => getColor(k, CHART.pieSliceHover))
}

/** Sector × ministry heatmaps: between original intense blue and very pale */
export function chartHeatmapCellColor(value: number, maxValue: number): string {
  if (value <= 0) return "transparent"
  const safeMax = maxValue > 0 ? maxValue : 1
  const t = Math.min(value, safeMax) / safeMax
  const r = Math.round(222 + (42 - 222) * t)
  const g = Math.round(234 + (72 - 234) * t)
  const b = Math.round(254 + (165 - 254) * t)
  return `rgb(${r},${g},${b})`
}

export { getColor };