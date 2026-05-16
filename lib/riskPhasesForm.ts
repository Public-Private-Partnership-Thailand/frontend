import type { Risk, RiskFormEntry } from '@/types/project'
import { RISK_PHASE_OPTIONS } from '@/lib/riskConstants'

const PHASE_ORDER = RISK_PHASE_OPTIONS.map((o) => o.value)

function normalizeRiskPhaseForForm(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  const s = raw.trim().toLowerCase().replace(/\s+/g, '-')
  if (s === 'pre-construction' || s === 'preconstruction') return 'pre-construction'
  if (s === 'construction') return 'construction'
  if (s === 'operation') return 'operation'
  return PHASE_ORDER.includes(s as (typeof PHASE_ORDER)[number]) ? s : null
}

export function sortRiskPhases(phases: string[]): string[] {
  const set = new Set(phases.map((p) => p.trim()).filter(Boolean))
  return PHASE_ORDER.filter((p) => set.has(p))
}

/** Exact title match (edit load): same title + different phases → one form row, all phases checked. */
function riskCollapseKeyByTitle(risk: Risk): string {
  return String(risk.title ?? '')
}

/**
 * Merge API risks into form rows keyed by exact `title`.
 * Rows with the same title and different `phase` values become one entry with `phases[]` filled.
 */
export function collapseRisksForForm(risks: Risk[]): RiskFormEntry[] {
  const groups = new Map<string, RiskFormEntry>()
  const phaseSets = new Map<string, Set<string>>()

  for (const risk of risks) {
    const key = riskCollapseKeyByTitle(risk)
    if (!groups.has(key)) {
      const { phase: _phase, ...rest } = risk
      groups.set(key, { ...rest, phases: [] })
      phaseSets.set(key, new Set())
    }
    const phase = normalizeRiskPhaseForForm(risk.phase)
    if (phase) phaseSets.get(key)!.add(phase)
  }

  return Array.from(groups.entries()).map(([key, entry]) => ({
    ...entry,
    phases: sortRiskPhases(Array.from(phaseSets.get(key)!)),
  }))
}

/** Duplicate each form risk once per selected phase (same payload except `phase`). */
export function expandRisksForApi(entries: RiskFormEntry[]): Risk[] {
  const result: Risk[] = []
  for (const entry of entries) {
    const phases = sortRiskPhases(entry.phases ?? [])
    const { phases: _phases, ...rest } = entry
    for (const phase of phases) {
      result.push({ ...rest, phase })
    }
  }
  return result
}

export function formatRiskPhaseLabels(phases: string[] | undefined): string {
  if (!phases?.length) return ''
  return sortRiskPhases(phases)
    .map((p) => RISK_PHASE_OPTIONS.find((o) => o.value === p)?.label ?? p)
    .join(', ')
}
