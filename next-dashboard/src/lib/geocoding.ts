/**
 * Geocoding Utility - Convert location names to GPS coordinates
 * Uses Nominatim API (OpenStreetMap) - Free, no API key required
 */

import { Coordinates } from '@/types'
import { getCachedCoordinates } from '@/lib/geocode-cache'

// Module-level cache for static taluka mapping (loaded from public file)
let STATIC_TALUKA_MAP: Map<string, Coordinates> | null = null

export async function loadStaticTalukaMap(): Promise<Map<string, Coordinates>> {
  if (STATIC_TALUKA_MAP) return STATIC_TALUKA_MAP

  try {
    const resp = await fetch('/data/taluka-coords.json')
    if (!resp.ok) {
      STATIC_TALUKA_MAP = new Map()
      return STATIC_TALUKA_MAP
    }
    const json = await resp.json()
    const m = new Map()
    Object.keys(json || {}).forEach(key => {
      const val = json[key]
      if (val && typeof val.lat === 'number' && typeof val.lon === 'number') {
        m.set(key.trim(), { lat: val.lat, lon: val.lon })
      }
    })
    STATIC_TALUKA_MAP = m
    return m
  } catch (err) {
    console.error('Failed to load static taluka map:', err)
    STATIC_TALUKA_MAP = new Map()
    return STATIC_TALUKA_MAP
  }
}

// Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'Wildlife-Call-Management-Dashboard/1.0'
const RATE_LIMIT_DELAY = 200 // 200ms = 5 requests per second (Nominatim allows up to 1 req/sec, but we can go a bit faster for batch)

/**
 * Geocode a single location name to coordinates
 * 
 * @param locationName - Name of the location (e.g., "Atpadi, Sangli, Maharashtra, India")
 * @returns Coordinates {lat, lon} or null if not found
 */
export async function geocodeLocation(locationName: string): Promise<Coordinates | null> {
  if (!locationName || locationName.trim() === '') {
    console.warn('Empty location name provided to geocodeLocation')
    return null
  }

  try {
    const query = encodeURIComponent(locationName.trim())
    const url = `${NOMINATIM_BASE_URL}?q=${query}&format=json&limit=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data && Array.isArray(data) && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      }
    }

    console.warn(`No coordinates found for location: ${locationName}`)
    return null
  } catch (error) {
    console.error(`Error geocoding location "${locationName}":`, error)
    return null
  }
}

/**
 * Geocode multiple locations in batch with rate limiting
 * 
 * @param locations - Array of location names
 * @param onProgress - Optional callback for progress updates (0-100)
 * @returns Map of location name to coordinates
 */
export async function geocodeBatch(
  locations: string[],
  onProgress?: (progress: number) => void
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>()
  
  if (!locations || locations.length === 0) {
    return results
  }

  // Remove duplicates
  const uniqueLocations = Array.from(new Set(locations.filter(loc => loc && loc.trim())))

  console.log(`Geocoding ${uniqueLocations.length} unique locations...`)

  for (let i = 0; i < uniqueLocations.length; i++) {
    const location = uniqueLocations[i]
    
    const coords = await geocodeLocation(location)
    
    if (coords) {
      results.set(location, coords)
      console.log(`✓ Geocoded: ${location} → ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`)
    } else {
      console.warn(`✗ Failed to geocode: ${location}`)
    }

    // Report progress
    if (onProgress) {
      const progress = Math.round(((i + 1) / uniqueLocations.length) * 100)
      onProgress(progress)
    }

    // Rate limiting: wait before next request (except for last one)
    if (i < uniqueLocations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
    }
  }

  console.log(`Geocoding complete: ${results.size}/${uniqueLocations.length} locations found`)

  return results
}

/**
 * Build a full location string for better geocoding accuracy
 * 
 * @param taluka - Taluka name
 * @param district - District name (default: "Sangli")
 * @param state - State name (default: "Maharashtra")
 * @param country - Country name (default: "India")
 * @returns Full location string
 */
export function buildLocationString(
  taluka: string,
  district: string = 'Sangli',
  state: string = 'Maharashtra',
  country: string = 'India'
): string {
  return `${taluka}, ${district}, ${state}, ${country}`
}

/**
 * Geocode talukas with district/state/country context
 * 
 * @param talukaNames - Array of taluka names
 * @param district - District name
 * @param state - State name
 * @param country - Country name
 * @param onProgress - Optional progress callback
 * @returns Map of original taluka name to coordinates
 */
export async function geocodeTalukas(
  talukaNames: string[],
  district: string = 'Sangli',
  state: string = 'Maharashtra',
  country: string = 'India',
  onProgress?: (progress: number) => void
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>()

  // 1) Load static mapping file and populate results for any known talukas
  const staticMap = await loadStaticTalukaMap()
  const remaining: string[] = []

  talukaNames.forEach(taluka => {
    const t = taluka?.trim()
    if (!t) return

    // Priority: explicit static mapping (Devanagari key as provided in form)
    if (staticMap.has(t)) {
      results.set(t, staticMap.get(t)!)
      return
    }

    // Next: consistent client cache (user-triggered caching may have stored this)
    const cached = getCachedCoordinates(`${t}, ${district}, ${state}, ${country}`) || getCachedCoordinates(t)
    if (cached) {
      results.set(t, cached)
      return
    }

    // Otherwise we'll geocode it
    remaining.push(t)
  })

  if (remaining.length === 0) {
    // Nothing left to geocode
    if (onProgress) onProgress(100)
    return results
  }

  // Build full location strings for remaining and geocode
  const locationMap = new Map<string, string>() // fullLocation -> originalTaluka
  const fullLocations: string[] = []

  remaining.forEach(taluka => {
    const fullLocation = buildLocationString(taluka, district, state, country)
    locationMap.set(fullLocation, taluka)
    fullLocations.push(fullLocation)
  })

  const geocodedResults = await geocodeBatch(fullLocations, onProgress)

  // Map back to original taluka names
  geocodedResults.forEach((coords, fullLocation) => {
    const originalTaluka = locationMap.get(fullLocation)
    if (originalTaluka) {
      results.set(originalTaluka, coords)
    }
  })

  return results
}
