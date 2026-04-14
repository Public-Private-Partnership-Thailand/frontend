import { useQuery } from '@tanstack/react-query'
import { appConfig } from '@/app/configs/appConfig'

export interface RiskCategory {
  /** Numeric ID from /api/v1/info (e.g. 1, 2, 3, ...) */
  id: number
  code: string
  /** Display name from API (field is "value" in JSON). Use this for UI labels. */
  value: string
  /** Short label from API (e.g. CON, LAN). Shown as "CON: Construction" in risk UI. */
  short_code?: string
  description_en: string
  description_th: string
  /** @deprecated Prefer value. Kept for backward compat. */
  name?: string
}

export interface RiskFactor {
  /** Numeric ID from /api/v1/info (e.g. 1, 2, 3, ...) */
  id: number
  /** Display name from API (field is "value" in JSON). Use this for UI labels. */
  value: string
  description_th: string
  /** @deprecated Prefer value. Kept for backward compat. */
  name?: string
}

/** e.g. "CON: Construction" when API sends short_code; otherwise the display name only. */
export function formatRiskCategoryLabel(
  c: Pick<RiskCategory, 'value' | 'name'> & { short_code?: string }
): string {
  const name = c.value ?? c.name ?? ''
  const sc = c.short_code?.trim()
  if (sc) return `${sc}: ${name}`
  return name
}

/** e.g. "F001: Access to the site…" from numeric id + value */
export function formatRiskFactorLabel(
  f: Pick<RiskFactor, 'id' | 'value' | 'name'>
): string {
  const name = f.value ?? f.name ?? ''
  const code = `F${String(f.id).padStart(3, '0')}`
  return `${code}: ${name}`
}

export interface RiskSourceEntry {
  id: number
  value: string
  reference?: string | null
  referenceFile?: string | null
  referenceFileUrl?: string | null
  referenceUrl?: string | null
}

export interface InfoData {
  sector: Array<{ id: number; value: string }>
  ministry: Array<{ id: number; value: string }>
  contractType: Array<{ id: number; value: string }>
  projectType: Array<{ id: number; value: string }>
  concessionForm: Array<{ id: number; value: string }>
  riskCategory: RiskCategory[]
  riskFactor: RiskFactor[]
  /** Maps source IDs in heatmapRiskPhase to display labels */
  riskSource?: {
    global: RiskSourceEntry[]
    thailand: RiskSourceEntry[]
  }
}

export const useInfo = () => {
  return useQuery<InfoData>({
    queryKey: ['get', 'info'],
    queryFn: async () => {
      const response = await fetch(`${appConfig.apiUrl}/api/v1/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as InfoData
      // API uses "value" for display text; normalize so .name is always set for UI
      if (data.riskCategory?.length) {
        data.riskCategory = data.riskCategory.map((c) => ({
          ...c,
          name: (c as any).name ?? (c as any).value ?? '',
        }))
      }
      if (data.riskFactor?.length) {
        data.riskFactor = data.riskFactor.map((f) => ({
          ...f,
          name: (f as any).name ?? (f as any).value ?? '',
        }))
      }
      return data
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
