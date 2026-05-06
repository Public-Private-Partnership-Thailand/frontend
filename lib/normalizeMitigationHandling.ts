/**
 * Form + display use `mitigation_handling: string[]` (one item per line, like impact).
 * Older API payloads may still return `{ action, status }[]` — map actions to lines.
 */
export function normalizeMitigationHandling(raw: unknown): string[] {
  if (raw == null) return []
  if (!Array.isArray(raw)) return []
  if (raw.length === 0) return []
  const first = raw[0]
  if (typeof first === 'string') {
    return raw.map((s) => String(s).trim()).filter(Boolean)
  }
  return raw
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (item && typeof item === 'object' && 'action' in item) {
        return String((item as { action?: string }).action ?? '').trim()
      }
      return ''
    })
    .filter(Boolean)
}
