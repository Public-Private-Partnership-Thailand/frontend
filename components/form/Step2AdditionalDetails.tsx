import { UseFormRegister, Control, FieldErrors, useFieldArray, UseFormSetValue, UseFormTrigger, useWatch, useFormState, Controller } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useEffect, useRef } from 'react'
import Litepicker from '@/components/Base/Litepicker'
import Lucide from '@/components/Base/Lucide'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { formatDateForLitepicker, parseLitepickerDateToISO } from '@/lib/utils/dateUtils'

interface Step2AdditionalDetailsProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
  trigger: UseFormTrigger<ProjectFormData>
}

export default function Step2AdditionalDetails({ register, control, errors, setValue, getValues, trigger }: Step2AdditionalDetailsProps) {
  const { t } = useLanguage()
  const { touchedFields, isSubmitted } = useFormState({ control })
  const startDateValue = useWatch({ control, name: 'period.startDate' })
  const implementationStartDateValue = useWatch({ control, name: 'implementationPeriod.startDate' })
  const maintenanceStartDateValue = useWatch({ control, name: 'maintenancePeriod.startDate' })
  
  // Period (contract signing) state
  const [durationYear, setDurationYear] = useState<string>('0')
  const [durationMonth, setDurationMonth] = useState<string>('0')
  const [durationDay, setDurationDay] = useState<string>('0')
  const [isProjectCompleted, setIsProjectCompleted] = useState<boolean>(false)
  
  // Implementation period state
  const [implDurationYear, setImplDurationYear] = useState<string>('0')
  const [implDurationMonth, setImplDurationMonth] = useState<string>('0')
  const [implDurationDay, setImplDurationDay] = useState<string>('0')
  const [isImplementationCompleted, setIsImplementationCompleted] = useState<boolean>(false)
  
  // Maintenance period state
  const [maintDurationYear, setMaintDurationYear] = useState<string>('0')
  const [maintDurationMonth, setMaintDurationMonth] = useState<string>('0')
  const [maintDurationDay, setMaintDurationDay] = useState<string>('0')
  const [isMaintenanceCompleted, setIsMaintenanceCompleted] = useState<boolean>(false)
  
  // Use refs to store current duration values for validation
  const durationYearRef = useRef<string>('0')
  const durationMonthRef = useRef<string>('0')
  const durationDayRef = useRef<string>('0')
  const implDurationYearRef = useRef<string>('0')
  const implDurationMonthRef = useRef<string>('0')
  const implDurationDayRef = useRef<string>('0')
  const maintDurationYearRef = useRef<string>('0')
  const maintDurationMonthRef = useRef<string>('0')
  const maintDurationDayRef = useRef<string>('0')
  
  // Update refs when state changes
  useEffect(() => {
    durationYearRef.current = durationYear
    durationMonthRef.current = durationMonth
    durationDayRef.current = durationDay
    implDurationYearRef.current = implDurationYear
    implDurationMonthRef.current = implDurationMonth
    implDurationDayRef.current = implDurationDay
    maintDurationYearRef.current = maintDurationYear
    maintDurationMonthRef.current = maintDurationMonth
    maintDurationDayRef.current = maintDurationDay
  }, [durationYear, durationMonth, durationDay, implDurationYear, implDurationMonth, implDurationDay, maintDurationYear, maintDurationMonth, maintDurationDay])

  // Calculate total days from year, month, day
  const calculateTotalDays = (year: string, month: string, day: string): number => {
    const y = parseInt(year) || 0
    const m = parseInt(month) || 0
    const d = parseInt(day) || 0
    return (y * 365) + (m * 30) + d
  }

  // Initialize duration from existing period data
  useEffect(() => {
    const formValues = getValues()
    let totalDays = 0
    
    if (formValues.period?.startDate && formValues.period?.endDate) {
      const start = parseDateString(formValues.period.startDate)
      const end = parseDateString(formValues.period.endDate)
      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = end.getTime() - start.getTime()
        totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      }
    } else if (formValues.period?.durationInDays) {
      totalDays = formValues.period.durationInDays
    }
    
    if (totalDays > 0) {
      // Convert days to years, months, and days
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      
      setDurationYear(String(years))
      setDurationMonth(String(months))
      setDurationDay(String(days))
    }
  }, [getValues])

  // Update durationInDays when duration changes (only if project is not completed - checkbox is false)
  useEffect(() => {
    if (isProjectCompleted) {
      // If project is completed, don't calculate from duration
      return
    }
    
    const totalDays = calculateTotalDays(durationYear, durationMonth, durationDay)
    
    if (totalDays > 0) {
      // When checkbox is false: set durationInDays, clear endDate
      setValue('period.durationInDays', totalDays, { shouldValidate: false })
      setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
      // Trigger validation after setting value
      trigger('period.endDate')
    } else {
      // Clear both if all duration fields are 0
      setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
      setValue('period.durationInDays', undefined, { shouldValidate: false })
      // Trigger validation after clearing value
      trigger('period.endDate')
    }
  }, [durationYear, durationMonth, durationDay, setValue, trigger, isProjectCompleted])

  // Update implementationPeriod durationInDays when duration changes (only if checkbox is false)
  useEffect(() => {
    if (isImplementationCompleted) {
      return
    }
    
    const totalDays = calculateTotalDays(implDurationYear, implDurationMonth, implDurationDay)
    
    if (totalDays > 0) {
      // When checkbox is false: set durationInDays, clear endDate
      setValue('implementationPeriod.durationInDays', totalDays, { shouldValidate: false })
      setValue('implementationPeriod.endDate', '', { shouldValidate: false })
    } else {
      setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('implementationPeriod.endDate', '', { shouldValidate: false })
    }
  }, [implDurationYear, implDurationMonth, implDurationDay, setValue, isImplementationCompleted])

  // Update maintenancePeriod durationInDays when duration changes (only if checkbox is false)
  useEffect(() => {
    if (isMaintenanceCompleted) {
      return
    }
    
    const totalDays = calculateTotalDays(maintDurationYear, maintDurationMonth, maintDurationDay)
    
    if (totalDays > 0) {
      // When checkbox is false: set durationInDays, clear endDate
      setValue('maintenancePeriod.durationInDays', totalDays, { shouldValidate: false })
      setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
    } else {
      setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
    }
  }, [maintDurationYear, maintDurationMonth, maintDurationDay, setValue, isMaintenanceCompleted])
  
  // Date conversion functions are now imported from @/lib/utils/dateUtils

  // Helper function to parse ISO 8601 or DD-MM-YYYY date string to Date object
  const parseDateString = (dateString: string): Date | null => {
    if (!dateString) return null
    // Try ISO 8601 format first (e.g., "2025-12-05T00:00:00+07:00")
    let date = dayjs(dateString)
    if (!date.isValid()) {
      // Fallback to DD-MM-YYYY format
      date = dayjs(dateString, 'DD-MM-YYYY', true)
    }
    if (!date.isValid()) {
      // Fallback to YYYY-MM-DD
      date = dayjs(dateString, 'YYYY-MM-DD', true)
    }
    if (!date.isValid()) return null
    return date.toDate()
  }

  // State for Litepicker display values
  const [contractSigningDateDisplay, setContractSigningDateDisplay] = useState<string>('')
  const [projectEndDateDisplay, setProjectEndDateDisplay] = useState<string>('')
  const [implementationStartDateDisplay, setImplementationStartDateDisplay] = useState<string>('')
  const [implementationEndDateDisplay, setImplementationEndDateDisplay] = useState<string>('')
  const [maintenanceStartDateDisplay, setMaintenanceStartDateDisplay] = useState<string>('')
  const [maintenanceEndDateDisplay, setMaintenanceEndDateDisplay] = useState<string>('')

  // Initialize display values from form values
  useEffect(() => {
    const formValues = getValues()
    
    // Period (contract signing)
    if (formValues.period?.startDate) {
      setContractSigningDateDisplay(formatDateForLitepicker(formValues.period.startDate))
    }
    if (formValues.period?.endDate) {
      setProjectEndDateDisplay(formatDateForLitepicker(formValues.period.endDate))
      setIsProjectCompleted(true)
    }
    
    // Implementation period
    if (formValues.implementationPeriod?.startDate) {
      setImplementationStartDateDisplay(formatDateForLitepicker(formValues.implementationPeriod.startDate))
    }
    if (formValues.implementationPeriod?.endDate) {
      setImplementationEndDateDisplay(formatDateForLitepicker(formValues.implementationPeriod.endDate))
      setIsImplementationCompleted(true)
    } else if (formValues.implementationPeriod?.durationInDays) {
      const totalDays = formValues.implementationPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setImplDurationYear(String(years))
      setImplDurationMonth(String(months))
      setImplDurationDay(String(days))
    }
    
    // Maintenance period
    if (formValues.maintenancePeriod?.startDate) {
      setMaintenanceStartDateDisplay(formatDateForLitepicker(formValues.maintenancePeriod.startDate))
    }
    if (formValues.maintenancePeriod?.endDate) {
      setMaintenanceEndDateDisplay(formatDateForLitepicker(formValues.maintenancePeriod.endDate))
      setIsMaintenanceCompleted(true)
    } else if (formValues.maintenancePeriod?.durationInDays) {
      const totalDays = formValues.maintenancePeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setMaintDurationYear(String(years))
      setMaintDurationMonth(String(months))
      setMaintDurationDay(String(days))
    }
  }, [getValues])

  return (
    <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="form-label mb-0">{t('pages.view.contractSigningDate')} *</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProjectCompleted}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsProjectCompleted(checked)
                      if (!checked) {
                        // When unchecking: clear endDate, clear durationInDays (will be set by duration inputs)
                        setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
                        setValue('period.durationInDays', undefined, { shouldValidate: false })
                        setProjectEndDateDisplay('')
                        // Clear duration fields
                        setDurationYear('0')
                        setDurationMonth('0')
                        setDurationDay('0')
                        trigger('period.endDate')
                      } else {
                        // When checking: clear duration fields and durationInDays (will be calculated from endDate)
                        setDurationYear('0')
                        setDurationMonth('0')
                        setDurationDay('0')
                        setValue('period.durationInDays', undefined, { shouldValidate: false })
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-700">โครงการสิ้นสุดแล้ว</span>
                </label>
              </div>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                />
                <Litepicker
                  value={contractSigningDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setContractSigningDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)

                    if (isoDate) {
                      // Set the value in ISO 8601 format, mark as touched, dirty, and validate
                      setValue('period.startDate', isoDate, { shouldValidate: true, shouldTouch: true, shouldDirty: true })
                      // Also trigger validation explicitly to ensure it runs
                      setTimeout(() => {
                        trigger('period.startDate')
                      }, 0)
                    } else {
                      // Clear the value if parsing failed
                      setValue('period.startDate', '', { shouldValidate: true, shouldTouch: true, shouldDirty: true })
                      setTimeout(() => {
                        trigger('period.startDate')
                      }, 0)
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
                  className={`pl-10 w-full ${errors.period?.startDate && (touchedFields.period?.startDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="เลือกวันที่"
                />
              </div>
              {/* Hidden inputs for form validation - using Controller to ensure values persist */}
              <Controller
                name="period.startDate"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value || ''} />
                }}
              />
              <Controller
                name="period.durationInDays"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value ?? ''} />
                }}
              />
              {errors.period?.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.period.startDate.message}</p>
              )}
            </div>
            
            {isProjectCompleted ? (
              <div>
                <label className="form-label">{t('form.period.endDate')} *</label>
                <label className="text-sm text-transparent mb-1 block">.</label>
                <div className="relative">
                  <Lucide
                    icon="Calendar"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                  />
                  <Litepicker
                    value={projectEndDateDisplay}
                    onChange={(e) => {
                      const litepickerValue = e.target.value
                      setProjectEndDateDisplay(litepickerValue)
                      const isoDate = parseLitepickerDateToISO(litepickerValue)

                      if (isoDate) {
                        // When checkbox is true: set endDate in ISO 8601 format, calculate and set durationInDays, clear duration fields
                        setValue('period.endDate', isoDate, { shouldValidate: true, shouldTouch: true })
                        // Calculate durationInDays from startDate and endDate
                        if (startDateValue) {
                          const start = parseDateString(startDateValue)
                          const end = parseDateString(isoDate)
                          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            const diffTime = end.getTime() - start.getTime()
                            const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                            if (daysDiff > 0) {
                              setValue('period.durationInDays', daysDiff, { shouldValidate: false })
                            } else {
                              setValue('period.durationInDays', undefined, { shouldValidate: false })
                            }
                          }
                        }
                        setTimeout(() => {
                          trigger('period.endDate')
                        }, 0)
                      } else {
                        setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
                        setValue('period.durationInDays', undefined, { shouldValidate: false })
                        setTimeout(() => {
                          trigger('period.endDate')
                        }, 0)
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
                    className={`pl-10 w-full ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="เลือกวันที่"
                  />
                </div>
                {/* Hidden inputs for form validation - using Controller to ensure values persist */}
                <Controller
                  name="period.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="period.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
                {errors.period?.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="form-label">{t('pages.view.projectDuration') || 'ระยะเวลาโครงการ'} *</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">ปี</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationYear}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setDurationYear(value)
                        durationYearRef.current = value // Update ref immediately
                      }}
                      className={`form-input ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">เดือน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationMonth}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setDurationMonth(value)
                        durationMonthRef.current = value // Update ref immediately
                      }}
                      className={`form-input ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">วัน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={durationDay}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setDurationDay(value)
                        durationDayRef.current = value // Update ref immediately
                      }}
                      className={`form-input ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0"
                    />
                  </div>
                </div>
                {/* Hidden inputs for form validation - using Controller to ensure values persist */}
                <Controller
                  name="period.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="period.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
                {errors.period?.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Implementation Period Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 pt-6 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="form-label mb-0">วันที่เริ่มก่อสร้างที่แพลนไว้</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImplementationCompleted}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsImplementationCompleted(checked)
                      if (!checked) {
                        // When unchecking: clear endDate, clear durationInDays (will be set by duration inputs)
                        setValue('implementationPeriod.endDate', '', { shouldValidate: false })
                        setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                        setImplementationEndDateDisplay('')
                        setImplDurationYear('0')
                        setImplDurationMonth('0')
                        setImplDurationDay('0')
                      } else {
                        // When checking: clear duration fields and durationInDays (will be calculated from endDate)
                        setImplDurationYear('0')
                        setImplDurationMonth('0')
                        setImplDurationDay('0')
                        setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-700">ก่อสร้างเสร็จแล้ว</span>
                </label>
              </div>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                />
                <Litepicker
                  value={implementationStartDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setImplementationStartDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)

                    if (isoDate) {
                      setValue('implementationPeriod.startDate', isoDate, { shouldValidate: false, shouldDirty: true })
                    } else {
                      setValue('implementationPeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
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
                name="implementationPeriod.startDate"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value || ''} />
                }}
              />
              <Controller
                name="implementationPeriod.durationInDays"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value ?? ''} />
                }}
              />
            </div>
            
            {isImplementationCompleted ? (
              <div>
                <label className="form-label">{t('form.period.endDate')} *</label>
                <label className="text-sm text-transparent mb-1 block">.</label>
                <div className="relative">
                  <Lucide
                    icon="Calendar"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                  />
                  <Litepicker
                    value={implementationEndDateDisplay}
                    onChange={(e) => {
                      const litepickerValue = e.target.value
                      setImplementationEndDateDisplay(litepickerValue)
                      const isoDate = parseLitepickerDateToISO(litepickerValue)

                      if (isoDate) {
                        // When checkbox is true: set endDate in ISO 8601 format, calculate and set durationInDays, clear duration fields
                        setValue('implementationPeriod.endDate', isoDate, { shouldValidate: false })
                        // Calculate durationInDays from startDate and endDate
                        if (implementationStartDateValue) {
                          const start = parseDateString(implementationStartDateValue)
                          const end = parseDateString(isoDate)
                          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            const diffTime = end.getTime() - start.getTime()
                            const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                            if (daysDiff > 0) {
                              setValue('implementationPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            } else {
                              setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                            }
                          } else {
                            setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                          }
                        } else {
                          setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      } else {
                        setValue('implementationPeriod.endDate', '', { shouldValidate: false })
                        setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
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
                  name="implementationPeriod.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="implementationPeriod.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="form-label">ระยะเวลาก่อสร้าง *</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">ปี</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={implDurationYear}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setImplDurationYear(value)
                        implDurationYearRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">เดือน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={implDurationMonth}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setImplDurationMonth(value)
                        implDurationMonthRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">วัน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={implDurationDay}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setImplDurationDay(value)
                        implDurationDayRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
                <Controller
                  name="implementationPeriod.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="implementationPeriod.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
              </div>
            )}
          </div>

          {/* Maintenance Period Section */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 pt-6 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="form-label mb-0">วันที่เริ่มบำรุงรักษาที่แพลนไว้</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMaintenanceCompleted}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsMaintenanceCompleted(checked)
                      if (!checked) {
                        // When unchecking: clear endDate, clear durationInDays (will be set by duration inputs)
                        setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
                        setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                        setMaintenanceEndDateDisplay('')
                        setMaintDurationYear('0')
                        setMaintDurationMonth('0')
                        setMaintDurationDay('0')
                      } else {
                        // When checking: clear duration fields and durationInDays (will be calculated from endDate)
                        setMaintDurationYear('0')
                        setMaintDurationMonth('0')
                        setMaintDurationDay('0')
                        setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span className="text-sm text-gray-700">หยุดบำรุงรักษาแล้ว</span>
                </label>
              </div>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                />
                <Litepicker
                  value={maintenanceStartDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setMaintenanceStartDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)

                    if (isoDate) {
                      setValue('maintenancePeriod.startDate', isoDate, { shouldValidate: false, shouldDirty: true })
                    } else {
                      setValue('maintenancePeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
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
                name="maintenancePeriod.startDate"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value || ''} />
                }}
              />
              <Controller
                name="maintenancePeriod.durationInDays"
                control={control}
                render={({ field }) => {
                  const { value, ...rest } = field
                  return <input type="hidden" {...rest} value={value ?? ''} />
                }}
              />
            </div>
            
            {isMaintenanceCompleted ? (
              <div>
                <label className="form-label">{t('form.period.endDate')} *</label>
                <label className="text-sm text-transparent mb-1 block">.</label>
                <div className="relative">
                  <Lucide
                    icon="Calendar"
                    className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400"
                  />
                  <Litepicker
                    value={maintenanceEndDateDisplay}
                    onChange={(e) => {
                      const litepickerValue = e.target.value
                      setMaintenanceEndDateDisplay(litepickerValue)
                      const isoDate = parseLitepickerDateToISO(litepickerValue)
                      console.log('Maintenance End Date selected:', { litepickerValue, isoDate })
                      if (isoDate) {
                        // When checkbox is true: set endDate in ISO 8601 format, calculate and set durationInDays, clear duration fields
                        setValue('maintenancePeriod.endDate', isoDate, { shouldValidate: false })
                        // Calculate durationInDays from startDate and endDate
                        if (maintenanceStartDateValue) {
                          const start = parseDateString(maintenanceStartDateValue)
                          const end = parseDateString(isoDate)
                          if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            const diffTime = end.getTime() - start.getTime()
                            const daysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                            if (daysDiff > 0) {
                              setValue('maintenancePeriod.durationInDays', daysDiff, { shouldValidate: false })
                            } else {
                              setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                            }
                          } else {
                            setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                          }
                        } else {
                          setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      } else {
                        setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
                        setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
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
                  name="maintenancePeriod.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="maintenancePeriod.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="form-label">ระยะเวลาบำรุงรักษา *</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">ปี</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maintDurationYear}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setMaintDurationYear(value)
                        maintDurationYearRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">เดือน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maintDurationMonth}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setMaintDurationMonth(value)
                        maintDurationMonthRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">วัน</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={maintDurationDay}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value
                        setMaintDurationDay(value)
                        maintDurationDayRef.current = value
                      }}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
                <Controller
                  name="maintenancePeriod.endDate"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value || ''} />
                  }}
                />
                <Controller
                  name="maintenancePeriod.durationInDays"
                  control={control}
                  render={({ field }) => {
                    const { value, ...rest } = field
                    return <input type="hidden" {...rest} value={value ?? ''} />
                  }}
                />
              </div>
            )}
        </div>
        </div>

  )
}

