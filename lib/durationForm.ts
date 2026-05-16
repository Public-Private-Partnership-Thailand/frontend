/** Form duration units: 1 year = 365 days, 1 month = 30 days (matches Step 2 UI). */
export const DAYS_PER_YEAR = 365
export const DAYS_PER_MONTH = 30

export function ymdToTotalDays(year: string | number, month: string | number, day: string | number): number {
  const y = parseInt(String(year), 10) || 0
  const m = parseInt(String(month), 10) || 0
  const d = parseInt(String(day), 10) || 0
  return y * DAYS_PER_YEAR + m * DAYS_PER_MONTH + d
}

export function totalDaysToYmd(totalDays: number): { years: number; months: number; days: number } {
  if (totalDays <= 0) return { years: 0, months: 0, days: 0 }
  const years = Math.floor(totalDays / DAYS_PER_YEAR)
  const remainingDaysAfterYears = totalDays % DAYS_PER_YEAR
  const months = Math.floor(remainingDaysAfterYears / DAYS_PER_MONTH)
  const days = remainingDaysAfterYears % DAYS_PER_MONTH
  return { years, months, days }
}

export function calendarDaysBetween(
  startIso: string,
  endIso: string,
  parseDate: (dateString: string) => Date | null
): number | null {
  const start = parseDate(startIso)
  const end = parseDate(endIso)
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return null
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Prefer stored durationInDays (canonical for Y/M/D inputs) over calendar start–end diff,
 * which can disagree when end dates were saved independently.
 */
export function resolveDurationTotalDays(
  period: { startDate?: string; endDate?: string; durationInDays?: number | null } | undefined,
  parseDate: (dateString: string) => Date | null
): number {
  if (!period) return 0
  if (period.durationInDays != null && period.durationInDays > 0) {
    return period.durationInDays
  }
  if (period.startDate && period.endDate) {
    const diff = calendarDaysBetween(period.startDate, period.endDate, parseDate)
    if (diff != null && diff > 0) return diff
  }
  return 0
}
