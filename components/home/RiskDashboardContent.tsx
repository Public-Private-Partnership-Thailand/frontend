'use client'

import { useEffect, useMemo, useRef, useState, type ComponentProps, type RefObject } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar } from 'react-chartjs-2'
import { CHART, getColor, chartBarDataset, chartHeatmapCellColor } from '@/lib/utils/colors'
import Lucide from '@/components/Base/Lucide'
import Tippy from '@/components/Base/Tippy'
import { HeatMapTable, PhaseMatrixRiskMark } from '@/components/RiskHeatmap'
import type { HeatmapPhaseRiskFactor, HeatmapRiskItem } from '@/lib/mockHeatmapData'
import {
  type InfoData,
  type RiskCategory,
  type RiskFactor,
  formatRiskCategoryLabel,
} from '@/app/hooks/useInfo'
import { toRiskFactorCode, toRiskCategoryCode } from '@/lib/normalizeHeatmapRisk'
import { getIconNameByGroupName } from '@/app/hooks/useSummary'
import type { RiskApiData } from '@/app/hooks/useRisk'
import {
  aggregateSourceIdsForPhase,
  buildMatrixPhaseCellTooltip,
  factorMatchesRiskSourceFilter,
  normalizeHeatmapFactorPhaseEntry,
  riskSourceFilterKey,
  THAILAND_RISK_SOURCE_OTP_ID,
  type RiskSourceMaps,
} from '@/lib/heatmapRiskPhaseUtils'
import PastPppThailandRiskSection from '@/components/home/PastPppThailandRiskSection'
import RiskSourceReferencesSection from '@/components/home/RiskSourceReferencesSection'
import { hexColorForRiskCategoryId } from '@/lib/riskCategoryColors'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels)

/** Same as ภาพรวมความเสี่ยงทั่วไป — matrix filter / legend use these for Global vs Thailand */
const THAI_FLAG_ICON_SRC = '/assets/icons/thai_flag.png'
const MATRIX_PHASE_KEYS = ['pre-construction', 'construction', 'operation'] as const
type MatrixPhaseKey = (typeof MATRIX_PHASE_KEYS)[number]
const MATRIX_PHASE_TITLES: Record<MatrixPhaseKey, string> = {
  'pre-construction': 'Pre-construction',
  construction: 'Construction',
  operation: 'Operation',
}
const RISK_FACTOR_RANK_TOP_PREVIEW = 5
const RISK_FACTOR_RANK_TOP_MAX = 10

function chunkLabelForBar(text: string, maxCharsPerLine: number): string[] {
  const trimmed = text.trim()
  if (!trimmed) return ['']
  if (trimmed.length <= maxCharsPerLine) return [trimmed]

  const hasSpaces = /\s/.test(trimmed)
  if (!hasSpaces) {
    const lines: string[] = []
    for (let i = 0; i < trimmed.length; i += maxCharsPerLine) {
      lines.push(trimmed.slice(i, i + maxCharsPerLine))
    }
    return lines
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  const pushWordTooLong = (word: string) => {
    let rest = word
    while (rest.length > maxCharsPerLine) {
      lines.push(rest.slice(0, maxCharsPerLine))
      rest = rest.slice(maxCharsPerLine)
    }
    return rest
  }

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current)
        current = ''
      }
      current = pushWordTooLong(word)
      continue
    }
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCharsPerLine) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

const PIE_LIKE_COLOR_KEYS = ['primary', 'pending', 'warning', 'success', 'danger', 'info'] as const

function getPieLikeCategoryColorByIndex(index: number): string {
  const key = PIE_LIKE_COLOR_KEYS[index % PIE_LIKE_COLOR_KEYS.length]
  const cycle = Math.floor(index / PIE_LIKE_COLOR_KEYS.length)
  // Keep the same palette feel as home pie chart, slightly softer on later cycles.
  const opacity = Math.max(0.52, CHART.pieSlice - cycle * 0.08)
  return getColor(key, opacity)
}

type MatrixSourceFilterModeState =
  | { kind: 'all_selected' }
  | { kind: 'none_selected' }
  | { kind: 'partial'; keys: Set<string> }

