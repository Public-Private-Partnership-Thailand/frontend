'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LoadingSpinner() {
  const { t } = useLanguage()
  
  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600">{t('common.loading')}</p>
    </div>
  )
}
