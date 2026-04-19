'use client'

import { useState } from 'react'
import Tippy from '@/components/Base/Tippy'
import Lucide from '@/components/Base/Lucide'
import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'
import {
  type RiskCategory,
  type RiskFactor,
  formatRiskCategoryLabel,
  formatRiskFactorLabel,
} from '@/app/hooks/useInfo'
import { toRiskFactorCode } from '@/lib/normalizeHeatmapRisk'
import {
  buildThailandOtpTooltipHtml,
  formatRiskSourcePlainText,
  riskSourceFilterKey,
  THAILAND_RISK_SOURCE_OTP_ID,
  type RiskSourceMaps,
  type ThailandOtpProjectRef,
} from '@/lib/heatmapRiskPhaseUtils'

/** Shared by Matrix ประเภทความเสี่ยง × เฟส and heat-map popup: check = risk in phase; no mark when none (no fill). */
export function PhaseMatrixRiskMark({ present }: { present: boolean }) {
  if (!present) {
    return null
  }
  return (
    <Lucide
      icon="Check"
      className="w-4 h-4 text-gray-900 shrink-0"
      aria-label="พบความเสี่ยงในระยะนี้"
    />
  )
}

const PHASE_TABLE_HEADER_TH_CLASS =
  'border border-gray-300 bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-700'

/** Same as ภาพรวมความเสี่ยงทั่วไป / matrix legend */
const THAI_FLAG_ICON_SRC = '/assets/icons/thai_flag.png'

/** Stable reference so Tippy is not torn down every render (see Base/Tippy) */
const THAILAND_OTP_TIPPY_OPTIONS = {
  allowHTML: true,
  /** Wide enough for titles; height grows with content (no inner scroll in tooltip HTML). */
  maxWidth: 'min(calc(100vw - 24px), 22rem)',
  placement: 'top-start' as const,
  interactive: true,
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    'pre-construction': 'Pre-construction',
    construction: 'Construction',
    operation: 'Operation',
    handback: 'Handback',
  }
  return labels[phase] ?? phase
}

/** Normalize factor id from API (numeric or "F01") to canonical F001 for lookup in riskFactor. */
function normalizeFactorId(id: string | number): string {
  return toRiskFactorCode(id)
}

interface RiskHeatmapProps {
  heatmapRisk: HeatmapRiskItem[]
  riskCategory: RiskCategory[]
  riskFactor: RiskFactor[]
  riskSourceMaps?: RiskSourceMaps
}

