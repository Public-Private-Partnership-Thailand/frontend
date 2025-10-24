import { ProjectData } from '@/types/project'

// External JSON API URL
const API_URL = 'https://publicdigitaltwin.s3.ap-southeast-1.amazonaws.com/project-ppp.json'

// Interface for the external JSON data structure
interface ExternalProjectData {
  ลำดับ: number
  โครงการ: string
  กลุ่มกิจการ: string
  ประเภทโครงการ: string
  กระทรวงเจ้าสังกัด: string
  หน่วยงานเจ้าของโครงการ: string
  เอกชนคู่สัญญา: string
  ระยะเวลาโครงการ: string
  วันที่ลงนามในสัญญา: string
  วันที่: string
  มูลค่าโครงการ: string
  รูปแบบการจัดสรรกรรมสิทธิ์: string
  รูปแบบสัมปทานหรือค่าตอบแทน: string
  กฎหมายที่เกี่ยวข้อง: string
  แหล่งข้อมูล: string
}

// Function to convert Thai Buddhist Era to Christian Era
function convertThaiDateToISO(thaiDate: string): string {
  if (!thaiDate || thaiDate === 'N/A') return ''
  
  // Extract year from Thai Buddhist Era (พ.ศ.)
  const yearMatch = thaiDate.match(/(\d{4})/)
  if (yearMatch) {
    const buddhistYear = parseInt(yearMatch[1])
    const christianYear = buddhistYear - 543
    
    // Replace Buddhist year with Christian year
    const isoDate = thaiDate.replace(/\d{4}/, christianYear.toString())
    
    // Convert Thai month names to numbers
    const monthMap: { [key: string]: string } = {
      'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
      'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
      'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
    }
    
    let convertedDate = isoDate
    for (const [thaiMonth, monthNum] of Object.entries(monthMap)) {
      convertedDate = convertedDate.replace(thaiMonth, monthNum)
    }
    
    // Format as ISO date
    const parts = convertedDate.split(' ')
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      return `${year}-${month}-${day}T00:00:00Z`
    }
  }
  
  return ''
}

// Function to extract numeric value from Thai currency
function extractNumericValue(value: string): number {
  if (!value || value === 'N/A') return 0
  
  // Remove Thai text and extract numbers
  const numericMatch = value.match(/[\d,]+/)
  if (numericMatch) {
    return parseInt(numericMatch[0].replace(/,/g, ''))
  }
  
  return 0
}

// Function to convert external JSON data to ProjectData
function convertExternalDataToProject(externalData: ExternalProjectData, index: number): ProjectData {
  // Generate unique ID
  const id = externalData.ลำดับ?.toString() || (index + 1).toString()
  
  // Convert dates - handle multiple dates separated by " / "
  const contractDates = externalData.วันที่ลงนามในสัญญา?.split(' / ') || []
  const startDate = convertThaiDateToISO(contractDates[0] || externalData.วันที่ลงนามในสัญญา)
  const endDate = convertThaiDateToISO(externalData.วันที่)
  
  // Extract duration in months - handle multiple durations separated by " / "
  const durationText = externalData.ระยะเวลาโครงการ?.split(' / ')[0] || externalData.ระยะเวลาโครงการ
  const durationMatch = durationText?.match(/(\d+)/)
  const durationInMonths = durationMatch ? parseInt(durationMatch[1]) * 12 : 0
  
  // Extract project value - handle multiple values separated by " / "
  const projectValueText = externalData.มูลค่าโครงการ?.split(' / ')[0] || externalData.มูลค่าโครงการ
  const projectValueNumeric = extractNumericValue(projectValueText)
  
  return {
    id,
    updated: new Date().toISOString(),
    language: 'th',
    identifiers: [`PPP-${id.padStart(3, '0')}`],
    publicAuthority: {
      n: externalData.กระทรวงเจ้าสังกัด || '',
      r: externalData.หน่วยงานเจ้าของโครงการ || ''
    },
    title: externalData.โครงการ || `โครงการ PPP ${id}`,
    description: `${externalData.โครงการ} - ${externalData.กลุ่มกิจการ}`,
    budget: {
      description: `งบประมาณโครงการ ${externalData.โครงการ}`,
      amount: {
        n: projectValueNumeric,
        r: projectValueNumeric,
        t: 'THB',
        request: startDate,
        approval: startDate
      },
      breakdown: [
        {
          bt: 'การลงทุนหลัก',
          br: [externalData.โครงการ || 'โครงการ PPP']
        }
      ],
      financing: externalData.รูปแบบการจัดสรรกรรมสิทธิ์ ? externalData.รูปแบบการจัดสรรกรรมสิทธิ์.split(' / ') : ['PPP']
    },
    period: {
      startDate,
      endDate,
      durationInMonths
    },
    implementationPeriod: {
      startDate,
      endDate: ''
    },
    completionPeriod: {},
    maintenancePeriod: {},
    decommissioningPeriod: {},
    locations: ['ประเทศไทย'],
    status: 'active',
    type: externalData.ประเภทโครงการ || 'PPP',
    sector: [externalData.กลุ่มกิจการ || 'โครงสร้างพื้นฐาน'],
    purpose: `การพัฒนา${externalData.ประเภทโครงการ || 'โครงสร้างพื้นฐาน'} ผ่านรูปแบบ PPP${externalData.กฎหมายที่เกี่ยวข้อง ? ` ตาม${externalData.กฎหมายที่เกี่ยวข้อง}` : ''}`,
    additionalClassifications: [
      ...(externalData.รูปแบบการจัดสรรกรรมสิทธิ์ ? externalData.รูปแบบการจัดสรรกรรมสิทธิ์.split(' / ') : ['PPP']),
      ...(externalData.รูปแบบสัมปทานหรือค่าตอบแทน ? [externalData.รูปแบบสัมปทานหรือค่าตอบแทน] : [])
    ],
    parties: [
      {
        name: externalData.เอกชนคู่สัญญา || 'เอกชนคู่สัญญา',
        id: `PRIVATE-${id}`,
        identifier: {
          Scheme: 'Private',
          id: `PRIVATE-${id}`,
          LegalName: externalData.เอกชนคู่สัญญา || 'เอกชนคู่สัญญา',
          URI: ''
        },
        additionalIdentifiers: ['เอกชน']
      }
    ],
    assetLifetime: {},
    forecasts: ['การพัฒนาอย่างยั่งยืน', 'การเพิ่มประสิทธิภาพการบริการ'],
    metrics: ['ประสิทธิภาพการดำเนินงาน', 'ความพึงพอใจของผู้ใช้บริการ'],
    milestones: ['การลงนามสัญญา', 'การก่อสร้าง', 'การเปิดให้บริการ'],
    completion: {
      endDate: '',
      endDateDetails: {},
      finalValue: {},
      finalValueDetails: {}
    },
    Documents: [],
    dataSource: externalData.แหล่งข้อมูล || ''
  }
}

// Function to fetch projects from external API
export async function fetchProjectsFromAPI(): Promise<ProjectData[]> {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const externalData: ExternalProjectData[] = await response.json()
    
    // Convert external data to ProjectData format
    return externalData.map((project, index) => 
      convertExternalDataToProject(project, index)
    )
  } catch (error) {
    console.error('Error fetching projects from API:', error)
    // Return empty array if API fails
    return []
  }
}

// Export the API URL for reference
export { API_URL }
