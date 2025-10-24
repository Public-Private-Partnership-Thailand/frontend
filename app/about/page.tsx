'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* What is PPP Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.whatIsPPP')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t('about.whatIsPPPDesc')}
            </p>
            
            {/* World Bank Definition */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                {t('about.worldBankDefinition')}
              </h3>
              <p className="text-blue-800 italic">
                "{t('about.worldBankDefinitionDesc')}"
              </p>
            </div>

            {/* Thai Context */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-3">
                {t('about.thaiContext')}
              </h3>
              <p className="text-green-800">
                {t('about.thaiContextDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Reasons for PPP Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.reasonsForPPP')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('about.reasonsForPPPDesc')}
            </p>
          </div>
        </div>

        {/* PPP Operations Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.pppOperations')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t('about.pppOperationsDesc')}
            </p>
            
            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  {t('about.riskSharing')}
                </h3>
                <p className="text-purple-800 text-sm">
                  {t('about.riskSharingDesc')}
                </p>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  {t('about.longTermContracts')}
                </h3>
                <p className="text-orange-800 text-sm">
                  {t('about.longTermContractsDesc')}
                </p>
              </div>
              
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-900 mb-2">
                  {t('about.serviceDelivery')}
                </h3>
                <p className="text-teal-800 text-sm">
                  {t('about.serviceDeliveryDesc')}
                </p>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                  {t('about.assetTransfer')}
                </h3>
                <p className="text-indigo-800 text-sm">
                  {t('about.assetTransferDesc')}
                </p>
              </div>
              
              <div className="bg-pink-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-pink-900 mb-2">
                  {t('about.contractDetails')}
                </h3>
                <p className="text-pink-800 text-sm">
                  {t('about.contractDetailsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thai PPP Act Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.thaiPPPLaw')}
            </h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-lg text-yellow-800 leading-relaxed">
                {t('about.thaiPPPLawDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.benefits')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t('about.benefitsDesc')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  {t('about.publicSectorBenefits')}
                </h3>
                <ul className="text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {t('about.accessToExpertise')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {t('about.riskSharingBenefits')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {t('about.improvedService')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {t('about.innovation')}
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">
                  {t('about.privateSectorBenefits')}
                </h3>
                <ul className="text-green-800 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {t('about.longTermRevenue')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {t('about.governmentPartnership')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {t('about.marketExpansion')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {t('about.stableRegulatory')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Win-Win Benefits Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">
              {t('about.winWinBenefits')}
            </h2>
            <p className="text-xl leading-relaxed">
              {t('about.winWinBenefitsDesc')}
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.summary')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t('about.summaryDesc')}
            </p>
            
            {/* Thailand PPP */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t('about.thailandPPP')}
              </h3>
              <p className="text-gray-700">
                {t('about.thailandPPPDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Important Considerations */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-orange-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('about.considerations')}
            </h2>
            <div className="bg-orange-50 p-6 rounded-lg">
              <p className="text-lg text-orange-800 leading-relaxed">
                {t('about.considerationsDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Thailand PPP at a Glance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-100">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">฿1.2T</div>
                <div className="text-blue-100">Total Investment</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">30+</div>
                <div className="text-blue-100">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">15+</div>
                <div className="text-blue-100">Sectors Covered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Explore PPP Projects?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Discover Thailand's innovative infrastructure projects and learn how PPP is shaping the nation's future.
            </p>
            <div className="space-x-4">
              <a
                href="/projects"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              >
                View All Projects
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}