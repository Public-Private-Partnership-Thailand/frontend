'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import HomePageSkeleton from '@/components/HomePageSkeleton'
import RiskDashboardContent from '@/components/home/RiskDashboardContent'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import Lucide from '@/components/Base/Lucide'
import { useLanguage } from '@/lib/LanguageContext'
import { useInfo } from '@/app/hooks/useInfo'
import { useRisk, type RiskPageFilters } from '@/app/hooks/useRisk'
import { getBusinessGroupDisplayName } from '@/types/businessGroup'

export default function RiskPage() {
  const { t } = useLanguage()
  const { data: infoData, isLoading: infoLoading, error: infoError } = useInfo()

  const [showFilters, setShowFilters] = useState(false)
  const [tempSectorValues, setTempSectorValues] = useState<string[]>([])
  /** `null` until synced from info — then same semantics as home (all selected = no sector_id params) */
  const [appliedSectorValues, setAppliedSectorValues] = useState<string[] | null>(null)

  const sectorOptions = useMemo(() => infoData?.sector?.map((s) => s.value) ?? [], [infoData?.sector])

  useEffect(() => {
    if (!infoData?.sector?.length || appliedSectorValues !== null) return
    const all = infoData.sector.map((s) => s.value)
    setTempSectorValues(all)
    setAppliedSectorValues(all)
  }, [infoData?.sector, appliedSectorValues])

  const riskFilters = useMemo((): RiskPageFilters => {
    if (appliedSectorValues === null || !infoData?.sector?.length) return {}
    const all = infoData.sector.map((s) => s.value)
    if (
      appliedSectorValues.length === all.length &&
      all.every((v) => appliedSectorValues.includes(v))
    ) {
      return {}
    }
    return { sectorValues: appliedSectorValues }
  }, [appliedSectorValues, infoData?.sector])

  const { data: riskData, isLoading: riskLoading, error: riskError } = useRisk(
    riskFilters,
    infoData ? { sector: infoData.sector } : undefined
  )

  const handleSectorChange = useCallback((value: string) => {
    setTempSectorValues((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    )
  }, [])

  const handleSectorSelectAll = useCallback(
    (selectAll: boolean) => {
      setTempSectorValues(selectAll ? [...sectorOptions] : [])
    },
    [sectorOptions]
  )

  const handleSectorClear = useCallback(() => {
    setTempSectorValues([])
  }, [])

  const applyFilters = useCallback(() => {
    setAppliedSectorValues([...tempSectorValues])
  }, [tempSectorValues])

  const clearFilters = useCallback(() => {
    if (!infoData?.sector?.length) return
    const all = infoData.sector.map((s) => s.value)
    setTempSectorValues(all)
    setAppliedSectorValues(all)
  }, [infoData?.sector])

  const hasActiveFilters = useMemo(() => {
    if (!infoData?.sector?.length || appliedSectorValues === null) return false
    const all = infoData.sector.map((s) => s.value)
    return (
      appliedSectorValues.length !== all.length || !all.every((v) => appliedSectorValues.includes(v))
    )
  }, [infoData?.sector, appliedSectorValues])

  const loading = infoLoading || riskLoading
  const error = riskError || infoError

  if (loading) {
    return <HomePageSkeleton />
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="flex flex-col lg:flex-row gap-6">
        <div
          className={clsx(
            'flex-shrink-0 overflow-hidden transition-all duration-700 ease-out',
            showFilters ? 'w-full lg:w-64 filter-panel-enter' : 'w-0 lg:w-0 opacity-0'
          )}
        >
          {showFilters && (
            <div className="box p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">{t('home.filters')}</h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close filters"
                >
                  <Lucide icon="X" className="w-5 h-5" />
                </button>
              </div>

              <MultiSelectDropdown
                label={t('pages.view.projectType')}
                options={sectorOptions}
                selectedValues={tempSectorValues}
                onChange={handleSectorChange}
                onSelectAll={handleSectorSelectAll}
                onClear={handleSectorClear}
                placeholder={t('home.allBusinessGroups')}
                displayNameMap={getBusinessGroupDisplayName}
              />

              <div className="pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full px-3 py-1.5 mb-2 text-xs font-medium text-white bg-theme-primary hover:bg-theme-primary-dark rounded-md transition-colors duration-200"
                >
                  {t('home.applyFilters') || 'Apply Filters'}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {t('projects.clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 transition-all duration-700 ease-out">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200',
                hasActiveFilters
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <Lucide
                icon="Filter"
                className={clsx('w-4 h-4', hasActiveFilters ? 'text-white' : 'text-gray-600')}
              />
              <span className="text-sm font-medium">{t('home.filters')}</span>
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">1</span>
              )}
            </button>
          </div>

          {error ? (
            <div className="box p-6 text-center text-red-600 text-sm">
              ไม่สามารถโหลดข้อมูลความเสี่ยงได้
            </div>
          ) : (
            <RiskDashboardContent infoData={infoData} riskData={riskData} />
          )}
        </div>
      </div>
    </div>
  )
}
