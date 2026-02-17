import { UseFormRegister, Control, FieldErrors, UseFormSetValue, Controller, useFormState } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useEffect } from 'react'
import Litepicker from '@/components/Base/Litepicker'
import Lucide from '@/components/Base/Lucide'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { formatDateForLitepicker, parseLitepickerDateToISO } from '@/lib/utils/dateUtils'

interface Step3BudgetInfoProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
}

export default function Step3BudgetInfo({ register, control, errors, setValue, getValues }: Step3BudgetInfoProps) {
  const { t } = useLanguage()
  const { touchedFields, isSubmitted } = useFormState({ control })
  const [currencyUnit, setCurrencyUnit] = useState<string>('ล้าน')
  const [budgetInputValue, setBudgetInputValue] = useState<string>('')
  
  // Date picker display values
  const [requestDateDisplay, setRequestDateDisplay] = useState<string>('')
  const [approvalDateDisplay, setApprovalDateDisplay] = useState<string>('')
  
  // Date conversion functions are now imported from @/lib/utils/dateUtils
  
  // Initialize display values from form values
  useEffect(() => {
    const formValues = getValues()
    if (formValues.budget?.requestDate) {
      setRequestDateDisplay(formatDateForLitepicker(formValues.budget.requestDate))
    }
    if (formValues.budget?.approvalDate) {
      setApprovalDateDisplay(formatDateForLitepicker(formValues.budget.approvalDate))
    }
  }, [getValues])

  // Conversion multipliers for currency (บาท, ล้าน, ล้านล้าน only)
  const getCurrencyMultiplier = (unit: string): number => {
    switch (unit) {
      case 'ล้านล้าน': return 1000000000000 // 1 trillion
      case 'ล้าน': return 1000000 // 1 million
      case 'บาท': return 1
      default: return 1
    }
  }

  // Convert and update budget amount when input or unit changes
  const handleBudgetAmountChange = (value: string) => {
    setBudgetInputValue(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      const multiplier = getCurrencyMultiplier(currencyUnit)
      const convertedAmount = numValue * multiplier
      setValue('budget.amount.amount', convertedAmount, { shouldValidate: false })
    } else if (value === '' || value === '0' || isNaN(numValue)) {
      // Clear the value if invalid (set to 0)
      setValue('budget.amount.amount', 0, { shouldValidate: false })
    }
  }
  
  const handleCurrencyUnitChange = (unit: string) => {
    setCurrencyUnit(unit)
    const numValue = parseFloat(budgetInputValue)
    if (!isNaN(numValue) && numValue > 0) {
      const multiplier = getCurrencyMultiplier(unit)
      const convertedAmount = numValue * multiplier
      setValue('budget.amount.amount', convertedAmount, { shouldValidate: false })
    }
  }

  // Set currency to THB on mount
  useEffect(() => {
    setValue('budget.amount.currency', 'THB', { shouldValidate: false })
  }, [setValue])
  
  // Initialize budget input value from existing budget amount
  useEffect(() => {
    const currentAmount = getValues().budget?.amount?.amount
    if (currentAmount && currentAmount > 0 && !budgetInputValue) {
      // Try to find the best unit to display (default to "ล้าน")
      let bestUnit = 'ล้าน'
      let bestDisplayValue = currentAmount / getCurrencyMultiplier(bestUnit)
      
      // Try other units to find a more readable value (บาท, ล้าน, ล้านล้าน only)
      const units = ['ล้านล้าน', 'ล้าน', 'บาท']
      for (const unit of units) {
        const multiplier = getCurrencyMultiplier(unit)
        const displayValue = currentAmount / multiplier
        // Prefer values between 0.01 and 10000 for readability
        if (displayValue >= 0.01 && displayValue < 10000 && displayValue >= bestDisplayValue) {
          bestUnit = unit
          bestDisplayValue = displayValue
        }
      }
      
      setCurrencyUnit(bestUnit)
      if (!isNaN(bestDisplayValue) && bestDisplayValue > 0) {
        setBudgetInputValue(bestDisplayValue.toFixed(2).replace(/\.?0+$/, ''))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">{t('form.budget.amountN')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={budgetInputValue}
                  onChange={(e) => handleBudgetAmountChange(e.target.value)}
                  className="form-input flex-1"
                  placeholder="0"
                />
                <select
                  value={currencyUnit}
                  onChange={(e) => handleCurrencyUnitChange(e.target.value)}
                  className="form-input w-32 sm:w-40"
                >
                  <option value="บาท">บาท</option>
                  <option value="ล้าน">ล้าน</option>
                  <option value="ล้านล้าน">ล้านล้าน</option>
                </select>
              </div>
              <input
                type="hidden"
                {...register('budget.amount.amount', { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="form-label">{t('form.budget.currency')}</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                THB
              </div>
              <input
                type="hidden"
                {...register('budget.amount.currency')}
                value="THB"
              />
            </div>
          </div>

          {/* Budget Description (Optional) */}
          <div>
            <label className="form-label">{t('form.budget.description')}</label>
            <textarea
              {...register('budget.description')}
              rows={3}
              className="form-input"
              placeholder={t('form.budget.describeBudget')}
            />
          </div>

          {/* Request and Approval Dates (Optional) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">{t('form.budget.requestDate')}</label>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                />
                <Litepicker
                  value={requestDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setRequestDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)
                    if (isoDate) {
                      setValue('budget.requestDate', isoDate, { shouldValidate: false, shouldDirty: true })
                    } else {
                      setValue('budget.requestDate', '', { shouldValidate: false, shouldDirty: true })
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-10 w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller
                name="budget.requestDate"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value || ''} />
                }}
              />
            </div>
            <div>
              <label className="form-label">{t('form.budget.approvalDate')}</label>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                />
                <Litepicker
                  value={approvalDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setApprovalDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)
                    if (isoDate) {
                      setValue('budget.approvalDate', isoDate, { shouldValidate: false, shouldDirty: true })
                    } else {
                      setValue('budget.approvalDate', '', { shouldValidate: false, shouldDirty: true })
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-10 w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller
                name="budget.approvalDate"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value || ''} />
                }}
              />
            </div>
          </div>
        </div>

  )
}
