/**
 * Official risk category colors by numeric API id (1–20), risk dashboard / heatmap UI.
 * @see product spec: Risk ID → hex
 */
export const RISK_CATEGORY_HEX_BY_ID: Record<number, string> = {
  1: '#5B8DB8', // Land availability, access & site — Blue
  2: '#F5A800', // Social — Golden Yellow
  3: '#5CB85C', // Environmental — Mid Green
  4: '#4FBFB8', // Design — Teal
  5: '#E05C00', // Construction — Burnt Orange
  6: '#00C4D4', // Variations — Cyan
  7: '#1A5FA0', // Operating Risk — Deep Blue
  8: '#FF4500', // Demand — Red-Orange
  9: '#D4A800', // Financial markets — Amber
  10: '#A0529A', // Strategic/partnering risk — Mauve
  11: '#E0409C', // Disruptive technology — Magenta
  12: '#6E6E6E', // Force majeure — Gray
  13: '#B01010', // Political — Crimson
  14: '#4A90A4', // Law — Slate Teal
  15: '#A8A800', // Early termination — Olive
  16: '#2E7D32', // Condition at handback — Forest Green
  17: '#FF7A88', // Project selected — Pink
  18: '#7B4EB8', // Relationship — Violet
  19: '#9A9490', // Project finance — Warm Gray
  20: '#5C2D0E', // Procurement risks — Espresso
}

export function hexColorForRiskCategoryId(id: number): string | undefined {
  return RISK_CATEGORY_HEX_BY_ID[id]
}
