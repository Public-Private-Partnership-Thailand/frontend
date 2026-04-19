'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { Icon } from 'leaflet'
import type { SummaryProjectLocation } from '@/app/hooks/useSummary'
import { resolveBusinessGroupLabel } from '@/types/businessGroup'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const THAILAND_CENTER: [number, number] = [13.7563, 100.5018]
const DEFAULT_ZOOM = 6
const SINGLE_POINT_ZOOM = 10

function isValidThailandPin(p: SummaryProjectLocation): boolean {
  const { lat, lng } = p
  if (typeof lat !== 'number' || typeof lng !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false
  }
  // Rough Thailand bounding box (WGS-84)
  return lat >= 5.5 && lat <= 21.0 && lng >= 97.0 && lng <= 106.0
}

/** Fit map to markers when data loads or changes */
function MapBoundsController({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) {
      map.setView(THAILAND_CENTER, DEFAULT_ZOOM)
      return
    }
    if (points.length === 1) {
      map.setView(points[0], SINGLE_POINT_ZOOM)
      return
    }
    const b = L.latLngBounds(points as L.LatLngExpression[])
    map.fitBounds(b, { padding: [40, 40], maxZoom: 11 })
  }, [map, points])
  return null
}

export interface MapComponentProps {
  locations?: SummaryProjectLocation[] | null
}

export default function MapComponent({ locations = [] }: MapComponentProps) {
  const valid = useMemo(() => (locations ?? []).filter(isValidThailandPin), [locations])
  const positions = useMemo(() => valid.map((p) => [p.lat, p.lng] as [number, number]), [valid])

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={THAILAND_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsController points={positions} />

        {valid.map((project) => (
          <Marker key={project.id} position={[project.lat, project.lng]}>
            <Popup>
              <div className="p-1 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-2 leading-snug">{project.title}</h3>
                <div className="space-y-1 text-xs text-gray-800">
                  {project.sector != null && project.sector !== '' && (
                    <p>
                      <span className="font-medium text-gray-600">กลุ่มกิจการ:</span>{' '}
                      {resolveBusinessGroupLabel(project.sector)}
                    </p>
                  )}
                  {project.budgetMillionBaht != null &&
                    project.budgetMillionBaht > 0 &&
                    Number.isFinite(project.budgetMillionBaht) && (
                      <p>
                        <span className="font-medium text-gray-600">มูลค่าโครงการ:</span>{' '}
                        ฿{project.budgetMillionBaht.toLocaleString('th-TH')} ล้านบาท
                      </p>
                    )}
                  <p className="pt-1">
                    <Link
                      href={`/view/${project.id}`}
                      className="text-theme-primary font-medium hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ดูรายละเอียด
                    </Link>
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {valid.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5">
          <p className="rounded-md bg-white/90 px-3 py-2 text-sm text-gray-600 shadow-sm">
            ไม่มีตำแหน่งโครงการบนแผนที่
          </p>
        </div>
      )}
    </div>
  )
}
