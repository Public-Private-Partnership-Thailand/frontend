import { UseFormRegister, Control, FieldErrors, useFieldArray, UseFormSetValue, UseFormTrigger, useWatch, useFormState, Controller } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useEffect, useRef } from 'react'
import Litepicker from '@/components/Base/Litepicker'
import Lucide from '@/components/Base/Lucide'
import Tippy from '@/components/Base/Tippy'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import { formatDateForLitepicker, parseLitepickerDateToISO, formatToISO8601, APP_TIMEZONE } from '@/lib/utils/dateUtils'

interface Step2AdditionalDetailsProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
  trigger: UseFormTrigger<ProjectFormData>
}

const DURATION_INFO_TOOLTIP = 'ระยะเวลา 1 ปี = 365 วัน, 1 เดือน = 30 วัน (ระบบใช้ค่าดังกล่าวในการคำนวณจำนวนวัน)'

const currentYear = dayjs().year()
const YEAR_MIN = currentYear - 100
const YEAR_MAX = currentYear + 100

function DurationLabel() {
  return (
    <span className="inline-flex items-center gap-1">
      ระยะเวลา
      <Tippy content={DURATION_INFO_TOOLTIP} as="span" className="inline-flex cursor-help">
        <Lucide icon="Info" className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </Tippy>
    </span>
  )
}

