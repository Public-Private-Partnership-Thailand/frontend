import { ProjectData } from '@/types/project'

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

// Function to convert CSV row to ProjectData
function convertCSVRowToProject(row: string[], index: number): ProjectData {
  const [
    sequence,
    projectTitle,
    businessGroup,
    projectType,
    ministry,
    ownerAgency,
    privateContractor,
    projectDuration,
    contractSignDate,
    date,
    projectValue,
    ownershipFormat,
    concessionFormat,
    relatedLaws,
    dataSource
  ] = row

  // Generate unique ID
  const id = (index + 1).toString()
  
  // Convert dates
  const startDate = convertThaiDateToISO(contractSignDate)
  const endDate = convertThaiDateToISO(date)
  
  // Extract duration in months
  const durationMatch = projectDuration?.match(/(\d+)/)
  const durationInMonths = durationMatch ? parseInt(durationMatch[1]) * 12 : 0
  
  // Extract project value
  const projectValueNumeric = extractNumericValue(projectValue)
  
  return {
    id,
    updated: new Date().toISOString(),
    language: 'th',
    identifiers: [`PPP-${id.padStart(3, '0')}`],
    publicAuthority: {
      n: ministry || '',
      r: ownerAgency || ''
    },
    title: projectTitle || `โครงการ PPP ${id}`,
    description: `${projectTitle} - ${businessGroup}`,
    budget: {
      description: `งบประมาณโครงการ ${projectTitle}`,
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
          br: [projectTitle || 'โครงการ PPP']
        }
      ],
      financing: [ownershipFormat || 'PPP']
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
    type: projectType || 'PPP',
    sector: [businessGroup || 'โครงสร้างพื้นฐาน'],
    purpose: `การพัฒนา${projectType || 'โครงสร้างพื้นฐาน'} ผ่านรูปแบบ PPP`,
    additionalClassifications: [ownershipFormat || 'PPP'],
    parties: [
      {
        name: privateContractor || 'เอกชนคู่สัญญา',
        id: `PRIVATE-${id}`,
        identifier: {
          Scheme: 'Private',
          id: `PRIVATE-${id}`,
          LegalName: privateContractor || 'เอกชนคู่สัญญา',
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
    // Data source link for reference
    dataSource: dataSource || ''
  }
}

// Data is now fetched from API via projectService
// This file contains utility functions for data conversion
