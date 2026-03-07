/**
 * Parse various date formats from Google Sheets
 * Returns null if the date cannot be parsed
 */
export function parseIncidentDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') return null
  
  // First, try the exact format we know from Google Sheets: DD/MM/YYYY HH:MM:SS
  const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/
  const match = dateString.match(ddmmyyyyPattern)
  
  if (match) {
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    const hours = parseInt(match[4])
    const minutes = parseInt(match[5])
    const seconds = parseInt(match[6])
    
    // Validate ranges
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      // Month is 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day, hours, minutes, seconds)
      
      // Verify the date is valid (handles invalid dates like Feb 30)
      if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
        return date
      }
    }
  }
  
  // Try DD/MM/YYYY without time
  const ddmmyyyyNoTimePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const matchNoTime = dateString.match(ddmmyyyyNoTimePattern)
  
  if (matchNoTime) {
    const day = parseInt(matchNoTime[1])
    const month = parseInt(matchNoTime[2])
    const year = parseInt(matchNoTime[3])
    
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const date = new Date(year, month - 1, day, 0, 0, 0)
      
      if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
        return date
      }
    }
  }
  
  // Try to parse as ISO date or other standard formats
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) {
    return date
  }
  
  // If all else fails, return null
  return null
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  if (!dateString || dateString.trim() === '') return 'N/A'
  
  const date = parseIncidentDate(dateString)
  if (!date) return dateString // Show original if can't parse
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format a time string for display
 */
export function formatTime(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '--:--'
  
  const date = parseIncidentDate(dateString)
  if (!date) return '--:--'
  
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  // Convert to 12-hour format
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
}
