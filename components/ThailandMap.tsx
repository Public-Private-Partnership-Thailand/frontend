'use client'

import dynamic from 'next/dynamic'
import { useLanguage } from '@/lib/LanguageContext'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})


export default function ThailandMap() {
  const { t } = useLanguage()

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <MapComponent />
    </div>
  )
}
