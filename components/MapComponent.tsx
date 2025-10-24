'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface ProjectLocation {
  id: string
  name: string
  lat: number
  lng: number
  sector: string
  status: string
  cost: number
}

// Sample project locations in Thailand
const projectLocations: ProjectLocation[] = [
  {
    id: '1',
    name: 'โครงการรถไฟฟ้าสายสีน้ำเงิน',
    lat: 13.7563,
    lng: 100.5018,
    sector: 'Transportation',
    status: 'Active',
    cost: 80410
  },
  {
    id: '2',
    name: 'โครงการรถไฟฟ้าสายสีชมพู',
    lat: 13.7563,
    lng: 100.5018,
    sector: 'Transportation',
    status: 'Active',
    cost: 56691
  },
  {
    id: '3',
    name: 'โครงการรถไฟฟ้าสายสีเหลือง',
    lat: 13.7563,
    lng: 100.5018,
    sector: 'Transportation',
    status: 'Active',
    cost: 54644
  },
  {
    id: '4',
    name: 'โครงการรถไฟฟ้าสายสีส้ม',
    lat: 13.7563,
    lng: 100.5018,
    sector: 'Transportation',
    status: 'Active',
    cost: 235320
  },
  {
    id: '5',
    name: 'โครงการพัฒนาสนามบินอู่ตะเภา',
    lat: 12.6333,
    lng: 101.0000,
    sector: 'Aviation',
    status: 'Active',
    cost: 290000
  },
  {
    id: '6',
    name: 'โครงการรถไฟความเร็วสูงเชื่อมสามสนามบิน',
    lat: 13.7563,
    lng: 100.5018,
    sector: 'Transportation',
    status: 'Active',
    cost: 224000
  },
  {
    id: '7',
    name: 'โครงการท่าเรือแหลมฉบัง',
    lat: 13.0833,
    lng: 100.8833,
    sector: 'Port',
    status: 'Active',
    cost: 0
  }
]

export default function MapComponent() {
  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {projectLocations.map((project) => (
        <Marker
          key={project.id}
          position={[project.lat, project.lng]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm mb-2">{project.name}</h3>
              <div className="space-y-1 text-xs">
                <p><strong>Sector:</strong> {project.sector}</p>
                <p><strong>Status:</strong> {project.status}</p>
                {project.cost > 0 && (
                  <p><strong>Cost:</strong> ฿{project.cost.toLocaleString()}M</p>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
