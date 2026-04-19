'use client'

import dynamic from 'next/dynamic'
import type { SummaryProjectLocation } from '@/app/hooks/useSummary'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
})

interface ThailandMapProps {
  className?: string
  /** Pins from GET /api/v1/summary `locations` */
  locations?: SummaryProjectLocation[] | null
}

export default function ThailandMap({ className, locations }: ThailandMapProps) {
  return (
    <div className={className || 'h-96 rounded-lg overflow-hidden border'}>
      <MapComponent locations={locations ?? []} />
    </div>
  )
}
