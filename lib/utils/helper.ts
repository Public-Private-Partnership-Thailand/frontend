export function toRGB(value: string): string {
  const hex = value.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Converts a date string in DD-MM-YYYY format to ISO 8601 format with timezone.
 * Example: "18-09-2018" -> "2018-09-18T00:00:00+07:00"
 * 
 * If the date is already in ISO 8601 format, it will be preserved (with timezone added if missing).
 * 
 * @param dateString - Date string in DD-MM-YYYY format or ISO 8601 format
 * @param timezone - Timezone offset (default: "+07:00" for Thailand)
 * @returns ISO 8601 formatted date string with timezone, or empty string if invalid
 */
export function convertToISO8601(dateString: string, timezone: string = "+07:00"): string {
  if (!dateString || dateString.trim() === '') {
    return ''
  }
  
  // Import dayjs dynamically to avoid issues
  const dayjs = require('dayjs')
  
  // Check if already in ISO 8601 format with timezone (e.g., "2018-09-18T11:26:04+01:00")
  const isoWithTimezoneRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/
  if (isoWithTimezoneRegex.test(dateString)) {
    // Already in correct format, return as is
    return dateString
  }
  
  // Check if in ISO 8601 format without timezone (e.g., "2018-09-18T00:00:00")
  const isoWithoutTimezoneRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
  if (isoWithoutTimezoneRegex.test(dateString)) {
    // Add timezone
    return dateString + timezone
  }
  
  // Check if in ISO date format (e.g., "2018-09-18")
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (isoDateRegex.test(dateString)) {
    // Add time and timezone
    return dateString + 'T00:00:00' + timezone
  }
  
  // Try parsing as DD-MM-YYYY format
  let date = dayjs(dateString, 'DD-MM-YYYY', true)
  
  // If that fails, try YYYY-MM-DD format
  if (!date.isValid()) {
    date = dayjs(dateString, 'YYYY-MM-DD', true)
  }
  
  // If that fails, try any format dayjs can parse
  if (!date.isValid()) {
    date = dayjs(dateString)
  }
  
  // If still invalid, return empty string
  if (!date.isValid()) {
    return ''
  }
  
  // Format as ISO 8601 with timezone: YYYY-MM-DDTHH:mm:ss+HH:mm
  // Set time to 00:00:00 (midnight) for date-only values
  const isoString = date.format('YYYY-MM-DD') + 'T00:00:00' + timezone
  
  return isoString
}

