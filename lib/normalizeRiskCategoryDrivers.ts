import type { RiskCategoryDriver } from '@/types/project'
import type { RiskCategory } from '@/app/hooks/useInfo'

/**
 * Project API may send `risk_category_id` as a string code (e.g. "LAW") matching `risk_category_code`,
 * while the edit form dropdown binds to numeric ids from `/api/v1/info`.
 */
export function resolveRiskCategoryNumericId(
  driver: Partial<RiskCategoryDriver> & { risk_category_id?: unknown },
  riskCategories: RiskCategory[],
): number {
  const rawId = driver?.risk_category_id as unknown

  if (!riskCategories.length) {
    return typeof rawId === 'number' && Number.isFinite(rawId) ? rawId : 0
  }

  const idAsNonDigitCode =
    typeof rawId === 'string' && rawId.trim() !== '' && !/^\d+$/.test(rawId.trim())
      ? rawId.trim().toUpperCase()
      : ''

  const codeFromFields =
    String(driver?.risk_category_code ?? '').trim().toUpperCase() || idAsNonDigitCode

  if (codeFromFields) {
    const byCode = riskCategories.find((c) => c.code.toUpperCase() === codeFromFields)
    if (byCode) return byCode.id
  }

  if (typeof rawId === 'number' && Number.isFinite(rawId) && riskCategories.some((c) => c.id === rawId)) {
    return rawId
  }
  if (typeof rawId === 'string') {
    const trimmed = rawId.trim()
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed)
      if (riskCategories.some((c) => c.id === n)) return n
    }
  }
  return 0
}

export function riskCategoryDriverNeedsNumericIdSync(
  driver: RiskCategoryDriver | undefined,
  resolvedNumericId: number,
): boolean {
  if (!driver || resolvedNumericId === 0) return false
  const raw = driver.risk_category_id as unknown
  return raw !== resolvedNumericId || typeof raw === 'string'
}

/** API expects `risk_category_id` as a string (e.g. `"3"` not `3`). */
export type RiskCategoryDriverApi = Omit<RiskCategoryDriver, 'risk_category_id'> & {
  risk_category_id: string
}

export function serializeCategoryDriversForApi(
  drivers: RiskCategoryDriver[] | undefined,
): RiskCategoryDriverApi[] {
  if (!drivers?.length) return []
  return drivers.map((driver) => {
    const raw = driver.risk_category_id as unknown
    let risk_category_id: string
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      risk_category_id = String(raw)
    } else if (typeof raw === 'string') {
      risk_category_id = raw.trim()
    } else {
      risk_category_id = ''
    }
    return { ...driver, risk_category_id }
  })
}
