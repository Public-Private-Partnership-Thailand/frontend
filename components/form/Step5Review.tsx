import { Control, useWatch } from 'react-hook-form'
import { ProjectFormData } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { BUSINESS_GROUP_CODE_TO_DISPLAY_NAME } from '@/types/businessGroup'
import { useEffect } from 'react'

interface Step5ReviewProps {
  control: Control<ProjectFormData>
}

export default function Step5Review({ control }: Step5ReviewProps) {
  const { t } = useLanguage()
  
  // Watch all form values
  const formData = useWatch({ control })

  // Console log the entire form data when user is in step 5
  useEffect(() => {
    console.log('Step 5 Review - Complete Form Data:', formData)
  }, [formData])

  // Get businessGroup display name from sector array
  const getBusinessGroupDisplayName = () => {
    if (!formData.sector || !Array.isArray(formData.sector)) return 'N/A'
    
    // Find the first sector code that matches a business group code
    for (const sectorItem of formData.sector) {
      const sectorCode = typeof sectorItem === 'string' ? sectorItem : (sectorItem?.id || '')
      if (sectorCode && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        return BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[sectorCode as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]
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

  // Get related laws from policyAlignment
  const getRelatedLaws = () => {
    if (formData.policyAlignment && typeof formData.policyAlignment === 'object') {
      return formData.policyAlignment.description || 'N/A'
    }
    return 'N/A'
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
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
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.projectTitle')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.title || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.description')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.description || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.purpose')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.purpose || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('dashboard.businessGroup')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{getBusinessGroupDisplayName()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.type')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.type || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('dashboard.ministry')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{getMinistry()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('pages.view.contractType')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{getContractType()}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.basicInfo.publicAuthority')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.authorityName')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.publicAuthority?.name || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.authorityRef')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.publicAuthority?.id || 'N/A'}</dd>
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
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('pages.view.contractSigningDate')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(formData.period?.startDate)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.period.endDate')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(formData.period?.endDate)}</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('form.budget.title')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.amountN')}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatCurrency(formData.budget?.amount?.amount || 0, formData.budget?.amount?.currency || 'THB')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.currency')}</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.budget?.amount?.currency || 'N/A'}</dd>
          </div>
          {formData.budget?.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.description')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.budget.description}</dd>
            </div>
          )}
          {formData.budget?.requestDate && (
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.requestDate')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(formData.budget.requestDate)}</dd>
            </div>
          )}
          {formData.budget?.approvalDate && (
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.approvalDate')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(formData.budget.approvalDate)}</dd>
            </div>
          )}
        </dl>
      </div>

      {getRelatedLaws() !== 'N/A' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">กฎหมายที่เกี่ยวข้อง</h2>
          <p className="text-sm text-gray-900">{getRelatedLaws()}</p>
        </div>
      )}

      {formData.documents && formData.documents.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.view.dataSource')}</h2>
          <div className="space-y-2">
            {formData.documents.map((doc, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{doc.title || 'N/A'}</span>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-theme-primary hover:underline break-all">
                      {doc.url}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
