import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/th'

dayjs.extend(utc)

// Thai month abbreviations mapping
export const THAI_MONTH_MAP: Record<string, number> = {
  'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4,
  'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8,
  'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12
}

/**
 * Parse Thai date string with Buddhist Era (พ.ศ.) to dayjs object
 * Converts Buddhist Era year to Common Era (subtracts 543)
 * 
 * @param dateString - Thai date format: "D MMM YYYY" (e.g., "1 ม.ค. 2569")
 * @returns dayjs object or null if invalid
 */
export function parseThaiDate(dateString: string): dayjs.Dayjs | null {
  if (!dateString || !dateString.trim()) {
    return null
  }

  // Parse the date string: "D MMM YYYY" (e.g., "1 ม.ค. 2569")
  const match = dateString.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/)
  if (!match) {
    console.warn('Could not parse date format:', dateString)
    return null
  }

  const [, dayStr, monthAbbr, yearStr] = match
  const day = parseInt(dayStr, 10)
  const buddhistYear = parseInt(yearStr, 10)

  // Convert Buddhist Era to Common Era
  const commonEraYear = buddhistYear - 543

  // Map Thai month abbreviation to month number
  const monthNum = THAI_MONTH_MAP[monthAbbr]
  if (!monthNum) {
    console.warn('Unknown Thai month abbreviation:', monthAbbr)
    return null
  }

  // Create date using dayjs with explicit values (YYYY-MM-DD format)
  const date = dayjs(`${commonEraYear}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`)

  if (!date.isValid()) {
    console.warn('Invalid date after conversion:', { year: commonEraYear, month: monthNum, day }, 'Original:', dateString)
    return null
  }

  return date
}

/**
 * Format dayjs date to ISO 8601 format in UTC (GMT+0)
 * Converts local time to UTC before formatting
 * 
 * @param date - dayjs date object (in local timezone)
 * @returns ISO 8601 formatted string in UTC: "YYYY-MM-DDTHH:mm:ss+00:00"
 */
export function formatToISO8601(date: dayjs.Dayjs): string {
  // Convert to UTC and format as ISO 8601 with +00:00 timezone
  const utcDate = date.utc()
  return utcDate.format('YYYY-MM-DDTHH:mm:ss') + '+00:00'
}

/**
 * Convert ISO 8601 or DD-MM-YYYY date string to Thai format for Litepicker
 * If date is in UTC, converts to local timezone before formatting
 * 
 * @param adDate - Date string in ISO 8601 (with or without timezone), DD-MM-YYYY, or YYYY-MM-DD format
 * @returns Thai formatted date string: "D MMM YYYY" (e.g., "1 ม.ค. 2569")
 */
export function formatDateForLitepicker(adDate: string): string {
  if (!adDate) return ''
  
  // Check if date is in ISO 8601 format (likely UTC)
  const isISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(adDate)
  
  let date: dayjs.Dayjs | null = null
  
  if (isISO8601) {
    // Parse as UTC and convert to local timezone
    date = dayjs.utc(adDate).local()
    
    if (!date.isValid()) {
      // Fallback: try parsing normally (dayjs will handle timezone)
      date = dayjs(adDate)
    }
  } else {
    // Try parsing as DD-MM-YYYY format
    date = dayjs(adDate, 'DD-MM-YYYY', true)
    if (!date.isValid()) {
      // Fallback to YYYY-MM-DD format
      date = dayjs(adDate, 'YYYY-MM-DD', true)
    }
    if (!date.isValid()) {
      // Fallback: try parsing normally
      date = dayjs(adDate)
    }
  }
  
  if (!date || !date.isValid()) return ''
  
  return date.locale('th').format('D MMM YYYY')
}

/**
 * Parse Thai date string from Litepicker to DD-MM-YYYY format
 * Converts Buddhist Era year to Common Era
 * 
 * @param litepickerValue - Thai date format: "D MMM YYYY" (e.g., "5 ธ.ค. 2568")
 * @returns Date string in DD-MM-YYYY format (e.g., "05-12-2025")
 */
