'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Lucide from '@/components/Base/Lucide'
import { getIconNameByGroupName } from '@/app/hooks/useSummary'
import {
  formatRiskCategoryLabel,
  formatRiskFactorLabel,
  type RiskCategory,
  type RiskFactor,
} from '@/app/hooks/useInfo'
import {
  normalizeRiskTextField,
  type RiskSectorWithProjectItem,
  type RiskSectorWithProjectProjectRow,
  type RiskSectorWithProjectProjectRiskRow,
} from '@/app/hooks/useRisk'
import { getBusinessGroupDisplayName } from '@/types/businessGroup'
import {
  countTotalProjects,
  type PastPppRiskIncident,
  type PastPppRiskProjectRow,
  type PastPppSectorPastRisks,
} from '@/lib/pastPppThailandRiskMock'
import { fetchProjectById } from '@/lib/projectService'
import { normalizeMitigationHandling } from '@/lib/normalizeMitigationHandling'
import type { Risk } from '@/types/project'

function mapIconName(iconName: string): string {
  const iconMap: Record<string, string> = {
    'transport_road.png': '01_transport.road.png',
    'transport_rail.png': '02_transport.rail.png',
    'transport_air.png': '03_transport.air.png',
    'transport_water.png': '04_transport.water.png',
    'waterAndWaste.png': '05_waterAndWaste.png',
    energy: '06_energy.png',
    communications: '07_communications.png',
    health: '08_health.png',
    education: '09_education.png',
    socialHousing: '10_socialHousing.png',
    cultureSportsAndRecreation: '11_cultureSportsAndRecreation.png',
    others: '12_others.png',
  }
  if (/^\d{2}_/.test(iconName)) return iconName
  return iconMap[iconName] || iconName
}

function phaseLabelTh(phase: string): string {
  const m: Record<string, string> = {
    'pre-construction': 'Pre-constuction',
    construction: 'Construction',
    operation: 'Operation',
  }
  return m[phase] ?? phase
}

function normalizeTextLines(value: unknown): string[] {
  if (value == null) return []
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean)
  }
  const s = String(value).trim()
  return s.length > 0 ? [s] : []
}

function hasMeaningfulTextLines(value: unknown): boolean {
  const lines = normalizeTextLines(value)
  return lines.length > 0 && !(lines.length === 1 && lines[0] === 'N/A')
}

function RiskDetailText({ value }: { value: string | string[] | undefined }) {
  const lines = normalizeTextLines(value)
  if (lines.length === 0) return <span className="text-gray-400">N/A</span>
  if (lines.length === 1) return <span>{lines[0]}</span>
  return (
    <ul className="space-y-1.5 list-none m-0 p-0">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 text-gray-700 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  )
}

function mapProjectRiskToModalRow(
  projectId: string,
  projectName: string,
  risk: Risk,
  riskCategoryMap: Map<number, string>,
): PastPppRiskProjectRow {
  const riskBreakdown = (risk.category_drivers ?? []).map((driver) => {
    const group =
      riskCategoryMap.get(driver.risk_category_id) ??
      (driver.category_name?.trim() || `หมวดความเสี่ยง #${driver.risk_category_id}`)
    const riskFactors = (driver.driven_by_risk_factors ?? [])
      .map((f) => removeRiskFactorCodePrefix(f.factor_name?.trim() || ''))
      .filter(Boolean)
    return { riskGroup: group, riskFactors }
  })
  const riskGroups = riskBreakdown.map((x) => x.riskGroup)
  const riskFactors = Array.from(new Set(riskBreakdown.flatMap((x) => x.riskFactors)))
  const descriptionLines = normalizeTextLines(risk.description)
  const impactLines = normalizeTextLines(risk.impact_statement)
  const responseLines = normalizeMitigationHandling(risk.mitigation_handling)

  return {
    projectId,
    projectName,
    problem: risk.title?.trim() || 'N/A',
    description: descriptionLines.length > 0 ? descriptionLines : 'N/A',
    riskImpact: impactLines.length > 0 ? impactLines : 'N/A',
    riskResponse: responseLines.length > 0 ? responseLines : 'N/A',
    phase: normalizePhase(risk.phase),
    riskGroup: riskGroups.join(' / ') || 'N/A',
    riskFactor: riskFactors.join(' / ') || 'N/A',
    riskGroups,
    riskFactors,
    riskBreakdown,
  }
}