function SourceBadgesRow({
  globalIds,
  thailandIds,
  thailandOtpProjects,
  maps,
  /** When set (partial matrix filter), badges whose key is not in this set are faded. */
  activeSourceFilterKeys,
}: {
  globalIds: number[]
  thailandIds: number[]
  /** Present when Thailand source OTP (id 2) lists concrete projects — hover shows links to `/view/:id` */
  thailandOtpProjects?: ThailandOtpProjectRef[]
  maps: RiskSourceMaps
  activeSourceFilterKeys?: ReadonlySet<string> | null
}) {
  if (!globalIds.length && !thailandIds.length) return null
  const shortLabel = (s: string) => (s.length > 16 ? `${s.slice(0, 16)}…` : s)

  const isKeyActive = (kind: 'global' | 'thailand', id: number) => {
    if (activeSourceFilterKeys == null) return true
    return activeSourceFilterKeys.has(riskSourceFilterKey(kind, id))
  }

  return (
    <div className="mt-1 flex flex-wrap gap-0.5">
      {globalIds.map((id) => {
        const name = maps.global.get(id) ?? `#${id}`
        const active = isKeyActive('global', id)
        return (
          <Tippy key={`g-${id}`} content={`ต่างประเทศ: ${name}`}>
            <span
              className={`inline-flex max-w-[7rem] items-center gap-1 cursor-default truncate py-0.5 text-[10px] font-medium transition-opacity ${
                active
                  ? 'text-gray-800'
                  : 'text-gray-400 opacity-50 saturate-50'
              }`}
            >
              <Lucide
                icon="Globe"
                className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-primary' : 'text-gray-300'}`}
                aria-hidden
              />
              <span className="min-w-0 truncate">{shortLabel(name)}</span>
            </span>
          </Tippy>
        )
      })}
      {thailandIds.map((id) => {
        const name = maps.thailand.get(id) ?? `#${id}`
        const active = isKeyActive('thailand', id)
        const otp =
          id === THAILAND_RISK_SOURCE_OTP_ID && thailandOtpProjects && thailandOtpProjects.length > 0
            ? thailandOtpProjects
            : undefined
        const thaiChipClass = active
          ? 'border-emerald-200/80 bg-emerald-50 text-emerald-900'
          : 'border-gray-200 bg-gray-100 text-gray-400 opacity-50'
        if (otp) {
          const html = buildThailandOtpTooltipHtml(otp, `ไทย: ${name}`)
          return (
            <Tippy
              key={`t-${id}`}
              as="span"
              content={html}
              className="inline-flex max-w-[7rem] cursor-default"
              options={THAILAND_OTP_TIPPY_OPTIONS}
            >
              <span
                className={`inline-flex max-w-[7rem] items-center gap-0.5 cursor-default truncate rounded border pl-0.5 pr-1 py-0.5 text-[10px] font-medium transition-opacity ${thaiChipClass}`}
              >
                <img
                  src={THAI_FLAG_ICON_SRC}
                  alt=""
                  width={12}
                  height={12}
                  className={`h-3 w-3 shrink-0 object-contain ${active ? '' : 'opacity-50 grayscale'}`}
                />
                <span className="min-w-0 truncate">{shortLabel(name)}</span>
              </span>
            </Tippy>
          )
        }
        return (
          <Tippy key={`t-${id}`} content={`ไทย: ${name}`}>
            <span
              className={`inline-flex max-w-[7rem] items-center gap-0.5 cursor-default truncate rounded border pl-0.5 pr-1 py-0.5 text-[10px] font-medium transition-opacity ${thaiChipClass}`}
            >
              <img
                src={THAI_FLAG_ICON_SRC}
                alt=""
                width={12}
                height={12}
                className={`h-3 w-3 shrink-0 object-contain ${active ? '' : 'opacity-50 grayscale'}`}
              />
              <span className="min-w-0 truncate">{shortLabel(name)}</span>
            </span>
          </Tippy>
        )
      })}
    </div>
  )
}

