'use client'

import HomePageSkeleton from '@/components/HomePageSkeleton'
import RiskDashboardContent from '@/components/home/RiskDashboardContent'
import { useInfo } from '@/app/hooks/useInfo'
import { useRisk } from '@/app/hooks/useRisk'

export default function RiskPage() {
  const { data: infoData, isLoading: infoLoading, error: infoError } = useInfo()
  const { data: riskData, isLoading: riskLoading, error: riskError } = useRisk(
    {},
    infoData
      ? {
          ministry: infoData.ministry,
          sector: infoData.sector,
          contractType: infoData.contractType,
        }
      : undefined
  )

  const loading = infoLoading || riskLoading
  const error = riskError || infoError

  if (loading) {
    return <HomePageSkeleton />
  }

  return (
    <div className="px-4 sm:px-0">
      {error ? (
        <div className="box p-6 text-center text-red-600 text-sm">
          ไม่สามารถโหลดข้อมูลความเสี่ยงได้
        </div>
      ) : (
        <RiskDashboardContent infoData={infoData} riskData={riskData} />
      )}
    </div>
  )
}
