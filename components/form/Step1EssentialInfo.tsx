import { UseFormRegister, Control, FieldErrors, useFieldArray, useWatch, UseFormSetValue, useFormState } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { BUSINESS_GROUP_OPTIONS } from '@/types/businessGroup'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useInfo } from '@/app/hooks/useInfo'

interface Step1EssentialInfoProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
  trigger?: (name?: string | string[]) => Promise<boolean>
}

export default function Step1EssentialInfo({ register, control, errors, setValue, getValues, trigger }: Step1EssentialInfoProps) {
  const { t } = useLanguage()
  const { touchedFields, isSubmitted } = useFormState({ control })
  const publicAuthorityValue = useWatch({ control, name: 'publicAuthority' })
  const [selectedSectorCode, setSelectedSectorCode] = useState<string>('')
  const [selectedContractType, setSelectedContractType] = useState<string>('')
  const [customContractType, setCustomContractType] = useState<string>('')
  const [selectedConcessionType, setSelectedConcessionType] = useState<string>('')
  const [customConcessionType, setCustomConcessionType] = useState<string>('')

  // Get data from API
  const { data: infoData } = useInfo()

  // Contract type options from API
  const contractTypeOptions = useMemo(() => {
    if (!infoData?.contractType) return [] // Fallback to empty array
    return infoData.contractType.map(c => c.value)
  }, [infoData])
  
  // Concession/compensation type options from API
  const concessionTypeOptions = useMemo(() => {
    if (!infoData?.concessionForm) return [] // Fallback to empty array
    return infoData.concessionForm.map(c => c.value)
  }, [infoData])

  // Project type options from API
  const projectTypeOptions = useMemo(() => {
    if (!infoData?.projectType) return [] // Fallback
    return infoData.projectType.map(p => p.value)
  }, [infoData])
  
  // Helper function to update additionalClassifications while preserving other classifications
  const updateAdditionalClassifications = (scheme: string, description: string) => {
    const currentClassifications = getValues().additionalClassifications || []
    const otherClassifications = currentClassifications.filter((c: any) => {
      const cScheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
      return cScheme !== scheme
    })
    
    if (description && description.trim()) {
      return [
        { scheme, id: '', description: description.trim() },
        ...otherClassifications
      ]
    } else {
      return otherClassifications
    }
  }

  // Initialize sector code from form data
  useEffect(() => {
    const formValues = getValues()
    if (formValues.sector && Array.isArray(formValues.sector) && formValues.sector.length > 0) {
      const firstSector = formValues.sector[0]
      const code = typeof firstSector === 'string' ? firstSector : (firstSector?.id || '')
      if (code) {
        setSelectedSectorCode(code)
      }
    }
  }, [getValues])

  // Initialize contractType, concessionType, and relatedLaws
  useEffect(() => {
    const formValues = getValues()
    
    // Initialize contract type and concession type from additionalClassifications
    if (formValues.additionalClassifications && Array.isArray(formValues.additionalClassifications)) {
      // Initialize contract type
      const contractType = formValues.additionalClassifications.find((c: any) => {
        const scheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
        return scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
      })
      if (contractType) {
        const description = typeof contractType === 'object' && contractType !== null ? (contractType.description || "") : ""
        const options = contractTypeOptions
        if (options.includes(description)) {
          setSelectedContractType(description)
          setCustomContractType('')
        } else {
          setSelectedContractType('อื่น ๆ')
          setCustomContractType(description)
        }
      }
      
      // Initialize concession/compensation type
      const concessionType = formValues.additionalClassifications.find((c: any) => {
        const scheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
        return scheme === 'รูปแบบสัมปทานหรือค่าตอบแทน'
      })
      if (concessionType) {
        const description = typeof concessionType === 'object' && concessionType !== null ? (concessionType.description || "") : ""
        const options = concessionTypeOptions
        if (options.includes(description)) {
          setSelectedConcessionType(description)
          setCustomConcessionType('')
        } else {
          setSelectedConcessionType('อื่น ๆ')
          setCustomConcessionType(description)
        }
      }
    }
  }, [getValues])

  const { fields: partyFields, append: appendParty, remove: removeParty } = useFieldArray({
    control,
    name: 'parties' as any
  })

  // Public Authorities with ministries - using a custom field array structure
  const [publicAuthorities, setPublicAuthorities] = useState<Array<{ name: string; ministries: string[] }>>([])


  // List of all ministries
  const ministries = [
    'กระทรวงกลาโหม',
    'กระทรวงการคลัง',
    'กระทรวงการต่างประเทศ',
    'กระทรวงการท่องเที่ยวและกีฬา',
    'กระทรวงการพัฒนาสังคมและความมั่นคงของมนุษย์',
    'กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม',
    'กระทรวงเกษตรและสหกรณ์',
    'กระทรวงคมนาคม',
    'กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม',
    'กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม',
    'กระทรวงพลังงาน',
    'กระทรวงพาณิชย์',
    'กระทรวงมหาดไทย',
    'กระทรวงยุติธรรม',
    'กระทรวงแรงงาน',
    'กระทรวงวัฒนธรรม',
    'กระทรวงศึกษาธิการ',
    'กระทรวงสาธารณสุข',
    'กระทรวงอุตสาหกรรม',
    'สำนักนายกรัฐมนตรี'
  ]

  // Initialize publicAuthorities from existing parties (only once on mount)
  const [isInitialized, setIsInitialized] = useState(false)
  const existingParties = useWatch({ control, name: 'parties' })
  
  useEffect(() => {
    if (!isInitialized) {
      if (existingParties && Array.isArray(existingParties)) {
        // Extract public authority parties
        const authorityParties = existingParties.filter((party: any) => 
          party.roles && party.roles.includes('publicAuthority')
        )
        
        if (authorityParties.length > 0) {
          // Convert parties back to publicAuthorities structure
          const authorities = authorityParties.map((party: any) => {
            const ministries = party.additionalIdentifiers
              ?.filter((id: any) => id.scheme === 'ministry' || id.scheme === 'TH-MINISTRY')
              .map((id: any) => id.legalName) || []
            
            return {
              name: party.name,
              ministries: ministries
            }
          })
          setPublicAuthorities(authorities)
        }
      }
      setIsInitialized(true)
    }
  }, [publicAuthorityValue, existingParties, isInitialized])

  // Sync publicAuthorities to parties array
  // We'll store public authority parties separately and merge with contractor parties
  // Only sync when publicAuthorities changes, not when contractor parties change
  useEffect(() => {
    if (!isInitialized) return // Don't sync during initialization
    
    // Convert publicAuthorities to parties format
    const authorityParties = publicAuthorities
      .filter(auth => auth.name.trim()) // Only include authorities with names
      .map((authority, index) => {
        // Generate an ID - using a simple format based on index
        const partyId = `TH-PUBLIC-AUTHORITY-${index + 1}`
        const identifierId = `AUTH-${index + 1}`
        
        // Create additionalIdentifiers for ministries
        const additionalIdentifiers = authority.ministries.map((ministry, ministryIndex) => ({
          scheme: 'ministry',
          legalName: ministry,
          id: ''
        }))

        return {
          name: authority.name,
          id: partyId,
          identifier: {
            scheme: 'TH-PUBLIC-AUTHORITY',
            id: identifierId,
            legalName: authority.name
          },
          additionalIdentifiers: additionalIdentifiers,
          roles: ['publicAuthority']
        }
      })

    // Get current parties from form using getValues to get the latest state
    // This ensures we have the most up-to-date contractor party values from useFieldArray
    const formValues = getValues()
    const currentParties = formValues.parties || []
    
    // IMPORTANT: Read contractor parties directly from the form fields using their registered paths
    // This ensures we get the actual values the user typed in contractor fields, not from merged array
    const contractorParties = partyFields.map((field, idx) => {
      // Get the current value for this specific contractor party field
      const partyName = formValues.parties?.[idx]?.name || ''
      const partyId = formValues.parties?.[idx]?.id || ''
      const partyRoles = formValues.parties?.[idx]?.roles || []
      
      // Only include if it's actually a contractor party (has contractor role and not publicAuthority)
      if (Array.isArray(partyRoles) && partyRoles.includes('contractor') && !partyRoles.includes('publicAuthority')) {
        return {
          name: partyName,
          id: partyId,
          roles: partyRoles
        }
      }
      return null
    }).filter((party): party is any => party !== null)
    
    // Fallback: if we couldn't get from fields, filter from currentParties
    const fallbackContractorParties = currentParties.filter((party: any) => {
      if (!party || !party.roles || !Array.isArray(party.roles)) return false
      const roles = party.roles
      return roles.includes('contractor') && !roles.includes('publicAuthority')
    })
    
    // Use contractor parties from form fields if available, otherwise use fallback
    const finalContractorParties = contractorParties.length > 0 || partyFields.length === 0
      ? contractorParties
      : fallbackContractorParties
    
    // Get other parties (excluding both publicAuthority and contractor)
    const otherParties = currentParties.filter((party: any) => {
      if (!party || !party.roles || !Array.isArray(party.roles)) return false
      const roles = party.roles
      return !roles.includes('publicAuthority') && !roles.includes('contractor')
    })
    
    // Combine: authority parties + contractor parties + other parties
    // IMPORTANT: Put contractor parties AFTER authority parties
    const allParties = [...authorityParties, ...finalContractorParties, ...otherParties]
    
    // Only update if the authority parties actually changed (not contractor parties)
    // This prevents interference with contractor party input
    const currentAuthorityParties = currentParties.filter((party: any) => 
      party && party.roles && Array.isArray(party.roles) && party.roles.includes('publicAuthority')
    )
    
    const authorityPartiesChanged = JSON.stringify(
      currentAuthorityParties.map((p: any) => ({
        name: p.name || '',
        ministries: (p.additionalIdentifiers || [])
          .filter((id: any) => id.scheme === 'ministry' || id.scheme === 'TH-MINISTRY')
          .map((id: any) => id.legalName)
      }))
    ) !== JSON.stringify(
      authorityParties.map((a: any) => ({
        name: a.name || '',
        ministries: a.ministries || []
      }))
    )
    
    if (authorityPartiesChanged) {
      // Update parties array - use shouldValidate: false and shouldDirty: false
      // to avoid interfering with contractor party input
      setValue('parties', allParties as any, { shouldValidate: false, shouldDirty: false })
    }
    
    // Also set the first public authority as the main one (for backward compatibility)
    if (publicAuthorities.length > 0) {
      const firstAuthority = publicAuthorities[0]
      setValue('publicAuthority', { name: firstAuthority.name, id: '' }, { shouldValidate: true })
      
    } else {
      // Clear publicAuthority if no authorities
      setValue('publicAuthority', { name: '', id: '' }, { shouldValidate: true })
    }
  }, [publicAuthorities, setValue, isInitialized]) // Only depend on publicAuthorities, not on existingParties

  const addPublicAuthority = () => {
    setPublicAuthorities([...publicAuthorities, { name: '', ministries: [] }])
  }

  const removePublicAuthority = (index: number) => {
    setPublicAuthorities(publicAuthorities.filter((_, i) => i !== index))
  }

  const updatePublicAuthority = (index: number, value: string) => {
    const updated = [...publicAuthorities]
    updated[index] = { ...updated[index], name: value }
    setPublicAuthorities(updated)
  }

  const toggleMinistry = (authorityIndex: number, ministry: string) => {
    const updated = [...publicAuthorities]
    const currentMinistries = updated[authorityIndex].ministries
    if (currentMinistries.includes(ministry)) {
      updated[authorityIndex].ministries = currentMinistries.filter(m => m !== ministry)
    } else {
      updated[authorityIndex].ministries = [...currentMinistries, ministry]
    }
    setPublicAuthorities(updated)
  }




  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div>
        <label className="form-label">{t('form.basicInfo.projectTitle')} *</label>
        <input
          {...register('title', { required: t('common.required') })}
          onChange={(e) => {
            register('title').onChange(e)
            trigger?.('title')
          }}
          className={`form-input ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder={t('form.basicInfo.enterTitle')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description (Optional) */}
      <div>
        <label className="form-label">{t('form.basicInfo.description')}</label>
        <textarea
          {...register('description')}
          rows={4}
          className="form-input"
          placeholder={t('form.basicInfo.enterDescription')}
        />
      </div>

      {/* Business Group (Sector) */}
      <div>
        <label className="form-label">{t('dashboard.businessGroup')} *</label>
        <select 
          value={selectedSectorCode}
          onChange={(e) => {
            const selectedCode = e.target.value
            setSelectedSectorCode(selectedCode)
            if (selectedCode) {
              // Store the code directly in sector array as first element
              setValue('sector', [{ id: selectedCode, scheme: '', description: '' }] as any, { shouldValidate: true })
            } else {
              setValue('sector', [] as any, { shouldValidate: true })
            }
          }}
          className={`form-input ${errors.sector ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">{t('common.select')}</option>
          {BUSINESS_GROUP_OPTIONS.map(option => (
            <option key={option.code} value={option.code}>
              {option.displayName}
            </option>
          ))}
        </select>
        <input
          type="hidden"
          {...register('sector', {
            required: t('common.required'),
            validate: (value) => {
              if (!Array.isArray(value) || value.length === 0) {
                return t('common.required')
              }
              const firstSector = value[0]
              if (!firstSector || !firstSector.id) {
                return t('common.required')
              }
              return true
            }
          })}
        />
        {errors.sector && (
          <p className="mt-1 text-sm text-red-600">{errors.sector.message || t('common.required')}</p>
        )}
      </div>

      {/* Project Type (ประเภทโครงการ) */}
      <div>
        <label className="form-label">ประเภทโครงการ *</label>
        <select 
          {...register('type', { 
            required: t('common.required'),
            validate: (value) => (value !== '' && value != null) || t('common.required')
          })} 
          onChange={(e) => {
            register('type').onChange(e)
            trigger?.('type')
          }}
          className={`form-input ${errors.type ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">{t('common.select')}</option>
          {projectTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message || t('common.required')}</p>
        )}
      </div>

      {/* Public Authorities (หน่วยงานเจ้าของโครงการ) */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('form.publicAuthorities.title')} *</h3>
          <button
            type="button"
            onClick={addPublicAuthority}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            {t('form.publicAuthorities.addAuthority')}
          </button>
        </div>
        {publicAuthorities.length === 0 && (
          <p className="text-sm text-red-600 mb-2">{t('common.required')}</p>
        )}
        {publicAuthorities.map((authority, index) => {
          const hasNameError = !authority.name.trim()
          const hasMinistryError = authority.ministries.length === 0
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  {t('form.publicAuthorities.authorityLabel').replace('{number}', (index + 1).toString())}
                </h4>
                <button
                  type="button"
                  onClick={() => removePublicAuthority(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t('form.publicAuthorities.removeAuthority')}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">{t('form.publicAuthorities.authorityName')} *</label>
                  <input
                    type="text"
                    value={authority.name}
                    onChange={(e) => updatePublicAuthority(index, e.target.value)}
                    className={`form-input ${hasNameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('form.publicAuthorities.enterAuthorityName')}
                  />
                  {hasNameError && (
                    <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">{t('form.publicAuthorities.selectMinistries')} *</label>
                  <div className={`border rounded-md p-3 max-h-60 overflow-y-auto ${hasMinistryError ? 'border-red-500' : 'border-gray-300'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {ministries.map((ministry) => (
                        <label
                          key={ministry}
                          className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={authority.ministries.includes(ministry)}
                            onChange={() => toggleMinistry(index, ministry)}
                            className="mr-2 h-4 w-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
                          />
                          <span className="text-sm text-gray-700">{ministry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {hasMinistryError && (
                    <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Private Contractor */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.privateContractor')} *</h3>
          <button
            type="button"
            onClick={() => appendParty({
              name: '',
              id: '',
              roles: ['contractor']
            })}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            {t('form.parties.addParty')}
          </button>
        </div>
        {partyFields.length === 0 && (
          <p className="text-sm text-red-600 mb-2">{t('common.required')}</p>
        )}
        {partyFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-700">
                {t('form.parties.partyLabel').replace('{number}', (index + 1).toString())}
              </h4>
              <button
                type="button"
                onClick={() => removeParty(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {t('form.parties.removeParty')}
              </button>
            </div>
            <div>
              <label className="form-label">{t('form.parties.partyName')} *</label>
              <input
                {...register(`parties.${index}.name`, { required: t('common.required') })}
                className={`form-input ${errors.parties?.[index]?.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('form.parties.enterPartyName')}
              />
              {errors.parties?.[index]?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.parties[index]?.name?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Project Classification Section (การจำแนกกลุ่มโครงการ) */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">การจำแนกกลุ่มโครงการ</h3>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Contract Type (รูปแบบการจัดสรรกรรมสิทธิ์) */}
          <div>
            <label className="form-label">{t('pages.view.contractType')} *</label>
            <select
              value={selectedContractType}
              onChange={(e) => {
                const value = e.target.value
                setSelectedContractType(value)
                
                const updated = updateAdditionalClassifications('รูปแบบการจัดสรรกรรมสิทธิ์', value === 'อื่น ๆ' ? customContractType : value)
                setValue('additionalClassifications', updated as any, { shouldValidate: true })
                
                if (value !== 'อื่น ๆ') {
                  setCustomContractType('')
                }
              }}
              className={`form-input ${errors.additionalClassifications ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">{t('common.select')}</option>
              {contractTypeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {/* Custom contract type input - shown when "อื่น ๆ" is selected */}
            {selectedContractType === 'อื่น ๆ' && (
              <div className="mt-3">
                <label className="form-label">{t('form.contractType.custom') || 'ระบุรูปแบบการจัดสรรกรรมสิทธิ์'} *</label>
                <input
                  type="text"
                  value={customContractType}
                  onChange={(e) => {
                    const value = e.target.value
                    setCustomContractType(value)
                    const updated = updateAdditionalClassifications('รูปแบบการจัดสรรกรรมสิทธิ์', value)
                    setValue('additionalClassifications', updated as any, { shouldValidate: true })
                  }}
                  className={`form-input ${errors.additionalClassifications && !customContractType.trim() ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('form.contractType.customPlaceholder') || 'กรุณาระบุรูปแบบการจัดสรรกรรมสิทธิ์'}
                />
                {errors.additionalClassifications && !customContractType.trim() && (
                  <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>
                )}
              </div>
            )}
          </div>

          {/* Concession/Compensation Type (รูปแบบสัมปทานหรือค่าตอบแทน) */}
          <div>
            <label className="form-label">รูปแบบสัมปทานหรือค่าตอบแทน</label>
            <select
              value={selectedConcessionType}
              onChange={(e) => {
                const value = e.target.value
                setSelectedConcessionType(value)
                
                const updated = updateAdditionalClassifications('รูปแบบสัมปทานหรือค่าตอบแทน', value === 'อื่น ๆ' ? customConcessionType : value)
                setValue('additionalClassifications', updated as any, { shouldValidate: false })
                
                if (value !== 'อื่น ๆ') {
                  setCustomConcessionType('')
                }
              }}
              className="form-input"
            >
              <option value="">{t('common.select')}</option>
              {concessionTypeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {/* Custom concession type input - shown when "อื่น ๆ" is selected */}
            {selectedConcessionType === 'อื่น ๆ' && (
              <div className="mt-3">
                <label className="form-label">ระบุรูปแบบสัมปทานหรือค่าตอบแทน</label>
                <input
                  type="text"
                  value={customConcessionType}
                  onChange={(e) => {
                    const value = e.target.value
                    setCustomConcessionType(value)
                    const updated = updateAdditionalClassifications('รูปแบบสัมปทานหรือค่าตอบแทน', value)
                    setValue('additionalClassifications', updated as any, { shouldValidate: false })
                  }}
                  className="form-input"
                  placeholder="กรุณาระบุรูปแบบสัมปทานหรือค่าตอบแทน"
                />
              </div>
            )}
          </div>

        </div>
        
        {/* Hidden input for validation (only contract type is required) */}
        <input
          type="hidden"
          {...register('additionalClassifications', {
            required: t('common.required'),
            validate: (value) => {
              if (!Array.isArray(value)) return t('common.required')
              const contractType = value.find((c: any) => {
                const scheme = typeof c === 'object' && c !== null ? (c.scheme || "") : ""
                return scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
              })
              if (!contractType || !contractType.description || !contractType.description.trim()) {
                return t('common.required')
              }
              return true
            }
          })}
        />
        {errors.additionalClassifications && selectedContractType !== 'อื่น ๆ' && (
          <p className="mt-1 text-sm text-red-600">{errors.additionalClassifications.message || t('common.required')}</p>
        )}
      </div>
    </div>
  )
}

