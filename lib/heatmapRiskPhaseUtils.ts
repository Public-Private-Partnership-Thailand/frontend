/** `source.thailand` id that carries per-project refs in `source["thailand-otp"]` from API */
export const THAILAND_RISK_SOURCE_OTP_ID = 2

/** `source.thailand` id backed by `riskSectorWithProject` (sector project risks). */
export const THAILAND_RISK_SOURCE_SECTOR_PROJECT_ID = 6

export type ThailandOtpProjectRef = {
  projectId: string
  title: string
}

function parseNumericIdList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const out: number[] = []
  for (const x of raw) {
    if (typeof x === 'number' && Number.isFinite(x)) {
      out.push(x)
      continue
    }
    if (typeof x === 'string' && x.trim() !== '') {
      const n = Number(x)
      if (Number.isFinite(n)) out.push(n)
    }
  }
  return out
}

function parseThailandProjectRefsFromSource(
  src: Record<string, unknown>,
  rawKeys: string[]
): ThailandOtpProjectRef[] {
  let raw: unknown
  for (const key of rawKeys) {
    if (key in src) {
      raw = src[key]
      break
    }
  }
  if (!Array.isArray(raw)) return []
  const out: ThailandOtpProjectRef[] = []
  for (const row of raw) {
    if (row == null || typeof row !== 'object') continue
    const o = row as Record<string, unknown>
    const projectIdRaw = o.projectId ?? o.project_id
    const titleRaw = o.title ?? o.projectTitle ?? o.projectName
    const projectId = projectIdRaw != null ? String(projectIdRaw) : ''
    const title = titleRaw != null ? String(titleRaw).trim() : ''
    if (projectId) out.push({ projectId, title: title || projectId })
  }
  return out
}

function parseThailandOtpFromSource(src: Record<string, unknown>): ThailandOtpProjectRef[] {
  return parseThailandProjectRefsFromSource(src, ['thailand-otp', 'thailandOtp', 'thailand_otp'])
}

function parseThailandSectorProjectsFromSource(src: Record<string, unknown>): ThailandOtpProjectRef[] {
  return parseThailandProjectRefsFromSource(src, [
    'thailand-sector-projects',
    'thailandSectorProjects',
    'thailand_sector_projects',
  ])
}

export type MatrixFactorPhaseSlice = {
  sourceGlobal: number[]
  sourceThailand: number[]
  thailandOtp: ThailandOtpProjectRef[]
  thailandSectorProjects: ThailandOtpProjectRef[]
}

export type NormalizedHeatmapFactorPhaseEntry = {
  phases: string[]
  sourceGlobal: number[]
  sourceThailand: number[]
  thailandOtp: ThailandOtpProjectRef[]
  thailandSectorProjects: ThailandOtpProjectRef[]
  byPhase: Record<string, MatrixFactorPhaseSlice>
}

function emptyMatrixFactorPhaseSlice(): MatrixFactorPhaseSlice {
  return {
    sourceGlobal: [],
    sourceThailand: [],
    thailandOtp: [],
    thailandSectorProjects: [],
  }
}

function parseMatrixFactorPhaseSlice(raw: unknown): MatrixFactorPhaseSlice {
  if (raw == null || typeof raw !== 'object') return emptyMatrixFactorPhaseSlice()
  const o = raw as Record<string, unknown>
  const src =
    o.source && typeof o.source === 'object' && o.source !== null
      ? (o.source as Record<string, unknown>)
      : o
  return {
    sourceGlobal: parseNumericIdList(src.global),
    sourceThailand: parseNumericIdList(src.thailand),
    thailandOtp: parseThailandOtpFromSource(src),
    thailandSectorProjects: parseThailandSectorProjectsFromSource(src),
  }
}

