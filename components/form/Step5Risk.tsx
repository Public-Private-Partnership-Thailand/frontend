'use client'

import { UseFormRegister, Control, Controller, FieldErrors, useFieldArray, UseFormSetValue, useWatch } from 'react-hook-form'
import { ProjectFormData, RiskCategoryDriver, RiskFactorItem } from '@/types/project'
import { useState, useRef, useEffect } from 'react'
import { RISK_PHASE_OPTIONS, MITIGATION_STATUS_OPTIONS } from '@/lib/riskConstants'
import { useInfo, RiskCategory, RiskFactor } from '@/app/hooks/useInfo'

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

  const sortedFactors = [...riskFactors].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true })
  )

  const filteredFactors = search.trim()
    ? sortedFactors.filter((f) =>
        `${f.id}: ${f.name}`.toLowerCase().includes(search.toLowerCase())
      )
    : sortedFactors

  const isSelected = (factorId: string) =>
    selectedFactors.some((f) => f.risk_factor_id === factorId)

  const toggleFactor = (factorId: string, factorName: string) => {
    if (isSelected(factorId)) {
      onChange(selectedFactors.filter((f) => f.risk_factor_id !== factorId))
    } else {
      onChange([...selectedFactors, { risk_factor_id: factorId, factor_name: factorName }])
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
                {item.risk_factor_id}: {item.factor_name}
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
                    onChange={() => toggleFactor(f.id, f.name)}
                    className="mr-2 h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-700">{f.id}: {f.name}</span>
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

  const {
    fields: riskFields,
    append: appendRisk,
    remove: removeRisk,
  } = useFieldArray({
    control,
    name: 'risks' as 'risks',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600">
          โครงการหนึ่งสามารถมีได้หลายความเสี่ยง คลิกเพิ่มความเสี่ยงเพื่อเพิ่มรายการ
        </p>
        <button
          type="button"
          onClick={() =>
            appendRisk({
              title: '',
              phase: '',
              description: [],
              category_drivers: [{ risk_category_id: '', risk_category_code: '', category_name: '', driven_by_risk_factors: [] }],
              mitigation_handling: [],
              impact_statement: [],
            })
          }
          className="btn-secondary text-sm whitespace-nowrap"
        >
          + เพิ่มความเสี่ยง
        </button>
      </div>

      {riskFields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-gray-500">ยังไม่มีความเสี่ยง</p>
          <p className="text-xs text-gray-400 mt-1">คลิก &quot;+ เพิ่มความเสี่ยง&quot; เพื่อเพิ่มรายการ (ไม่บังคับ)</p>
        </div>
      )}

      {riskFields.map((riskField, riskIndex) => (
        <div key={riskField.id} className="card border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-900">ความเสี่ยง #{riskIndex + 1}</span>
            <button
              type="button"
              onClick={() => removeRisk(riskIndex)}
              className="text-red-600 hover:text-red-800 text-sm px-2"
            >
              ลบ
            </button>
          </div>

          <div className="space-y-4">
            {/* title */}
            <div>
              <label className="form-label">ชื่อความเสี่ยง (Title) *</label>
              <input
                {...register(`risks.${riskIndex}.title` as const, {
                  required: 'กรุณากรอกชื่อความเสี่ยง',
                })}
                className={`form-input w-full ${errors.risks?.[riskIndex]?.title ? 'border-red-500' : ''}`}
                placeholder="ชื่อหรือหัวข้อของความเสี่ยง"
              />
              {errors.risks?.[riskIndex]?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.risks[riskIndex]?.title?.message}
                </p>
              )}
            </div>

            {/* phase */}
            <div>
              <label className="form-label">Phase (ระยะ) *</label>
              <select
                {...register(`risks.${riskIndex}.phase` as const, {
                  required: 'กรุณาเลือก Phase',
                })}
                className={`form-input w-full ${errors.risks?.[riskIndex]?.phase ? 'border-red-500' : ''}`}
              >
                <option value="">-- เลือก Phase --</option>
                {RISK_PHASE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.risks?.[riskIndex]?.phase && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.risks[riskIndex]?.phase?.message}
                </p>
              )}
            </div>

            {/* description */}
            <div>
              <label className="form-label">รายละเอียดความเสี่ยง (Description)</label>
              <p className="text-xs text-gray-400 mb-1">แต่ละบรรทัดจะถูกบันทึกเป็นรายการแยก</p>
              <Controller
                control={control}
                name={`risks.${riskIndex}.description` as const}
                render={({ field }) => (
                  <textarea
                    value={(field.value as string[]).join('\n')}
                    onChange={(e) => field.onChange(e.target.value.split('\n'))}
                    onBlur={field.onBlur}
                    rows={4}
                    className="form-input w-full"
                    placeholder={"บรรทัดที่ 1: รายละเอียดแรก\nบรรทัดที่ 2: รายละเอียดที่สอง"}
                  />
                )}
              />
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

            {/* mitigation_handling */}
            <MitigationBlock
              riskIndex={riskIndex}
              register={register}
              control={control}
              errors={errors}
            />

            {/* impact_statement */}
            <div>
              <label className="form-label">ผลกระทบ (Impact Statement)</label>
              <p className="text-xs text-gray-400 mb-1">แต่ละบรรทัดจะถูกบันทึกเป็นรายการแยก</p>
              <Controller
                control={control}
                name={`risks.${riskIndex}.impact_statement` as const}
                render={({ field }) => (
                  <textarea
                    value={(field.value as string[]).join('\n')}
                    onChange={(e) => field.onChange(e.target.value.split('\n'))}
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
      ))}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="form-label mb-0">Risk Category Drivers</label>
        <button
          type="button"
          onClick={() =>
            appendDriver({
              risk_category_id: '',
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
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="block text-xs font-medium text-gray-600">Risk Category</label>
                <InfoTooltip
                  lines={(() => {
                    const selId = Array.isArray(drivers) ? drivers[driverIndex]?.risk_category_id : ''
                    const cat = riskCategories.find((c) => c.id === selId)
                    return cat ? [`${cat.code}: ${cat.name}`, cat.description_th] : []
                  })()}
                />
              </div>
              <select
                {...register(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_id` as const)}
                onChange={(e) => {
                  const id = e.target.value
                  setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_id` as const, id, { shouldValidate: true })
                  const cat = riskCategories.find((c) => c.id === id)
                  setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.risk_category_code` as const, cat?.code ?? '')
                  setValue(`risks.${riskIndex}.category_drivers.${driverIndex}.category_name` as const, cat?.name ?? '')
                }}
                className="form-input w-full text-sm"
              >
                <option value="">-- เลือก Category --</option>
                {[...riskCategories]
                  .sort((a, b) => a.code.localeCompare(b.code))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <label className="block text-xs font-medium text-gray-600">
                  Risk Factor (ค้นหาและเลือกได้หลายรายการ)
                </label>
                <InfoTooltip
                  lines={(() => {
                    const selFactors = (Array.isArray(drivers) ? drivers[driverIndex]?.driven_by_risk_factors : undefined) ?? []
                    return selFactors.map((item) => {
                      const f = riskFactors.find((x) => x.id === item.risk_factor_id)
                      return f
                        ? `${f.id}: ${f.name} — ${f.description_th}`
                        : item.risk_factor_id
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
        ))}
      </div>
    </div>
  )
}

function MitigationBlock({
  riskIndex,
  register,
  control,
  errors,
}: {
  riskIndex: number
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
}) {
  const {
    fields: mitigationFields,
    append: appendMitigation,
    remove: removeMitigation,
  } = useFieldArray({
    control,
    name: `risks.${riskIndex}.mitigation_handling` as 'risks.0.mitigation_handling',
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="form-label mb-0">Mitigation / Handling</label>
        <button
          type="button"
          onClick={() => appendMitigation({ action: '', status: 'planned' })}
          className="btn-secondary text-xs py-1 px-2"
        >
          + เพิ่มมาตรการ
        </button>
      </div>
      {mitigationFields.length === 0 && (
        <p className="text-xs text-gray-400 italic">ยังไม่มีมาตรการรับมือ</p>
      )}
      <div className="space-y-3">
        {mitigationFields.map((mField, mIndex) => (
          <div key={mField.id} className="pl-4 border-l-2 border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">มาตรการ #{mIndex + 1}</span>
              <button
                type="button"
                onClick={() => removeMitigation(mIndex)}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                ลบ
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">มาตรการรับมือ (Action)</label>
              <input
                {...register(`risks.${riskIndex}.mitigation_handling.${mIndex}.action` as const)}
                className="form-input w-full text-sm"
                placeholder="รายละเอียดมาตรการ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">สถานะ (Status)</label>
              <select
                {...register(`risks.${riskIndex}.mitigation_handling.${mIndex}.status` as const)}
                className="form-input w-full text-sm"
              >
                {MITIGATION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
