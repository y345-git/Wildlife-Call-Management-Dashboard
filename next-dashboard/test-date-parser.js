// Test the date parser with actual data from the sheet

const testDates = [
  '26/07/2025 15:47:34',
  '28/07/2025 08:34:37',
  '28/07/2025 08:47:18',
  '28/07/2025 09:18:52',
  '28/07/2025 09:49:59',
  '28/07/2025 09:57:37',
  '11/08/2025 10:53:08',
  '11/08/2025 11:05:25',
  '11/08/2025 11:38:01',
  '11/08/2025 11:44:29',
  '13/08/2025 10:35:17',
  '18/08/2025 19:40:26',
  '19/08/2025 21:06:50',
  '20/08/2025 19:16:54',
  '20/08/2025 19:17:49',
  '01/09/2025 12:30:35',
  '01/09/2025 13:18:35',
  '01/09/2025 13:22:17',
  '01/09/2025 15:59:53',
  '01/09/2025 17:55:27',
  '26/10/2025 17:04:49',
  '26/10/2025 17:04:59',
  '26/10/2025 17:15:17',
  '26/10/2025 17:16:33',
  '26/10/2025 17:19:14',
  '26/10/2025 17:21:32',
  '26/10/2025 17:48:52',
  '27/10/2025 16:08:02',
  '30/10/2025 09:31:56',
  '03/11/2025 14:22:07',
  '03/11/2025 15:23:01',
  '03/11/2025 15:34:21',
  '04/11/2025 16:21:02',
  '04/11/2025 16:25:52',
  '04/11/2025 22:17:14',
  '04/11/2025 22:19:38',
  '04/11/2025 22:20:16',
]

function parseIncidentDate(dateString) {
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
  
  return null
}

console.log('Testing date parsing with actual Google Sheets data:\n')
console.log('Total test dates:', testDates.length)

const parsed = testDates.map(dateStr => {
  const parsed = parseIncidentDate(dateStr)
  return {
    original: dateStr,
    parsed: parsed,
    formatted: parsed ? parsed.toISOString() : 'FAILED TO PARSE'
  }
})

const successful = parsed.filter(p => p.parsed !== null)
const failed = parsed.filter(p => p.parsed === null)

console.log('\nSuccessfully parsed:', successful.length)
console.log('Failed to parse:', failed.length)

if (failed.length > 0) {
  console.log('\nFailed dates:')
  failed.forEach(f => console.log('  -', f.original))
}

console.log('\nSample successful parses:')
successful.slice(0, 5).forEach(s => {
  console.log(`  ${s.original} -> ${s.formatted}`)
})

// Check date range
const dates = successful.map(s => s.parsed).sort((a, b) => a - b)
if (dates.length > 0) {
  console.log('\nDate Range:')
  console.log('  Earliest:', dates[0].toISOString())
  console.log('  Latest:', dates[dates.length - 1].toISOString())
  
  // Test filtering with full range
  const startOfDay = new Date(dates[0])
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(dates[dates.length - 1])
  endOfDay.setHours(23, 59, 59, 999)
  
  const inRange = dates.filter(d => d >= startOfDay && d <= endOfDay)
  console.log('\nFiltering test:')
  console.log('  Range:', startOfDay.toISOString(), 'to', endOfDay.toISOString())
  console.log('  Dates in range:', inRange.length, '/', dates.length)
}
