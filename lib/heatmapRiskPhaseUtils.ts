/** `source.thailand` id that carries per-project refs in `source["thailand-otp"]` from API */
export const THAILAND_RISK_SOURCE_OTP_ID = 2

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

function parseThailandOtpFromSource(src: Record<string, unknown>): ThailandOtpProjectRef[] {
  const raw = src['thailand-otp'] ?? src.thailandOtp ?? src['thailand_otp']
  if (!Array.isArray(raw)) return []
  const out: ThailandOtpProjectRef[] = []
  for (const row of raw) {
    if (row == null || typeof row !== 'object') continue
    const o = row as Record<string, unknown>
    const projectIdRaw = o.projectId ?? o.project_id
    const titleRaw = o.title ?? o.projectTitle
    const projectId = projectIdRaw != null ? String(projectIdRaw) : ''
    const title = titleRaw != null ? String(titleRaw) : ''
    if (projectId) out.push({ projectId, title })
  }
  return out
}

/**
 * Normalizes /api/v1/summary heatmapRiskPhase factor entries:
 * - Legacy: string[] of phases
 * - Current: { phase: string[], source: { global, thailand, "thailand-otp": { projectId, title }[] } }
 */
export function normalizeHeatmapFactorPhaseEntry(entry: unknown): {
  phases: string[]
  sourceGlobal: number[]
  sourceThailand: number[]
  thailandOtp: ThailandOtpProjectRef[]
} {
  if (entry == null) {
    return { phases: [], sourceGlobal: [], sourceThailand: [], thailandOtp: [] }
  }
  if (Array.isArray(entry)) {
    return {
      phases: entry.filter((p): p is string => typeof p === 'string'),
      sourceGlobal: [],
      sourceThailand: [],
      thailandOtp: [],
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
    return { phases: phaseArr, sourceGlobal: global, sourceThailand: thailand, thailandOtp }
  }
  return { phases: [], sourceGlobal: [], sourceThailand: [], thailandOtp: [] }
}

/** Stable key for matrix source filter, e.g. `global:1` / `thailand:1` (IDs differ per bucket). */
export function riskSourceFilterKey(kind: 'global' | 'thailand', id: number): string {
  return `${kind}:${id}`
}

/**
 * When `selectedKeys` is empty, no filtering. Otherwise a factor matches if it cites **any**
 * of the selected sources (OR). Keys must be `global:id` or `thailand:id`.
 */
export function factorMatchesRiskSourceFilter(
  n: { sourceGlobal: number[]; sourceThailand: number[]; thailandOtp: ThailandOtpProjectRef[] },
  selectedKeys: ReadonlySet<string>
): boolean {
  if (selectedKeys.size === 0) return true
  for (const key of Array.from(selectedKeys)) {
    const colon = key.indexOf(':')
    if (colon < 0) continue
    const kind = key.slice(0, colon)
    const id = parseInt(key.slice(colon + 1), 10)
    if (Number.isNaN(id)) continue
    if (kind === 'global' && n.sourceGlobal.includes(id)) return true
    if (kind === 'thailand') {
      if (n.sourceThailand.includes(id)) return true
      if (id === THAILAND_RISK_SOURCE_OTP_ID && n.thailandOtp.length > 0) return true
    }
  }
  return false
}

export function aggregateSourceIdsForPhase(
  factorPhases: Record<string, unknown> | undefined,
  phase: string,
  sourceFilterKeys?: ReadonlySet<string> | null
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
    if (filterOn && !factorMatchesRiskSourceFilter(n, sourceFilterKeys)) continue
    n.sourceGlobal.forEach((id) => g.add(id))
    n.sourceThailand.forEach((id) => t.add(id))
    if (n.thailandOtp.length > 0) t.add(THAILAND_RISK_SOURCE_OTP_ID)
  }
  return {
    global: Array.from(g).sort((a, b) => a - b),
    thailand: Array.from(t).sort((a, b) => a - b),
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
    lines.push(`นานาชาติ: ${labels.join(', ')}`)
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
    .map((p) => {
      const pid = encodeURIComponent(p.projectId)
      const title = escapeHtmlForTooltip(p.title)
      // Inline color: Tippy default theme is dark (#333 + white text); Tailwind in this string is not applied to the popover.
      return `<li style="font-size:0.875rem;line-height:1.375"><a style="color:#7dd3fc;font-weight:500;text-decoration:underline;text-underline-offset:2px" href="/view/${pid}" target="_blank" rel="noopener noreferrer">${title}</a></li>`
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
  let text = `${phaseLabel}: ${factorCount} ปัจจัย`
  const src = formatRiskSourcePlainText(aggregated.global, aggregated.thailand, maps)
  if (src) {
    text += `\n\nแหล่งอ้างอิง (รวมในช่องนี้):\n${src}`
  }
  return text
}
