'use client'

import { useMemo, useState } from 'react'
import Lucide from '@/components/Base/Lucide'
import { getIconNameByGroupName } from '@/app/hooks/useSummary'
import {
  formatRiskCategoryLabel,
  formatRiskFactorLabel,
  type RiskCategory,
  type RiskFactor,
} from '@/app/hooks/useInfo'
import type {
  RiskSectorWithProjectItem,
  RiskSectorWithProjectProjectRow,
  RiskSectorWithProjectProjectRiskRow,
} from '@/app/hooks/useRisk'
import { getBusinessGroupDisplayName } from '@/types/businessGroup'
import {
  countTotalProjects,
  type PastPppRiskIncident,
  type PastPppRiskProjectRow,
  type PastPppSectorPastRisks,
} from '@/lib/pastPppThailandRiskMock'

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
    'pre-construction': 'ก่อนก่อสร้าง',
    construction: 'ก่อสร้าง',
    operation: 'ดำเนินการ',
  }
  return m[phase] ?? phase
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
    riskImpact: p.riskImpact,
    riskResponse: p.riskResponse,
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
      const dedupProjectMap = new Map<string, PastPppRiskProjectRow>()

      for (const p of projects) {
        const mapped = mapProjectRowFromApi(p, riskCategoryMap, riskFactorMap)
        const key = [
          mapped.projectId,
          mapped.projectName,
          mapped.problem,
          mapped.riskImpact,
          mapped.riskResponse,
          mapped.phase,
        ].join('|')
        const existing = dedupProjectMap.get(key)
        if (!existing) {
          dedupProjectMap.set(key, mapped)
          continue
        }
        const mergedRiskGroups = Array.from(
          new Set([...(existing.riskGroups ?? []), ...(mapped.riskGroups ?? [])])
        )
        const mergedRiskFactors = Array.from(
          new Set([...(existing.riskFactors ?? []), ...(mapped.riskFactors ?? [])])
        )
        const mergedBreakdownMap = new Map<string, Set<string>>()
        for (const row of [...(existing.riskBreakdown ?? []), ...(mapped.riskBreakdown ?? [])]) {
          if (!mergedBreakdownMap.has(row.riskGroup)) {
            mergedBreakdownMap.set(row.riskGroup, new Set())
          }
          const set = mergedBreakdownMap.get(row.riskGroup)!
          for (const factor of row.riskFactors) set.add(factor)
        }
        const mergedRiskBreakdown = Array.from(mergedBreakdownMap.entries()).map(([riskGroup, factors]) => ({
          riskGroup,
          riskFactors: Array.from(factors),
        }))
        dedupProjectMap.set(key, {
          ...existing,
          riskGroups: mergedRiskGroups,
          riskFactors: mergedRiskFactors,
          riskGroup: mergedRiskGroups.join(' / '),
          riskFactor: mergedRiskFactors.join(' / '),
          riskBreakdown: mergedRiskBreakdown,
        })
      }

      const incidents: PastPppRiskIncident[] = Array.from(dedupProjectMap.values()).map((mapped, idx) => ({
        id: `${sectorKey}-${mapped.projectId || idx + 1}-${idx + 1}`,
        summaryProblem: mapped.problem,
        riskGroup: mapped.riskGroup,
        riskFactor: mapped.riskFactor,
        phase: mapped.phase,
        projects: [mapped],
        riskBreakdown: mapped.riskBreakdown,
      }))

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
  const [projectsModal, setProjectsModal] = useState<{
    sectorLabel: string
    incident: PastPppRiskIncident
  } | null>(null)

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
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2 id="past-ppp-sector-title" className="text-lg font-semibold text-gray-900">
                  {getBusinessGroupDisplayName(sectorModal.sectorKey)}
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
                <ul className="space-y-3">
                  {sectorModal.incidents.map((inc) => (
                    <li
                      key={inc.id}
                      className="rounded-lg border border-gray-200 bg-slate-50/50 p-4 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{inc.summaryProblem}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          <span className="rounded bg-white px-2 py-0.5 border border-gray-200">
                            จำนวนปัจจัยเสี่ยง:{' '}
                            {(inc.riskBreakdown && inc.riskBreakdown.length > 0
                              ? inc.riskBreakdown.reduce((sum, row) => sum + row.riskFactors.length, 0)
                              : inc.riskFactor
                                ? 1
                                : 0)}
                          </span>
                          <span className="rounded bg-white px-2 py-0.5 border border-gray-200">
                            เฟส: {phaseLabelTh(inc.phase)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2 text-xs text-gray-700">
                        {(inc.riskBreakdown && inc.riskBreakdown.length > 0
                          ? inc.riskBreakdown
                          : [{ riskGroup: inc.riskGroup, riskFactors: [inc.riskFactor] }]
                        ).map((row, idx) => (
                          <div
                            key={`${inc.id}-incident-breakdown-${idx}`}
                            className="rounded-md border border-gray-200 bg-white px-2.5 py-2"
                          >
                            <div className="font-semibold text-gray-700">{row.riskGroup}</div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {row.riskFactors.map((factor, factorIdx) => (
                                <span
                                  key={`${inc.id}-incident-breakdown-factor-${idx}-${factorIdx}`}
                                  className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-gray-700"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectsModal({
                            sectorLabel: getBusinessGroupDisplayName(sectorModal.sectorKey),
                            incident: inc,
                          })
                        }
                        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        ดูรายละเอียดโครงการ ({inc.projects.length})
                        <Lucide icon="ChevronRight" className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
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
                  โครงการ — {projectsModal.sectorLabel}
                </h2>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{projectsModal.incident.summaryProblem}</p>
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
              <div className="min-w-[720px]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="py-2 pr-3 pl-2 sticky left-0 bg-white min-w-[10rem]">โครงการ</th>
                      <th className="py-2 pr-3 min-w-[11rem]">ปัญหาที่เกิดขึ้น</th>
                      <th className="py-2 pr-3 min-w-[9rem]">Risk impact</th>
                      <th className="py-2 pr-3 min-w-[9rem]">Risk response</th>
                      <th className="py-2 pr-3 w-28">Phase</th>
                      <th className="py-2 pr-3 min-w-[11rem]">กลุ่มความเสี่ยง</th>
                      <th className="py-2 pr-2 min-w-[8rem]">จำนวนปัจจัยเสี่ยง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectsModal.incident.projects.map((p: PastPppRiskProjectRow) => (
                      <tr key={p.projectId} className="border-b border-gray-100 align-top hover:bg-slate-50/80">
                        <td className="py-3 pr-3 pl-2 font-medium text-gray-900 sticky left-0 bg-white">
                          {p.projectName}
                        </td>
                        <td className="py-3 pr-3 text-gray-700">{p.problem}</td>
                        <td className="py-3 pr-3 text-gray-700">{p.riskImpact}</td>
                        <td className="py-3 pr-3 text-gray-700">{p.riskResponse}</td>
                        <td className="py-3 pr-3 text-gray-700 whitespace-nowrap">{phaseLabelTh(p.phase)}</td>
                        <td className="py-3 pr-3 text-gray-700 align-top">
                          <div className="space-y-2">
                            {(p.riskBreakdown && p.riskBreakdown.length > 0
                              ? p.riskBreakdown
                              : [{ riskGroup: p.riskGroup, riskFactors: [p.riskFactor] }]
                            ).map((groupRow, idx) => (
                              <div key={`${p.projectId}-risk-breakdown-${idx}`} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                <div className="text-xs font-semibold text-slate-700">{groupRow.riskGroup}</div>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {groupRow.riskFactors.map((factor, factorIdx) => (
                                    <span
                                      key={`${p.projectId}-risk-breakdown-factor-${idx}-${factorIdx}`}
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
                        <td className="py-3 pr-2 text-gray-700 align-top">
                          <div className="text-xs text-gray-600">
                            {(p.riskBreakdown && p.riskBreakdown.length > 0 ? p.riskBreakdown : []).reduce(
                              (sum, row) => sum + row.riskFactors.length,
                              0
                            ) || (p.riskFactors?.length ?? (p.riskFactor ? 1 : 0))}{' '}
                            ปัจจัย
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
