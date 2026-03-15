'use client'

import { useState } from 'react'
import Tippy from '@/components/Base/Tippy'
import Lucide from '@/components/Base/Lucide'
import type { HeatmapRiskItem } from '@/lib/mockHeatmapData'
import type { RiskCategory, RiskFactor } from '@/app/hooks/useInfo'

/** Value 0 = transparent; value > 0 = gradient from light to dark (blue scale). */
function getGradientColor(value: number, maxValue: number): string {
  if (value <= 0) return 'transparent'
  const safeMax = maxValue > 0 ? maxValue : 1
  const clamped = Math.min(value, safeMax)
  const t = clamped / safeMax // 0..1: lightest at smallest positive, darkest at max
  const r = Math.round(219 + (30 - 219) * t)
  const g = Math.round(234 + (64 - 234) * t)
  const b = Math.round(254 + (175 - 254) * t)
  return `rgb(${r},${g},${b})`
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

/** Normalize factor id from API (numeric 1, 2, ... or string "F01") to "F01" for lookup in riskFactor. */
function normalizeFactorId(id: string | number): string {
  const s = String(id)
  if (/^F\d+$/i.test(s)) return s
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? s : `F${String(n).padStart(2, '0')}`
}

interface RiskHeatmapProps {
  heatmapRisk: HeatmapRiskItem[]
  riskCategory: RiskCategory[]
  riskFactor: RiskFactor[]
}

/** Single heat map table - compact (small) or full size */
function HeatMapTable({
  item,
  categoryById,
  factorById,
  compact,
  maxValue,
  onCellClick,
}: {
  item: HeatmapRiskItem
  categoryById: Map<string, RiskCategory>
  factorById: Map<string, RiskFactor>
  compact: boolean
  maxValue: number
  onCellClick?: () => void
}) {
  const categoryIdKey = String(item.riskCategoryId)
  const category = categoryById.get(item.riskCategoryId as string) ?? categoryById.get(categoryIdKey)
  const title = category?.name ?? categoryIdKey
  const phases = item.phaseList ?? []
  const allFactorIdsRaw = Array.from(
    new Set(phases.flatMap((p) => (p.riskFactors ?? []).map((r) => r.id)))
  )
  const allFactorIds = allFactorIdsRaw
    .map((id) => normalizeFactorId(id))
    .filter((id) => factorById.has(id))
  const valueByKey = new Map<string, number>()
  phases.forEach((phase) => {
    (phase.riskFactors ?? []).forEach((rf) => {
      valueByKey.set(`${phase.phase}:${normalizeFactorId(rf.id)}`, rf.value)
    })
  })

  const factorIds = compact ? allFactorIds.slice(0, 15) : allFactorIds

  // Lite/compact: overview per phase — "Found in N projects" only
  const phaseOverview = phases.map((p) => {
    const factorsInPhase = (p.riskFactors ?? [])
      .map((rf) => ({ id: normalizeFactorId(rf.id), value: rf.value }))
      .filter(({ id }) => factorById.has(id))
    const totalInPhase = factorsInPhase.reduce((sum, { value }) => sum + value, 0)
    return { phase: p.phase, totalInPhase }
  })

  const compactOverview = (
    <div className="space-y-1 text-xs">
      {phaseOverview.map(({ phase, totalInPhase }) => (
        <div key={phase} className="border-b border-gray-100 py-1 last:border-0 last:pb-0">
          <p className="font-medium text-gray-800 leading-tight">
            {getPhaseLabel(phase)}: found in {totalInPhase} project{totalInPhase !== 1 ? 's' : ''}
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
        <col style={{ minWidth: 200, maxWidth: 320 }} />
        {phases.map((p) => (
          <col key={p.phase} style={{ width: fullCellPx }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left text-gray-700 text-xs">
            Risk factor
          </th>
          {phases.map((p) => (
            <th
              key={p.phase}
              className="border border-gray-300 bg-gray-50 px-2 py-2 text-center text-gray-700 text-xs"
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
          const factorName = factor?.name ?? factorId
          return (
            <tr key={factorId}>
              <td
                className="border border-gray-300 px-2 py-1.5 text-gray-800 bg-white text-xs max-w-[320px]"
                title={factorName}
              >
                {factorName}
              </td>
              {phases.map((p) => {
                const value = valueByKey.get(`${p.phase}:${factorId}`) ?? 0
                const bg = getGradientColor(value, maxValue)
                return (
                  <td
                    key={p.phase}
                    className="border border-gray-300 p-0 align-middle"
                    style={{ width: fullCellPx, height: fullCellPx }}
                  >
                    <Tippy content={`${factorName} · ${getPhaseLabel(p.phase)}: ${value}`}>
                      <div
                        className="w-full h-full flex items-center justify-center font-medium text-gray-800 text-xs"
                        style={{ backgroundColor: bg }}
                      >
                        {value > 0 ? value : ''}
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
      {/* <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{title}</h3> */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">{fullTable}</div>
      </div>
      <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-600">
        <span className="text-gray-600">พบความเสี่ยงน้อย</span>
        <span className="inline-flex items-center gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const v = Math.round(maxValue * f)
            return (
              <span
                key={v}
                className="w-5 h-4 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: getGradientColor(v, maxValue) }}
                title={String(v)}
              />
            )
          })}
        </span>
        <span className="text-gray-600">พบความเสี่ยงมาก</span>
      </div>
    </div>
  )
}

export default function RiskHeatmap({ heatmapRisk, riskCategory, riskFactor }: RiskHeatmapProps) {
  const [selectedItem, setSelectedItem] = useState<HeatmapRiskItem | null>(null)
  const categoryById = new Map<string, RiskCategory>()
  riskCategory.forEach((c, i) => {
    categoryById.set(c.id, c)
    categoryById.set(String(i + 1), c)
  })
  const factorById = new Map(riskFactor.map((f) => [f.id, f]))

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
                {categoryById.get(String(selectedItem.riskCategoryId))?.name ?? categoryById.get(selectedItem.riskCategoryId as string)?.name ?? String(selectedItem.riskCategoryId)}
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
