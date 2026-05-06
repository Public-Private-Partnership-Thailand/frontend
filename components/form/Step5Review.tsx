import { Control, useWatch } from 'react-hook-form'
import { ProjectFormData, ProjectData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { BUSINESS_GROUP_CODE_TO_DISPLAY_NAME } from '@/types/businessGroup'
import { RISK_PHASE_OPTIONS } from '@/lib/riskConstants'
import { normalizeMitigationHandling } from '@/lib/normalizeMitigationHandling'
import { useEffect } from 'react'

interface Step5ReviewProps {
  control: Control<ProjectFormData>
  mode?: 'create' | 'edit'
  originalProject?: ProjectData | null
}

export default function Step5Review({ control, mode = 'create', originalProject }: Step5ReviewProps) {
  const { t } = useLanguage()
  
  // Watch all form values
  const formData = useWatch({ control })

  useEffect(() => {
    console.log('Step 5 Review - Complete Form Data:', formData)
  }, [formData])

  const isEditMode = mode === 'edit' && !!originalProject

  const normalize = (value: unknown) => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  const renderDiffValue = (beforeRaw: unknown, afterRaw: unknown, options?: { preserveNewlines?: boolean }) => {
    const before = normalize(beforeRaw)
    const after = normalize(afterRaw)
    const changed = before !== after
    const multiline = options?.preserveNewlines ? 'whitespace-pre-line' : ''

    if (!isEditMode) {
      return <span className={`text-sm text-gray-900 ${multiline}`}>{after || 'N/A'}</span>
    }

    if (!changed) {
      return <span className={`text-sm text-gray-900 ${multiline}`}>{after || 'N/A'}</span>
    }

    return (
      <div className="text-sm space-y-1">
        <div className={`line-through text-gray-400 ${multiline}`}>{before || 'N/A'}</div>
        <div className={`text-theme-primary font-semibold ${multiline}`}>{after || 'N/A'}</div>
      </div>
    )
  }

  // Get businessGroup display name from sector array
  const getBusinessGroupDisplayName = () => {
    if (!formData.sector || !Array.isArray(formData.sector)) return 'N/A'
    
    // Form `sector` is typed as string[] (business group codes). Each entry is already the code string.
    for (const sectorCode of formData.sector) {
      if (sectorCode && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        return BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]
      }
    }
    return 'N/A'
  }

  const getOriginalBusinessGroupDisplayName = () => {
    if (!originalProject?.sector || !Array.isArray(originalProject.sector)) return 'N/A'

    // API may return sector as string[] (e.g. ["transport.road"]) or Classification[] with .id
    for (const c of originalProject.sector) {
      const code = typeof c === 'string' ? c : (c && typeof c === 'object' ? (c as { id?: string }).id : '') || ''
      if (code && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[code as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        return BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[code as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]
      }
    }
    return 'N/A'
  }

  // Get ministry from parties[publicAuthority].additionalIdentifiers
  const getMinistry = () => {
    if (!formData.parties || !Array.isArray(formData.parties)) return 'N/A'
    
    const publicAuthorityParty = formData.parties.find(p => 
      Array.isArray(p?.roles) && p.roles.includes('publicAuthority')
    )
    
    if (publicAuthorityParty?.additionalIdentifiers) {
      const ministryIdentifier = publicAuthorityParty.additionalIdentifiers.find(
        ai => ai?.scheme === 'ministry'
      )
      return ministryIdentifier?.legalName || 'N/A'
    }
    return 'N/A'
  }

  const getOriginalMinistry = () => {
    if (!originalProject?.parties || !Array.isArray(originalProject.parties)) return 'N/A'

    const publicAuthorityParty = originalProject.parties.find(
      (p) => Array.isArray(p?.roles) && p.roles.includes('publicAuthority')
    )

    if (publicAuthorityParty?.additionalIdentifiers) {
      const ministryIdentifier = publicAuthorityParty.additionalIdentifiers.find((ai) => ai?.scheme === 'ministry')
      return ministryIdentifier?.legalName || 'N/A'
    }
    return 'N/A'
  }

  // Get contractType from additionalClassifications
  const getContractType = () => {
    if (!formData.additionalClassifications || !Array.isArray(formData.additionalClassifications)) {
      return 'N/A'
    }
    
    const contractTypeClassification = formData.additionalClassifications.find(
      c => c?.scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
    )
    return contractTypeClassification?.description || 'N/A'
  }

  const getOriginalContractType = () => {
    if (!originalProject?.additionalClassifications || !Array.isArray(originalProject.additionalClassifications)) {
      return 'N/A'
    }

    const contractTypeClassification = originalProject.additionalClassifications.find(
      (c) => c?.scheme === 'รูปแบบการจัดสรรกรรมสิทธิ์'
    )
    return contractTypeClassification?.description || 'N/A'
  }

  // Get related laws from policyAlignment
  const getRelatedLaws = () => {
    if (formData.policyAlignment && typeof formData.policyAlignment === 'object') {
      return formData.policyAlignment.description || 'N/A'
    }
    return 'N/A'
  }

  const getOriginalRelatedLaws = () => {
    if (originalProject?.policyAlignment && typeof originalProject.policyAlignment === 'object') {
      const anyAlignment = originalProject.policyAlignment as any
      return anyAlignment.description || 'N/A'
    }
    return 'N/A'
  }

  // Format date without timezone shift: date-only (YYYY-MM-DD) and ISO strings
  // are interpreted as calendar dates so 1988-12-22 always shows as 22/12/1988
  // (or locale equivalent), not the previous day in timezones west of UTC.
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    const trimmed = String(dateString).trim()
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, y, m, d] = match
      const year = parseInt(y!, 10)
      const month = parseInt(m!, 10) - 1
      const day = parseInt(d!, 10)
      const localDate = new Date(year, month, day)
      if (!isNaN(localDate.getTime())) return localDate.toLocaleDateString()
    }
    return new Date(trimmed).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency || 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.basicInfo.title')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.title) !== normalize(formData.title) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.projectTitle')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.title, formData.title)}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.description) !== normalize(formData.description) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.description')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.description, formData.description)}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.purpose) !== normalize(formData.purpose) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.purpose')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.purpose, formData.purpose)}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(getOriginalBusinessGroupDisplayName()) !== normalize(getBusinessGroupDisplayName()) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('dashboard.businessGroup')}</dt>
            <dd className="mt-1">
              {renderDiffValue(getOriginalBusinessGroupDisplayName(), getBusinessGroupDisplayName())}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.type) !== normalize(formData.type) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.type')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.type, formData.type)}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(getOriginalMinistry()) !== normalize(getMinistry()) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('dashboard.ministry')}</dt>
            <dd className="mt-1">
              {renderDiffValue(getOriginalMinistry(), getMinistry())}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(getOriginalContractType()) !== normalize(getContractType()) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('pages.view.contractType')}</dt>
            <dd className="mt-1">
              {renderDiffValue(getOriginalContractType(), getContractType())}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.basicInfo.publicAuthority')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.publicAuthority?.name) !== normalize(formData.publicAuthority?.name) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.authorityName')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.publicAuthority?.name, formData.publicAuthority?.name)}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.publicAuthority?.id) !== normalize(formData.publicAuthority?.id) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.authorityRef')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.publicAuthority?.id, formData.publicAuthority?.id)}
            </dd>
          </div>
        </dl>
      </div>

      {formData.parties && formData.parties.length > 0 && (() => {
        // Filter only contractor parties (not publicAuthority)
        const contractorParties = formData.parties.filter(p => {
          const roles = Array.isArray(p?.roles) ? p.roles.filter(r => r) : []
          return roles.includes('contractor') && !roles.includes('publicAuthority')
        })
        
        return contractorParties.length > 0 ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('dashboard.privateContractor')}</h2>
            <div className="space-y-4">
              {contractorParties.map((party, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('form.parties.partyName')}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{party.name || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('form.parties.partyId')}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{party.id || 'N/A'}</dd>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      })()}

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.view.projectDuration')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(formatDate(originalProject?.period?.startDate)) !== normalize(formatDate(formData.period?.startDate)) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('pages.view.contractSigningDate')}</dt>
            <dd className="mt-1">
              {renderDiffValue(formatDate(originalProject?.period?.startDate), formatDate(formData.period?.startDate))}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(formatDate(originalProject?.period?.endDate)) !== normalize(formatDate(formData.period?.endDate)) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.period.endDate')}</dt>
            <dd className="mt-1">
              {renderDiffValue(formatDate(originalProject?.period?.endDate), formatDate(formData.period?.endDate))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.budget.title')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(formatCurrency(originalProject?.budget?.amount?.amount || 0, originalProject?.budget?.amount?.currency || 'THB')) !== normalize(formatCurrency(formData.budget?.amount?.amount || 0, formData.budget?.amount?.currency || 'THB')) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.amountN')}</dt>
            <dd className="mt-1">
              {renderDiffValue(
                formatCurrency(originalProject?.budget?.amount?.amount || 0, originalProject?.budget?.amount?.currency || 'THB'),
                formatCurrency(formData.budget?.amount?.amount || 0, formData.budget?.amount?.currency || 'THB')
              )}
            </dd>
          </div>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(originalProject?.budget?.amount?.currency) !== normalize(formData.budget?.amount?.currency) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.currency')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.budget?.amount?.currency, formData.budget?.amount?.currency)}
            </dd>
          </div>
          {(formData.budget?.description || originalProject?.budget?.description) && (
            <div className={isEditMode ? 'sm:col-span-2 rounded-md p-2 ' + (normalize(originalProject?.budget?.description) !== normalize(formData.budget?.description) ? 'bg-yellow-50 border border-yellow-200' : '') : 'sm:col-span-2'}>
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.description')}</dt>
              <dd className="mt-1">
                {renderDiffValue(originalProject?.budget?.description, formData.budget?.description)}
              </dd>
            </div>
          )}
          {(formData.budget?.requestDate || originalProject?.budget?.requestDate) && (
            <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(formatDate(originalProject?.budget?.requestDate)) !== normalize(formatDate(formData.budget?.requestDate)) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.requestDate')}</dt>
              <dd className="mt-1">
                {renderDiffValue(formatDate(originalProject?.budget?.requestDate), formatDate(formData.budget?.requestDate))}
              </dd>
            </div>
          )}
          {(formData.budget?.approvalDate || originalProject?.budget?.approvalDate) && (
            <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(formatDate(originalProject?.budget?.approvalDate)) !== normalize(formatDate(formData.budget?.approvalDate)) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.approvalDate')}</dt>
              <dd className="mt-1">
                {renderDiffValue(formatDate(originalProject?.budget?.approvalDate), formatDate(formData.budget?.approvalDate))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {getRelatedLaws() !== 'N/A' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">กฎหมายที่เกี่ยวข้อง</h2>
          <div className={isEditMode ? 'rounded-md p-2 ' + (normalize(getOriginalRelatedLaws()) !== normalize(getRelatedLaws()) ? 'bg-yellow-50 border border-yellow-200' : '') : ''}>
            {renderDiffValue(getOriginalRelatedLaws(), getRelatedLaws())}
          </div>
        </div>
      )}

      {formData.documents && formData.documents.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.view.dataSource')}</h2>
          <div className="space-y-2">
            {formData.documents.map((doc, index) => {
              const originalDoc = originalProject?.documents?.[index]
              const titleChanged = isEditMode && normalize(originalDoc?.title) !== normalize(doc.title)
              const urlChanged = isEditMode && normalize(originalDoc?.url) !== normalize(doc.url)
              const rowHighlight = titleChanged || urlChanged
              return (
                <div key={index} className={'border border-gray-200 rounded-lg p-3 ' + (rowHighlight ? 'bg-yellow-50 border-yellow-200' : '')}>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium text-gray-700">{t('form.documents.referenceLabel').replace('{number}', String(index + 1))}: </span>
                      {isEditMode ? renderDiffValue(originalDoc?.title, doc.title) : <span className="text-gray-900">{doc.title || 'N/A'}</span>}
                    </div>
                    <div>
                      {isEditMode ? (
                        renderDiffValue(originalDoc?.url, doc.url)
                      ) : doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-theme-primary hover:underline break-all">
                          {doc.url}
                        </a>
                      ) : (
                        <span className="text-gray-900">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {formData.risks && formData.risks.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ความเสี่ยง</h2>
          <div className="space-y-4">
            {formData.risks.map((risk, riskIndex) => {
              const originalRisks = originalProject?.risks ?? []
              const originalRisk = originalRisks[riskIndex]
              /** Matches `Risk` / form watch: IDs are numeric; form state may omit fields. */
              const formatCategoryDrivers = (
                arr:
                  | Array<{
                      category_name?: string
                      risk_category_id?: number
                      risk_category_code?: string
                      driven_by_risk_factors?: Array<{
                        factor_name?: string
                        risk_factor_id?: number
                      }>
                    }>
                  | undefined
              ) => {
                if (!arr?.length) return '—'
                return arr
                  .map((cd) => {
                    const label =
                      cd.category_name ||
                      (cd.risk_category_id != null ? String(cd.risk_category_id) : '') ||
                      '—'
                    const factors = (cd.driven_by_risk_factors ?? [])
                      .map((f) => f.factor_name || (f.risk_factor_id != null ? String(f.risk_factor_id) : ''))
                      .filter(Boolean)
                    return factors.length ? `${label}: ${factors.join(', ')}` : label
                  })
                  .join('\n')
              }
              const descBefore = (originalRisk?.description ?? []).filter(Boolean).join('\n') || '—'
              const descAfter = (risk.description ?? []).filter(Boolean).join('\n') || '—'
              const impactBefore = (originalRisk?.impact_statement ?? []).filter(Boolean).join('\n') || '—'
              const impactAfter = (risk.impact_statement ?? []).filter(Boolean).join('\n') || '—'
              const mitigationBefore =
                normalizeMitigationHandling(originalRisk?.mitigation_handling).join('\n') || '—'
              const mitigationAfter =
                normalizeMitigationHandling(risk.mitigation_handling).join('\n') || '—'
              const categoryDriversBefore = formatCategoryDrivers(originalRisk?.category_drivers)
              const categoryDriversAfter = formatCategoryDrivers(risk.category_drivers)
              const phaseLabelAfter = RISK_PHASE_OPTIONS.find((p) => p.value === risk.phase)?.label ?? (risk.phase || '—')
              const phaseLabelBefore = originalRisk ? (RISK_PHASE_OPTIONS.find((p) => p.value === originalRisk.phase)?.label ?? (originalRisk.phase || '—')) : '—'
              const titleChanged = isEditMode && normalize(originalRisk?.title) !== normalize(risk.title)
              const phaseChanged = isEditMode && phaseLabelBefore !== phaseLabelAfter
              const descChanged = isEditMode && normalize(descBefore) !== normalize(descAfter)
              const impactChanged = isEditMode && normalize(impactBefore) !== normalize(impactAfter)
              const mitigationChanged = isEditMode && normalize(mitigationBefore) !== normalize(mitigationAfter)
              const categoryDriversChanged = isEditMode && normalize(categoryDriversBefore) !== normalize(categoryDriversAfter)
              return (
                <div key={riskIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className={titleChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                      <dt className="text-sm font-medium text-gray-500">ชื่อความเสี่ยง (Title)</dt>
                      <dd className="mt-1">
                        {renderDiffValue(originalRisk?.title, risk.title)}
                      </dd>
                    </div>
                    <div className={phaseChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                      <dt className="text-sm font-medium text-gray-500">Phase</dt>
                      <dd className="mt-1">
                        {renderDiffValue(phaseLabelBefore, phaseLabelAfter)}
                      </dd>
                    </div>
                    {((risk.description?.length ?? 0) > 0 || (originalRisk?.description?.length ?? 0) > 0) ? (
                      <div className={descChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                        <dt className="text-sm font-medium text-gray-500">รายละเอียด (Description)</dt>
                        <dd className="mt-1">
                          {renderDiffValue(descBefore, descAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    ) : null}
                    {((risk.category_drivers?.length ?? 0) > 0 || (originalRisk?.category_drivers?.length ?? 0) > 0) ? (
                      <div className={categoryDriversChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                        <dt className="text-sm font-medium text-gray-500">กลุ่มปัญหาความเสี่ยง (Risk Category Drivers)</dt>
                        <dd className="mt-1">
                          {renderDiffValue(categoryDriversBefore, categoryDriversAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    ) : null}
                    {((risk.mitigation_handling?.length ?? 0) > 0 || (originalRisk?.mitigation_handling?.length ?? 0) > 0) ? (
                      <div className={mitigationChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                        <dt className="text-sm font-medium text-gray-500">มาตรการรับมือ (Risk Response)</dt>
                        <dd className="mt-1">
                          {renderDiffValue(mitigationBefore, mitigationAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    ) : null}
                    {((risk.impact_statement?.length ?? 0) > 0 || (originalRisk?.impact_statement?.length ?? 0) > 0) ? (
                      <div className={impactChanged ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200' : ''}>
                        <dt className="text-sm font-medium text-gray-500">ผลกระทบ (Risk Impact)</dt>
                        <dd className="mt-1">
                          {renderDiffValue(impactBefore, impactAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