async function fetchRiskDetailRowsForIncident(
  incident: PastPppRiskIncident,
  riskCategoryList: RiskCategory[],
): Promise<PastPppRiskProjectRow[]> {
  const projectRef = incident.projects[0]
  if (!projectRef?.projectId?.trim()) return []

  const project = await fetchProjectById(projectRef.projectId.trim())
  if (!project) return []

  const projectName = project.title?.trim() || projectRef.projectName?.trim() || 'N/A'
  const riskCategoryMap = new Map<number, string>(
    riskCategoryList.map((c) => [c.id, formatRiskCategoryLabel(c)]),
  )

  const allRisks = project.risks ?? []
  const summary = incident.summaryProblem?.trim()
  const matched =
    summary.length > 0
      ? allRisks.filter((r) => (r.title ?? '').trim() === summary)
      : []
  const risksToShow = matched.length > 0 ? matched : allRisks

  return risksToShow.map((risk) =>
    mapProjectRiskToModalRow(projectRef.projectId, projectName, risk, riskCategoryMap),
  )
}

type PastPppThailandRiskSectionProps = {
  riskSectorWithProject?: RiskSectorWithProjectItem[]
  riskCategoryList?: RiskCategory[]
  riskFactorList?: RiskFactor[]
}

function normalizePhase(phase: string): string {
  const s = phase.trim().toLowerCase().replace(/\s+/g, '-')
  if (s === 'preconstruction' || s === 'pre-construction') return 'pre-construction'
  if (s === 'construction') return 'construction'
  if (s === 'operation') return 'operation'
  if (s === 'handback') return 'handback'
  return phase
}

function removeRiskFactorCodePrefix(label: string): string {
  return label.replace(/^\s*F\d+\s*:\s*/i, '').trim()
}

function countRiskFactorsForIncident(inc: PastPppRiskIncident): number {
  if (inc.riskBreakdown && inc.riskBreakdown.length > 0) {
    return inc.riskBreakdown.reduce((sum, row) => sum + row.riskFactors.length, 0)
  }
  return inc.riskFactor ? 1 : 0
}

function countRiskGroupsForIncident(inc: PastPppRiskIncident): number {
  if (inc.riskBreakdown && inc.riskBreakdown.length > 0) {
    return inc.riskBreakdown.length
  }
  return inc.riskGroup && String(inc.riskGroup).trim() ? 1 : 0
}

type SectorModalProjectItem = {
  projectId: string
  projectName: string
  riskGroupCount: number
  riskFactorCount: number
}

function aggregateProjectRiskStats(rows: PastPppRiskProjectRow[]): {
  riskGroupCount: number
  riskFactorCount: number
} {
  const groups = new Set<string>()
  const factors = new Set<string>()
  for (const p of rows) {
    if (p.riskBreakdown && p.riskBreakdown.length > 0) {
      for (const row of p.riskBreakdown) {
        const g = String(row.riskGroup ?? '').trim()
        if (g) groups.add(g)
        for (const f of row.riskFactors ?? []) {
          const t = String(f ?? '').trim()
          if (t) factors.add(t)
        }
      }
    } else {
      const g = String(p.riskGroup ?? '').trim()
      if (g) groups.add(g)
      const f = String(p.riskFactor ?? '').trim()
      if (f) factors.add(f)
      for (const gf of p.riskGroups ?? []) {
        const t = String(gf).trim()
        if (t) groups.add(t)
      }
      for (const ff of p.riskFactors ?? []) {
        const t = String(ff).trim()
        if (t) factors.add(t)
      }
    }
  }
  return { riskGroupCount: groups.size, riskFactorCount: factors.size }
}

