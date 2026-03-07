'use server'

import { google } from 'googleapis'
import { IncidentData } from '@/types'

/**
 * Helper to parse Google service account JSON from an environment variable.
 * We allow either a raw JSON string or base64-encoded JSON. If the variable
 * is missing or invalid an error is thrown so the server startup fails early.
 */
function loadCredentials(): Record<string, unknown> {
  const raw = process.env.GOOGLE_CREDENTIALS_JSON
  if (!raw) {
    throw new Error('Environment variable GOOGLE_CREDENTIALS_JSON is required')
  }

  let jsonStr = raw
  // detect base64 and decode if necessary
  if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.includes('\n') === false && raw.trim().length % 4 === 0) {
    try {
      jsonStr = Buffer.from(raw, 'base64').toString('utf8')
    } catch (_e) {
      // if decode fails, just fall back to raw
    }
  }

  try {
    return JSON.parse(jsonStr)
  } catch (err) {
    throw new Error('Failed to parse GOOGLE_CREDENTIALS_JSON: ' + err)
  }
}

export async function fetchIncidentData(): Promise<IncidentData[]> {
  try {
    // load credentials and sheet id from environment variables
    const credentials = loadCredentials()
    const sheetId = process.env.GOOGLE_SHEET_ID
    if (!sheetId) {
      throw new Error('Environment variable GOOGLE_SHEET_ID is required')
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Form_responses_1!A:Z', // Get all columns
    })

    const rows = (response.data.values as unknown) as string[][] | undefined

    if (!rows || rows.length === 0) {
      return []
    }

    // Convert to our data structure
    const headers = rows[0] as string[]
    const data = rows.slice(1).map((row: string[]) => {
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] || ''
      })
      return obj as IncidentData
    })

    console.log('Fetched rows from Google Sheets:', rows.length - 1) // -1 for header
    console.log('Sample data:', data[0])
    
    return data
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error)
    throw new Error('Failed to fetch incident data')
  }
}
