import { Control, useWatch } from 'react-hook-form'
import { ProjectFormData, ProjectData, Period, Party } from '@/types/project'
import { useLanguage } from '@/lib/LanguageContext'
import { BUSINESS_GROUP_CODE_TO_DISPLAY_NAME } from '@/types/businessGroup'
import { normalizeMitigationHandling } from '@/lib/normalizeMitigationHandling'
import { collapseRisksForForm, formatRiskPhaseLabels } from '@/lib/riskPhasesForm'

interface Step5ReviewProps {
  control: Control<ProjectFormData>
  mode?: 'create' | 'edit'
  originalProject?: ProjectData | null
}

type AuthoritySummary = { name: string; ministries: string[]; contractors: string[] }

type PeriodKey =
  | 'period'
  | 'identificationPeriod'
  | 'preparationPeriod'
  | 'implementationPeriod'
  | 'completionPeriod'
  | 'maintenancePeriod'
  | 'decommissioningPeriod'

const PERIOD_SECTIONS: Array<{
  key: PeriodKey
  title: string
  startLabel: string
  endLabel: string
}> = [
  { key: 'period', title: 'สัญญาโครงการ', startLabel: 'วันที่ลงนามในสัญญา', endLabel: 'วันที่สิ้นสุด' },
  {
    key: 'identificationPeriod',
    title: 'ระยะเวลาการเริ่มต้นโครงการ (Identification Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
  {
    key: 'preparationPeriod',
    title: 'ระยะเวลาการเตรียมการ (Preparation Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
  {
    key: 'implementationPeriod',
    title: 'ระยะเวลาการดำเนินก่อสร้าง (Implementation Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
  {
    key: 'completionPeriod',
    title: 'ระยะเวลาการส่งมอบ (Completion Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
  {
    key: 'maintenancePeriod',
    title: 'ระยะการบำรุงรักษา (Maintenance Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
  {
    key: 'decommissioningPeriod',
    title: 'ระยะเวลาการสิ้นสุดโครงการ (Decommissioning Period)',
    startLabel: 'วันที่เริ่ม',
    endLabel: 'วันที่สิ้นสุด',
  },
]

function parseAuthorityParties(parties: Party[] | undefined): AuthoritySummary[] {
  if (!parties?.length) return []
  return parties
    .filter((p) => Array.isArray(p?.roles) && p.roles.includes('publicAuthority'))
    .map((party) => {
      const ministries =
        party.additionalIdentifiers
          ?.filter((id) => id?.scheme === 'ministry' || id?.scheme === 'TH-MINISTRY')
          .map((id) => id.legalName)
          .filter(Boolean) as string[] ?? []
      const legalNameStr = party.identifier?.legalName ?? ''
      const contractors = legalNameStr
        ? legalNameStr.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      return { name: party.name || '', ministries, contractors }
    })
}

export default function Step5Review({ control, mode = 'create', originalProject }: Step5ReviewProps) {
  const { t } = useLanguage()
  const formData = useWatch({ control })
  const isEditMode = mode === 'edit' && !!originalProject

  const normalize = (value: unknown) => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  const wrapLongTextClass = 'min-w-0 max-w-full break-words [overflow-wrap:anywhere]'

  const renderDiffValue = (
    beforeRaw: unknown,
    afterRaw: unknown,
    options?: { preserveNewlines?: boolean; breakWords?: boolean }
  ) => {
    const before = normalize(beforeRaw)
    const after = normalize(afterRaw)
    const changed = before !== after
    const multiline = options?.preserveNewlines ? 'whitespace-pre-line' : ''
    const wrap = options?.breakWords ? wrapLongTextClass : ''

    if (!isEditMode) {
      return <span className={`text-sm text-gray-900 ${multiline} ${wrap}`}>{after || 'N/A'}</span>
    }

    if (!changed) {
      return <span className={`text-sm text-gray-900 ${multiline} ${wrap}`}>{after || 'N/A'}</span>
    }

    return (
      <div className={`text-sm space-y-1 ${wrap}`}>
        <div className={`line-through text-gray-400 ${multiline}`}>{before || 'N/A'}</div>
        <div className={`text-theme-primary font-semibold ${multiline}`}>{after || 'N/A'}</div>
      </div>
    )
  }

  const renderDocumentUrl = (url: string | undefined, originalUrl?: string) => {
    const href = url?.trim()
    const wrapLinkClass = `block text-sm text-theme-primary hover:underline ${wrapLongTextClass}`

    if (!isEditMode) {
      if (!href) return <span className="text-sm text-gray-900">N/A</span>
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={wrapLinkClass}>
          {href}
        </a>
      )
    }

    if (normalize(originalUrl) === normalize(url)) {
      if (!href) return <span className={`text-sm text-gray-900 ${wrapLongTextClass}`}>N/A</span>
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={wrapLinkClass}>
          {href}
        </a>
      )
    }

    return renderDiffValue(originalUrl, url, { breakWords: true })
  }

  const diffHighlight = (beforeRaw: unknown, afterRaw: unknown) =>
    isEditMode && normalize(beforeRaw) !== normalize(afterRaw)
      ? 'rounded-md p-2 bg-yellow-50 border border-yellow-200'
      : ''

  const getBusinessGroupDisplayName = (sector: ProjectFormData['sector'] | ProjectData['sector'] | undefined) => {
    if (!sector || !Array.isArray(sector)) return 'N/A'
    for (const entry of sector) {
      const code = typeof entry === 'string' ? entry : (entry && typeof entry === 'object' ? (entry as { id?: string }).id : '') || ''
      if (code && BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[code as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]) {
        return BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[code as keyof typeof BUSINESS_GROUP_CODE_TO_DISPLAY_NAME]
      }
    }
    return 'N/A'
  }

  const getClassificationDescription = (
    classifications: ProjectFormData['additionalClassifications'],
    scheme: string
  ) => {
    if (!classifications?.length) return 'N/A'
    const item = classifications.find((c) => c?.scheme === scheme)
    return item?.description?.trim() || 'N/A'
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A'
    const trimmed = String(dateString).trim()
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, y, m, d] = match
      const localDate = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10))
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

  const getRelatedLaws = (policyAlignment: ProjectFormData['policyAlignment']) => {
    if (policyAlignment && typeof policyAlignment === 'object') {
      return (policyAlignment as { description?: string }).description?.trim() || 'N/A'
    }
    return 'N/A'
  }

  const formAuthorities = parseAuthorityParties(formData.parties as Party[] | undefined)
  const originalAuthorities = parseAuthorityParties(originalProject?.parties)

  const referenceDocuments = (formData.documents ?? []).filter((d) => d.documentType === 'reference')
  const imageDocuments = (formData.documents ?? []).filter((d) => d.documentType === 'image')
  const originalReferenceDocuments = (originalProject?.documents ?? []).filter((d) => d.documentType === 'reference')
  const originalImageDocuments = (originalProject?.documents ?? []).filter((d) => d.documentType === 'image')

  const getPeriod = (source: ProjectFormData | ProjectData | undefined, key: PeriodKey): Period | undefined => {
    if (!source) return undefined
    return source[key] as Period | undefined
  }

  const periodHasValues = (p: Period | undefined) => !!(p?.startDate?.trim() || p?.endDate?.trim())

  return (
    <div className="space-y-6">
      {/* Step 1 — ข้อมูลพื้นฐาน */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('pages.create.step1')}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={diffHighlight(originalProject?.title, formData.title)}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.projectTitle')}</dt>
            <dd className="mt-1">{renderDiffValue(originalProject?.title, formData.title)}</dd>
          </div>
          <div className={diffHighlight(originalProject?.description, formData.description)}>
            <dt className="text-sm font-medium text-gray-500">{t('form.basicInfo.description')}</dt>
            <dd className="mt-1">{renderDiffValue(originalProject?.description, formData.description)}</dd>
          </div>
          <div
            className={diffHighlight(getBusinessGroupDisplayName(originalProject?.sector), getBusinessGroupDisplayName(formData.sector))}
          >
            <dt className="text-sm font-medium text-gray-500">{t('dashboard.businessGroup')}</dt>
            <dd className="mt-1">
              {renderDiffValue(
                getBusinessGroupDisplayName(originalProject?.sector),
                getBusinessGroupDisplayName(formData.sector)
              )}
            </dd>
          </div>
          <div className={diffHighlight(originalProject?.type, formData.type)}>
            <dt className="text-sm font-medium text-gray-500">ประเภทโครงการ</dt>
            <dd className="mt-1">{renderDiffValue(originalProject?.type, formData.type)}</dd>
          </div>
        </dl>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('form.publicAuthorities.title')}</h3>
          {formAuthorities.length > 0 ? (
            <div className="space-y-4">
              {formAuthorities.map((authority, index) => {
                const original = originalAuthorities[index]
                const ministriesStr = authority.ministries.join(', ') || 'N/A'
                const originalMinistriesStr = original?.ministries.join(', ') || 'N/A'
                const contractorsStr = authority.contractors.join(', ') || 'N/A'
                const originalContractorsStr = original?.contractors.join(', ') || 'N/A'
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">
                      {t('form.publicAuthorities.authorityLabel').replace('{number}', String(index + 1))}
                    </h4>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className={diffHighlight(original?.name, authority.name)}>
                        <dt className="text-sm font-medium text-gray-500">{t('form.publicAuthorities.authorityName')}</dt>
                        <dd className="mt-1">{renderDiffValue(original?.name, authority.name)}</dd>
                      </div>
                      <div className={diffHighlight(originalMinistriesStr, ministriesStr)}>
                        <dt className="text-sm font-medium text-gray-500">{t('form.publicAuthorities.selectMinistries')}</dt>
                        <dd className="mt-1">{renderDiffValue(originalMinistriesStr, ministriesStr)}</dd>
                      </div>
                      <div className={`sm:col-span-2 ${diffHighlight(originalContractorsStr, contractorsStr)}`}>
                        <dt className="text-sm font-medium text-gray-500">{t('dashboard.privateContractor')}</dt>
                        <dd className="mt-1">{renderDiffValue(originalContractorsStr, contractorsStr)}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">N/A</p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">การจำแนกกลุ่มโครงการ</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className={diffHighlight(
                getClassificationDescription(originalProject?.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบการจัดสรรกรรมสิทธิ์'),
                getClassificationDescription(formData.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบการจัดสรรกรรมสิทธิ์')
              )}
            >
              <dt className="text-sm font-medium text-gray-500">{t('pages.view.contractType')}</dt>
              <dd className="mt-1">
                {renderDiffValue(
                  getClassificationDescription(originalProject?.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบการจัดสรรกรรมสิทธิ์'),
                  getClassificationDescription(formData.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบการจัดสรรกรรมสิทธิ์')
                )}
              </dd>
            </div>
            <div
              className={diffHighlight(
                getClassificationDescription(originalProject?.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบสัมปทานหรือค่าตอบแทน'),
                getClassificationDescription(formData.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบสัมปทานหรือค่าตอบแทน')
              )}
            >
              <dt className="text-sm font-medium text-gray-500">รูปแบบสัมปทานหรือค่าตอบแทน</dt>
              <dd className="mt-1">
                {renderDiffValue(
                  getClassificationDescription(originalProject?.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบสัมปทานหรือค่าตอบแทน'),
                  getClassificationDescription(formData.additionalClassifications as ProjectFormData['additionalClassifications'], 'รูปแบบสัมปทานหรือค่าตอบแทน')
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Step 2 — ระยะเวลาโครงการ */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ระยะเวลาโครงการ</h2>
        <div className="space-y-6">
          {PERIOD_SECTIONS.map(({ key, title, startLabel, endLabel }) => {
            const after = getPeriod(formData as ProjectFormData, key)
            const before = getPeriod(originalProject ?? undefined, key)
            if (!periodHasValues(after) && !periodHasValues(before)) return null
            return (
              <div key={key} className={key !== 'period' ? 'pt-6 border-t border-gray-200' : ''}>
                <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={diffHighlight(formatDate(before?.startDate), formatDate(after?.startDate))}>
                    <dt className="text-sm font-medium text-gray-500">{startLabel}</dt>
                    <dd className="mt-1">{renderDiffValue(formatDate(before?.startDate), formatDate(after?.startDate))}</dd>
                  </div>
                  <div className={diffHighlight(formatDate(before?.endDate), formatDate(after?.endDate))}>
                    <dt className="text-sm font-medium text-gray-500">{endLabel}</dt>
                    <dd className="mt-1">{renderDiffValue(formatDate(before?.endDate), formatDate(after?.endDate))}</dd>
                  </div>
                </dl>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 3 — ข้อมูลงบประมาณ */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ข้อมูลงบประมาณ</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className={diffHighlight(
              formatCurrency(originalProject?.budget?.amount?.amount || 0, originalProject?.budget?.amount?.currency || 'THB'),
              formatCurrency(formData.budget?.amount?.amount || 0, formData.budget?.amount?.currency || 'THB')
            )}
          >
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.amountN')}</dt>
            <dd className="mt-1">
              {renderDiffValue(
                formatCurrency(originalProject?.budget?.amount?.amount || 0, originalProject?.budget?.amount?.currency || 'THB'),
                formatCurrency(formData.budget?.amount?.amount || 0, formData.budget?.amount?.currency || 'THB')
              )}
            </dd>
          </div>
          <div
            className={diffHighlight(originalProject?.budget?.amount?.currency, formData.budget?.amount?.currency)}
          >
            <dt className="text-sm font-medium text-gray-500">{t('form.budget.currency')}</dt>
            <dd className="mt-1">
              {renderDiffValue(originalProject?.budget?.amount?.currency, formData.budget?.amount?.currency)}
            </dd>
          </div>
          {(formData.budget?.description || originalProject?.budget?.description) && (
            <div
              className={`sm:col-span-2 ${diffHighlight(originalProject?.budget?.description, formData.budget?.description)}`}
            >
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.description')}</dt>
              <dd className="mt-1">
                {renderDiffValue(originalProject?.budget?.description, formData.budget?.description)}
              </dd>
            </div>
          )}
          {(formData.budget?.requestDate || originalProject?.budget?.requestDate) && (
            <div
              className={diffHighlight(
                formatDate(originalProject?.budget?.requestDate),
                formatDate(formData.budget?.requestDate)
              )}
            >
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.requestDate')}</dt>
              <dd className="mt-1">
                {renderDiffValue(
                  formatDate(originalProject?.budget?.requestDate),
                  formatDate(formData.budget?.requestDate)
                )}
              </dd>
            </div>
          )}
          {(formData.budget?.approvalDate || originalProject?.budget?.approvalDate) && (
            <div
              className={diffHighlight(
                formatDate(originalProject?.budget?.approvalDate),
                formatDate(formData.budget?.approvalDate)
              )}
            >
              <dt className="text-sm font-medium text-gray-500">{t('form.budget.approvalDate')}</dt>
              <dd className="mt-1">
                {renderDiffValue(
                  formatDate(originalProject?.budget?.approvalDate),
                  formatDate(formData.budget?.approvalDate)
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Step 4 — กฎหมายและอ้างอิง */}
      <div className="card min-w-0 overflow-hidden">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">กฎหมายและอ้างอิง</h2>
        <div className="min-w-0 space-y-6">
          <div className={diffHighlight(getRelatedLaws(originalProject?.policyAlignment), getRelatedLaws(formData.policyAlignment))}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">กฎหมายที่เกี่ยวข้อง</h3>
            {renderDiffValue(
              getRelatedLaws(originalProject?.policyAlignment),
              getRelatedLaws(formData.policyAlignment),
              { preserveNewlines: true }
            )}
          </div>

          {(referenceDocuments.length > 0 || originalReferenceDocuments.length > 0) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('pages.view.dataSource')}</h3>
              <div className="space-y-2">
                {referenceDocuments.map((doc, index) => {
                  const originalDoc = originalReferenceDocuments[index]
                  const titleChanged = isEditMode && normalize(originalDoc?.title) !== normalize(doc.title)
                  const urlChanged = isEditMode && normalize(originalDoc?.url) !== normalize(doc.url)
                  return (
                    <div
                      key={index}
                      className={`min-w-0 overflow-hidden border border-gray-200 rounded-lg p-3 ${titleChanged || urlChanged ? 'bg-yellow-50 border-yellow-200' : ''}`}
                    >
                      <div className="min-w-0 text-sm space-y-1">
                        <div className="min-w-0">
                          <span className="font-medium text-gray-700">
                            {t('form.documents.referenceLabel').replace('{number}', String(index + 1))}:{' '}
                          </span>
                          {isEditMode ? (
                            renderDiffValue(originalDoc?.title, doc.title, { breakWords: true })
                          ) : (
                            <span className={`text-gray-900 ${wrapLongTextClass}`}>{doc.title || 'N/A'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          {renderDocumentUrl(doc.url, originalDoc?.url)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(imageDocuments.length > 0 || originalImageDocuments.length > 0) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-3">{t('pages.view.images')}</h3>
              <div className="space-y-2">
                {imageDocuments.map((doc, index) => {
                  const originalDoc = originalImageDocuments[index]
                  const urlChanged = isEditMode && normalize(originalDoc?.url) !== normalize(doc.url)
                  return (
                    <div
                      key={index}
                      className={`min-w-0 overflow-hidden border border-gray-200 rounded-lg p-3 ${urlChanged ? 'bg-yellow-50 border-yellow-200' : ''}`}
                    >
                      <div className="min-w-0 text-sm">
                        <span className="font-medium text-gray-700">
                          {t('form.documents.imageLabel').replace('{number}', String(index + 1))}:{' '}
                        </span>
                        <div className="min-w-0 mt-1">
                          {renderDocumentUrl(doc.url, originalDoc?.url)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 5 — ความเสี่ยง */}
      {formData.risks && formData.risks.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ความเสี่ยง</h2>
          <div className="space-y-4">
            {formData.risks.map((risk, riskIndex) => {
              const originalFormRisks = collapseRisksForForm(originalProject?.risks ?? [])
              const originalRisk = originalFormRisks[riskIndex]
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
              const mitigationBefore = normalizeMitigationHandling(originalRisk?.mitigation_handling).join('\n') || '—'
              const mitigationAfter = normalizeMitigationHandling(risk.mitigation_handling).join('\n') || '—'
              const categoryDriversBefore = formatCategoryDrivers(originalRisk?.category_drivers)
              const categoryDriversAfter = formatCategoryDrivers(risk.category_drivers)
              const phaseLabelAfter = formatRiskPhaseLabels(risk.phases) || '—'
              const phaseLabelBefore = originalRisk ? formatRiskPhaseLabels(originalRisk.phases) || '—' : '—'

              return (
                <div key={riskIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className={diffHighlight(originalRisk?.title, risk.title)}>
                      <dt className="text-sm font-medium text-gray-500">ชื่อความเสี่ยง</dt>
                      <dd className="mt-1">{renderDiffValue(originalRisk?.title, risk.title)}</dd>
                    </div>
                    <div className={diffHighlight(phaseLabelBefore, phaseLabelAfter)}>
                      <dt className="text-sm font-medium text-gray-500">เฟส</dt>
                      <dd className="mt-1">{renderDiffValue(phaseLabelBefore, phaseLabelAfter)}</dd>
                    </div>
                    {((risk.description?.length ?? 0) > 0 || (originalRisk?.description?.length ?? 0) > 0) && (
                      <div className={diffHighlight(descBefore, descAfter)}>
                        <dt className="text-sm font-medium text-gray-500">รายละเอียด</dt>
                        <dd className="mt-1">{renderDiffValue(descBefore, descAfter, { preserveNewlines: true })}</dd>
                      </div>
                    )}
                    {((risk.category_drivers?.length ?? 0) > 0 || (originalRisk?.category_drivers?.length ?? 0) > 0) && (
                      <div className={diffHighlight(categoryDriversBefore, categoryDriversAfter)}>
                        <dt className="text-sm font-medium text-gray-500">กลุ่มปัญหาความเสี่ยง</dt>
                        <dd className="mt-1">
                          {renderDiffValue(categoryDriversBefore, categoryDriversAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    )}
                    {((risk.mitigation_handling?.length ?? 0) > 0 || (originalRisk?.mitigation_handling?.length ?? 0) > 0) && (
                      <div className={diffHighlight(mitigationBefore, mitigationAfter)}>
                        <dt className="text-sm font-medium text-gray-500">มาตรการรับมือ</dt>
                        <dd className="mt-1">
                          {renderDiffValue(mitigationBefore, mitigationAfter, { preserveNewlines: true })}
                        </dd>
                      </div>
                    )}
                    {((risk.impact_statement?.length ?? 0) > 0 || (originalRisk?.impact_statement?.length ?? 0) > 0) && (
                      <div className={diffHighlight(impactBefore, impactAfter)}>
                        <dt className="text-sm font-medium text-gray-500">ผลกระทบ</dt>
                        <dd className="mt-1">{renderDiffValue(impactBefore, impactAfter, { preserveNewlines: true })}</dd>
                      </div>
                    )}
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