export default function Step2AdditionalDetails({ register, control, errors, setValue, getValues, trigger }: Step2AdditionalDetailsProps) {
  const { t } = useLanguage()
  const { touchedFields, isSubmitted } = useFormState({ control })
  const startDateValue = useWatch({ control, name: 'period.startDate' })
  const identificationStartDateValue = useWatch({ control, name: 'identificationPeriod.startDate' })
  const preparationStartDateValue = useWatch({ control, name: 'preparationPeriod.startDate' })
  const implementationStartDateValue = useWatch({ control, name: 'implementationPeriod.startDate' })
  const completionStartDateValue = useWatch({ control, name: 'completionPeriod.startDate' })
  const maintenanceStartDateValue = useWatch({ control, name: 'maintenancePeriod.startDate' })
  const decommissioningStartDateValue = useWatch({ control, name: 'decommissioningPeriod.startDate' })
  
  // Period (contract signing) state
  const [durationYear, setDurationYear] = useState<string>('0')
  const [durationMonth, setDurationMonth] = useState<string>('0')
  const [durationDay, setDurationDay] = useState<string>('0')
  
  // Identification period state
  const [identDurationYear, setIdentDurationYear] = useState<string>('0')
  const [identDurationMonth, setIdentDurationMonth] = useState<string>('0')
  const [identDurationDay, setIdentDurationDay] = useState<string>('0')
  
  // Preparation period state
  const [prepDurationYear, setPrepDurationYear] = useState<string>('0')
  const [prepDurationMonth, setPrepDurationMonth] = useState<string>('0')
  const [prepDurationDay, setPrepDurationDay] = useState<string>('0')
  
  // Implementation period state
  const [implDurationYear, setImplDurationYear] = useState<string>('0')
  const [implDurationMonth, setImplDurationMonth] = useState<string>('0')
  const [implDurationDay, setImplDurationDay] = useState<string>('0')
  
  // Completion period state
  const [completeDurationYear, setCompleteDurationYear] = useState<string>('0')
  const [completeDurationMonth, setCompleteDurationMonth] = useState<string>('0')
  const [completeDurationDay, setCompleteDurationDay] = useState<string>('0')
  
  // Maintenance period state
  const [maintDurationYear, setMaintDurationYear] = useState<string>('0')
  const [maintDurationMonth, setMaintDurationMonth] = useState<string>('0')
  const [maintDurationDay, setMaintDurationDay] = useState<string>('0')
  
  // Decommissioning period state
  const [decommDurationYear, setDecommDurationYear] = useState<string>('0')
  const [decommDurationMonth, setDecommDurationMonth] = useState<string>('0')
  const [decommDurationDay, setDecommDurationDay] = useState<string>('0')
  
  // Use refs to store current duration values for validation
  const durationYearRef = useRef<string>('0')
  const durationMonthRef = useRef<string>('0')
  const durationDayRef = useRef<string>('0')
  const identDurationYearRef = useRef<string>('0')
  const identDurationMonthRef = useRef<string>('0')
  const identDurationDayRef = useRef<string>('0')
  const prepDurationYearRef = useRef<string>('0')
  const prepDurationMonthRef = useRef<string>('0')
  const prepDurationDayRef = useRef<string>('0')
  const implDurationYearRef = useRef<string>('0')
  const implDurationMonthRef = useRef<string>('0')
  const implDurationDayRef = useRef<string>('0')
  const completeDurationYearRef = useRef<string>('0')
  const completeDurationMonthRef = useRef<string>('0')
  const completeDurationDayRef = useRef<string>('0')
  const maintDurationYearRef = useRef<string>('0')
  const maintDurationMonthRef = useRef<string>('0')
  const maintDurationDayRef = useRef<string>('0')
  const decommDurationYearRef = useRef<string>('0')
  const decommDurationMonthRef = useRef<string>('0')
  const decommDurationDayRef = useRef<string>('0')
  
  // Refs to avoid clearing endDate when it was just set from date picker (duration effect would overwrite it)
  const periodEndDateFromPickerRef = useRef(false)
  const identEndDateFromPickerRef = useRef(false)
  const prepEndDateFromPickerRef = useRef(false)
  const implEndDateFromPickerRef = useRef(false)
  const completeEndDateFromPickerRef = useRef(false)
  const maintEndDateFromPickerRef = useRef(false)
  const decommEndDateFromPickerRef = useRef(false)
  
  // Update refs when state changes
  useEffect(() => {
    durationYearRef.current = durationYear
    durationMonthRef.current = durationMonth
    durationDayRef.current = durationDay
    identDurationYearRef.current = identDurationYear
    identDurationMonthRef.current = identDurationMonth
    identDurationDayRef.current = identDurationDay
    prepDurationYearRef.current = prepDurationYear
    prepDurationMonthRef.current = prepDurationMonth
    prepDurationDayRef.current = prepDurationDay
    implDurationYearRef.current = implDurationYear
    implDurationMonthRef.current = implDurationMonth
    implDurationDayRef.current = implDurationDay
    completeDurationYearRef.current = completeDurationYear
    completeDurationMonthRef.current = completeDurationMonth
    completeDurationDayRef.current = completeDurationDay
    maintDurationYearRef.current = maintDurationYear
    maintDurationMonthRef.current = maintDurationMonth
    maintDurationDayRef.current = maintDurationDay
    decommDurationYearRef.current = decommDurationYear
    decommDurationMonthRef.current = decommDurationMonth
    decommDurationDayRef.current = decommDurationDay
  }, [durationYear, durationMonth, durationDay, identDurationYear, identDurationMonth, identDurationDay, prepDurationYear, prepDurationMonth, prepDurationDay, implDurationYear, implDurationMonth, implDurationDay, completeDurationYear, completeDurationMonth, completeDurationDay, maintDurationYear, maintDurationMonth, maintDurationDay, decommDurationYear, decommDurationMonth, decommDurationDay])

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

  // Compute endDate ISO from startDate + days (so schema gets both when user enters duration)
  const computeEndDateFromStartAndDays = (startDateIso: string | undefined, days: number): string => {
    if (!startDateIso || days <= 0) return ''
    const start = dayjs(startDateIso).tz(APP_TIMEZONE)
    if (!start.isValid()) return ''
    return formatToISO8601(start.add(days, 'day'))
  }

  // Update durationInDays when duration changes (skip if endDate was just set from picker). When user enters duration, set endDate = startDate + duration so schema has both.
  useEffect(() => {
    if (periodEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(durationYear, durationMonth, durationDay)
    const startDate = getValues().period?.startDate
    
    if (totalDays > 0) {
      setValue('period.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('period.endDate', endDateIso, { shouldValidate: true, shouldTouch: true })
      if (endDateIso) setProjectEndDateDisplay(formatDateForLitepicker(endDateIso))
      trigger('period.endDate')
    } else {
      setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
      setValue('period.durationInDays', undefined, { shouldValidate: false })
      trigger('period.endDate')
    }
  }, [durationYear, durationMonth, durationDay, setValue, trigger])

  // Update identificationPeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (identEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(identDurationYear, identDurationMonth, identDurationDay)
    const startDate = getValues().identificationPeriod?.startDate
    if (totalDays > 0) {
      setValue('identificationPeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('identificationPeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setIdentificationEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('identificationPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('identificationPeriod.endDate', '', { shouldValidate: false })
    }
  }, [identDurationYear, identDurationMonth, identDurationDay, setValue])

  // Update preparationPeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (prepEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(prepDurationYear, prepDurationMonth, prepDurationDay)
    const startDate = getValues().preparationPeriod?.startDate
    if (totalDays > 0) {
      setValue('preparationPeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('preparationPeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setPreparationEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('preparationPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('preparationPeriod.endDate', '', { shouldValidate: false })
    }
  }, [prepDurationYear, prepDurationMonth, prepDurationDay, setValue])

  // Update implementationPeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (implEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(implDurationYear, implDurationMonth, implDurationDay)
    const startDate = getValues().implementationPeriod?.startDate
    if (totalDays > 0) {
      setValue('implementationPeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('implementationPeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setImplementationEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('implementationPeriod.endDate', '', { shouldValidate: false })
    }
  }, [implDurationYear, implDurationMonth, implDurationDay, setValue])

  // Update completionPeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (completeEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(completeDurationYear, completeDurationMonth, completeDurationDay)
    const startDate = getValues().completionPeriod?.startDate
    if (totalDays > 0) {
      setValue('completionPeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('completionPeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setCompletionEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('completionPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('completionPeriod.endDate', '', { shouldValidate: false })
    }
  }, [completeDurationYear, completeDurationMonth, completeDurationDay, setValue])

  // Update maintenancePeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (maintEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(maintDurationYear, maintDurationMonth, maintDurationDay)
    const startDate = getValues().maintenancePeriod?.startDate
    if (totalDays > 0) {
      setValue('maintenancePeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('maintenancePeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setMaintenanceEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
    }
  }, [maintDurationYear, maintDurationMonth, maintDurationDay, setValue])

  // Update decommissioningPeriod durationInDays when duration changes; set endDate = startDate + duration
  useEffect(() => {
    if (decommEndDateFromPickerRef.current) return
    const totalDays = calculateTotalDays(decommDurationYear, decommDurationMonth, decommDurationDay)
    const startDate = getValues().decommissioningPeriod?.startDate
    if (totalDays > 0) {
      setValue('decommissioningPeriod.durationInDays', totalDays, { shouldValidate: false })
      const endDateIso = computeEndDateFromStartAndDays(startDate, totalDays)
      setValue('decommissioningPeriod.endDate', endDateIso, { shouldValidate: false })
      if (endDateIso) setDecommissioningEndDateDisplay(formatDateForLitepicker(endDateIso))
    } else {
      setValue('decommissioningPeriod.durationInDays', undefined, { shouldValidate: false })
      setValue('decommissioningPeriod.endDate', '', { shouldValidate: false })
    }
  }, [decommDurationYear, decommDurationMonth, decommDurationDay, setValue])

  // When start date changes, recalc end date from start + duration so the three fields stay in sync
  useEffect(() => {
    periodEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(durationYear, durationMonth, durationDay)
    if (startDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(startDateValue, totalDays)
      if (endIso) {
        setValue('period.endDate', endIso, { shouldValidate: false, shouldTouch: true })
        setValue('period.durationInDays', totalDays, { shouldValidate: false })
        setProjectEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [startDateValue])
  useEffect(() => {
    identEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(identDurationYear, identDurationMonth, identDurationDay)
    if (identificationStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(identificationStartDateValue, totalDays)
      if (endIso) {
        setValue('identificationPeriod.endDate', endIso, { shouldValidate: false })
        setValue('identificationPeriod.durationInDays', totalDays, { shouldValidate: false })
        setIdentificationEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [identificationStartDateValue])
  useEffect(() => {
    prepEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(prepDurationYear, prepDurationMonth, prepDurationDay)
    if (preparationStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(preparationStartDateValue, totalDays)
      if (endIso) {
        setValue('preparationPeriod.endDate', endIso, { shouldValidate: false })
        setValue('preparationPeriod.durationInDays', totalDays, { shouldValidate: false })
        setPreparationEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [preparationStartDateValue])
  useEffect(() => {
    implEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(implDurationYear, implDurationMonth, implDurationDay)
    if (implementationStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(implementationStartDateValue, totalDays)
      if (endIso) {
        setValue('implementationPeriod.endDate', endIso, { shouldValidate: false })
        setValue('implementationPeriod.durationInDays', totalDays, { shouldValidate: false })
        setImplementationEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [implementationStartDateValue])
  useEffect(() => {
    completeEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(completeDurationYear, completeDurationMonth, completeDurationDay)
    if (completionStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(completionStartDateValue, totalDays)
      if (endIso) {
        setValue('completionPeriod.endDate', endIso, { shouldValidate: false })
        setValue('completionPeriod.durationInDays', totalDays, { shouldValidate: false })
        setCompletionEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [completionStartDateValue])
  useEffect(() => {
    maintEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(maintDurationYear, maintDurationMonth, maintDurationDay)
    if (maintenanceStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(maintenanceStartDateValue, totalDays)
      if (endIso) {
        setValue('maintenancePeriod.endDate', endIso, { shouldValidate: false })
        setValue('maintenancePeriod.durationInDays', totalDays, { shouldValidate: false })
        setMaintenanceEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [maintenanceStartDateValue])
  useEffect(() => {
    decommEndDateFromPickerRef.current = false
    const totalDays = calculateTotalDays(decommDurationYear, decommDurationMonth, decommDurationDay)
    if (decommissioningStartDateValue && totalDays > 0) {
      const endIso = computeEndDateFromStartAndDays(decommissioningStartDateValue, totalDays)
      if (endIso) {
        setValue('decommissioningPeriod.endDate', endIso, { shouldValidate: false })
        setValue('decommissioningPeriod.durationInDays', totalDays, { shouldValidate: false })
        setDecommissioningEndDateDisplay(formatDateForLitepicker(endIso))
      }
    }
  }, [decommissioningStartDateValue])
  
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
  const [identificationStartDateDisplay, setIdentificationStartDateDisplay] = useState<string>('')
  const [identificationEndDateDisplay, setIdentificationEndDateDisplay] = useState<string>('')
  const [preparationStartDateDisplay, setPreparationStartDateDisplay] = useState<string>('')
  const [preparationEndDateDisplay, setPreparationEndDateDisplay] = useState<string>('')
  const [implementationStartDateDisplay, setImplementationStartDateDisplay] = useState<string>('')
  const [implementationEndDateDisplay, setImplementationEndDateDisplay] = useState<string>('')
  const [completionStartDateDisplay, setCompletionStartDateDisplay] = useState<string>('')
  const [completionEndDateDisplay, setCompletionEndDateDisplay] = useState<string>('')
  const [maintenanceStartDateDisplay, setMaintenanceStartDateDisplay] = useState<string>('')
  const [maintenanceEndDateDisplay, setMaintenanceEndDateDisplay] = useState<string>('')
  const [decommissioningStartDateDisplay, setDecommissioningStartDateDisplay] = useState<string>('')
  const [decommissioningEndDateDisplay, setDecommissioningEndDateDisplay] = useState<string>('')

  // Initialize display values from form values (e.g. when editing and form is reset with project data)
  useEffect(() => {
    const formValues = getValues()
    
    // Period (contract signing)
    if (formValues.period?.startDate) {
      setContractSigningDateDisplay(formatDateForLitepicker(formValues.period.startDate))
    }
    if (formValues.period?.endDate) {
      setProjectEndDateDisplay(formatDateForLitepicker(formValues.period.endDate))
    }
    
    // Identification period
    if (formValues.identificationPeriod?.startDate) {
      setIdentificationStartDateDisplay(formatDateForLitepicker(formValues.identificationPeriod.startDate))
    }
    if (formValues.identificationPeriod?.endDate) {
      setIdentificationEndDateDisplay(formatDateForLitepicker(formValues.identificationPeriod.endDate))
    }
    if (formValues.identificationPeriod?.durationInDays) {
      const totalDays = formValues.identificationPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setIdentDurationYear(String(years))
      setIdentDurationMonth(String(months))
      setIdentDurationDay(String(days))
    }
    
    // Preparation period
    if (formValues.preparationPeriod?.startDate) {
      setPreparationStartDateDisplay(formatDateForLitepicker(formValues.preparationPeriod.startDate))
    }
    if (formValues.preparationPeriod?.endDate) {
      setPreparationEndDateDisplay(formatDateForLitepicker(formValues.preparationPeriod.endDate))
    }
    if (formValues.preparationPeriod?.durationInDays) {
      const totalDays = formValues.preparationPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setPrepDurationYear(String(years))
      setPrepDurationMonth(String(months))
      setPrepDurationDay(String(days))
    }
    
    // Implementation period
    if (formValues.implementationPeriod?.startDate) {
      setImplementationStartDateDisplay(formatDateForLitepicker(formValues.implementationPeriod.startDate))
    }
    if (formValues.implementationPeriod?.endDate) {
      setImplementationEndDateDisplay(formatDateForLitepicker(formValues.implementationPeriod.endDate))
    }
    if (formValues.implementationPeriod?.durationInDays) {
      const totalDays = formValues.implementationPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setImplDurationYear(String(years))
      setImplDurationMonth(String(months))
      setImplDurationDay(String(days))
    }
    
    // Completion period
    if (formValues.completionPeriod?.startDate) {
      setCompletionStartDateDisplay(formatDateForLitepicker(formValues.completionPeriod.startDate))
    }
    if (formValues.completionPeriod?.endDate) {
      setCompletionEndDateDisplay(formatDateForLitepicker(formValues.completionPeriod.endDate))
    }
    if (formValues.completionPeriod?.durationInDays) {
      const totalDays = formValues.completionPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setCompleteDurationYear(String(years))
      setCompleteDurationMonth(String(months))
      setCompleteDurationDay(String(days))
    }
    
    // Maintenance period
    if (formValues.maintenancePeriod?.startDate) {
      setMaintenanceStartDateDisplay(formatDateForLitepicker(formValues.maintenancePeriod.startDate))
    }
    if (formValues.maintenancePeriod?.endDate) {
      setMaintenanceEndDateDisplay(formatDateForLitepicker(formValues.maintenancePeriod.endDate))
    }
    if (formValues.maintenancePeriod?.durationInDays) {
      const totalDays = formValues.maintenancePeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setMaintDurationYear(String(years))
      setMaintDurationMonth(String(months))
      setMaintDurationDay(String(days))
    }
    
    // Decommissioning period
    if (formValues.decommissioningPeriod?.startDate) {
      setDecommissioningStartDateDisplay(formatDateForLitepicker(formValues.decommissioningPeriod.startDate))
    }
    if (formValues.decommissioningPeriod?.endDate) {
      setDecommissioningEndDateDisplay(formatDateForLitepicker(formValues.decommissioningPeriod.endDate))
    }
    if (formValues.decommissioningPeriod?.durationInDays) {
      const totalDays = formValues.decommissioningPeriod.durationInDays
      const years = Math.floor(totalDays / 365)
      const remainingDaysAfterYears = totalDays % 365
      const months = Math.floor(remainingDaysAfterYears / 30)
      const days = remainingDaysAfterYears % 30
      setDecommDurationYear(String(years))
      setDecommDurationMonth(String(months))
      setDecommDurationDay(String(days))
    }
  }, [getValues]) // eslint-disable-line react-hooks/exhaustive-deps -- only run once on mount

  // Helper to set duration state from total days (for syncing when endDate is picked)
  const setDurationStateFromDays = (totalDays: number, setYear: (v: string) => void, setMonth: (v: string) => void, setDay: (v: string) => void) => {
    if (totalDays <= 0) return
    const years = Math.floor(totalDays / 365)
    const remainingDaysAfterYears = totalDays % 365
    const months = Math.floor(remainingDaysAfterYears / 30)
    const days = remainingDaysAfterYears % 30
    setYear(String(years))
    setMonth(String(months))
    setDay(String(days))
  }

  return (
    <div className="space-y-6">
          {/* Period: startDate | endDate | periodInDays (duration) - 3 columns */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่ลงนามในสัญญา</label>
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
                      setValue('period.startDate', isoDate, { shouldValidate: true, shouldTouch: true, shouldDirty: true })
                      setTimeout(() => trigger('period.startDate'), 0)
                    } else {
                      setValue('period.startDate', '', { shouldValidate: true, shouldTouch: true, shouldDirty: true })
                      setTimeout(() => trigger('period.startDate'), 0)
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className={`pl-10 w-full min-w-0 max-w-full ${errors.period?.startDate && (touchedFields.period?.startDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="period.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="period.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
              {errors.period?.startDate && <p className="mt-1 text-sm text-red-600">{errors.period.startDate.message}</p>}
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={projectEndDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setProjectEndDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)
                    if (isoDate) {
                      setValue('period.endDate', isoDate, { shouldValidate: true, shouldTouch: true })
                      if (startDateValue) {
                        const start = parseDateString(startDateValue)
                        const end = parseDateString(isoDate)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                            if (daysDiff > 0) {
                              setValue('period.durationInDays', daysDiff, { shouldValidate: false })
                            periodEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setDurationYear, setDurationMonth, setDurationDay)
                          } else {
                            setValue('period.durationInDays', undefined, { shouldValidate: false })
                          }
                        }
                      }
                      setTimeout(() => trigger('period.endDate'), 0)
                    } else {
                      setValue('period.endDate', '', { shouldValidate: true, shouldTouch: true })
                      setValue('period.durationInDays', undefined, { shouldValidate: false })
                      setDurationYear('0')
                      setDurationMonth('0')
                      setDurationDay('0')
                      setTimeout(() => trigger('period.endDate'), 0)
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className={`pl-10 w-full min-w-0 max-w-full ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="period.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              {errors.period?.endDate && <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>}
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">ปี</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={durationYear}
                    onChange={(e) => {
                      periodEndDateFromPickerRef.current = false
                      const value = e.target.value === '' ? '0' : e.target.value
                      setDurationYear(value)
                      durationYearRef.current = value
                    }}
                    className={`form-input w-full ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                      periodEndDateFromPickerRef.current = false
                      const value = e.target.value === '' ? '0' : e.target.value
                      setDurationMonth(value)
                      durationMonthRef.current = value
                    }}
                    className={`form-input w-full ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                      periodEndDateFromPickerRef.current = false
                      const value = e.target.value === '' ? '0' : e.target.value
                      setDurationDay(value)
                      durationDayRef.current = value
                    }}
                    className={`form-input w-full ${errors.period?.endDate && (touchedFields.period?.endDate || isSubmitted) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="0"
                  />
                </div>
              </div>
              <Controller name="period.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="period.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
              {errors.period?.endDate && <p className="mt-1 text-sm text-red-600">{errors.period.endDate.message}</p>}
            </div>
          </div>

          {/* Identification Period */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะเวลาการเริ่มต้นโครงการ (Identification Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={identificationStartDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setIdentificationStartDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) setValue('identificationPeriod.startDate', iso, { shouldValidate: false, shouldDirty: true })
                    else setValue('identificationPeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="identificationPeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="identificationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={identificationEndDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setIdentificationEndDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) {
                      setValue('identificationPeriod.endDate', iso, { shouldValidate: false })
                      if (identificationStartDateValue) {
                        const start = parseDateString(identificationStartDateValue)
                        const end = parseDateString(iso)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('identificationPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            identEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setIdentDurationYear, setIdentDurationMonth, setIdentDurationDay)
                          } else setValue('identificationPeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      }
                    } else {
                      setValue('identificationPeriod.endDate', '', { shouldValidate: false })
                      setValue('identificationPeriod.durationInDays', undefined, { shouldValidate: false })
                      setIdentDurationYear('0')
                      setIdentDurationMonth('0')
                      setIdentDurationDay('0')
                    }
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="identificationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><label className="text-sm text-gray-600 mb-1 block">ปี</label><input type="number" min="0" step="1" value={identDurationYear} onChange={(e) => { identEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setIdentDurationYear(val); identDurationYearRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">เดือน</label><input type="number" min="0" step="1" value={identDurationMonth} onChange={(e) => { identEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setIdentDurationMonth(val); identDurationMonthRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">วัน</label><input type="number" min="0" step="1" value={identDurationDay} onChange={(e) => { const val = e.target.value === '' ? '0' : e.target.value; setIdentDurationDay(val); identDurationDayRef.current = val }} className="form-input w-full" placeholder="0" /></div>
              </div>
              <Controller name="identificationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="identificationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>

          {/* Preparation Period */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะเวลาการเตรียมการ (Preparation Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={preparationStartDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setPreparationStartDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) setValue('preparationPeriod.startDate', iso, { shouldValidate: false, shouldDirty: true })
                    else setValue('preparationPeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="preparationPeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="preparationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={preparationEndDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setPreparationEndDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) {
                      setValue('preparationPeriod.endDate', iso, { shouldValidate: false })
                      if (preparationStartDateValue) {
                        const start = parseDateString(preparationStartDateValue)
                        const end = parseDateString(iso)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('preparationPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            prepEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setPrepDurationYear, setPrepDurationMonth, setPrepDurationDay)
                          } else setValue('preparationPeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      }
                    } else {
                      setValue('preparationPeriod.endDate', '', { shouldValidate: false })
                      setValue('preparationPeriod.durationInDays', undefined, { shouldValidate: false })
                      setPrepDurationYear('0')
                      setPrepDurationMonth('0')
                      setPrepDurationDay('0')
                    }
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="preparationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><label className="text-sm text-gray-600 mb-1 block">ปี</label><input type="number" min="0" step="1" value={prepDurationYear} onChange={(e) => { prepEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setPrepDurationYear(val); prepDurationYearRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">เดือน</label><input type="number" min="0" step="1" value={prepDurationMonth} onChange={(e) => { const val = e.target.value === '' ? '0' : e.target.value; setPrepDurationMonth(val); prepDurationMonthRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">วัน</label><input type="number" min="0" step="1" value={prepDurationDay} onChange={(e) => { prepEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setPrepDurationDay(val); prepDurationDayRef.current = val }} className="form-input w-full" placeholder="0" /></div>
              </div>
              <Controller name="preparationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="preparationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>

          {/* Implementation Period: startDate | endDate | periodInDays - 3 columns */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะเวลาการดำเนินก่อสร้าง (Implementation Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
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
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="implementationPeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="implementationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={implementationEndDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setImplementationEndDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)
                    if (isoDate) {
                      setValue('implementationPeriod.endDate', isoDate, { shouldValidate: false })
                      if (implementationStartDateValue) {
                        const start = parseDateString(implementationStartDateValue)
                        const end = parseDateString(isoDate)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('implementationPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            implEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setImplDurationYear, setImplDurationMonth, setImplDurationDay)
                          } else {
                            setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                          }
                        }
                      }
                    } else {
                      setValue('implementationPeriod.endDate', '', { shouldValidate: false })
                      setValue('implementationPeriod.durationInDays', undefined, { shouldValidate: false })
                      setImplDurationYear('0')
                      setImplDurationMonth('0')
                      setImplDurationDay('0')
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="implementationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
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
                    className="form-input w-full"
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
                      implEndDateFromPickerRef.current = false
                      const value = e.target.value === '' ? '0' : e.target.value
                      setImplDurationMonth(value)
                      implDurationMonthRef.current = value
                    }}
                    className="form-input w-full"
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
                    className="form-input w-full"
                    placeholder="0"
                  />
                </div>
              </div>
              <Controller name="implementationPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="implementationPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>

          {/* Completion Period */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะเวลาการส่งมอบ (Completion Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={completionStartDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setCompletionStartDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) setValue('completionPeriod.startDate', iso, { shouldValidate: false, shouldDirty: true })
                    else setValue('completionPeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="completionPeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="completionPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={completionEndDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setCompletionEndDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) {
                      setValue('completionPeriod.endDate', iso, { shouldValidate: false })
                      if (completionStartDateValue) {
                        const start = parseDateString(completionStartDateValue)
                        const end = parseDateString(iso)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('completionPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            completeEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setCompleteDurationYear, setCompleteDurationMonth, setCompleteDurationDay)
                          } else setValue('completionPeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      }
                    } else {
                      setValue('completionPeriod.endDate', '', { shouldValidate: false })
                      setValue('completionPeriod.durationInDays', undefined, { shouldValidate: false })
                      setCompleteDurationYear('0')
                      setCompleteDurationMonth('0')
                      setCompleteDurationDay('0')
                    }
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="completionPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><label className="text-sm text-gray-600 mb-1 block">ปี</label><input type="number" min="0" step="1" value={completeDurationYear} onChange={(e) => { completeEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setCompleteDurationYear(val); completeDurationYearRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">เดือน</label><input type="number" min="0" step="1" value={completeDurationMonth} onChange={(e) => { const val = e.target.value === '' ? '0' : e.target.value; setCompleteDurationMonth(val); completeDurationMonthRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">วัน</label><input type="number" min="0" step="1" value={completeDurationDay} onChange={(e) => { completeEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setCompleteDurationDay(val); completeDurationDayRef.current = val }} className="form-input w-full" placeholder="0" /></div>
              </div>
              <Controller name="completionPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="completionPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>

          {/* Maintenance Period: startDate | endDate | periodInDays - 3 columns */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะการบำรุงรักษา (Maintenance Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
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
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="maintenancePeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="maintenancePeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={maintenanceEndDateDisplay}
                  onChange={(e) => {
                    const litepickerValue = e.target.value
                    setMaintenanceEndDateDisplay(litepickerValue)
                    const isoDate = parseLitepickerDateToISO(litepickerValue)
                    if (isoDate) {
                      setValue('maintenancePeriod.endDate', isoDate, { shouldValidate: false })
                      if (maintenanceStartDateValue) {
                        const start = parseDateString(maintenanceStartDateValue)
                        const end = parseDateString(isoDate)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('maintenancePeriod.durationInDays', daysDiff, { shouldValidate: false })
                            maintEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setMaintDurationYear, setMaintDurationMonth, setMaintDurationDay)
                          } else {
                            setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                          }
                        }
                      }
                    } else {
                      setValue('maintenancePeriod.endDate', '', { shouldValidate: false })
                      setValue('maintenancePeriod.durationInDays', undefined, { shouldValidate: false })
                      setMaintDurationYear('0')
                      setMaintDurationMonth('0')
                      setMaintDurationDay('0')
                    }
                  }}
                  options={{
                    autoApply: true,
                    singleMode: true,
                    format: 'D MMM YYYY',
                    lang: 'th-TH',
                    dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true },
                  }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="maintenancePeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
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
                    className="form-input w-full"
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
                      maintEndDateFromPickerRef.current = false
                      const value = e.target.value === '' ? '0' : e.target.value
                      setMaintDurationMonth(value)
                      maintDurationMonthRef.current = value
                    }}
                    className="form-input w-full"
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
                    className="form-input w-full"
                    placeholder="0"
                  />
                </div>
              </div>
              <Controller name="maintenancePeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="maintenancePeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>

          {/* Decommissioning Period */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-3">ระยะเวลาการสิ้นสุดโครงการ (Decommissioning Period)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0">
              <label className="form-label">วันที่เริ่ม</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={decommissioningStartDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setDecommissioningStartDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) setValue('decommissioningPeriod.startDate', iso, { shouldValidate: false, shouldDirty: true })
                    else setValue('decommissioningPeriod.startDate', '', { shouldValidate: false, shouldDirty: true })
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="decommissioningPeriod.startDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="decommissioningPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label">วันที่สิ้นสุด</label>
              <label className="text-sm text-transparent mb-1 block">.</label>
              <div className="relative">
                <Lucide icon="Calendar" className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 text-gray-400" />
                <Litepicker
                  value={decommissioningEndDateDisplay}
                  onChange={(e) => {
                    const v = e.target.value
                    setDecommissioningEndDateDisplay(v)
                    const iso = parseLitepickerDateToISO(v)
                    if (iso) {
                      setValue('decommissioningPeriod.endDate', iso, { shouldValidate: false })
                      if (decommissioningStartDateValue) {
                        const start = parseDateString(decommissioningStartDateValue)
                        const end = parseDateString(iso)
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                          const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                          if (daysDiff > 0) {
                            setValue('decommissioningPeriod.durationInDays', daysDiff, { shouldValidate: false })
                            decommEndDateFromPickerRef.current = true
                            setDurationStateFromDays(daysDiff, setDecommDurationYear, setDecommDurationMonth, setDecommDurationDay)
                          } else setValue('decommissioningPeriod.durationInDays', undefined, { shouldValidate: false })
                        }
                      }
                    } else {
                      setValue('decommissioningPeriod.endDate', '', { shouldValidate: false })
                      setValue('decommissioningPeriod.durationInDays', undefined, { shouldValidate: false })
                      setDecommDurationYear('0')
                      setDecommDurationMonth('0')
                      setDecommDurationDay('0')
                    }
                  }}
                  options={{ autoApply: true, singleMode: true, format: 'D MMM YYYY', lang: 'th-TH', dropdowns: { minYear: YEAR_MIN, maxYear: YEAR_MAX, months: true, years: true } }}
                  className="pl-10 w-full min-w-0 max-w-full"
                  placeholder="เลือกวันที่"
                />
              </div>
              <Controller name="decommissioningPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
            </div>
            <div className="min-w-0">
              <label className="form-label"><DurationLabel /></label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><label className="text-sm text-gray-600 mb-1 block">ปี</label><input type="number" min="0" step="1" value={decommDurationYear} onChange={(e) => { decommEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setDecommDurationYear(val); decommDurationYearRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">เดือน</label><input type="number" min="0" step="1" value={decommDurationMonth} onChange={(e) => { const val = e.target.value === '' ? '0' : e.target.value; setDecommDurationMonth(val); decommDurationMonthRef.current = val }} className="form-input w-full" placeholder="0" /></div>
                <div><label className="text-sm text-gray-600 mb-1 block">วัน</label><input type="number" min="0" step="1" value={decommDurationDay} onChange={(e) => { decommEndDateFromPickerRef.current = false; const val = e.target.value === '' ? '0' : e.target.value; setDecommDurationDay(val); decommDurationDayRef.current = val }} className="form-input w-full" placeholder="0" /></div>
              </div>
              <Controller name="decommissioningPeriod.endDate" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />} />
              <Controller name="decommissioningPeriod.durationInDays" control={control} render={({ field }) => <input type="hidden" {...field} value={field.value ?? ''} />} />
            </div>
            </div>
          </div>
        </div>

  )
}