function mergeMatrixFactorPhaseSlices(
  a: MatrixFactorPhaseSlice,
  b: MatrixFactorPhaseSlice
): MatrixFactorPhaseSlice {
  const otpByProjectId = new Map<string, ThailandOtpProjectRef>()
  for (const p of [...a.thailandOtp, ...b.thailandOtp]) {
    if (p.projectId) otpByProjectId.set(p.projectId, p)
  }
  const sectorByProjectId = new Map<string, ThailandOtpProjectRef>()
  for (const p of [...a.thailandSectorProjects, ...b.thailandSectorProjects]) {
    if (p.projectId) sectorByProjectId.set(p.projectId, p)
  }
  return {
    sourceGlobal: Array.from(new Set([...a.sourceGlobal, ...b.sourceGlobal])),
    sourceThailand: Array.from(new Set([...a.sourceThailand, ...b.sourceThailand])),
    thailandOtp: Array.from(otpByProjectId.values()),
    thailandSectorProjects: Array.from(sectorByProjectId.values()),
  }
}

function buildByPhaseFromFlat(
  phaseArr: string[],
  global: number[],
  thailand: number[],
  thailandOtp: ThailandOtpProjectRef[],
  thailandSectorProjects: ThailandOtpProjectRef[]
): Record<string, MatrixFactorPhaseSlice> {
  const byPhase: Record<string, MatrixFactorPhaseSlice> = {}
  for (const phase of phaseArr) {
    byPhase[phase] = {
      sourceGlobal: [...global],
      sourceThailand: [...thailand],
      thailandOtp: [...thailandOtp],
      thailandSectorProjects: [...thailandSectorProjects],
    }
  }
  return byPhase
}

function flattenFromByPhase(byPhase: Record<string, MatrixFactorPhaseSlice>): {
  sourceGlobal: number[]
  sourceThailand: number[]
  thailandOtp: ThailandOtpProjectRef[]
  thailandSectorProjects: ThailandOtpProjectRef[]
} {
  const g = new Set<number>()
  const t = new Set<number>()
  const otpByProjectId = new Map<string, ThailandOtpProjectRef>()
  const sectorByProjectId = new Map<string, ThailandOtpProjectRef>()
  for (const slice of Object.values(byPhase)) {
    slice.sourceGlobal.forEach((id) => g.add(id))
    slice.sourceThailand.forEach((id) => t.add(id))
    for (const p of slice.thailandOtp) {
      if (p.projectId) otpByProjectId.set(p.projectId, p)
    }
    for (const p of slice.thailandSectorProjects) {
      if (p.projectId) sectorByProjectId.set(p.projectId, p)
    }
  }
  return {
    sourceGlobal: Array.from(g),
    sourceThailand: Array.from(t),
    thailandOtp: Array.from(otpByProjectId.values()),
    thailandSectorProjects: Array.from(sectorByProjectId.values()),
  }
}

function emptyNormalizedHeatmapFactorPhaseEntry(): NormalizedHeatmapFactorPhaseEntry {
  return {
    phases: [],
    sourceGlobal: [],
    sourceThailand: [],
    thailandOtp: [],
    thailandSectorProjects: [],
    byPhase: {},
  }
}

/**
 * Normalizes /api/v1/summary heatmapRiskPhase factor entries:
 * - Legacy: string[] of phases
 * - Current: { phase: string[], source: { global, thailand, ... }, byPhase?: { [phase]: { source, projects } } }
 */
