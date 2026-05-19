import {
  normalizeRiskPhaseKey,
  type RiskSectorWithProjectItem,
  type RiskSectorWithProjectProjectRiskRow,
  type RiskSectorWithProjectProjectRow,
} from '@/app/hooks/useRisk'
import {
  mergeNormalizedHeatmapFactorPhaseEntries,
  normalizeHeatmapFactorPhaseEntry,
  rebuildNormalizedEntryFromByPhase,
  type MatrixFactorPhaseSlice,
  type NormalizedHeatmapFactorPhaseEntry,
  THAILAND_RISK_SOURCE_SECTOR_PROJECT_ID,
  type ThailandOtpProjectRef,
} from '@/lib/heatmapRiskPhaseUtils'
import { toRiskCategoryCode, toRiskFactorCode } from '@/lib/normalizeHeatmapRisk'

export { THAILAND_RISK_SOURCE_SECTOR_PROJECT_ID }

export type HeatmapRiskPhaseMap = Record<string, Record<string, unknown>>

function emptySlice(): MatrixFactorPhaseSlice {
  return {
    sourceGlobal: [],
    sourceThailand: [],
    thailandOtp: [],
    thailandSectorProjects: [],
  }
}

function normalizeProjectRisks(
  project: RiskSectorWithProjectProjectRow
): RiskSectorWithProjectProjectRiskRow[] {
  if (Array.isArray(project.risks) && project.risks.length > 0) {
    return project.risks
  }
  if (typeof project.riskCategoryId === 'number' && typeof project.riskFactorId === 'number') {
    return [{ riskCategoryId: project.riskCategoryId, riskFactorId: [project.riskFactorId] }]
  }
  return []
}

function serializedFactorEntry(n: NormalizedHeatmapFactorPhaseEntry): unknown | null {
  const hasPhases = n.phases.length > 0
  const hasByPhase = Object.keys(n.byPhase).length > 0
  const hasSources =
    n.sourceGlobal.length > 0 ||
    n.sourceThailand.length > 0 ||
    n.thailandOtp.length > 0 ||
    n.thailandSectorProjects.length > 0
  if (!hasPhases && !hasSources) return null
  if (!hasSources) return [...n.phases]

  const source: Record<string, unknown> = {}
  if (n.sourceGlobal.length) source.global = n.sourceGlobal
  if (n.sourceThailand.length) source.thailand = n.sourceThailand
  if (n.thailandOtp.length) {
    source['thailand-otp'] = n.thailandOtp.map((p) => ({
      projectId: p.projectId,
      title: p.title,
    }))
  }
  if (n.thailandSectorProjects.length) {
    source['thailand-sector-projects'] = n.thailandSectorProjects.map((p) => ({
      projectId: p.projectId,
      title: p.title,
    }))
  }

  const payload: Record<string, unknown> = { phase: n.phases, source }
  if (hasByPhase) {
    const byPhase: Record<string, unknown> = {}
    for (const [phase, slice] of Object.entries(n.byPhase)) {
      const phaseSrc: Record<string, unknown> = {}
      if (slice.sourceGlobal.length) phaseSrc.global = slice.sourceGlobal
      if (slice.sourceThailand.length) phaseSrc.thailand = slice.sourceThailand
      if (slice.thailandOtp.length) {
        phaseSrc['thailand-otp'] = slice.thailandOtp.map((p) => ({
          projectId: p.projectId,
          title: p.title,
        }))
      }
      if (slice.thailandSectorProjects.length) {
        phaseSrc['thailand-sector-projects'] = slice.thailandSectorProjects.map((p) => ({
          projectId: p.projectId,
          title: p.title,
        }))
      }
      byPhase[phase] = { source: phaseSrc }
    }
    payload.byPhase = byPhase
  }
  return payload
}

/** Collapse API key variants (`"1"` / `"C1"` / `"C01"`) and factor ids into one map. */
function normalizeHeatmapRiskPhaseKeys(heatmap: HeatmapRiskPhaseMap): HeatmapRiskPhaseMap {
  const out: HeatmapRiskPhaseMap = {}

  for (const [categoryIdRaw, factorPhases] of Object.entries(heatmap)) {
    if (!factorPhases || typeof factorPhases !== 'object') continue
    const categoryId = toRiskCategoryCode(categoryIdRaw)
    if (!out[categoryId]) out[categoryId] = {}

    for (const [factorIdRaw, raw] of Object.entries(factorPhases)) {
      const factorId = toRiskFactorCode(factorIdRaw)
      const factors = out[categoryId]
      const existing = factors[factorId]
      if (existing != null) {
        const entry = serializedFactorEntry(
          mergeNormalizedHeatmapFactorPhaseEntries(
            normalizeHeatmapFactorPhaseEntry(existing),
            normalizeHeatmapFactorPhaseEntry(raw)
          )
        )
        if (entry != null) factors[factorId] = entry
        else delete factors[factorId]
      } else {
        factors[factorId] = raw
      }
    }

    if (Object.keys(out[categoryId]).length === 0) delete out[categoryId]
  }

  return out
}

