import { UseFormRegister, Control, FieldErrors, useWatch, UseFormSetValue, UseFormTrigger, useFormState } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useInfo } from '@/app/hooks/useInfo'
import { getBusinessGroupDisplayName } from '@/types/businessGroup'

interface Step1EssentialInfoProps {
  register: UseFormRegister<ProjectFormData>
  control: Control<ProjectFormData>
  errors: FieldErrors<ProjectFormData>
  setValue: UseFormSetValue<ProjectFormData>
  getValues: () => ProjectFormData
  trigger?: UseFormTrigger<ProjectFormData>
  /** When true, show validation errors for ชื่อหน่วยงาน and เลือกกระทรวง (only after user clicks Next) */
  showAuthorityValidationErrors?: boolean
}

export default function Step1EssentialInfo({ register, control, errors, setValue, getValues, trigger, showAuthorityValidationErrors = false }: Step1EssentialInfoProps) {
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

  // Contract type options from API (keep id + value so key can be unique)
  const contractTypeOptions = useMemo(() => {
    if (!infoData?.contractType) return []
    return infoData.contractType.map(c => ({ id: c.id, value: c.value }))
  }, [infoData])

  // Concession/compensation type options from API (id for key, value for display — values may duplicate)
  const concessionTypeOptions = useMemo(() => {
    if (!infoData?.concessionForm) return []
    return infoData.concessionForm.map(c => ({ id: c.id, value: c.value }))
  }, [infoData])

  // Project type options from API
  const projectTypeOptions = useMemo(() => {
    if (!infoData?.projectType) return [] // Fallback
    return infoData.projectType.map(p => p.value)
  }, [infoData])

  // Sector (กลุ่มกิจการ) options from API; display Thai label from businessGroup map, store code as value
  const sectorOptions = useMemo(() => {
    if (!infoData?.sector) return []
    return infoData.sector.map(s => ({
      value: s.value,
      id: s.id,
      displayLabel: getBusinessGroupDisplayName(s.value)
    }))
  }, [infoData])

  // Ministry options from API /api/v1/info ministry field (สำหรับ เลือกกระทรวง)
  const ministries = useMemo(() => {
    if (!infoData?.ministry) return []
    return infoData.ministry.map(m => m.value)
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
        if (options.some((o: { id: number; value: string }) => o.value === description)) {
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
        if (options.some((o: { id: number; value: string }) => o.value === description)) {
          setSelectedConcessionType(description)
          setCustomConcessionType('')
        } else {
          setSelectedConcessionType('อื่น ๆ')
          setCustomConcessionType(description)
        }
      }
    }
  }, [getValues])

  // One หน่วยงาน = name + ministries + contractors. Default 1 item when create.
  type AuthorityItem = { name: string; ministries: string[]; contractors: string[] }
  const [publicAuthorities, setPublicAuthorities] = useState<AuthorityItem[]>([
    { name: '', ministries: [], contractors: [] }
  ])

  const [isInitialized, setIsInitialized] = useState(false)
  const existingParties = useWatch({ control, name: 'parties' })

  // Initialize from existing parties (edit) or keep default 1 หน่วยงาน (create)
  useEffect(() => {
    if (!isInitialized) {
      if (existingParties && Array.isArray(existingParties)) {
        const authorityParties = existingParties.filter((party: any) =>
          party.roles && party.roles.includes('publicAuthority')
        )
        if (authorityParties.length > 0) {
          const authorities: AuthorityItem[] = authorityParties.map((party: any) => {
            const ministries = party.additionalIdentifiers
              ?.filter((id: any) => id.scheme === 'ministry' || id.scheme === 'TH-MINISTRY')
              .map((id: any) => id.legalName) || []
            const legalNameStr = party.identifier?.legalName ?? ''
            const contractors = legalNameStr ? legalNameStr.split(',').map((s: string) => s.trim()).filter(Boolean) : []
            return { name: party.name || '', ministries, contractors }
          })
          setPublicAuthorities(authorities)
        }
      }
      setIsInitialized(true)
    }
  }, [publicAuthorityValue, existingParties, isInitialized])

  // Sync publicAuthorities (name + ministries + contractors per หน่วยงาน) to parties
  useEffect(() => {
    if (!isInitialized) return

    const authorityParties = publicAuthorities
      .filter(auth => auth.name.trim())
      .map((authority, index) => {
        const partyId = `TH-PUBLIC-AUTHORITY-${index + 1}`
        const identifierId = `AUTH-${index + 1}`
        const additionalIdentifiers = (authority.ministries || []).map((m) => ({
          scheme: 'ministry',
          legalName: m,
          id: ''
        }))
        const contractorLegalName = (authority.contractors || []).filter(Boolean).join(', ')
        return {
          name: authority.name,
          id: partyId,
          identifier: {
            scheme: 'TH-PUBLIC-AUTHORITY',
            id: identifierId,
            legalName: contractorLegalName
          },
          additionalIdentifiers,
          roles: ['publicAuthority']
        }
      })

    const currentParties = (getValues() as ProjectFormData).parties || []
    const currentAuthorityParties = (Array.isArray(currentParties) ? currentParties : []).filter(
      (p: any) => p?.roles?.includes('publicAuthority')
    )
    const authorityPartiesChanged =
      JSON.stringify(
        currentAuthorityParties.map((p: any) => {
          const legalNameStr = p.identifier?.legalName ?? ''
          const contractors = legalNameStr ? legalNameStr.split(',').map((s: string) => s.trim()).filter(Boolean) : []
          return {
            name: p.name || '',
            ministries: (p.additionalIdentifiers || []).filter((id: any) => id.scheme === 'ministry' || id.scheme === 'TH-MINISTRY').map((id: any) => id.legalName),
            contractors
          }
        })
      ) !== JSON.stringify(
        publicAuthorities.map((a) => ({ name: a.name, ministries: a.ministries, contractors: a.contractors }))
      )

    if (authorityPartiesChanged) {
      setValue('parties', authorityParties as any, { shouldValidate: false, shouldDirty: false })
    }
    if (publicAuthorities.length > 0) {
      setValue('publicAuthority', { name: publicAuthorities[0].name, id: '' }, { shouldValidate: true })
    } else {
      setValue('publicAuthority', { name: '', id: '' }, { shouldValidate: true })
    }
  }, [publicAuthorities, setValue, isInitialized, getValues])

  const addPublicAuthority = () => {
    setPublicAuthorities([...publicAuthorities, { name: '', ministries: [], contractors: [] }])
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

  const addContractor = (authorityIndex: number) => {
    const updated = [...publicAuthorities]
    updated[authorityIndex] = {
      ...updated[authorityIndex],
      contractors: [...(updated[authorityIndex].contractors || []), '']
    }
    setPublicAuthorities(updated)
  }

  const removeContractor = (authorityIndex: number, contractorIndex: number) => {
    const updated = [...publicAuthorities]
    updated[authorityIndex] = {
      ...updated[authorityIndex],
      contractors: (updated[authorityIndex].contractors || []).filter((_, i) => i !== contractorIndex)
    }
    setPublicAuthorities(updated)
  }

  const updateContractor = (authorityIndex: number, contractorIndex: number, value: string) => {
    const updated = [...publicAuthorities]
    const list = [...(updated[authorityIndex].contractors || [])]
    list[contractorIndex] = value
    updated[authorityIndex] = { ...updated[authorityIndex], contractors: list }
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
              // API expects string codes only, e.g. ["transport.road"]
              setValue('sector', [selectedCode], { shouldValidate: true })
            } else {
              setValue('sector', [], { shouldValidate: true })
            }
          }}
          className={`form-input ${errors.sector ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        >
          <option value="">{t('common.select')}</option>
          {sectorOptions.map((option, idx) => (
            <option key={option.id != null ? `sector-${option.id}` : `sector-${idx}`} value={option.value}>
              {option.displayLabel}
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
              const first = value[0]
              const code =
                typeof first === 'string'
                  ? first.trim()
                  : first && typeof first === 'object' && 'id' in first
                    ? String((first as { id?: string }).id || '').trim()
                    : ''
              if (!code) {
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
          {projectTypeOptions.map((option, idx) => (
            <option key={option != null ? `type-${String(option)}-${idx}` : `type-${idx}`} value={option ?? ''}>
              {option ?? ''}
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
        {showAuthorityValidationErrors && publicAuthorities.length === 0 && (
          <p className="text-sm text-red-600 mb-2">{t('common.required')}</p>
        )}
        {publicAuthorities.map((authority, index) => {
          const hasNameError = !authority.name.trim()
          const hasMinistryError = authority.ministries.length === 0
          const showNameError = showAuthorityValidationErrors && hasNameError
          const showMinistryError = showAuthorityValidationErrors && hasMinistryError
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">
                  {t('form.publicAuthorities.authorityLabel').replace('{number}', (index + 1).toString())}
                </h4>
                {publicAuthorities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePublicAuthority(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('form.publicAuthorities.removeAuthority')}
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">{t('form.publicAuthorities.authorityName')} *</label>
                  <input
                    type="text"
                    value={authority.name}
                    onChange={(e) => updatePublicAuthority(index, e.target.value)}
                    className={`form-input ${showNameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={t('form.publicAuthorities.enterAuthorityName')}
                  />
                  {showNameError && (
                    <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">{t('form.publicAuthorities.selectMinistries')} *</label>
                  <div className={`border rounded-md p-3 max-h-60 overflow-y-auto ${showMinistryError ? 'border-red-500' : 'border-gray-300'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {ministries.map((ministry, mIdx) => (
                        <label
                          key={ministry != null && ministry !== '' ? `ministry-${ministry}` : `ministry-${mIdx}`}
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
                  {showMinistryError && (
                    <p className="mt-1 text-sm text-red-600">{t('common.required')}</p>
                  )}
                </div>
                {/* เอกชนคู่สัญญา (contractors) under this หน่วยงาน */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label">{t('dashboard.privateContractor')}</label>
                    <button
                      type="button"
                      onClick={() => addContractor(index)}
                      className="text-sm text-theme-primary hover:text-theme-primary-dark"
                    >
                      + {t('form.parties.addParty')}
                    </button>
                  </div>
                  {(authority.contractors || []).map((contractorName, cIdx) => (
                    <div key={`auth-${index}-contractor-${cIdx}`} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={contractorName}
                        onChange={(e) => updateContractor(index, cIdx, e.target.value)}
                        className="form-input flex-1"
                        placeholder={t('form.parties.enterPartyName')}
                      />
                      <button
                        type="button"
                        onClick={() => removeContractor(index, cIdx)}
                        className="text-red-600 hover:text-red-800 text-sm px-2"
                        title={t('form.parties.removeParty')}
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>


      {/* Project Classification Section (การจำแนกกลุ่มโครงการ) */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">การจำแนกกลุ่มโครงการ</h3>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Contract Type (รูปแบบการจัดสรรกรรมสิทธิ์) - optional */}
          <div>
            <label className="form-label">{t('pages.view.contractType')}</label>
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
              {contractTypeOptions.map((option, idx) => (
                <option key={option.id != null ? `contractType-${option.id}` : `contractType-${idx}`} value={option.value}>
                  {option.value}
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
                  className="form-input"
                  placeholder={t('form.contractType.customPlaceholder') || 'กรุณาระบุรูปแบบการจัดสรรกรรมสิทธิ์'}
                />
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
              {concessionTypeOptions.map((option, idx) => (
                <option key={option.id != null ? `concession-${option.id}` : `concession-${idx}`} value={option.value}>
                  {option.value}
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
        
        {/* Hidden input to register additionalClassifications (contract type and concession form are optional) */}
        <input
          type="hidden"
          {...register('additionalClassifications')}
        />
      </div>
    </div>
  )
}