export function normalizeHeatmapFactorPhaseEntry(entry: unknown): NormalizedHeatmapFactorPhaseEntry {
  if (entry == null) {
    return emptyNormalizedHeatmapFactorPhaseEntry()
  }
  if (Array.isArray(entry)) {
    const phases = entry.filter((p): p is string => typeof p === 'string')
    return {
      phases,
      sourceGlobal: [],
      sourceThailand: [],
      thailandOtp: [],
      thailandSectorProjects: [],
      byPhase: buildByPhaseFromFlat(phases, [], [], [], []),
    }
  }
  if (typeof entry === 'object' && entry !== null && 'phase' in entry) {
    const o = entry as Record<string, unknown>
    const phaseArr = Array.isArray(o.phase) ? o.phase.filter((p): p is string => typeof p === 'string') : []
    const src =
      o.source && typeof o.source === 'object' && o.source !== null
        ? (o.source as Record<string, unknown>)
        : {}
    const global = parseNumericIdList(src.global)
    const thailand = parseNumericIdList(src.thailand)
    const thailandOtp = parseThailandOtpFromSource(src)
    const thailandSectorProjects = parseThailandSectorProjectsFromSource(src)

    let byPhase: Record<string, MatrixFactorPhaseSlice> = {}
    const byPhaseRaw = o.byPhase
    if (byPhaseRaw && typeof byPhaseRaw === 'object') {
      for (const [phase, sliceRaw] of Object.entries(byPhaseRaw as Record<string, unknown>)) {
        byPhase[phase] = parseMatrixFactorPhaseSlice(sliceRaw)
      }
    }
    if (Object.keys(byPhase).length === 0) {
      byPhase = buildByPhaseFromFlat(phaseArr, global, thailand, thailandOtp, thailandSectorProjects)
    }

    const flat = flattenFromByPhase(byPhase)
    return {
      phases: phaseArr,
      sourceGlobal: flat.sourceGlobal.length ? flat.sourceGlobal : global,
      sourceThailand: flat.sourceThailand.length ? flat.sourceThailand : thailand,
      thailandOtp: flat.thailandOtp.length ? flat.thailandOtp : thailandOtp,
      thailandSectorProjects: flat.thailandSectorProjects.length
        ? flat.thailandSectorProjects
        : thailandSectorProjects,
      byPhase,
    }
  }
  return emptyNormalizedHeatmapFactorPhaseEntry()
}

/** Sources and projects for one factor in one matrix phase column. */
export function getMatrixFactorPhaseSlice(
  n: NormalizedHeatmapFactorPhaseEntry,
  phase: string
): MatrixFactorPhaseSlice {
  if (!n.phases.includes(phase)) return emptyMatrixFactorPhaseSlice()
  return n.byPhase[phase] ?? emptyMatrixFactorPhaseSlice()
}

export function rebuildNormalizedEntryFromByPhase(
  byPhase: Record<string, MatrixFactorPhaseSlice>
): NormalizedHeatmapFactorPhaseEntry {
  const phases = Object.keys(byPhase).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const flat = flattenFromByPhase(byPhase)
  return {
    phases,
    ...flat,
    byPhase,
  }
}

export function mergeNormalizedHeatmapFactorPhaseEntries(
  a: NormalizedHeatmapFactorPhaseEntry,
  b: NormalizedHeatmapFactorPhaseEntry
): NormalizedHeatmapFactorPhaseEntry {
  const phases = Array.from(new Set([...a.phases, ...b.phases]))
  const byPhase: Record<string, MatrixFactorPhaseSlice> = { ...a.byPhase }
  for (const [phase, sliceB] of Object.entries(b.byPhase)) {
    byPhase[phase] = byPhase[phase]
      ? mergeMatrixFactorPhaseSlices(byPhase[phase], sliceB)
      : { ...sliceB }
  }
  const flat = flattenFromByPhase(byPhase)
  return {
    phases,
    ...flat,
    byPhase,
  }
}

/** Stable key for matrix source filter, e.g. `global:1` / `thailand:1` (IDs differ per bucket). */
export function riskSourceFilterKey(kind: 'global' | 'thailand', id: number): string {
  return `${kind}:${id}`
}

/** Keep only Thailand source ids defined in `/api/v1/info` → `riskSource.thailand`. */
export function filterKnownThailandSourceIds(
  ids: number[],
  knownThailandSourceIds: ReadonlySet<number>
): number[] {
  return ids.filter((id) => knownThailandSourceIds.has(id))
}

/**
 * When `selectedKeys` is empty, no filtering. Otherwise a factor matches if it cites **any**
 * of the selected sources (OR). Keys must be `global:id` or `thailand:id`.
 */
export function factorPhaseSliceMatchesRiskSourceFilter(
  slice: MatrixFactorPhaseSlice,
  selectedKeys: ReadonlySet<string>
): boolean {
  if (selectedKeys.size === 0) return true
  for (const key of Array.from(selectedKeys)) {
    const colon = key.indexOf(':')
    if (colon < 0) continue
    const kind = key.slice(0, colon)
    const id = parseInt(key.slice(colon + 1), 10)
    if (Number.isNaN(id)) continue
    if (kind === 'global' && slice.sourceGlobal.includes(id)) return true
    if (kind === 'thailand' && slice.sourceThailand.includes(id)) return true
  }
  return false
}