function buildProjectsInSectorModal(sector: PastPppSectorPastRisks): SectorModalProjectItem[] {
  const byProject = new Map<string, { projectName: string; rows: PastPppRiskProjectRow[] }>()

  for (const inc of sector.incidents) {
    for (const p of inc.projects) {
      const id = p.projectId?.trim()
      if (!id) continue
      const existing = byProject.get(id) ?? {
        projectName: p.projectName?.trim() || 'N/A',
        rows: [],
      }
      existing.rows.push(p)
      byProject.set(id, existing)
    }
  }

  return Array.from(byProject.entries()).map(([projectId, { projectName, rows }]) => {
    const stats = aggregateProjectRiskStats(rows)
    return {
      projectId,
      projectName,
      riskGroupCount: stats.riskGroupCount,
      riskFactorCount: stats.riskFactorCount,
    }
  })
}

function mapProjectRowFromApi(
  p: RiskSectorWithProjectProjectRow,
  riskCategoryMap: Map<number, string>,
  riskFactorMap: Map<number, string>
): PastPppRiskProjectRow {
  const normalizedRisks: RiskSectorWithProjectProjectRiskRow[] = []
  if (Array.isArray(p.risks) && p.risks.length > 0) {
    normalizedRisks.push(...p.risks)
  } else if (typeof p.riskCategoryId === 'number' && typeof p.riskFactorId === 'number') {
    normalizedRisks.push({ riskCategoryId: p.riskCategoryId, riskFactorId: [p.riskFactorId] })
  }

  const riskBreakdownMap = new Map<string, Set<string>>()
  for (const risk of normalizedRisks) {
    const group = riskCategoryMap.get(risk.riskCategoryId) ?? `หมวดความเสี่ยง #${risk.riskCategoryId}`
    if (!riskBreakdownMap.has(group)) {
      riskBreakdownMap.set(group, new Set())
    }
    const factorSet = riskBreakdownMap.get(group)!
    for (const id of risk.riskFactorId) {
      const rawFactor = riskFactorMap.get(id) ?? `ปัจจัยความเสี่ยง #${id}`
      factorSet.add(removeRiskFactorCodePrefix(rawFactor))
    }
  }

  const riskBreakdown = Array.from(riskBreakdownMap.entries()).map(([riskGroup, factors]) => ({
    riskGroup,
    riskFactors: Array.from(factors),
  }))
  const riskGroups = riskBreakdown.map((x) => x.riskGroup)
  const riskFactors = Array.from(new Set(riskBreakdown.flatMap((x) => x.riskFactors)))

  const riskGroup = riskGroups.join(' / ')
  const riskFactor = riskFactors.join(' / ')
  return {
    projectId: p.projectId,
    projectName: p.projectName,
    problem: p.problem,
    riskImpact: normalizeRiskTextField(p.riskImpact),
    riskResponse: normalizeRiskTextField(p.riskResponse),
    phase: normalizePhase(p.phase),
    riskGroup,
    riskFactor,
    riskGroups,
    riskFactors,
    riskBreakdown,
  }
}

function mapApiToSectorPastRisks(
  riskSectorWithProject: RiskSectorWithProjectItem[] | undefined,
  riskCategoryList: RiskCategory[],
  riskFactorList: RiskFactor[]
): PastPppSectorPastRisks[] {
  const riskCategoryMap = new Map<number, string>(
    riskCategoryList.map((c) => [c.id, formatRiskCategoryLabel(c)])
  )
  const riskFactorMap = new Map<number, string>(
    riskFactorList.map((f) => [f.id, formatRiskFactorLabel(f)])
  )

  return (riskSectorWithProject ?? [])
    .filter((row) => typeof row.sector === 'string' && row.sector.trim().length > 0)
    .map((row) => {
      const sectorKey = row.sector
      const projects = Array.isArray(row.projects) ? row.projects : []

      // One API `projects[]` row = one incident (matches `riskCount`; no merge by problem+impact+response).
      const incidents: PastPppRiskIncident[] = projects.map((p, idx) => {
        const mapped = mapProjectRowFromApi(p, riskCategoryMap, riskFactorMap)
        return {
          id: `${sectorKey}-${mapped.projectId}-${idx}`,
          summaryProblem: mapped.problem,
          riskGroup: mapped.riskGroup,
          riskFactor: mapped.riskFactor,
          phase: mapped.phase,
          projects: [mapped],
          riskBreakdown: mapped.riskBreakdown,
        }
      })

      return {
        sectorKey,
        incidents,
      }
    })
}