/** Remove `source.thailand` id 6 from API `heatmapRiskPhase` (replaced by sector project data). */
export function stripThailandSectorSourceFromHeatmapRiskPhase(
  heatmap: HeatmapRiskPhaseMap | undefined
): HeatmapRiskPhaseMap {
  if (!heatmap || typeof heatmap !== 'object') return {}

  const out: HeatmapRiskPhaseMap = {}
  for (const [categoryId, factorPhases] of Object.entries(heatmap)) {
    if (!factorPhases || typeof factorPhases !== 'object') continue

    const factors: Record<string, unknown> = {}
    for (const [factorId, raw] of Object.entries(factorPhases)) {
      const n = normalizeHeatmapFactorPhaseEntry(raw)
      const byPhase: Record<string, MatrixFactorPhaseSlice> = {}
      for (const [phase, slice] of Object.entries(n.byPhase)) {
        const next: MatrixFactorPhaseSlice = {
          sourceGlobal: [...slice.sourceGlobal],
          sourceThailand: slice.sourceThailand.filter(
            (id) => id !== THAILAND_RISK_SOURCE_SECTOR_PROJECT_ID
          ),
          thailandOtp: [...slice.thailandOtp],
          thailandSectorProjects: [],
        }
        const hasSliceData =
          next.sourceGlobal.length > 0 ||
          next.sourceThailand.length > 0 ||
          next.thailandOtp.length > 0
        if (!hasSliceData) continue
        byPhase[phase] = next
      }
      if (Object.keys(byPhase).length === 0) continue
      const entry = serializedFactorEntry(rebuildNormalizedEntryFromByPhase(byPhase))
      if (entry != null) factors[factorId] = entry
    }

    if (Object.keys(factors).length > 0) out[categoryId] = factors
  }
  return out
}

/** Build heatmap-shaped entries from `riskSectorWithProject[].projects[].risks` (Thailand source id 6). */
export function buildHeatmapRiskPhaseFromRiskSectorWithProject(
  items: RiskSectorWithProjectItem[] | undefined
): HeatmapRiskPhaseMap {
  const accum = new Map<string, Map<string, NormalizedHeatmapFactorPhaseEntry>>()

  for (const sectorRow of items ?? []) {
    const projects = Array.isArray(sectorRow.projects) ? sectorRow.projects : []
    for (const project of projects) {
      const phase = normalizeRiskPhaseKey(project.phase)
      if (!phase) continue

      const projectId = typeof project.projectId === 'string' ? project.projectId.trim() : ''
      if (!projectId) continue

      const projectTitle =
        typeof project.projectName === 'string' && project.projectName.trim()
          ? project.projectName.trim()
          : projectId
      const projectRef: ThailandOtpProjectRef = { projectId, title: projectTitle }

      for (const risk of normalizeProjectRisks(project)) {
        const categoryId = toRiskCategoryCode(risk.riskCategoryId)
        for (const factorIdRaw of risk.riskFactorId) {
          const factorId = toRiskFactorCode(factorIdRaw)
          if (!accum.has(categoryId)) accum.set(categoryId, new Map())
          const byFactor = accum.get(categoryId)!

          const existing =
            byFactor.get(factorId) ??
            ({
              phases: [],
              sourceGlobal: [],
              sourceThailand: [],
              thailandOtp: [],
              thailandSectorProjects: [],
              byPhase: {},
            } satisfies NormalizedHeatmapFactorPhaseEntry)

          const phases = new Set(existing.phases)
          phases.add(phase)

          const byPhase = { ...existing.byPhase }
          const slice = byPhase[phase] ? { ...byPhase[phase] } : emptySlice()
          const sourceThailand = new Set(slice.sourceThailand)
          sourceThailand.add(THAILAND_RISK_SOURCE_SECTOR_PROJECT_ID)
          const sectorByProjectId = new Map(
            slice.thailandSectorProjects.map((p) => [p.projectId, p] as const)
          )
          sectorByProjectId.set(projectId, projectRef)
          byPhase[phase] = {
            ...slice,
            sourceThailand: [...sourceThailand],
            thailandSectorProjects: Array.from(sectorByProjectId.values()),
          }

          byFactor.set(factorId, {
            phases: [...phases],
            sourceGlobal: existing.sourceGlobal,
            sourceThailand: existing.sourceThailand,
            thailandOtp: existing.thailandOtp,
            thailandSectorProjects: existing.thailandSectorProjects,
            byPhase,
          })
        }
      }
    }
  }

  const out: HeatmapRiskPhaseMap = {}
  for (const [categoryId, byFactor] of accum) {
    const factors: Record<string, unknown> = {}
    for (const [factorId, partial] of byFactor) {
      const entry = serializedFactorEntry(rebuildNormalizedEntryFromByPhase(partial.byPhase))
      if (entry != null) factors[factorId] = entry
    }
    if (Object.keys(factors).length > 0) out[categoryId] = factors
  }
  return out
}

export function mergeHeatmapRiskPhaseMaps(
  base: HeatmapRiskPhaseMap,
  extra: HeatmapRiskPhaseMap
): HeatmapRiskPhaseMap {
  const scratch: HeatmapRiskPhaseMap = {}
  for (const src of [base, extra]) {
    for (const [categoryIdRaw, factorPhases] of Object.entries(src)) {
      if (!factorPhases || typeof factorPhases !== 'object') continue
      if (!scratch[categoryIdRaw]) scratch[categoryIdRaw] = {}
      Object.assign(scratch[categoryIdRaw], factorPhases)
    }
  }
  return normalizeHeatmapRiskPhaseKeys(scratch)
}

/** Matrix table + modal: heatmap without Thailand id 6, plus sector project risks as source id 6. */
export function buildMatrixHeatmapRiskPhase(
  heatmapRiskPhase: HeatmapRiskPhaseMap | undefined,
  riskSectorWithProject: RiskSectorWithProjectItem[] | undefined
): HeatmapRiskPhaseMap {
  const stripped = stripThailandSectorSourceFromHeatmapRiskPhase(heatmapRiskPhase)
  const fromSector = buildHeatmapRiskPhaseFromRiskSectorWithProject(riskSectorWithProject)
  return mergeHeatmapRiskPhaseMaps(stripped, fromSector)
}