export function factorMatchesRiskSourceFilter(
  n: NormalizedHeatmapFactorPhaseEntry,
  selectedKeys: ReadonlySet<string>
): boolean {
  if (selectedKeys.size === 0) return true
  for (const phase of n.phases) {
    if (factorPhaseSliceMatchesRiskSourceFilter(getMatrixFactorPhaseSlice(n, phase), selectedKeys)) {
      return true
    }
  }
  return false
}

export function aggregateSourceIdsForPhase(
  factorPhases: Record<string, unknown> | undefined,
  phase: string,
  sourceFilterKeys?: ReadonlySet<string> | null,
  knownThailandSourceIds?: ReadonlySet<number>
): { global: number[]; thailand: number[] } {
  const g = new Set<number>()
  const t = new Set<number>()
  if (!factorPhases || typeof factorPhases !== 'object') {
    return { global: [], thailand: [] }
  }
  const filterOn = sourceFilterKeys && sourceFilterKeys.size > 0
  for (const entry of Object.values(factorPhases)) {
    const n = normalizeHeatmapFactorPhaseEntry(entry)
    if (!n.phases.includes(phase)) continue
    if (!n.phases.includes(phase)) continue
    const slice = getMatrixFactorPhaseSlice(n, phase)
    if (filterOn && !factorPhaseSliceMatchesRiskSourceFilter(slice, sourceFilterKeys)) continue
    slice.sourceGlobal.forEach((id) => g.add(id))
    slice.sourceThailand.forEach((id) => t.add(id))
  }
  const thailand = knownThailandSourceIds
    ? filterKnownThailandSourceIds(Array.from(t), knownThailandSourceIds)
    : Array.from(t)
  return {
    global: Array.from(g).sort((a, b) => a - b),
    thailand: thailand.sort((a, b) => a - b),
  }
}

export type RiskSourceMaps = {
  global: Map<number, string>
  thailand: Map<number, string>
}

export function formatRiskSourcePlainText(
  globalIds: number[],
  thailandIds: number[],
  maps: RiskSourceMaps
): string {
  const lines: string[] = []
  if (globalIds.length) {
    const labels = globalIds.map((id) => maps.global.get(id) ?? `#${id}`)
    lines.push(`ต่างประเทศ: ${labels.join(', ')}`)
  }
  if (thailandIds.length) {
    const labels = thailandIds.map((id) => maps.thailand.get(id) ?? `#${id}`)
    lines.push(`ไทย: ${labels.join(', ')}`)
  }
  return lines.join('\n')
}