export default function PastPppThailandRiskSection({
  riskSectorWithProject,
  riskCategoryList = [],
  riskFactorList = [],
}: PastPppThailandRiskSectionProps) {
  const bySector = useMemo(
    () => mapApiToSectorPastRisks(riskSectorWithProject, riskCategoryList, riskFactorList),
    [riskSectorWithProject, riskCategoryList, riskFactorList]
  )
  const riskCountBySector = useMemo(() => {
    const m = new Map<string, number>()
    for (const row of riskSectorWithProject ?? []) {
      if (typeof row.riskCount === 'number' && Number.isFinite(row.riskCount)) {
        m.set(row.sector, Math.max(0, Math.floor(row.riskCount)))
      }
    }
    return m
  }, [riskSectorWithProject])
  const [sectorModal, setSectorModal] = useState<PastPppSectorPastRisks | null>(null)
  const [sectorModalExpanded, setSectorModalExpanded] = useState({
    projects: false,
    incidents: false,
  })
  const [projectsModal, setProjectsModal] = useState<{
    sectorLabel: string
    incident: PastPppRiskIncident
    rows: PastPppRiskProjectRow[] | null
    loadError: string | null
    openedAt: number
  } | null>(null)
  useEffect(() => {
    if (sectorModal) {
      setSectorModalExpanded({ projects: false, incidents: false })
    }
  }, [sectorModal])

  useEffect(() => {
    if (!projectsModal) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await fetchRiskDetailRowsForIncident(
          projectsModal.incident,
          riskCategoryList,
        )
        if (cancelled) return
        setProjectsModal((prev) =>
          prev ? { ...prev, rows, loadError: rows.length === 0 ? 'ไม่พบข้อมูลความเสี่ยงของโครงการ' : null } : null,
        )
      } catch {
        if (cancelled) return
        setProjectsModal((prev) =>
          prev ? { ...prev, rows: [], loadError: 'ไม่สามารถโหลดข้อมูลโครงการได้' } : null,
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [projectsModal?.openedAt, riskCategoryList])

  const projectsInSectorModal = useMemo(
    () => (sectorModal ? buildProjectsInSectorModal(sectorModal) : []),
    [sectorModal],
  )

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">ความเสี่ยงจากโครงการ PPP ของประเทศไทย (เฉพาะโครงการที่พบความเสี่ยง)</h2>
        <p className="mt-1 text-sm text-gray-500 max-w-4xl">
          แบ่งตามกลุ่มกิจการ 12 กลุ่มของประเทศไทย — สามารถคลิกกลุ่มกิจการเพื่อดูความเสี่ยงที่เคยเกิดขึ้น
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
        {bySector.map((row) => {
          const displayName = getBusinessGroupDisplayName(row.sectorKey)
          const icon = mapIconName(getIconNameByGroupName(row.sectorKey))
          const iconPath = `/assets/icons/${icon}`
          const nIncidents = riskCountBySector.get(row.sectorKey) ?? row.incidents.length
          const nProjects = countTotalProjects(row.incidents)

          return (
            <button
              key={row.sectorKey}
              type="button"
              onClick={() => setSectorModal(row)}
              className="box h-[190px] w-full flex flex-col text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group"
            >
              <div className="flex min-h-0 flex-1 gap-3">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden self-start">
                  <img
                    src={iconPath}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 flex h-full min-h-0 flex-col">
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-gutter:stable]">
                    <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-800">
                      {displayName}
                    </p>
                  </div>
                  <div className="mt-2 flex-shrink-0 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>
                      ความเสี่ยงที่บันทึกไว้:{' '}
                      <strong className="text-gray-700 tabular-nums">{nIncidents}</strong>
                    </span>
                    <span>
                      จำนวนโครงการที่พบความเสี่ยง:{' '}
                      <strong className="text-gray-700 tabular-nums">{nProjects}</strong>
                    </span>
                  </div>
                  <span className="mt-2 flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                    ดูรายการ
                    <Lucide icon="ChevronRight" className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Modal: รายการความเสี่ยงในกลุ่มกิจการ */}
      {sectorModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="past-ppp-sector-title"
          onClick={() => setSectorModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[700px] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 shrink-0">
              <div>
                <h2 id="past-ppp-sector-title" className="text-lg font-semibold text-gray-900">
                  {"กลุ่มกิจการ — " + getBusinessGroupDisplayName(sectorModal.sectorKey)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSectorModal(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="ปิด"
              >
                <Lucide icon="X" className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {sectorModal.incidents.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">ยังไม่มีข้อมูลตัวอย่างในกลุ่มกิจการนี้</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setSectorModalExpanded((s) => ({ ...s, projects: !s.projects }))
                      }
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      aria-expanded={sectorModalExpanded.projects}
                    >
                      <h3 className="text-sm font-semibold text-gray-900">
                        โครงการที่พบความเสี่ยง ({projectsInSectorModal.length})
                      </h3>
                      <Lucide
                        icon={sectorModalExpanded.projects ? 'ChevronUp' : 'ChevronDown'}
                        className="w-5 h-5 text-gray-500 shrink-0"
                      />
                    </button>
                    {sectorModalExpanded.projects && (
                      <div className="border-t border-gray-200 px-4 py-3 bg-slate-50/40">
                        {projectsInSectorModal.length === 0 ? (
                          <p className="text-sm text-gray-500 py-2">ไม่มีรายการโครงการ</p>
                        ) : (
                          <ul className="space-y-3">
                            {projectsInSectorModal.map((proj) => (
                              <li
                                key={proj.projectId}
                                className="rounded-lg border border-gray-200 bg-white p-4"
                              >
                                <p className="text-sm font-medium text-gray-900">{proj.projectName}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                  <span className="rounded bg-slate-50 px-2 py-0.5 border border-gray-200">
                                    จำนวนกลุ่มความเสี่ยง: {proj.riskGroupCount}
                                  </span>
                                  <span className="rounded bg-slate-50 px-2 py-0.5 border border-gray-200">
                                    จำนวนปัจจัยเสี่ยง: {proj.riskFactorCount}
                                  </span>
                                </div>
                                <Link
                                  href={`/view/${proj.projectId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  ดูรายละเอียดโครงการ
                                  <Lucide icon="ChevronRight" className="w-4 h-4" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setSectorModalExpanded((s) => ({ ...s, incidents: !s.incidents }))
                      }
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      aria-expanded={sectorModalExpanded.incidents}
                    >
                      <h3 className="text-sm font-semibold text-gray-900">
                        ความเสี่ยงที่บันทึกไว้ (
                        {riskCountBySector.get(sectorModal.sectorKey) ?? sectorModal.incidents.length})
                      </h3>
                      <Lucide
                        icon={sectorModalExpanded.incidents ? 'ChevronUp' : 'ChevronDown'}
                        className="w-5 h-5 text-gray-500 shrink-0"
                      />
                    </button>
                    {sectorModalExpanded.incidents && (
                      <div className="border-t border-gray-200 px-4 py-3 bg-slate-50/40">
                        <ul className="space-y-3">
                          {sectorModal.incidents.map((inc) => (
                            <li
                              key={inc.id}
                              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-indigo-200 transition-colors"
                            >
                              <p className="text-sm font-medium text-gray-900">{inc.summaryProblem}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                <span className="rounded bg-slate-50 px-2 py-0.5 border border-gray-200">
                                  จำนวนกลุ่มความเสี่ยง: {countRiskGroupsForIncident(inc)}
                                </span>
                                <span className="rounded bg-slate-50 px-2 py-0.5 border border-gray-200">
                                  จำนวนปัจจัยเสี่ยง: {countRiskFactorsForIncident(inc)}
                                </span>
                                <span className="rounded bg-slate-50 px-2 py-0.5 border border-gray-200">
                                  เฟส: {phaseLabelTh(inc.phase)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setProjectsModal({
                                    sectorLabel: getBusinessGroupDisplayName(sectorModal.sectorKey),
                                    incident: inc,
                                    rows: null,
                                    loadError: null,
                                    openedAt: Date.now(),
                                  })
                                }
                                className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                              >
                                ดูรายละเอียดความเสี่ยง
                                <Lucide icon="ChevronRight" className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: ตารางโครงการ */}
      {projectsModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="past-ppp-projects-title"
          onClick={() => setProjectsModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 id="past-ppp-projects-title" className="text-lg font-semibold text-gray-900">
                  กลุ่มกิจการ — {projectsModal.sectorLabel}
                </h2>
                {/* <p className="mt-1 text-sm text-gray-600 line-clamp-2">{projectsModal.incident.summaryProblem}</p> */}
              </div>
              <button
                type="button"
                onClick={() => setProjectsModal(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="ปิด"
              >
                <Lucide icon="X" className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 px-2 sm:px-4 py-4">
              {projectsModal.rows === null ? (
                <p className="text-sm text-gray-500 py-12 text-center">กำลังโหลดข้อมูลความเสี่ยง...</p>
              ) : projectsModal.loadError ? (
                <p className="text-sm text-gray-500 py-12 text-center">{projectsModal.loadError}</p>
              ) : (
                <div className="min-w-[720px]">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500">
                        <th className="py-2 pr-3 pl-2 sticky left-0 bg-white min-w-[10rem]">โครงการ</th>
                        <th className="py-2 pr-3 min-w-[11rem]">ปัญหาที่เกิดขึ้น</th>
                        <th className="py-2 pr-3 min-w-[9rem]">Risk Impact</th>
                        <th className="py-2 pr-3 min-w-[9rem]">Risk Response</th>
                        <th className="py-2 pr-3 w-28">เฟส</th>
                        <th className="py-2 pr-3 min-w-[11rem]">กลุ่มความเสี่ยงและปัจจัยเสี่ยง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsModal.rows.map((p, rowIdx) => (
                        <tr
                          key={`${p.projectId}-${rowIdx}`}
                          className="border-b border-gray-100 align-top"
                        >
                          <td className="py-3 pr-3 pl-2 font-medium text-gray-900 sticky left-0 bg-white">
                            <Link
                              href={`/view/${p.projectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-indigo-700 hover:text-indigo-900"
                            >
                              {p.projectName}
                            </Link>
                          </td>
                          <td className="py-3 pr-3 text-gray-700">
                            <p className="font-medium text-gray-900">{p.problem}</p>
                            {hasMeaningfulTextLines(p.description) && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                                  รายละเอียด
                                </p>
                                <RiskDetailText value={p.description} />
                              </div>
                            )}
                          </td>
                          <td className="py-3 pr-3 text-gray-700">
                            <RiskDetailText value={p.riskImpact} />
                          </td>
                          <td className="py-3 pr-3 text-gray-700">
                            <RiskDetailText value={p.riskResponse} />
                          </td>
                          <td className="py-3 pr-3 text-gray-700 whitespace-nowrap">{phaseLabelTh(p.phase)}</td>
                          <td className="py-3 pr-3 text-gray-700 align-top">
                            <div className="space-y-2">
                              {(p.riskBreakdown && p.riskBreakdown.length > 0
                                ? p.riskBreakdown
                                : [{ riskGroup: p.riskGroup, riskFactors: [p.riskFactor] }]
                              ).map((groupRow, idx) => (
                                <div
                                  key={`${p.projectId}-risk-breakdown-${rowIdx}-${idx}`}
                                  className="rounded-md border border-slate-200 bg-slate-50 p-2"
                                >
                                  <div className="text-xs font-semibold text-slate-700">{groupRow.riskGroup}</div>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {groupRow.riskFactors.map((factor, factorIdx) => (
                                      <span
                                        key={`${p.projectId}-risk-breakdown-factor-${rowIdx}-${idx}-${factorIdx}`}
                                        className="inline-flex rounded bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-700"
                                      >
                                        {factor}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
