'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-base text-gray-600">
            {t('about.subtitle')}
          </p>
        </div>

        {/* About Platform Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.aboutPlatform')}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {t('about.aboutPlatformDesc')}
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.platformPurpose')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.platformPurposeDesc')}
              </p>
            </div>
            
          </div>
        </div>

        {/* What is PPP Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.whatIsPPP')}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {t('about.whatIsPPPDesc')}
          </p>
          
          {/* World Bank Definition */}
          <div className="border-l-4 border-gray-300 pl-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('about.worldBankDefinition')}
            </h3>
            <p className="text-base text-gray-700">
              "{t('about.worldBankDefinitionDesc')}"
            </p>
          </div>

          {/* Thai Context */}
          <div className="border-l-4 border-gray-300 pl-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('about.thaiContext')}
            </h3>
            <p className="text-base text-gray-700">
              {t('about.thaiContextDesc')}
            </p>
          </div>
        </div>

        {/* Reasons for PPP Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.reasonsForPPP')}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            {t('about.reasonsForPPPDesc')}
          </p>
        </div>

        {/* PPP Operations Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.pppOperations')}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {t('about.pppOperationsDesc')}
          </p>
          
          {/* Key Features List */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.riskSharing')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.riskSharingDesc')}
              </p>
            </div>
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.longTermContracts')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.longTermContractsDesc')}
              </p>
            </div>
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.serviceDelivery')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.serviceDeliveryDesc')}
              </p>
            </div>
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.assetTransfer')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.assetTransferDesc')}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('about.contractDetails')}
              </h3>
              <p className="text-base text-gray-700">
                {t('about.contractDetailsDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Thai PPP Act Section */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.thaiPPPLaw')}
          </h2>
          <div className="border-l-4 border-gray-300 pl-4">
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              {t('about.thaiPPPLawDesc')}
            </p>
            <p className="text-base text-gray-700">
              <a
                href="https://www.ratchakitcha.soc.go.th/DATA/PDF/2562/A/029/T_0001.PDF"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('about.thaiPPPLawLink')}
              </a>
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('about.benefits')}
          </h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {t('about.benefitsDesc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('about.publicSectorBenefits')}
              </h3>
              <ul className="text-base text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.accessToExpertise')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.riskSharingBenefits')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.improvedService')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.innovation')}
                </li>
              </ul>
            </div>
            
            <div className="border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('about.privateSectorBenefits')}
              </h3>
              <ul className="text-base text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.longTermRevenue')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.governmentPartnership')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.marketExpansion')}
                </li>
                <li className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  {t('about.stableRegulatory')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}