'use client'

import { UseFormRegister, Control, Controller, FieldErrors, useFieldArray, UseFormSetValue, useWatch } from 'react-hook-form'
import { ProjectFormData, RiskCategoryDriver, RiskFactorItem } from '@/types/project'
import { useState, useRef, useEffect } from 'react'
import { RISK_PHASE_OPTIONS } from '@/lib/riskConstants'
import {
  resolveRiskCategoryNumericId,
  riskCategoryDriverNeedsNumericIdSync,
} from '@/lib/normalizeRiskCategoryDrivers'
import { formatRiskPhaseLabels } from '@/lib/riskPhasesForm'
import { useInfo, RiskCategory, RiskFactor } from '@/app/hooks/useInfo'

function PhaseMultiSelect({
  selectedPhases,
  onChange,
  error,
}: {
  selectedPhases: string[]
  onChange: (phases: string[]) => void
  error?: string
}) {
  const togglePhase = (value: string) => {
    if (selectedPhases.includes(value)) {
      onChange(selectedPhases.filter((p) => p !== value))
    } else {
      onChange([...selectedPhases, value])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {RISK_PHASE_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={selectedPhases.includes(opt.value)}
              onChange={() => togglePhase(opt.value)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

/** Floating info tooltip triggered on hover */
function InfoTooltip({ lines }: { lines: string[] }) {
  const [visible, setVisible] = useState(false)
  const empty = lines.length === 0 || lines.every((l) => !l)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors leading-none"
        aria-label="แสดงรายละเอียด"
      >
        i
      </button>
      {visible && (
        <div className="absolute z-40 left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none">
          {empty ? (
            <span className="italic text-gray-400">เลือกรายการเพื่อดูรายละเอียด</span>
          ) : (
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className={lines.length > 1 ? 'border-b border-gray-600 pb-2 last:border-0 last:pb-0' : ''}>
                  {line}
                </li>
              ))}
            </ul>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  )
}

interface Step5RiskProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
}

function toTextareaValue(value: unknown): string {
  return Array.isArray(value) ? value.join('\n') : ''
}

function fromTextareaValue(value: string): string[] {
  if (!value.trim()) return []
  return value.split('\n')
}

/** Searchable multi-select for risk factors — stores { risk_factor_id, factor_name } objects */
function RiskFactorSelect({
  selectedFactors,
  onChange,
  riskFactors,
  placeholder = 'ค้นหาและเลือก Risk Factor',
}: {
  selectedFactors: RiskFactorItem[]
  onChange: (factors: RiskFactorItem[]) => void
  riskFactors: RiskFactor[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortedFactors = [...riskFactors].sort((a, b) => a.id - b.id)

  const filteredFactors = search.trim()
    ? sortedFactors.filter((f) =>
        `${f.id}: ${f.value}`.toLowerCase().includes(search.toLowerCase())
      )
    : sortedFactors

  const isSelected = (factorId: number) =>
    selectedFactors.some((f) => f.risk_factor_id === factorId)

  const toggleFactor = (factorId: number, factorName: string) => {
    if (isSelected(factorId)) {
      onChange(selectedFactors.filter((f) => f.risk_factor_id !== factorId))
    } else {
      onChange([...selectedFactors, { risk_factor_id: factorId, factor_name: factorName }])
      setSearch('')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-wrap gap-1.5 min-h-[38px] px-2 py-1.5 border border-gray-300 rounded-md bg-white text-left text-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        {selectedFactors.length > 0
          ? selectedFactors.map((item) => (
              <span
                key={item.risk_factor_id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-theme-primary/10 text-theme-primary text-xs"
              >
                {item.factor_name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(selectedFactors.filter((f) => f.risk_factor_id !== item.risk_factor_id))
                  }}
                  className="hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))
          : null}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedFactors.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 p-0 focus:ring-0 text-sm"
        />
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-hidden flex flex-col">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            className="mx-2 mt-2 px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
          <div className="overflow-auto flex-1 p-2">
            {filteredFactors.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">ไม่พบรายการ</p>
            ) : (
              filteredFactors.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded"
                >
                  <input
                    type="checkbox"
                    checked={isSelected(f.id)}
                    onChange={() => toggleFactor(f.id, f.value)}
                    className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-700">{f.value}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Step5Risk({ register, control, errors, setValue }: Step5RiskProps) {
  const { data: infoData } = useInfo()
  const riskCategories: RiskCategory[] = infoData?.riskCategory ?? []
  const riskFactors: RiskFactor[] = infoData?.riskFactor ?? []
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])
  const risksValues = useWatch({
    control,
    name: 'risks',
    defaultValue: [],
  })

  const {
    fields: riskFields,
    append: appendRisk,
    remove: removeRisk,
  } = useFieldArray({
    control,
    name: 'risks' as 'risks',
  })

  const addRiskButton = (
    <button
      type="button"
      onClick={() =>
        appendRisk({
          title: '',
          phases: [],
          description: [],
          category_drivers: [{ risk_category_id: 0, risk_category_code: '', category_name: '', driven_by_risk_factors: [] }],
          mitigation_handling: [],
          impact_statement: [],
        })
      }
      className="btn-secondary text-sm whitespace-nowrap"
    >
      + เพิ่มความเสี่ยง
    </button>
  )

  return (
    <div className="space-y-6">
      {riskFields.length === 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-gray-600">
            หนึ่งโครงการสามารถมีได้หลายความเสี่ยง
          </p>
          {addRiskButton}
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          หนึ่งโครงการสามารถมีได้หลายความเสี่ยง เลื่อนลงด้านล่างเพื่อคลิกเพิ่มความเสี่ยง
        </p>
      )}

      {riskFields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-gray-500">ยังไม่มีความเสี่ยง</p>
          <p className="text-xs text-gray-400 mt-1">คลิก &quot;+ เพิ่มความเสี่ยง&quot; เพื่อเพิ่มรายการ</p>
        </div>
      )}

      {riskFields.map((riskField, riskIndex) => (
        (() => {
          const isCollapsed = collapsedIds.includes(riskField.id)
          const currentRisk =
            Array.isArray(risksValues) && risksValues[riskIndex] ? risksValues[riskIndex] : {}
          const phaseLabel = formatRiskPhaseLabels((currentRisk as any)?.phases)
          const descriptionLines: string[] = Array.isArray((currentRisk as any)?.description)
            ? ((currentRisk as any).description as string[])
            : []
          const firstDescription = descriptionLines[0] || ''

          if (isCollapsed) {
            return (
              <div
                key={riskField.id}
                className="card border border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-gray-500 mb-1">ความเสี่ยง #{riskIndex + 1}</div>
                  <h3 className="font-medium text-gray-900">
                    {(currentRisk as any)?.title || `ยังไม่ตั้งชื่อความเสี่ยง`}
                  </h3>
                  {phaseLabel && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Phase:</span> {phaseLabel}
                    </p>
                  )}
                  {firstDescription && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {firstDescription}
                    </p>
                  )}
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedIds((prev) => prev.filter((id) => id !== riskField.id))
                    }
                    className="btn-secondary text-xs px-3 py-1 whitespace-nowrap"
                  >
                    แสดงรายละเอียด
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeRisk(riskIndex)
                      setCollapsedIds((prev) => prev.filter((id) => id !== riskField.id))
                    }}
                    className="btn-danger text-xs px-3 py-1 whitespace-nowrap"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={riskField.id} className="card border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-900">ความเสี่ยง #{riskIndex + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedIds((prev) =>
                        prev.includes(riskField.id) ? prev : [...prev, riskField.id],
                      )
                    }
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    ซ่อนรายละเอียด
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRisk(riskIndex)}
                    className="text-red-600 hover:text-red-800 text-sm px-2"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* title + phase in left column, description on right */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/2 space-y-3">
                    {/* title */}
                    <div>
                      <label className="form-label">ชื่อความเสี่ยง (Title) *</label>
                      <input
                        {...register(`risks.${riskIndex}.title` as const, {
                          required: 'กรุณากรอกชื่อความเสี่ยง',
                        })}
                        className={`form-input w-full ${
                          errors.risks?.[riskIndex]?.title ? 'border-red-500' : ''
                        }`}
                        placeholder="ชื่อหรือหัวข้อของความเสี่ยง"
                      />
                      {errors.risks?.[riskIndex]?.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.risks[riskIndex]?.title?.message}
                        </p>
                      )}
                    </div>

                    {/* phases (saved as one API risk row per selected phase) */}
                    <div>
                      <label className="form-label">เฟส (Phase) *</label>
                      <Controller
                        control={control}
                        name={`risks.${riskIndex}.phases` as const}
                        rules={{
                          validate: (value) =>
                            (Array.isArray(value) && value.length > 0) || 'กรุณาเลือก Phase อย่างน้อย 1 รายการ',
                        }}
                        render={({ field }) => (
                          <PhaseMultiSelect
                            selectedPhases={Array.isArray(field.value) ? field.value : []}
                            onChange={field.onChange}
                            error={errors.risks?.[riskIndex]?.phases?.message as string | undefined}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <label className="form-label">รายละเอียดความเสี่ยง (Description)</label>
                    {/* <p className="text-xs text-gray-400 mb-1">แต่ละบรรทัดจะถูกบันทึกเป็นรายการแยก</p> */}
                    <Controller
                      control={control}
                      name={`risks.${riskIndex}.description` as const}
                      render={({ field }) => (
                        <textarea
                          value={toTextareaValue(field.value)}
                          onChange={(e) => field.onChange(fromTextareaValue(e.target.value))}
                          onBlur={field.onBlur}
                          rows={4}
                          className="form-input w-full"
                          placeholder={"บรรทัดที่ 1: รายละเอียดแรก\nบรรทัดที่ 2: รายละเอียดที่สอง"}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* category_drivers */}
                <RiskCategoryDriversBlock
                  riskIndex={riskIndex}
                  register={register}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  riskCategories={riskCategories}
                  riskFactors={riskFactors}
                />

                {/* mitigation_handling — stored as string[] (one line per array item), same as impact */}
                <div>
                  <label className="form-label">มาตรการรับมือ (Risk Response)</label>
                  <p className="text-xs text-gray-400 mb-1">แต่ละบรรทัดจะถูกบันทึกเป็นรายการแยก</p>
                  <Controller
                    control={control}
                    name={`risks.${riskIndex}.mitigation_handling` as const}
                    render={({ field }) => (
                      <textarea
                        value={toTextareaValue(field.value)}
                        onChange={(e) => field.onChange(fromTextareaValue(e.target.value))}
                        onBlur={field.onBlur}
                        rows={3}
                        className="form-input w-full"
                        placeholder={
                          'บรรทัดที่ 1: มาตรการรับมือแรก\nบรรทัดที่ 2: มาตรการถัดไป'
                        }
                      />
                    )}
                  />
                </div>

                {/* impact_statement */}
                <div>
                  <label className="form-label">ผลกระทบ (Risk Impact)</label>
                  <p className="text-xs text-gray-400 mb-1">
                    แต่ละบรรทัดจะถูกบันทึกเป็นรายการแยก
                  </p>
                  <Controller
                    control={control}
                    name={`risks.${riskIndex}.impact_statement` as const}
                    render={({ field }) => (
                      <textarea
                        value={toTextareaValue(field.value)}
                        onChange={(e) => field.onChange(fromTextareaValue(e.target.value))}
                        onBlur={field.onBlur}
                        rows={3}
                        className="form-input w-full"
                        placeholder={"บรรทัดที่ 1: ผลกระทบแรก\nบรรทัดที่ 2: ผลกระทบที่สอง"}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )
        })()
      ))}

      {riskFields.length >= 1 && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          {addRiskButton}
        </div>
      )}
    </div>
  )
}

function RiskCategoryDriversBlock({
  riskIndex,
  register,
  control,
  errors,
  setValue,
  riskCategories,
  riskFactors,
}: {
  riskIndex: number
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  riskCategories: RiskCategory[]
  riskFactors: RiskFactor[]
}) {
  const drivers = useWatch({
    control,
    name: `risks.${riskIndex}.category_drivers` as 'risks.0.category_drivers',
    defaultValue: [],
  })
  const {
    fields: driverFields,
    append: appendDriver,
    remove: removeDriver,
  } = useFieldArray({
    control,
    name: `risks.${riskIndex}.category_drivers` as 'risks.0.category_drivers',
  })

  /** API often sends `risk_category_id` as a code string; dropdown options use numeric ids from `/info`. */
  useEffect(() => {
    if (!riskCategories.length || !Array.isArray(drivers)) return
    drivers.forEach((driver, driverIndex) => {
      if (!driver) return
      const resolved = resolveRiskCategoryNumericId(driver, riskCategories)
      if (!riskCategoryDriverNeedsNumericIdSync(driver as RiskCategoryDriver, resolved)) return
      const cat = riskCategories.find((c) => c.id === resolved)
      setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_id` as const, resolved, {
        shouldValidate: true,
        shouldDirty: false,
      })
      setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_code` as const, cat?.code ?? '', {
        shouldDirty: false,
      })
      setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.category_name` as const, cat?.value ?? '', {
        shouldDirty: false,
      })
    })
  }, [riskCategories, drivers, riskIndex, setValue])

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="form-label mb-0">กลุ่มปัญหาความเสี่ยง (Risk Category Drivers)</label>
        <button
          type="button"
          onClick={() =>
            appendDriver({
              risk_category_id: 0,
              risk_category_code: '',
              category_name: '',
              driven_by_risk_factors: [],
            } as RiskCategoryDriver)
          }
          className="btn-secondary text-xs py-1 px-2"
        >
          + เพิ่ม Category
        </button>
      </div>
      <div className="space-y-3">
        {driverFields.map((driverField, driverIndex) => (
          <div
            key={driverField.id}
            className="pl-4 border-l-2 border-gray-200 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Category #{driverIndex + 1}</span>
              <button
                type="button"
                onClick={() => removeDriver(driverIndex)}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                ลบ
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2">
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600">Risk Category</label>
                  <InfoTooltip
                    lines={(() => {
                      const d = Array.isArray(drivers) ? drivers[driverIndex] : undefined
                      const selId = d?.risk_category_id as unknown
                      let cat: RiskCategory | undefined
                      if (typeof selId === 'number') {
                        cat = riskCategories.find((c) => c.id === selId)
                      } else if (typeof selId === 'string' && /^\d+$/.test(selId.trim())) {
                        cat = riskCategories.find((c) => c.id === Number(selId.trim()))
                      }
                      if (!cat && d) {
                        const code = String(d.risk_category_code ?? '').trim().toUpperCase()
                        if (code) {
                          cat = riskCategories.find((c) => c.code.toUpperCase() === code)
                        }
                        if (!cat && typeof selId === 'string') {
                          cat = riskCategories.find((c) => c.code.toUpperCase() === selId.trim().toUpperCase())
                        }
                      }
                      return cat ? [`${cat.code}: ${cat.value}`, cat.description_th] : []
                    })()}
                  />
                </div>
                <select
                  {...register(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_id` as const)}
                  onChange={(e) => {
                    const id = Number(e.target.value) || 0
                    setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_id` as const, id, { shouldValidate: true })
                    const cat = riskCategories.find((c) => c.id === id)
                    setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_code` as const, cat?.code ?? '')
                    setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.category_name` as const, cat?.value ?? '')
                  }}
                  className="form-input w-full text-sm"
                >
                  <option value="">-- เลือก Category --</option>
                  {(() => {
                    const order = [
                      'PROJECT_SELECTION',   // Project selected
                      'PROCUREMENT',         // Procurement risks
                      'LAND_SITE',           // Land availability, access & site
                      'SOCIAL',              // Social
                      'ENVIRONMENTAL',       // Environmental
                      'DESIGN',              // Design
                      'CONSTRUCTION',        // Construction
                      'VARIATIONS',          // Variations
                      'OPERATING',           // Operating
                      'DEMAND',              // Demand
                      'PROJECT_FINANCE',     // Project finance
                      'FIN_MARKET',          // Financial markets
                      'STRATEGIC',           // Strategic / Partnering
                      'POLITICAL',           // Political
                      'LAW',                 // Law
                      'RELATIONSHIP',        // Relationship
                      'DISRUPT_TECH',        // Disruptive technology
                      'FORCE_MAJEURE',       // Force majeure
                      'EARLY_TERMINATION',   // Early termination
                      'HANDBACK_COND',       // Condition at handback
                    ]

                    return [...riskCategories]
                      .sort((a, b) => {
                        const ia = order.indexOf(a.code)
                        const ib = order.indexOf(b.code)
                        const aIdx = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
                        const bIdx = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
                        if (aIdx !== bIdx) return aIdx - bIdx
                        return a.code.localeCompare(b.code)
                      })
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code}: {c.value}
                        </option>
                      ))
                  })()}
                </select>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Risk Factor (ค้นหาและเลือกได้หลายรายการ)
                  </label>
                  <InfoTooltip
                    lines={(() => {
                      const selFactors =
                        (Array.isArray(drivers)
                          ? drivers[driverIndex]?.driven_by_risk_factors
                          : undefined) ?? []
                      return selFactors.map((item: RiskFactorItem) => {
                        const f = riskFactors.find((x) => x.id === item.risk_factor_id)
                        return f
                          ? `${f.value} — ${f.description_th}`
                          : String(item.risk_factor_id)
                      })
                    })()}
                  />
                </div>
                <RiskFactorSelect
                  selectedFactors={
                    (Array.isArray(drivers) ? drivers[driverIndex]?.driven_by_risk_factors : undefined) ?? []
                  }
                  onChange={(factors) => {
                    setValue(
                      `risks.${riskIndex}.category_drivers.${driverIndex}.driven_by_risk_factors` as const,
                      factors,
                      { shouldValidate: true }
                    )
                  }}
                  riskFactors={riskFactors}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