function MatrixRiskSourceFilterPanel({
  rs,
  matrixSourceFilterKeys,
  matrixSourceFilterMode,
  selectAllInputRef,
  toggleMatrixSelectAllSources,
  toggleMatrixSourceFilterKey,
  onClearFilters,
  className = '',
  helpVariant = 'full',
}: {
  rs: NonNullable<InfoData['riskSource']>
  matrixSourceFilterKeys: string[]
  matrixSourceFilterMode: MatrixSourceFilterModeState
  selectAllInputRef: RefObject<HTMLInputElement>
  toggleMatrixSelectAllSources: () => void
  toggleMatrixSourceFilterKey: (key: string) => void
  onClearFilters: () => void
  className?: string
  helpVariant?: 'full' | 'short'
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-slate-50 px-4 py-3 text-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          <span className="font-medium text-gray-800 shrink-0">กรองตามแหล่งที่มาของข้อมูล</span>
          <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50">
            <input
              ref={selectAllInputRef}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              checked={matrixSourceFilterMode.kind === 'all_selected'}
              onChange={toggleMatrixSelectAllSources}
              aria-label="เลือกแหล่งอ้างอิงทั้งหมด"
            />
            <span>เลือกทั้งหมด</span>
          </label>
        </div>
        {matrixSourceFilterKeys.length > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>
      {helpVariant === 'full' ? (
        <p className="text-xs text-gray-500 mb-3">

        </p>
      ) : (
        <p className="text-xs text-gray-500 mb-3">

        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
        {rs.global && rs.global.length > 0 && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Lucide icon="Globe" className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>ต่างประเทศ</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {rs.global.map((s) => {
                const key = riskSourceFilterKey('global', s.id)
                const checked = matrixSourceFilterKeys.includes(key)
                return (
                  <label
                    key={key}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                      checked
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-950'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={() => toggleMatrixSourceFilterKey(key)}
                    />
                    <span className="leading-tight">{s.value}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
        {rs.thailand && rs.thailand.length > 0 && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-2">
              <img
                src={THAI_FLAG_ICON_SRC}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 shrink-0 object-contain"
              />
              <span>ไทย</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {rs.thailand.map((s) => {
                const key = riskSourceFilterKey('thailand', s.id)
                const checked = matrixSourceFilterKeys.includes(key)
                return (
                  <label
                    key={key}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                      checked
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={checked}
                      onChange={() => toggleMatrixSourceFilterKey(key)}
                    />
                    <span className="leading-tight">{s.value}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function mapIconName(iconName: string): string {
  const iconMap: Record<string, string> = {
    'transport_road.png': '01_transport.road.png',
    'transport_rail.png': '02_transport.rail.png',
    'transport_air.png': '03_transport.air.png',
    'transport_water.png': '04_transport.water.png',
    'waterAndWaste.png': '05_waterAndWaste.png',
    'energy.png': '06_energy.png',
    'communications.png': '07_communications.png',
    'health.png': '08_health.png',
    'education.png': '09_education.png',
    'socialHousing.png': '10_socialHousing.png',
    'cultureSportsAndRecreation.png': '11_cultureSportsAndRecreation.png',
    'others.png': '12_others.png',
  }
  if (
    iconName.startsWith('01_') ||
    iconName.startsWith('02_') ||
    iconName.startsWith('03_') ||
    iconName.startsWith('04_') ||
    iconName.startsWith('05_') ||
    iconName.startsWith('06_') ||
    iconName.startsWith('07_') ||
    iconName.startsWith('08_') ||
    iconName.startsWith('09_') ||
    iconName.startsWith('10_') ||
    iconName.startsWith('11_') ||
    iconName.startsWith('12_')
  ) {
    return iconName
  }
  return iconMap[iconName] || iconName
}

function escapeHtmlForTooltip(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const GENERAL_RISK_LABELS = {
  foreign: 'แหล่งที่มาของข้อมูลจากต่างประเทศ',
  thailand: 'แหล่งที่มาข้อมูลจากไทย',
} as const

type GeneralRiskAccent = keyof typeof GENERAL_RISK_LABELS

/** Matches home overview stat cards: `col-span-12 sm:col-span-6 xl:col-span-3`, `p-5 box`, icon + metric + slate label */
function GeneralRiskOverviewCard({
  accent,
  sourceReferenceCount,
  sourceNames,
}: {
  accent: GeneralRiskAccent
  /** จาก `info.riskSource.global` หรือ `info.riskSource.thailand` — จำนวนรายการในอาร์เรย์ */
  sourceReferenceCount: number
  /** ชื่อแหล่งอ้างอิงทั้งหมดในกลุ่มนี้ (แสดงเมื่อ hover) */
  sourceNames: string[]
}) {
  const label = GENERAL_RISK_LABELS[accent]
  const tooltipContent = useMemo(() => {
    const safeTitle = escapeHtmlForTooltip(label)
    if (sourceNames.length === 0) {
      return `<div class="text-left text-sm max-w-xs"><div class="font-semibold">${safeTitle}</div><p class="mt-1.5 text-gray-500">ยังไม่มีรายการแหล่งอ้างอิง</p></div>`
    }
    const items = sourceNames
      .map((n) => `<li class="text-sm leading-snug pl-0.5">${escapeHtmlForTooltip(n)}</li>`)
      .join('')
    return `<div class="text-left text-sm max-w-sm"><div class="font-semibold mb-1.5">${safeTitle}</div><ul class="list-disc pl-4 space-y-1">${items}</ul></div>`
  }, [label, sourceNames])

  return (
    <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
      <div className="relative zoom-in h-full">
        <Tippy
          as="div"
          className="block h-full w-full !cursor-default"
          content={tooltipContent}
          options={{
            allowHTML: true,
            maxWidth: 380,
            placement: 'top-start',
          }}
        >
          <div className="p-5 box h-full">
            <div className="flex">
              {accent === 'foreign' ? (
                <Lucide icon="Globe" className="w-[28px] h-[28px] text-primary" />
              ) : (
                <img
                  src={THAI_FLAG_ICON_SRC}
                  alt="ธงไทย"
                  width={28}
                  height={28}
                  className="w-[28px] h-[28px] object-contain shrink-0"
                />
              )}
            </div>
            <div className="mt-6 text-3xl font-medium leading-8 tabular-nums">
              {sourceReferenceCount.toLocaleString('th-TH')}
            </div>
            <div className="mt-1 text-base text-slate-500">{label}</div>
          </div>
        </Tippy>
      </div>
    </div>
  )
}

function RiskSummaryCountCard({
  icon,
  label,
  count,
}: {
  icon: ComponentProps<typeof Lucide>['icon']
  label: string
  count: number
}) {
  return (
    <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
      <div className="relative zoom-in h-full">
        <div className="p-5 box h-full">
          <div className="flex">
            <Lucide icon={icon} className="w-[28px] h-[28px] text-primary" />
          </div>
          <div className="mt-6 text-3xl font-medium leading-8 tabular-nums">
            {count.toLocaleString('th-TH')}
          </div>
          <div className="mt-1 text-base text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

export type RiskDashboardContentProps = {
  infoData?: InfoData
  riskData?: RiskApiData
}

export default function RiskDashboardContent({ infoData, riskData }: RiskDashboardContentProps) {
  const [sectorRiskHeatmapExpanded, setSectorRiskHeatmapExpanded] = useState(false)
  const [showTop10RiskFactors, setShowTop10RiskFactors] = useState(false)
  const [matrixSourceFilterKeys, setMatrixSourceFilterKeys] = useState<string[]>([])
  const [selectedMatrixCategoryId, setSelectedMatrixCategoryId] = useState<string | null>(null)
  const matrixSourceFilterDefaultedRef = useRef(false)
  const matrixSelectAllInputRef = useRef<HTMLInputElement>(null)
  const matrixSelectAllModalInputRef = useRef<HTMLInputElement>(null)

  const safeInfoData =
    infoData ?? {
      sector: [],
      ministry: [],
      contractType: [],
      projectType: [],
      concessionForm: [],
      riskCategory: [],
      riskFactor: [],
      riskSource: undefined,
    }

  const riskSourceMaps: RiskSourceMaps = useMemo(() => {
    const global = new Map<number, string>()
    const thailand = new Map<number, string>()
    safeInfoData.riskSource?.global?.forEach((x) => global.set(x.id, x.value))
    safeInfoData.riskSource?.thailand?.forEach((x) => thailand.set(x.id, x.value))
    return { global, thailand }
  }, [safeInfoData.riskSource])

  const matrixSourceFilterSet = useMemo(() => new Set(matrixSourceFilterKeys), [matrixSourceFilterKeys])

  const allMatrixSourceKeys = useMemo(() => {
    const keys: string[] = []
    for (const s of safeInfoData.riskSource?.global ?? []) {
      keys.push(riskSourceFilterKey('global', s.id))
    }
    for (const s of safeInfoData.riskSource?.thailand ?? []) {
      keys.push(riskSourceFilterKey('thailand', s.id))
    }
    return keys.sort()
  }, [safeInfoData.riskSource])

  /**
   * - `none_selected`: user cleared all checkboxes → matrix / modal show no factors.
   * - `all_selected`: every source checked (or no sources in info) → same as unfiltered.
   * - `partial`: OR-filter by selected keys.
   */
  const matrixSourceFilterMode = useMemo(() => {
    if (allMatrixSourceKeys.length === 0) {
      return { kind: 'all_selected' as const }
    }
    if (matrixSourceFilterSet.size === 0) {
      return { kind: 'none_selected' as const }
    }
    if (
      matrixSourceFilterSet.size === allMatrixSourceKeys.length &&
      allMatrixSourceKeys.every((k) => matrixSourceFilterSet.has(k))
    ) {
      return { kind: 'all_selected' as const }
    }
    return { kind: 'partial' as const, keys: matrixSourceFilterSet }
  }, [matrixSourceFilterSet, allMatrixSourceKeys])

  useEffect(() => {
    const partial = matrixSourceFilterMode.kind === 'partial'
    for (const ref of [matrixSelectAllInputRef, matrixSelectAllModalInputRef]) {
      const el = ref.current
      if (el) el.indeterminate = partial
    }
  }, [matrixSourceFilterMode])

  const aggregateSourcesForMatrixPhase = (
    factorPhases: Record<string, unknown> | undefined,
    phase: string
  ) => {
    if (matrixSourceFilterMode.kind === 'none_selected') {
      return { global: [] as number[], thailand: [] as number[] }
    }
    if (matrixSourceFilterMode.kind === 'all_selected') {
      return aggregateSourceIdsForPhase(factorPhases, phase, null)
    }
    return aggregateSourceIdsForPhase(factorPhases, phase, matrixSourceFilterMode.keys)
  }

  useEffect(() => {
    if (matrixSourceFilterDefaultedRef.current) return
    if (allMatrixSourceKeys.length === 0) return
    setMatrixSourceFilterKeys([...allMatrixSourceKeys])
    matrixSourceFilterDefaultedRef.current = true
  }, [allMatrixSourceKeys])

  const toggleMatrixSourceFilterKey = (key: string) => {
    setMatrixSourceFilterKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      return next.sort()
    })
  }

  const toggleMatrixSelectAllSources = () => {
    if (matrixSourceFilterMode.kind === 'all_selected') {
      setMatrixSourceFilterKeys([])
    } else {
      setMatrixSourceFilterKeys([...allMatrixSourceKeys])
    }
  }

  const riskCategoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    safeInfoData.riskCategory?.forEach((c) => {
      const label = formatRiskCategoryLabel(c)
      map.set(toRiskCategoryCode(c.id), label)
      map.set(String(c.id), label)
      if (c.code) {
        map.set(c.code, label)
      }
    })
    return map
  }, [safeInfoData.riskCategory])

  const riskHeatmapForMatrix = useMemo(() => {
    const riskCategory: RiskCategory[] = safeInfoData.riskCategory ?? []
    const riskFactor: RiskFactor[] = safeInfoData.riskFactor ?? []
    const heatmapRiskPhase = riskData?.heatmapRiskPhase ?? {}
    const categoryById = new Map<string, RiskCategory>()
    riskCategory.forEach((c, i) => {
      categoryById.set(toRiskCategoryCode(c.id), c)
      categoryById.set(String(c.id), c)
      if (c.code) {
        categoryById.set(c.code, c)
      }
      categoryById.set(String(i + 1), c)
    })
    const factorById = new Map<string, RiskFactor>(riskFactor.map((f) => [toRiskFactorCode(f.id), f]))
    const phaseOrder = ['pre-construction', 'construction', 'operation'] as const

    const showNone = matrixSourceFilterMode.kind === 'none_selected'
    const partialKeys =
      matrixSourceFilterMode.kind === 'partial' ? matrixSourceFilterMode.keys : null

    const getHeatmapItemByCategoryId = (categoryId: string): HeatmapRiskItem | null => {
      const factorPhases = heatmapRiskPhase[categoryId]
      if (!factorPhases || typeof factorPhases !== 'object') return null
      const phaseList = phaseOrder.map((phase) => ({
        phase,
        riskFactors: showNone
          ? []
          : Object.entries(factorPhases)
              .map(([factorId, raw]) => {
                const n = normalizeHeatmapFactorPhaseEntry(raw)
                if (!n.phases.includes(phase)) return null
                if (
                  partialKeys &&
                  !factorMatchesRiskSourceFilter(n, partialKeys)
                ) {
                  return null
                }
                const effectiveThailand = [...n.sourceThailand]
                if (n.thailandOtp.length > 0 && !effectiveThailand.includes(THAILAND_RISK_SOURCE_OTP_ID)) {
                  effectiveThailand.push(THAILAND_RISK_SOURCE_OTP_ID)
                }
                effectiveThailand.sort((a, b) => a - b)
                const value = Math.max(1, n.sourceGlobal.length + effectiveThailand.length)
                const rf: HeatmapPhaseRiskFactor = { id: factorId, value }
                if (n.sourceGlobal.length) rf.sourceGlobal = n.sourceGlobal
                if (effectiveThailand.length) rf.sourceThailand = effectiveThailand
                if (n.thailandOtp.length) rf.thailandOtpProjects = n.thailandOtp
                return rf
              })
              .filter((x): x is NonNullable<typeof x> => x != null),
      }))
      return { riskCategoryId: categoryId, phaseList }
    }

    let maxValue = 1
    if (!showNone) {
      for (const cat of Object.values(heatmapRiskPhase)) {
        if (!cat || typeof cat !== 'object') continue
        for (const entry of Object.values(cat)) {
          const n = normalizeHeatmapFactorPhaseEntry(entry)
          if (partialKeys && !factorMatchesRiskSourceFilter(n, partialKeys)) continue
          const effTh = [...n.sourceThailand]
          if (n.thailandOtp.length > 0 && !effTh.includes(THAILAND_RISK_SOURCE_OTP_ID)) {
            effTh.push(THAILAND_RISK_SOURCE_OTP_ID)
          }
          maxValue = Math.max(maxValue, 1, n.sourceGlobal.length + effTh.length)
        }
      }
    }

    return { categoryById, factorById, maxValue, getHeatmapItemByCategoryId }
  }, [
    riskData?.heatmapRiskPhase,
    safeInfoData.riskCategory,
    safeInfoData.riskFactor,
    matrixSourceFilterMode,
  ])

  const riskCategoryBarData = useMemo(() => {
    const rows = [...(riskData?.countProjectGroupByRiskCategory ?? [])].sort(
      (a, b) => b.projectCount - a.projectCount || a.riskCategoryId - b.riskCategoryId
    )
    return {
      labels: rows.map(
        (r) => riskCategoryNameById.get(String(r.riskCategoryId)) ?? String(r.riskCategoryId)
      ),
      datasets: [
        {
          label: 'จำนวนโครงการ',
          data: rows.map((r) => r.projectCount),
          ...chartBarDataset('primary'),
        },
      ],
    }
  }, [riskCategoryNameById, riskData?.countProjectGroupByRiskCategory])

  const riskCategoryBarOptions = useMemo(() => {
    const counts = (riskCategoryBarData.datasets[0]?.data as number[] | undefined) ?? []
    const maxCount = Math.max(...counts, 1)
    const useUnitStep = maxCount <= 30
    return {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { display: false } },
      scales: {
        x: {
          type: 'linear' as const,
          min: 0,
          ...(useUnitStep
            ? {
                max: maxCount + 1,
                ticks: {
                  font: { size: 11 },
                  stepSize: 1,
                  callback: (v: string | number) => `${Math.round(Number(v))}`,
                },
              }
            : {
                ticks: {
                  font: { size: 11 },
                  precision: 0,
                  maxTicksLimit: 12,
                  callback: (v: string | number) => `${Math.round(Number(v))}`,
                },
              }),
          grid: { color: getColor('slate.300', 0.3) },
        },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } },
      },
    }
  }, [riskCategoryBarData])

  const riskByPhaseStackedData = useMemo(() => {
    const phaseLabels = ['Pre-construction', 'Construction', 'Operation'] as const
    const stackedColorKeys = [
      'primary',
      'pending',
      'success',
      'info',
      'slate.500',
      'warning',
      'danger',
    ] as const

    const byPhase = riskData?.countProjectGroupByPhaseAndRiskCategory
    if (!byPhase?.length) {
      return { labels: [...phaseLabels], datasets: [] as { label: string; data: number[]; backgroundColor: string }[] }
    }

    const categoryIds = new Set<number>()
    for (const block of byPhase) {
      for (const row of block.riskCategoryList) {
        categoryIds.add(row.riskCategoryId)
      }
    }
    const sortedCategoryIds = Array.from(categoryIds).sort((a, b) => a - b)

    const datasets = sortedCategoryIds.map((categoryId, idx) => ({
      label: riskCategoryNameById.get(String(categoryId)) ?? String(categoryId),
      data: byPhase.map((block) => {
        const row = block.riskCategoryList.find((r) => r.riskCategoryId === categoryId)
        return row?.projectCount ?? 0
      }),
      backgroundColor:
        hexColorForRiskCategoryId(categoryId) ??
        getColor(stackedColorKeys[idx % stackedColorKeys.length], CHART.barFill),
    }))

    return { labels: [...phaseLabels], datasets }
  }, [riskCategoryNameById, riskData?.countProjectGroupByPhaseAndRiskCategory])

  const riskByPhaseStackedOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' as const }, datalabels: { display: false } },
      scales: {
        x: { stacked: true, ticks: { font: { size: 11 } }, grid: { display: false } },
        y: { stacked: true, ticks: { font: { size: 11 } }, grid: { color: getColor('slate.300', 0.3) } },
      },
    }),
    []
  )

  const riskSourceReferenceCounts = useMemo(
    () => ({
      global: safeInfoData.riskSource?.global?.length ?? 0,
      thailand: safeInfoData.riskSource?.thailand?.length ?? 0,
    }),
    [safeInfoData.riskSource]
  )

  const generalRiskForeignSourceNames = useMemo(
    () => safeInfoData.riskSource?.global?.map((s) => s.value) ?? [],
    [safeInfoData.riskSource?.global]
  )

  const generalRiskThailandSourceNames = useMemo(
    () => safeInfoData.riskSource?.thailand?.map((s) => s.value) ?? [],
    [safeInfoData.riskSource?.thailand]
  )

  const savedProjectCount = useMemo(
    () =>
      (riskData?.riskSectorWithProject ?? []).reduce((sum, row) => {
        const projectCount = Array.isArray(row.projects) ? row.projects.length : 0
        return sum + projectCount
      }, 0),
    [riskData?.riskSectorWithProject]
  )
  const riskCategoryCount = safeInfoData.riskCategory?.length ?? 0
  const riskFactorCount = safeInfoData.riskFactor?.length ?? 0

  const riskFactorByCode = useMemo(() => {
    const m = new Map<string, RiskFactor>()
    for (const f of safeInfoData.riskFactor ?? []) {
      m.set(toRiskFactorCode(f.id), f)
    }
    return m
  }, [safeInfoData.riskFactor])

  const riskCategoryColorMap = useMemo(() => {
    const m = new Map<string, string>()
    const categories = [...(safeInfoData.riskCategory ?? [])].sort((a, b) => a.id - b.id)
    categories.forEach((c, index) => {
      const fixed = hexColorForRiskCategoryId(c.id)
      m.set(toRiskCategoryCode(c.id), fixed ?? getPieLikeCategoryColorByIndex(index))
    })
    return m
  }, [safeInfoData.riskCategory])

  const riskFactorRankByPhase = useMemo(() => {
    const h = riskData?.heatmapRiskPhase
    const noSourceSelected = matrixSourceFilterMode.kind === 'none_selected'
    const activeSourceKeys =
      matrixSourceFilterMode.kind === 'partial' ? matrixSourceFilterMode.keys : null

    return MATRIX_PHASE_KEYS.map((phase) => {
      type AggRow = {
        factorId: string
        count: number
        rank: number
        label: string
        dominantCategoryId: string
        dominantCategoryLabel: string
        color: string
      }

      if (!h || typeof h !== 'object' || noSourceSelected) {
        return { phase, title: MATRIX_PHASE_TITLES[phase], rows: [] as AggRow[] }
      }

      // Count each category × factor matrix occurrence in a phase.
      const factorCounts = new Map<string, number>()
      const factorByCategoryCounts = new Map<string, Map<string, number>>()

      for (const [categoryIdRaw, factorPhases] of Object.entries(h)) {
        const categoryId = toRiskCategoryCode(categoryIdRaw)
        if (!factorPhases || typeof factorPhases !== 'object') continue
        for (const [factorIdRaw, raw] of Object.entries(factorPhases as Record<string, unknown>)) {
          const n = normalizeHeatmapFactorPhaseEntry(raw)
          if (activeSourceKeys && !factorMatchesRiskSourceFilter(n, activeSourceKeys)) continue
          if (!n.phases.includes(phase)) continue
          const factorId = toRiskFactorCode(factorIdRaw)
          factorCounts.set(factorId, (factorCounts.get(factorId) ?? 0) + 1)
          if (!factorByCategoryCounts.has(factorId)) {
            factorByCategoryCounts.set(factorId, new Map())
          }
          const byCategory = factorByCategoryCounts.get(factorId)!
          byCategory.set(categoryId, (byCategory.get(categoryId) ?? 0) + 1)
        }
      }

      const rows: AggRow[] = Array.from(factorCounts.entries()).map(([factorId, count]) => {
        const factorInfo = riskFactorByCode.get(factorId)
        const label = factorInfo
          ? (factorInfo.value ?? factorInfo.name ?? '').trim() || factorId
          : factorId
        const byCategory = factorByCategoryCounts.get(factorId) ?? new Map<string, number>()
        const sortedCategoryCounts = Array.from(byCategory.entries()).sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], undefined, { numeric: true })
        )
        const dominantCategoryId = sortedCategoryCounts[0]?.[0] ?? 'unknown'
        const dominantCategoryLabel =
          riskCategoryNameById.get(dominantCategoryId) ?? dominantCategoryId
        return {
          factorId,
          count,
          rank: 0,
          label,
          dominantCategoryId,
          dominantCategoryLabel,
          color: riskCategoryColorMap.get(dominantCategoryId) ?? getColor('slate.500', CHART.pieSlice),
        }
      })

      rows.sort((a, b) => b.count - a.count || a.factorId.localeCompare(b.factorId, undefined, { numeric: true }))
      rows.forEach((row, index) => {
        if (index === 0) {
          row.rank = 1
          return
        }
        const prev = rows[index - 1]
        row.rank = row.count === prev.count ? prev.rank : index + 1
      })

      return {
        phase,
        title: MATRIX_PHASE_TITLES[phase],
        rows: rows.slice(0, RISK_FACTOR_RANK_TOP_MAX),
      }
    })
  }, [riskData?.heatmapRiskPhase, matrixSourceFilterMode, riskCategoryNameById, riskFactorByCode, riskCategoryColorMap])

  const rankColorLegendTooltip = useMemo(() => {
    const categories = [...(safeInfoData.riskCategory ?? [])].sort((a, b) => a.id - b.id)
    if (categories.length === 0) {
      return '<div class="text-sm text-gray-700">ไม่มีข้อมูล Risk Category</div>'
    }
    const items = categories
      .map((c) => {
        const categoryId = toRiskCategoryCode(c.id)
        const label = formatRiskCategoryLabel(c)
        const color = riskCategoryColorMap.get(categoryId) ?? getColor('slate.500', CHART.pieSlice)
        return `<li class="flex min-w-0 items-center gap-2 text-xs leading-5"><span class="inline-block h-3 w-3 shrink-0 rounded-sm border border-gray-300" style="background:${color}"></span><span class="min-w-0 break-words">${escapeHtmlForTooltip(label)}</span></li>`
      })
      .join('')
    return `<div class="text-left w-[min(88vw,520px)] min-w-[320px] max-w-[520px] p-1"><p class="text-xs font-semibold mb-2">สีของกลุ่มความเสี่ยง</p><ul class="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1.5 p-0 py-1 pr-2 max-h-[min(72vh,620px)] overflow-y-auto overscroll-contain">${items}</ul></div>`
  }, [safeInfoData.riskCategory, riskCategoryColorMap])

  const rankColorLegendTippyOptions = useMemo(
    () => ({
      allowHTML: true,
      maxWidth: 520,
      placement: 'right-start' as const,
      interactive: true,
      interactiveBorder: 24,
      appendTo: () => document.body,
    }),
    []
  )

  const riskCategoryMatrixData = useMemo(() => {
    const h = riskData?.heatmapRiskPhase
    if (!h || typeof h !== 'object') return []
    const showNone = matrixSourceFilterMode.kind === 'none_selected'
    const partialKeys =
      matrixSourceFilterMode.kind === 'partial' ? matrixSourceFilterMode.keys : null
    return Object.entries(h)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([categoryId, factorPhases]) => {
        if (showNone) {
          return { categoryId, preConstruction: 0, construction: 0, operation: 0 }
        }
        const entries = Object.values(factorPhases as Record<string, unknown>)
        let preConstruction = 0
        let construction = 0
        let operation = 0
        for (const entry of entries) {
          const n = normalizeHeatmapFactorPhaseEntry(entry)
          if (partialKeys && !factorMatchesRiskSourceFilter(n, partialKeys)) continue
          if (n.phases.includes('pre-construction')) preConstruction++
          if (n.phases.includes('construction')) construction++
          if (n.phases.includes('operation')) operation++
        }
        return { categoryId, preConstruction, construction, operation }
      })
  }, [riskData?.heatmapRiskPhase, matrixSourceFilterMode])

  return (
    <div className="contents">
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">ภาพรวมความเสี่ยง</h2>
        </div>
        <div className="grid grid-cols-12 gap-6 auto-rows-fr">
          <RiskSummaryCountCard
            icon="FolderCheck"
            label="จำนวนโครงการที่พบความเสี่ยง"
            count={savedProjectCount}
          />
          <RiskSummaryCountCard
            icon="LayoutList"
            label="จำนวนกลุ่มความเสี่ยง"
            count={riskCategoryCount}
          />
          <RiskSummaryCountCard
            icon="ShieldAlert"
            label="จำนวนปัจจัยเสี่ยง"
            count={riskFactorCount}
          />
        </div>
        <div className="mt-6 grid grid-cols-12 gap-6 auto-rows-fr">
          <GeneralRiskOverviewCard
            accent="foreign"
            sourceReferenceCount={riskSourceReferenceCounts.global}
            sourceNames={generalRiskForeignSourceNames}
          />
          <GeneralRiskOverviewCard
            accent="thailand"
            sourceReferenceCount={riskSourceReferenceCounts.thailand}
            sourceNames={generalRiskThailandSourceNames}
          />
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              ปัจจัยเสี่ยงที่พบบ่อยที่สุด {showTop10RiskFactors ? '10' : '5'} อันดับแรก แยกตามเฟสของโครงการ
            </h3>
            <Tippy content={rankColorLegendTooltip} options={rankColorLegendTippyOptions}>
              <button
                type="button"
                aria-label="ดู mapping สีตาม category"
                className="inline-flex items-center justify-center rounded-full text-gray-500 hover:text-primary"
              >
                <Lucide icon="Info" />
              </button>
            </Tippy>
            <button
              type="button"
              onClick={() => setShowTop10RiskFactors((v) => !v)}
              className="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              {showTop10RiskFactors ? 'แสดง 5 อันดับแรก' : 'ดูเพิ่มเติม (10 อันดับแรก)'}
            </button>
          </div>
          {/* <p className="mt-1 text-sm text-gray-500">
            ใช้ข้อมูลชุดเดียวกับ Matrix ประเภทความเสี่ยง × เฟสโครงการ และจัดอันดับแบบแชร์ลำดับเมื่อจำนวนเท่ากัน
            (ตัวอย่าง 1, 2, 2, 4)
          </p> */}
          <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
            {riskFactorRankByPhase.map((block) => {
              const visibleRows = block.rows.slice(
                0,
                showTop10RiskFactors ? RISK_FACTOR_RANK_TOP_MAX : RISK_FACTOR_RANK_TOP_PREVIEW
              )
              const maxCount = visibleRows.length > 0 ? Math.max(...visibleRows.map((r) => r.count), 1) : 1
              const chartHeight = Math.max(280, visibleRows.length * 52 + 80)
              return (
                <div key={block.phase} className="box p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{block.title}</h4>
                  <div style={{ height: chartHeight }}>
                    {visibleRows.length > 0 ? (
                      <Bar
                        data={{
                          labels: visibleRows.map((r) => `#${r.rank}`),
                          datasets: [
                            {
                              label: 'จำนวนครั้งที่เกิดขึ้นจริง',
                              data: visibleRows.map((r) => r.count),
                              backgroundColor: visibleRows.map((r) => r.color),
                              borderColor: visibleRows.map((r) => r.color),
                              borderWidth: 1,
                              categoryPercentage: 0.88,
                              barPercentage: 0.92,
                            },
                          ],
                        }}
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                          layout: { padding: { right: 8 } },
                          plugins: {
                            legend: { display: false },
                            datalabels: {
                              display: true,
                              // Horizontal bar: anchor at left edge of bar; align 'end' places label to the
                              // right of that point (inside the bar). 'center' would straddle the edge.
                              anchor: 'start',
                              align: 'end',
                              offset: 4,
                              textAlign: 'left',
                              clip: false,
                              clamp: false,
                              color: '#1f2937',
                              textStrokeColor: '#ffffff',
                              textStrokeWidth: 1,
                              font: {
                                family: 'IBM Plex Sans Thai, system-ui, sans-serif',
                                size: 10,
                                weight: 'bold' as const,
                              },
                              formatter: (_value: number, ctx) => {
                                const row = visibleRows[ctx.dataIndex]
                                if (!row) return ''
                                const narrow =
                                  maxCount > 0 && Number(ctx.dataset.data[ctx.dataIndex]) / maxCount < 0.18
                                return chunkLabelForBar(row.label, narrow ? 22 : 30)
                              },
                            },
                            tooltip: {
                              callbacks: {
                                title: (items) => {
                                  const idx = items[0]?.dataIndex ?? 0
                                  return visibleRows[idx]?.label ?? ''
                                },
                                label: (ctx) => {
                                  const row = visibleRows[ctx.dataIndex]
                                  if (!row) return ''
                                  return `จำนวนครั้ง: ${row.count}`
                                },
                                afterLabel: (ctx) => {
                                  const row = visibleRows[ctx.dataIndex]
                                  if (!row) return ''
                                  return `กลุ่มความเสี่ยง: ${row.dominantCategoryLabel}`
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              min: 0,
                              max: maxCount + 1,
                              title: {
                                display: true,
                                text: 'จำนวนโครงการที่พบปัจจัยเสี่ยง',
                                font: {
                                  family: 'IBM Plex Sans Thai, system-ui, sans-serif',
                                  size: 12,
                                },
                                color: getColor('slate.700', 0.95),
                                padding: { top: 8 },
                              },
                              ticks: {
                                precision: 0,
                                stepSize: 1,
                              },
                              grid: { color: getColor('slate.300', 0.3) },
                            },
                            y: {
                              ticks: {
                                font: { size: 11, weight: 'bold' as const },
                                color: getColor('slate.600', 0.9),
                              },
                              grid: { display: false },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        ไม่มีข้อมูลในเฟสนี้
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* จำนวนโครงการแยกตามประเภทความเสี่ยง + ประเภทความเสี่ยงแยกตามเฟสโครงการ — ซ่อนชั่วคราว
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">จำนวนโครงการแยกตามประเภทความเสี่ยง</h2>
          <div className="box p-6">
            <div className="h-80">
              <Bar data={riskCategoryBarData} options={riskCategoryBarOptions} />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ประเภทความเสี่ยงแยกตามเฟสโครงการ</h2>
          <div className="box p-6">
            <div className="h-80">
              <Bar data={riskByPhaseStackedData} options={riskByPhaseStackedOptions} />
            </div>
          </div>
        </div>
      </div>
      */}
      <PastPppThailandRiskSection
        riskSectorWithProject={riskData?.riskSectorWithProject}
        riskCategoryList={safeInfoData.riskCategory}
        riskFactorList={safeInfoData.riskFactor}
      />
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">กลุ่มความเสี่ยงที่เกิดขึ้นในแต่ละเฟสของโครงการ</h2>
          <p className="mt-1 text-sm text-gray-500">คลิกชื่อประเภทความเสี่ยงเพื่อเปิดรายละเอียดแยกตามปัจจัยความเสี่ยงในแต่ละเฟส</p>
        </div>
        {safeInfoData.riskSource?.global?.length || safeInfoData.riskSource?.thailand?.length ? (
          <MatrixRiskSourceFilterPanel
            rs={safeInfoData.riskSource!}
            matrixSourceFilterKeys={matrixSourceFilterKeys}
            matrixSourceFilterMode={matrixSourceFilterMode}
            selectAllInputRef={matrixSelectAllInputRef}
            toggleMatrixSelectAllSources={toggleMatrixSelectAllSources}
            toggleMatrixSourceFilterKey={toggleMatrixSourceFilterKey}
            onClearFilters={() => setMatrixSourceFilterKeys([])}
            className="mb-4"
          />
        ) : null}
        <div className="box p-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-medium text-gray-700">
                  ประเภทความเสี่ยง
                </th>
                <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-medium text-gray-700">
                  Pre-construction
                </th>
                <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-medium text-gray-700">
                  Construction
                </th>
                <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-center font-medium text-gray-700">
                  Operation
                </th>
              </tr>
            </thead>
            <tbody>
              {riskCategoryMatrixData.map((row) => {
                const fullName =
                  riskCategoryNameById.get(row.categoryId) ??
                  riskCategoryNameById.get(toRiskCategoryCode(row.categoryId)) ??
                  row.categoryId
                const fp = riskData?.heatmapRiskPhase?.[row.categoryId] as Record<string, unknown> | undefined
                const hasMatrixRowValue =
                  row.preConstruction > 0 ||
                  row.construction > 0 ||
                  row.operation > 0
                const tipPre =
                  row.preConstruction > 0
                    ? buildMatrixPhaseCellTooltip(
                        'Pre-construction',
                        row.preConstruction,
                        aggregateSourcesForMatrixPhase(fp, 'pre-construction'),
                        riskSourceMaps
                      )
                    : ''
                const tipCon =
                  row.construction > 0
                    ? buildMatrixPhaseCellTooltip(
                        'Construction',
                        row.construction,
                        aggregateSourcesForMatrixPhase(fp, 'construction'),
                        riskSourceMaps
                      )
                    : ''
                const tipOp =
                  row.operation > 0
                    ? buildMatrixPhaseCellTooltip(
                        'Operation',
                        row.operation,
                        aggregateSourcesForMatrixPhase(fp, 'operation'),
                        riskSourceMaps
                      )
                    : ''
                return (
                  <tr key={row.categoryId}>
                    <td className="border border-gray-300 px-3 py-2 text-gray-800 bg-white">
                      {hasMatrixRowValue ? (
                        <Tippy content="คลิกเพื่อเปิด heat map ปัจจัยความเสี่ยง">
                          <button
                            type="button"
                            onClick={() => setSelectedMatrixCategoryId(row.categoryId)}
                            className="inline-flex items-center gap-1.5 text-left text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded py-0.5 pr-1 group"
                            aria-label={`เปิด heat map: ${fullName}`}
                          >
                            <span className="group-hover:underline">{fullName}</span>
                            <Lucide icon="Expand" className="w-4 h-4 flex-shrink-0 opacity-70" aria-hidden />
                          </button>
                        </Tippy>
                      ) : (
                        <span className="text-gray-900">{fullName}</span>
                      )}
                    </td>
                    <td className="border border-gray-300 p-0 text-center align-middle min-w-[4rem] bg-white">
                      {row.preConstruction > 0 ? (
                        <Tippy content={tipPre}>
                          <div
                            className="flex min-h-[2.5rem] items-center justify-center"
                            aria-label={`Pre-construction: ${row.preConstruction}`}
                          >
                            <PhaseMatrixRiskMark present />
                          </div>
                        </Tippy>
                      ) : (
                        <div className="flex min-h-[2.5rem] items-center justify-center">
                          <PhaseMatrixRiskMark present={false} />
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-0 text-center align-middle min-w-[4rem] bg-white">
                      {row.construction > 0 ? (
                        <Tippy content={tipCon}>
                          <div
                            className="flex min-h-[2.5rem] items-center justify-center"
                            aria-label={`Construction: ${row.construction}`}
                          >
                            <PhaseMatrixRiskMark present />
                          </div>
                        </Tippy>
                      ) : (
                        <div className="flex min-h-[2.5rem] items-center justify-center">
                          <PhaseMatrixRiskMark present={false} />
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-0 text-center align-middle min-w-[4rem] bg-white">
                      {row.operation > 0 ? (
                        <Tippy content={tipOp}>
                          <div
                            className="flex min-h-[2.5rem] items-center justify-center"
                            aria-label={`Operation: ${row.operation}`}
                          >
                            <PhaseMatrixRiskMark present />
                          </div>
                        </Tippy>
                      ) : (
                        <div className="flex min-h-[2.5rem] items-center justify-center">
                          <PhaseMatrixRiskMark present={false} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {(safeInfoData.riskSource?.global?.length || safeInfoData.riskSource?.thailand?.length) && (
            <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500">แหล่งอ้างอิง</span>
                <span className="inline-flex items-center gap-1.5">
                  <Lucide icon="Globe" className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  ต่างประเทศ
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={THAI_FLAG_ICON_SRC}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 shrink-0 object-contain"
                  />
                  ไทย
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
      {safeInfoData.riskSource?.global?.length || safeInfoData.riskSource?.thailand?.length ? (
        <RiskSourceReferencesSection riskSource={safeInfoData.riskSource!} />
      ) : null}
      {/* <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Heat map: กลุ่มกิจการ × ปัจจัยความเสี่ยง</h2>
        <div className="box p-4 overflow-x-auto">
          {(() => {
            const { rows: sectorRows, cols: factorCols, data: heatmapData } = sectorRiskFactorHeatmapData
            const numFactors = factorCols.length
            const rowSums = factorCols.map((_, j) => sectorRows.reduce((s, _, i) => s + heatmapData[i][j], 0))
            const sortedFactorIndices = factorCols
              .map((_, j) => j)
              .sort((a, b) => rowSums[b] - rowSums[a])
            const topN = 20
            const displayedIndices = sectorRiskHeatmapExpanded ? sortedFactorIndices : sortedFactorIndices.slice(0, topN)
            const hasMore = numFactors > topN
            const riskFactorsForHeatmap: { id: string; name: string }[] =
              safeInfoData.riskFactor?.length
                ? safeInfoData.riskFactor.map((f) => ({
                    id: toRiskFactorCode(f.id),
                    name: (f as { value?: string }).value ?? f.name ?? String(f.id),
                  }))
                : MOCK_RISK_FACTORS
            const maxVal = Math.max(...heatmapData.flat(), 1)
            return (
              <>
                <div className="mb-3 flex items-center gap-3 flex-wrap text-xs text-gray-600">
                  <span className="text-gray-600">พบความเสี่ยงน้อย</span>
                  <span className="inline-flex items-center gap-0.5">
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                      const v = Math.round(maxVal * f)
                      return (
                        <span
                          key={v}
                          className="w-5 h-4 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: chartHeatmapCellColor(v, maxVal) }}
                          title={String(v)}
                        />
                      )
                    })}
                  </span>
                  <span className="text-gray-600">พบความเสี่ยงมาก</span>
                </div>
                <table className="w-full border-collapse text-sm table-fixed">
                  <colgroup>
                    <col style={{ minWidth: '12rem' }} />
                    {sectorRows.map((row) => (
                      <col key={row} style={{ width: '4rem' }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 px-2 py-2 text-left font-medium text-gray-700">
                        ปัจจัยความเสี่ยง
                      </th>
                      {sectorRows.map((row) => {
                        const icon = getIconNameByGroupName(row)
                        const mappedIcon = mapIconName(icon)
                        const iconPath = `/assets/icons/${mappedIcon}`
                        const displayName = getBusinessGroupDisplayName(row)
                        return (
                          <th
                            key={row}
                            className="border border-gray-300 bg-gray-50 px-2 py-2 text-center font-medium text-gray-700 w-16 align-middle"
                            title={displayName}
                          >
                            <div className="w-8 h-8 mx-auto rounded overflow-hidden flex items-center justify-center bg-gray-50">
                              <img
                                src={iconPath}
                                alt=""
                                width={32}
                                height={32}
                                className="w-full h-full object-contain"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedIndices.map((j) => {
                      const factorId = factorCols[j]
                      const factorName = riskFactorsForHeatmap.find((f) => f.id === factorId)?.name ?? factorId
                      return (
                        <tr key={factorId}>
                          <td
                            className="border border-gray-300 px-2 py-1.5 text-gray-800 bg-white text-left align-middle text-xs max-w-[20rem] truncate"
                            title={factorName}
                          >
                            {factorName}
                          </td>
                          {sectorRows.map((_, i) => {
                            const val = heatmapData[i][j]
                            const bg = chartHeatmapCellColor(val, maxVal)
                            return (
                              <td
                                key={i}
                                className="border border-gray-300 p-1 text-center align-middle w-16 min-h-[2rem]"
                                style={{ minWidth: 32, backgroundColor: bg }}
                              >
                                <span
                                  className={
                                    val > 0
                                      ? 'inline-flex items-center justify-center w-8 h-6 rounded text-gray-800 font-medium text-xs'
                                      : 'text-gray-400 text-xs'
                                  }
                                >
                                  {val}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {hasMore && (
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSectorRiskHeatmapExpanded((v) => !v)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {sectorRiskHeatmapExpanded
                        ? `ย่อ (แสดง ${numFactors} ปัจจัย)`
                        : `แสดงเพิ่ม (อีก ${numFactors - topN} ปัจจัย)`}
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div> */}
      {selectedMatrixCategoryId &&
        (() => {
          const matrixModalItem = riskHeatmapForMatrix.getHeatmapItemByCategoryId(selectedMatrixCategoryId)
          if (!matrixModalItem) return null
          const modalTitle =
            riskCategoryNameById.get(selectedMatrixCategoryId) ??
            riskCategoryNameById.get(toRiskCategoryCode(selectedMatrixCategoryId)) ??
            String(selectedMatrixCategoryId)
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="risk-heatmap-modal-title"
            >
              <div className="bg-white rounded-xl shadow-xl w-max max-w-[90vw] max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div>
                    <h2 id="risk-heatmap-modal-title" className="text-lg font-semibold text-gray-900">
                      {'กลุ่มความเสี่ยง '}
                      {modalTitle}
                    </h2>
                    {matrixSourceFilterMode.kind === 'partial' && (
                      <p className="mt-1 text-xs text-gray-500">
                        กำลังกรองตามแหล่งอ้างอิงที่เลือก ({matrixSourceFilterMode.keys.size} รายการ)
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMatrixCategoryId(null)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Close"
                  >
                    <Lucide icon="X" className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                  {safeInfoData.riskSource?.global?.length ||
                  safeInfoData.riskSource?.thailand?.length ? (
                    <MatrixRiskSourceFilterPanel
                      rs={safeInfoData.riskSource!}
                      matrixSourceFilterKeys={matrixSourceFilterKeys}
                      matrixSourceFilterMode={matrixSourceFilterMode}
                      selectAllInputRef={matrixSelectAllModalInputRef}
                      toggleMatrixSelectAllSources={toggleMatrixSelectAllSources}
                      toggleMatrixSourceFilterKey={toggleMatrixSourceFilterKey}
                      onClearFilters={() => setMatrixSourceFilterKeys([])}
                      helpVariant="short"
                      className="mb-4"
                    />
                  ) : null}
                  <HeatMapTable
                    item={matrixModalItem}
                    categoryById={riskHeatmapForMatrix.categoryById}
                    factorById={riskHeatmapForMatrix.factorById}
                    compact={false}
                    maxValue={riskHeatmapForMatrix.maxValue}
                    showColorLegend={Boolean(riskSourceMaps)}
                    riskSourceMaps={riskSourceMaps}
                    activeSourceFilterKeys={
                      matrixSourceFilterMode.kind === 'partial'
                        ? matrixSourceFilterMode.keys
                        : null
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className="absolute inset-0 -z-10"
                aria-label="Close overlay"
                onClick={() => setSelectedMatrixCategoryId(null)}
              />
            </div>
          )
        })()}
    </div>
  )
}
