// Business Group Constants and Mappings
// Centralized definition for all business group related mappings

export type BusinessGroupCode = 
  | 'transport.road'
  | 'transport.rail'
  | 'transport.air'
  | 'transport.water'
  | 'waterAndWaste'
  | 'energy'
  | 'communications'
  | 'health'
  | 'education'
  | 'socialHousing'
  | 'cultureSportsAndRecreation'
  | 'others'

export interface BusinessGroupInfo {
  displayName: string
  icon: string
  fullDisplayName: string // Full display name used in forms
}

// Full display names (used in forms and detailed views)
const FULL_DISPLAY_NAMES: Record<BusinessGroupCode, string> = {
  'transport.road': 'ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน',
  'transport.rail': 'รถไฟ รถไฟฟ้า การขนส่งทางราง',
  'transport.air': 'ท่าอากาศยาน การขนส่งทางอากาศ',
  'transport.water': 'ท่าเรือ การขนส่งทางน้ำ',
  'waterAndWaste': 'การจัดการน้ำ การชลประทาน การประปา การบำบัดน้ำเสีย',
  'energy': 'การพลังงาน',
  'communications': 'การโทรคมนาคม การสื่อสาร',
  'health': 'โรงพยาบาล การสาธารณสุข',
  'education': 'โรงเรียน การศึกษา',
  'socialHousing': 'ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ',
  'cultureSportsAndRecreation': 'ศูนย์นิทรรศการและศูนย์การประชุม',
  'others': 'กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา'
}

// Short display names (used in dashboard/list views)
const SHORT_DISPLAY_NAMES: Record<BusinessGroupCode, string> = {
  'transport.road': '1. ถนน ทางหลวง ทางพิเศษ',
  'transport.rail': '2. รถไฟ รถไฟฟ้า การขนส่งทางราง',
  'transport.air': '3. ท่าอากาศยาน การขนส่งทางอากาศ',
  'transport.water': '4. ท่าเรือ การขนส่งทางน้ำ',
  'waterAndWaste': '5. การจัดการน้ำ การประปา',
  'energy': '6. การพลังงาน',
  'communications': '7. การโทรคมนาคม',
  'health': '8. โรงพยาบาล การสาธารณสุข',
  'education': '9. โรงเรียน การศึกษา',
  'socialHousing': '10. ที่อยู่อาศัยผู้ด้อยโอกาส',
  'cultureSportsAndRecreation': '11. ศูนย์นิทรรศการ',
  'others': '12. กิจการอื่น'
}

// Icon file names
const ICONS: Record<BusinessGroupCode, string> = {
  'transport.road': '01_transport.road.png',
  'transport.rail': '02_transport.rail.png',
  'transport.air': '03_transport.air.png',
  'transport.water': '04_transport.water.png',
  'waterAndWaste': '05_waterAndWaste.png',
  'energy': '06_energy.png',
  'communications': '07_communications.png',
  'health': '08_health.png',
  'education': '09_education.png',
  'socialHousing': '10_socialHousing.png',
  'cultureSportsAndRecreation': '11_cultureSportsAndRecreation.png',
  'others': '12_others.png'
}

// Array of all business group codes
export const BUSINESS_GROUP_CODES: BusinessGroupCode[] = [
  'transport.road',
  'transport.rail',
  'transport.air',
  'transport.water',
  'waterAndWaste',
  'energy',
  'communications',
  'health',
  'education',
  'socialHousing',
  'cultureSportsAndRecreation',
  'others'
]

// Map: Display name (full) -> Code (for form inputs)
export const BUSINESS_GROUP_DISPLAY_NAME_TO_CODE: Record<string, BusinessGroupCode> = {
  'ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน': 'transport.road',
  'รถไฟ รถไฟฟ้า การขนส่งทางราง': 'transport.rail',
  'ท่าอากาศยาน การขนส่งทางอากาศ': 'transport.air',
  'ท่าเรือ การขนส่งทางน้ำ': 'transport.water',
  'การจัดการน้ำ การชลประทาน การประปา การบำบัดน้ำเสีย': 'waterAndWaste',
  'การพลังงาน': 'energy',
  'การโทรคมนาคม การสื่อสาร': 'communications',
  'โรงพยาบาล การสาธารณสุข': 'health',
  'โรงเรียน การศึกษา': 'education',
  'ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ': 'socialHousing',
  'ศูนย์นิทรรศการและศูนย์การประชุม': 'cultureSportsAndRecreation',
  'กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา': 'others'
}

// Map: Code -> Display name (full) (reverse mapping)
export const BUSINESS_GROUP_CODE_TO_DISPLAY_NAME: Record<BusinessGroupCode, string> = {
  'transport.road': '1. ถนน ทางหลวง ทางพิเศษ การขนส่งทางถนน',
  'transport.rail': '2. รถไฟ รถไฟฟ้า การขนส่งทางราง',
  'transport.air': '3. ท่าอากาศยาน การขนส่งทางอากาศ',
  'transport.water': '4. ท่าเรือ การขนส่งทางน้ำ',
  'waterAndWaste': '5. การจัดการน้ำ การชลประทาน การประปา การบำบัดน้ำเสีย',
  'energy': '6.การพลังงาน',
  'communications': '7. การโทรคมนาคม การสื่อสาร',
  'health': '8. โรงพยาบาล การสาธารณสุข',
  'education': '9. โรงเรียน การศึกษา',
  'socialHousing': '10. ที่อยู่อาศัยหรือสิ่งอำนวยความสะดวกสำหรับผู้มีรายได้น้อย ผู้สูงวัย ผู้ด้อยโอกาส หรือผู้พิการ',
  'cultureSportsAndRecreation': '11. ศูนย์นิทรรศการและศูนย์การประชุม',
  'others': '12. กิจการอื่นตามที่กำหนดในพระราชกฤษฎีกา'
}