function escapeHtmlForTooltip(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** HTML for Tippy: list of project titles linking to `/view/:projectId` (source Thailand OTP / id 2). */
export function buildThailandOtpTooltipHtml(
  projects: ThailandOtpProjectRef[],
  sourceLabel: string
): string {
  const safeHeading = escapeHtmlForTooltip(sourceLabel)
  if (projects.length === 0) {
    return `<div class="text-left text-sm max-w-sm"><div class="font-semibold">${safeHeading}</div></div>`
  }
  const items = projects
    .map((p, index) => {
      const pid = encodeURIComponent(p.projectId)
      const title = escapeHtmlForTooltip(p.title || p.projectId)
      const n = index + 1
      return `<li style="font-size:0.875rem;line-height:1.375;display:flex;gap:0.35rem;align-items:baseline"><span style="opacity:0.9;flex-shrink:0">${n}.</span><a style="color:#7dd3fc;font-weight:500;text-decoration:underline;text-underline-offset:2px" href="/view/${pid}" target="_blank" rel="noopener noreferrer">${title}</a></li>`
    })
    .join('')
  return `<div style="text-align:left;max-width:min(100vw - 24px, 22rem);font-size:0.875rem;line-height:1.4"><div style="font-weight:600;margin-bottom:0.25rem">${safeHeading}</div><p style="font-size:0.75rem;opacity:0.85;margin:0 0 0.25rem 0">คลิกชื่อโครงการเพื่อเปิดในแท็บใหม่</p><ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.25rem;max-height:none;overflow:visible">${items}</ul></div>`
}

export function buildMatrixPhaseCellTooltip(
  phaseLabel: string,
  factorCount: number,
  aggregated: { global: number[]; thailand: number[] },
  maps: RiskSourceMaps
): string {
  let text = `เฟส ${phaseLabel}: พบ ${factorCount} ปัจจัยเสี่ยง`
  return text
}

const TOOLTIP_BLOCK_STYLE =
  'text-align:left;max-width:min(100vw - 24px, 22rem);font-size:0.875rem;line-height:1.4'
const TOOLTIP_HEADING_STYLE = 'font-weight:600;margin:0 0 0.35rem 0'
const TOOLTIP_LIST_STYLE =
  'list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.25rem'
const TOOLTIP_LIST_ITEM_STYLE =
  'font-size:0.875rem;line-height:1.375;display:flex;gap:0.35rem;align-items:baseline'

function numberedPlainListItem(index: number, label: string): string {
  return `<li style="${TOOLTIP_LIST_ITEM_STYLE}"><span style="opacity:0.9;flex-shrink:0">${index}.</span><span>${escapeHtmlForTooltip(label)}</span></li>`
}

function numberedProjectListItem(index: number, project: ThailandOtpProjectRef): string {
  const pid = encodeURIComponent(project.projectId)
  const title = escapeHtmlForTooltip(project.title || project.projectId)
  return `<li style="${TOOLTIP_LIST_ITEM_STYLE}"><span style="opacity:0.9;flex-shrink:0">${index}.</span><a style="color:#7dd3fc;font-weight:500;text-decoration:underline;text-underline-offset:2px" href="/view/${pid}" target="_blank" rel="noopener noreferrer">${title}</a></li>`
}

/** Heat-map modal: per factor × phase cell — numbered sources and projects. */
export function buildMatrixFactorPhaseCellTooltipHtml(
  maps: RiskSourceMaps,
  params: {
    globalIds?: number[]
    thailandIds?: number[]
    sectorProjects?: ThailandOtpProjectRef[]
  }
): string {
  const sourceLabels: string[] = []
  for (const id of params.globalIds ?? []) {
    sourceLabels.push(maps.global.get(id) ?? `#${id}`)
  }
  for (const id of params.thailandIds ?? []) {
    if (!maps.thailand.has(id)) continue
    sourceLabels.push(maps.thailand.get(id) ?? `#${id}`)
  }

  const projectById = new Map<string, ThailandOtpProjectRef>()
  for (const p of params.sectorProjects ?? []) {
    if (p.projectId) projectById.set(p.projectId, p)
  }
  const projects = Array.from(projectById.values())

  const sections: string[] = []

  if (sourceLabels.length > 0) {
    const items = sourceLabels
      .map((label, index) => numberedPlainListItem(index + 1, label))
      .join('')
    sections.push(
      `<div><p style="${TOOLTIP_HEADING_STYLE}">แหล่งข้อมูล</p><ul style="${TOOLTIP_LIST_STYLE}">${items}</ul></div>`
    )
  }

  if (projects.length > 0) {
    const items = projects
      .map((project, index) => numberedProjectListItem(index + 1, project))
      .join('')
    sections.push(
      `<div style="margin-top:0.75rem"><p style="${TOOLTIP_HEADING_STYLE}">โครงการ</p>` +
        `<p style="font-size:0.75rem;opacity:0.85;margin:0 0 0.25rem 0">คลิกชื่อโครงการเพื่อเปิดในแท็บใหม่</p>` +
        `<ul style="${TOOLTIP_LIST_STYLE}">${items}</ul></div>`
    )
  }

  if (sections.length === 0) return ''
  return `<div style="${TOOLTIP_BLOCK_STYLE}">${sections.join('')}</div>`
}