export function parseLitepickerDate(litepickerValue: string): string {
  if (!litepickerValue) return ''

  // Litepicker returns format: "D MMM YYYY" (e.g., "5 ธ.ค. 2568" with BE year)
  // Extract day, month, and year
  const match = litepickerValue.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/)
  if (match) {
    const [, day, month, year] = match
    const yearNum = parseInt(year)

    // If year looks like BE year (>= 2500), convert to AD
    let adYear = yearNum
    if (yearNum >= 2500 && yearNum <= 2600) {
      adYear = yearNum - 543
    }

    // Map Thai month abbreviation to month number
    const monthNum = THAI_MONTH_MAP[month]
    if (monthNum) {
      // Create date using dayjs with explicit values
      const date = dayjs(`${adYear}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
      if (date.isValid()) {
        // Return in DD-MM-YYYY format
        return date.format('DD-MM-YYYY')
      }
    } else {
      console.error('Unknown Thai month abbreviation:', month)
    }
  }

  // Fallback: try parsing with dayjs directly
  const date = dayjs(litepickerValue, 'D MMM YYYY', 'th', true).locale('th')
  if (date.isValid()) {
    // Check if year is BE and convert
    const year = date.year()
    if (year >= 2500 && year <= 2600) {
      const adDate = date.subtract(543, 'year')
      return adDate.format('DD-MM-YYYY')
    }
    return date.format('DD-MM-YYYY')
  }

  return ''
}

/**
 * Parse Thai date string from Litepicker to ISO 8601 format in UTC (GMT+0)
 * Converts Buddhist Era year to Common Era, takes local time, and converts to UTC
 * 
 * @param litepickerValue - Thai date format: "D MMM YYYY" (e.g., "5 ธ.ค. 2568")
 * @returns Date string in ISO 8601 format in UTC: "2025-12-05T00:00:00+00:00"
 */
export function parseLitepickerDateToISO(litepickerValue: string): string {
  if (!litepickerValue) return ''

  // Parse the Thai date using parseThaiDate which handles BE to CE conversion
  // This creates a date in local timezone
  const date = parseThaiDate(litepickerValue)
  
  if (date && date.isValid()) {
    // Convert local time to UTC and format as ISO 8601
    return formatToISO8601(date.startOf('day'))
  }

  return ''
}

/**
 * Convert Thai date range string to ISO 8601 startDate and endDate in UTC
 * 
 * @param dateRangeString - Date range in format: "D MMM YYYY - D MMM YYYY" or "D MMM YYYY"
 * @returns Object with startDate and endDate in ISO 8601 format (UTC), or null if invalid
 */
export function parseThaiDateRangeToISO(dateRangeString: string): { startDate: string; endDate: string } | null {
  if (!dateRangeString || !dateRangeString.trim()) {
    return null
  }

  try {
    const dateRangeParts = dateRangeString.split(' - ').map(part => part.trim())

    if (dateRangeParts.length === 1 && dateRangeParts[0]) {
      // Single date selected - use it as both start and end
      const date = parseThaiDate(dateRangeParts[0])
      if (date && date.isValid()) {
        const startDateISO = formatToISO8601(date.startOf('day'))
        const endDateISO = formatToISO8601(date.endOf('day'))
        return { startDate: startDateISO, endDate: endDateISO }
      }
    } else if (dateRangeParts.length === 2 && dateRangeParts[0] && dateRangeParts[1]) {
      // Date range selected
      const startDate = parseThaiDate(dateRangeParts[0])
      const endDate = parseThaiDate(dateRangeParts[1])

      if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
        const startDateISO = formatToISO8601(startDate.startOf('day'))
        const endDateISO = formatToISO8601(endDate.endOf('day'))
        return { startDate: startDateISO, endDate: endDateISO }
      }
    }
  } catch (error) {
    console.error('Error parsing date range:', error)
  }

  return null
}

/**
 * Convert UTC ISO 8601 date string to local timezone dayjs object
 * 
 * @param utcDateString - ISO 8601 date string in UTC (e.g., "2025-12-05T00:00:00+00:00")
 * @returns dayjs object in local timezone, or null if invalid
 */
export function parseUTCToLocal(utcDateString: string): dayjs.Dayjs | null {
  if (!utcDateString || !utcDateString.trim()) {
    return null
  }

  // Parse as UTC first
  let date = dayjs.utc(utcDateString)
  
  // If that fails, try parsing normally (dayjs will handle timezone)
  if (!date.isValid()) {
    date = dayjs(utcDateString)
  }
  
  if (!date.isValid()) {
    return null
  }
  
  // Convert UTC to local timezone
  return date.local()
}

/**
 * Format UTC ISO 8601 date string to Thai format for display
 * Converts from UTC to local timezone before formatting
 * 
 * @param utcDateString - ISO 8601 date string in UTC (e.g., "2025-12-05T00:00:00+00:00")
 * @returns Thai formatted date string: "D MMM YYYY" (e.g., "5 ธ.ค. 2568")
 */
export function formatUTCToThai(utcDateString: string): string {
  if (!utcDateString || !utcDateString.trim()) {
    return 'N/A'
  }

  const localDate = parseUTCToLocal(utcDateString)
  
  if (!localDate || !localDate.isValid()) {
    return 'N/A'
  }
  
  return localDate.locale('th').format('D MMM YYYY')
}

/**
 * Format date string to Thai format with Buddhist Era for display
 * Handles multiple date formats: ISO 8601 (UTC), DD-MM-YYYY, YYYY-MM-DD
 * Converts UTC dates to local timezone before formatting
 * 
 * @param dateString - Date string in various formats (ISO 8601, DD-MM-YYYY, YYYY-MM-DD)
 * @returns Thai formatted date string: "D MMM YYYY" (e.g., "15 ม.ค. 2568")
 */
export function formatDateForDisplay(dateString: string | undefined): string {
  if (!dateString || typeof dateString !== 'string') return 'N/A'
  
  // Trim whitespace
  const trimmedDate = dateString.trim()
  if (!trimmedDate) return 'N/A'
  
  // Thai month abbreviations
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  
  // Check if date is in ISO 8601 format (likely UTC)
  const isISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmedDate)
  
  let date: dayjs.Dayjs | null = null
  
  if (isISO8601) {
    // Parse as UTC and convert to local timezone
    date = dayjs.utc(trimmedDate).local()
    
    if (!date.isValid()) {
      // Fallback: try parsing normally (dayjs will handle timezone)
      date = dayjs(trimmedDate)
    }
  } else {
    // Try parsing DD-MM-YYYY format first (manual parsing as fallback)
    const ddMMyyyyMatch = trimmedDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (ddMMyyyyMatch) {
      const [, day, month, year] = ddMMyyyyMatch
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      // Validate date parts
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
        // Create date in YYYY-MM-DD format for dayjs
        const isoDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
        date = dayjs(isoDate)
        if (date.isValid()) {
          const day = date.date()
          const month = date.month() // 0-11
          const adYear = date.year()
          const beYear = adYear + 543
          return `${day} ${thaiMonths[month]} ${beYear}`
        }
      }
    }
    
    // Parse the date using dayjs - handle DD-MM-YYYY format
    date = dayjs(trimmedDate, 'DD-MM-YYYY', true)
    
    // If parsing with DD-MM-YYYY format fails, try other common formats
    if (!date.isValid()) {
      // Try YYYY-MM-DD format
      date = dayjs(trimmedDate, 'YYYY-MM-DD', true)
    }
    
    if (!date.isValid()) {
      // Try default parsing as fallback
      date = dayjs(trimmedDate)
    }
  }
  
  if (!date || !date.isValid()) return 'N/A'
  
  // Get day, month (0-indexed), and year
  const day = date.date()
  const month = date.month() // 0-11
  const adYear = date.year()
  
  // Convert to Buddhist Era (BE) by adding 543
  const beYear = adYear + 543
  
  // Format: "15 ม.ค. 2568" (Thai date with BE year, no พ.ศ. prefix)
  return `${day} ${thaiMonths[month]} ${beYear}`
}