/** Single heat map table - compact (small) or full size. Exported for use in Matrix category popup. */
export function HeatMapTable({
  item,
  categoryById,
  factorById,
  compact,
  maxValue: _maxValue,
  onCellClick,
  showColorLegend = false,
  riskSourceMaps,
  /** Partial matrix source filter: fade tags under factors that are not in this set. Omit when all sources selected. */
  activeSourceFilterKeys,
}: {
  item: HeatmapRiskItem
  categoryById: Map<string, RiskCategory>
  factorById: Map<string, RiskFactor>
  compact: boolean
  maxValue: number
  onCellClick?: () => void
  /** When true and `riskSourceMaps` is set, shows G/T tag legend under the table. */
  showColorLegend?: boolean
  riskSourceMaps?: RiskSourceMaps
  activeSourceFilterKeys?: ReadonlySet<string> | null
}) {
  const categoryIdKey = String(item.riskCategoryId)
  const category = categoryById.get(item.riskCategoryId as string) ?? categoryById.get(categoryIdKey)
  const categoryDisplayName = category ? formatRiskCategoryLabel(category) : ''
  const title = categoryDisplayName || categoryIdKey
  const phases = item.phaseList ?? []
  const allFactorIdsRaw = Array.from(
    new Set(phases.flatMap((p) => (p.riskFactors ?? []).map((r) => r.id)))
  )
  const allFactorIds = Array.from(new Set(allFactorIdsRaw.map((id) => normalizeFactorId(id)))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  )
  const sourceByFactorId = new Map<
    string,
    { global: number[]; thailand: number[]; thailandOtpProjects?: ThailandOtpProjectRef[] }
  >()
  phases.forEach((phase) => {
    phase.riskFactors?.forEach((rf) => {
      const id = normalizeFactorId(rf.id)
      const g = rf.sourceGlobal ?? []
      const th = rf.sourceThailand ?? []
      const otp = rf.thailandOtpProjects
      const hasAny = g.length > 0 || th.length > 0 || (otp?.length ?? 0) > 0
      if (!hasAny) return

      const prev = sourceByFactorId.get(id)
      if (!prev) {
        sourceByFactorId.set(id, {
          global: [...g],
          thailand: [...th],
          thailandOtpProjects: otp?.length ? [...otp] : undefined,
        })
        return
      }
      const prevOtpLen = prev.thailandOtpProjects?.length ?? 0
      if ((otp?.length ?? 0) > prevOtpLen) {
        sourceByFactorId.set(id, {
          ...prev,
          thailandOtpProjects: otp?.length ? [...otp] : prev.thailandOtpProjects,
        })
      }
    })
  })
  const valueByKey = new Map<string, number>()
  phases.forEach((phase) => {
    (phase.riskFactors ?? []).forEach((rf) => {
      valueByKey.set(`${phase.phase}:${normalizeFactorId(rf.id)}`, rf.value)
    })
  })

  const factorIds = compact ? allFactorIds.slice(0, 15) : allFactorIds

  // Lite/compact: overview per phase — "Found in N projects" only
  const phaseOverview = phases.map((p) => {
    const factorsInPhase = (p.riskFactors ?? []).map((rf) => ({
      id: normalizeFactorId(rf.id),
      value: rf.value,
    }))
    const totalInPhase = factorsInPhase.length
    return { phase: p.phase, totalInPhase }
  })

  const compactOverview = (
    <div className="space-y-1 text-xs">
      {phaseOverview.map(({ phase, totalInPhase }) => (
        <div key={phase} className="border-b border-gray-100 py-1 last:border-0 last:pb-0">
          <p className="font-medium text-gray-800 leading-tight">
            {getPhaseLabel(phase)}: {totalInPhase} ปัจจัย
          </p>
        </div>
      ))}
    </div>
  )

  // Full table: rows = risk factors (full name), columns = phases
  const fullCellPx = 28
  const fullTable = (
    <table className="border-collapse text-sm">
      <colgroup>
        <col style={{ minWidth: 240, maxWidth: 360 }} />
        {phases.map((p) => (
          <col key={p.phase} style={{ width: fullCellPx }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left text-gray-700 text-xs">
            ปัจจัยเสี่ยง/เฟสโครงการ
          </th>
          {phases.map((p) => (
            <th
              key={p.phase}
              className={PHASE_TABLE_HEADER_TH_CLASS}
              style={{ width: fullCellPx, minWidth: fullCellPx }}
            >
              {getPhaseLabel(p.phase)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {factorIds.map((factorId) => {
          const factor = factorById.get(factorId)
          const factorName = factor
            ? formatRiskFactorLabel(factor)
            : toRiskFactorCode(factorId)
          const src = sourceByFactorId.get(factorId)
          return (
            <tr key={factorId}>
              <td
                className="border border-gray-300 px-2 py-1.5 text-gray-800 bg-white text-xs max-w-[360px] align-top"
                style={{ minWidth: 240 }}
                title={factorName}
              >
                <div className="font-medium text-gray-900 leading-snug">{factorName}</div>
                {riskSourceMaps &&
                  src &&
                  (src.global.length > 0 || src.thailand.length > 0 || (src.thailandOtpProjects?.length ?? 0) > 0) && (
                    <SourceBadgesRow
                      globalIds={src.global}
                      thailandIds={src.thailand}
                      thailandOtpProjects={src.thailandOtpProjects}
                      maps={riskSourceMaps}
                      activeSourceFilterKeys={activeSourceFilterKeys}
                    />
                  )}
              </td>
              {phases.map((p) => {
                const value = valueByKey.get(`${p.phase}:${factorId}`) ?? 0
                const present = value > 0
                const rfForCell = p.riskFactors?.find((r) => normalizeFactorId(r.id) === factorId)
                let cellTip = `${factorName} · ${getPhaseLabel(p.phase)}`
                if (present) {
                  cellTip += `\nการอ้างอิง (จำนวนแหล่งรวม): ${value}`
                  if (
                    riskSourceMaps &&
                    rfForCell &&
                    (rfForCell.sourceGlobal?.length || rfForCell.sourceThailand?.length)
                  ) {
                    const srcTxt = formatRiskSourcePlainText(
                      rfForCell.sourceGlobal ?? [],
                      rfForCell.sourceThailand ?? [],
                      riskSourceMaps
                    )
                    if (srcTxt) cellTip += `\n\n${srcTxt}`
                  }
                  if (rfForCell?.thailandOtpProjects?.length) {
                    cellTip += `\n\nโครงการ (แหล่งไทย OTP):\n${rfForCell.thailandOtpProjects.map((p) => p.title).join('\n')}`
                  }
                } else {
                  cellTip += ': ไม่มี'
                }
                return (
                  <td
                    key={p.phase}
                    className="border border-gray-300 p-0 align-middle bg-white"
                    style={{ width: fullCellPx, height: fullCellPx }}
                  >
                    <Tippy content={cellTip}>
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        <PhaseMatrixRiskMark present={present} />
                      </div>
                    </Tippy>
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  if (compact) {
    return (
      <button
        type="button"
        onClick={onCellClick}
        className="box p-3 w-full h-full min-h-0 text-left rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex flex-col items-stretch"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate pr-6 flex-shrink-0" title={title}>
          {title}
        </h3>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{compactOverview}</div>
        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
          <Lucide icon="Expand" className="w-3.5 h-3.5" />
          Click to view full heat map
        </p>
      </button>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">{fullTable}</div>
      </div>
      {showColorLegend && riskSourceMaps && (
        <div className="mt-3 text-xs text-gray-500">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>แท็กแหล่งอ้างอิงใต้ชื่อปัจจัย:</span>
            <span className="inline-flex items-center gap-1">
              <Lucide icon="Globe" className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              ต่างประเทศ
            </span>
            <span className="text-gray-400">·</span>
            <span className="inline-flex items-center gap-1">
              <img
                src={THAI_FLAG_ICON_SRC}
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0 object-contain"
              />
              ไทย
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default function RiskHeatmap({ heatmapRisk, riskCategory, riskFactor, riskSourceMaps }: RiskHeatmapProps) {
  const [selectedItem, setSelectedItem] = useState<HeatmapRiskItem | null>(null)
  const categoryById = new Map<string, RiskCategory>()
  riskCategory.forEach((c, i) => {
    // Map by canonical risk category code ("C01", "C02", ...) and by numeric index as fallback
    const codeKey = `C${String(c.id).padStart(2, '0')}`
    categoryById.set(codeKey, c)
    if (c.code) {
      categoryById.set(c.code, c)
    }
    categoryById.set(String(i + 1), c)
  })
  // Map factors by canonical code (F001, …) so they match heatmapRisk IDs
  const factorById = new Map<string, RiskFactor>(
    riskFactor.map((f) => [toRiskFactorCode(f.id), f])
  )

  // Find global max value across all cells to drive gradient intensity
  const allValues: number[] = []
  heatmapRisk.forEach(item => {
    item.phaseList?.forEach(phase => {
      phase.riskFactors?.forEach(rf => {
        if (typeof rf.value === 'number') {
          allValues.push(rf.value)
        }
      })
    })
  })
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0

  return (
    <>
      {/* Compact grid: 2 heat maps per row; equal height cards, title stuck at top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heatmapRisk.map((item) => (
          <HeatMapTable
            key={item.riskCategoryId}
            item={item}
            categoryById={categoryById}
            factorById={factorById}
            compact
            maxValue={maxValue}
            onCellClick={() => setSelectedItem(item)}
            riskSourceMaps={riskSourceMaps}
          />
        ))}
      </div>

      {/* Full-size modal when a heat map is clicked */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="risk-heatmap-modal-title"
        >
          <div className="bg-white rounded-xl shadow-xl w-max max-w-[90vw] max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 id="risk-heatmap-modal-title" className="text-lg font-semibold text-gray-900">
                {(() => {
                  const c =
                    categoryById.get(String(selectedItem.riskCategoryId)) ??
                    categoryById.get(selectedItem.riskCategoryId as string)
                  return c ? formatRiskCategoryLabel(c) : String(selectedItem.riskCategoryId)
                })()}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close"
              >
                <Lucide icon="X" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <HeatMapTable
                item={selectedItem}
                categoryById={categoryById}
                factorById={factorById}
                compact={false}
                maxValue={maxValue}
                showColorLegend={Boolean(riskSourceMaps)}
                riskSourceMaps={riskSourceMaps}
              />
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label="Close overlay"
            onClick={() => setSelectedItem(null)}
          />
        </div>
      )}
    </>
  )
}
