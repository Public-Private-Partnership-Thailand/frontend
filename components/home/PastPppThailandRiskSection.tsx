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
    handback: 'ส่งมอบ',
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

function mapProjectRowFromApi(
  p: RiskSectorWithProjectProjectRow,
  riskCategoryMap: Map<number, string>,
  riskFactorMap: Map<number, string>
): PastPppRiskProjectRow {
  const riskGroup = riskCategoryMap.get(p.riskCategoryId) ?? `หมวดความเสี่ยง #${p.riskCategoryId}`
  const riskFactor = riskFactorMap.get(p.riskFactorId) ?? `ปัจจัยความเสี่ยง #${p.riskFactorId}`
  return {
    projectId: p.projectId,
    projectName: p.projectName,
    problem: p.problem,
    riskImpact: p.riskImpact,
    riskResponse: p.riskResponse,
    phase: normalizePhase(p.phase),
    riskGroup,
    riskFactor,
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

  const projectsBySector = new Map<string, RiskSectorWithProjectProjectRow[]>()
  for (const row of riskSectorWithProject ?? []) {
    if (!Array.isArray(row.projects)) continue
    projectsBySector.set(row.sector, row.projects)
  }

  return (riskSectorWithProject ?? [])
    .filter((row) => typeof row.sector === 'string' && row.sector.trim().length > 0)
    .map((row) => {
    const sectorKey = row.sector
    const projects = projectsBySector.get(sectorKey) ?? []
    const incidents: PastPppRiskIncident[] = projects.map((p, idx) => {
      const mapped = mapProjectRowFromApi(p, riskCategoryMap, riskFactorMap)
      return {
        id: `${sectorKey}-${p.projectId || idx + 1}-${idx + 1}`,
        summaryProblem: mapped.problem,
        riskGroup: mapped.riskGroup,
        riskFactor: mapped.riskFactor,
        phase: mapped.phase,
        projects: [mapped],
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
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
              className="box min-h-[143px] w-full flex flex-col items-stretch justify-start text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 group"
            >
              <div className="flex w-full min-h-0 flex-1 items-start justify-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                <div className="min-w-0 flex-1 self-start">
                  <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-indigo-800">
                    {displayName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>
                      ความเสี่ยงที่บันทึกไว้:{' '}
                      <strong className="text-gray-700 tabular-nums">{nIncidents}</strong>
                    </span>
                    <span>
                      จำนวนโครงการที่พบความเสี่ยง:{' '}
                      <strong className="text-gray-700 tabular-nums">{nProjects}</strong>
                    </span>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
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
                      <p className="text-sm font-medium text-gray-900">{inc.summaryProblem}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="rounded bg-white px-2 py-0.5 border border-gray-200">
                          กลุ่ม: {inc.riskGroup}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 border border-gray-200">
                          ปัจจัย: {inc.riskFactor}
                        </span>
                        <span className="rounded bg-white px-2 py-0.5 border border-gray-200">
                          เฟส: {phaseLabelTh(inc.phase)}
                        </span>
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
                      <th className="py-2 pr-3 min-w-[9rem]">กลุ่มความเสี่ยง</th>
                      <th className="py-2 pr-2 min-w-[9rem]">ปัจจัยเสี่ยง</th>
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
                        <td className="py-3 pr-3 text-gray-700">{p.riskGroup}</td>
                        <td className="py-3 pr-2 text-gray-700">{p.riskFactor}</td>
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