// Map: Code -> Info (displayName + icon) (for dashboard/list views)
export const BUSINESS_GROUP_INFO: Record<BusinessGroupCode, BusinessGroupInfo> = {
  'transport.road': { 
    displayName: SHORT_DISPLAY_NAMES['transport.road'], 
    icon: ICONS['transport.road'],
    fullDisplayName: FULL_DISPLAY_NAMES['transport.road']
  },
  'transport.rail': { 
    displayName: SHORT_DISPLAY_NAMES['transport.rail'], 
    icon: ICONS['transport.rail'],
    fullDisplayName: FULL_DISPLAY_NAMES['transport.rail']
  },
  'transport.air': { 
    displayName: SHORT_DISPLAY_NAMES['transport.air'], 
    icon: ICONS['transport.air'],
    fullDisplayName: FULL_DISPLAY_NAMES['transport.air']
  },
  'transport.water': { 
    displayName: SHORT_DISPLAY_NAMES['transport.water'], 
    icon: ICONS['transport.water'],
    fullDisplayName: FULL_DISPLAY_NAMES['transport.water']
  },
  'waterAndWaste': { 
    displayName: SHORT_DISPLAY_NAMES['waterAndWaste'], 
    icon: ICONS['waterAndWaste'],
    fullDisplayName: FULL_DISPLAY_NAMES['waterAndWaste']
  },
  'energy': { 
    displayName: SHORT_DISPLAY_NAMES['energy'], 
    icon: ICONS['energy'],
    fullDisplayName: FULL_DISPLAY_NAMES['energy']
  },
  'communications': { 
    displayName: SHORT_DISPLAY_NAMES['communications'], 
    icon: ICONS['communications'],
    fullDisplayName: FULL_DISPLAY_NAMES['communications']
  },
  'health': { 
    displayName: SHORT_DISPLAY_NAMES['health'], 
    icon: ICONS['health'],
    fullDisplayName: FULL_DISPLAY_NAMES['health']
  },
  'education': { 
    displayName: SHORT_DISPLAY_NAMES['education'], 
    icon: ICONS['education'],
    fullDisplayName: FULL_DISPLAY_NAMES['education']
  },
  'socialHousing': { 
    displayName: SHORT_DISPLAY_NAMES['socialHousing'], 
    icon: ICONS['socialHousing'],
    fullDisplayName: FULL_DISPLAY_NAMES['socialHousing']
  },
  'cultureSportsAndRecreation': { 
    displayName: SHORT_DISPLAY_NAMES['cultureSportsAndRecreation'], 
    icon: ICONS['cultureSportsAndRecreation'],
    fullDisplayName: FULL_DISPLAY_NAMES['cultureSportsAndRecreation']
  },
  'others': { 
    displayName: SHORT_DISPLAY_NAMES['others'], 
    icon: ICONS['others'],
    fullDisplayName: FULL_DISPLAY_NAMES['others']
  }
}

// Array of business group options for dropdowns (code + full display name)
export const BUSINESS_GROUP_OPTIONS: Array<{ code: BusinessGroupCode; displayName: string }> = 
  BUSINESS_GROUP_CODES.map(code => ({
    code,
    displayName: `${BUSINESS_GROUP_CODES.indexOf(code) + 1}. ${FULL_DISPLAY_NAMES[code]}`
  }))

// Helper function to get display name from code
export function getBusinessGroupDisplayName(code: BusinessGroupCode | string): string {
  return BUSINESS_GROUP_CODE_TO_DISPLAY_NAME[code as BusinessGroupCode] || code
}

/**
 * Map API / summary sector keys (e.g. transport.road, transport_road) to Thai labels.
 * Unknown values are returned unchanged.
 */
export function resolveBusinessGroupLabel(raw: string | null | undefined): string {
  if (raw == null) return ''
  const s = String(raw).trim()
  if (!s) return ''
  if (isValidBusinessGroupCode(s)) return getBusinessGroupDisplayName(s)

  const lower = s.toLowerCase()
  if (lower === 'transport.urban') return getBusinessGroupDisplayName('transport.rail')
  const alias: Record<string, BusinessGroupCode> = {
    transport_road: 'transport.road',
    transport_rail: 'transport.rail',
    transport_air: 'transport.air',
    transport_water: 'transport.water',
    transport_urban: 'transport.rail',
    transporturban: 'transport.rail',
    water_and_waste: 'waterAndWaste',
    waterandwaste: 'waterAndWaste',
    social_housing: 'socialHousing',
    socialhousing: 'socialHousing',
    culture_sports_and_recreation: 'cultureSportsAndRecreation',
    culturesportsandrecreation: 'cultureSportsAndRecreation',
  }
  if (alias[lower]) return getBusinessGroupDisplayName(alias[lower])

  const dotted = s.replace(/_/g, '.')
  if (isValidBusinessGroupCode(dotted)) return getBusinessGroupDisplayName(dotted)

  return s
}

// Helper function to get info from code
export function getBusinessGroupInfo(code: BusinessGroupCode | string): BusinessGroupInfo | null {
  return BUSINESS_GROUP_INFO[code as BusinessGroupCode] || null
}

// Helper function to check if a code is a valid business group code
export function isValidBusinessGroupCode(code: string): code is BusinessGroupCode {
  return BUSINESS_GROUP_CODES.includes(code as BusinessGroupCode)
}

