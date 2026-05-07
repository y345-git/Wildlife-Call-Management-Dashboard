/**
 * Integrated Geocoding Service
 * Combines geocoding API with caching for optimal performance
 */

import { Coordinates } from '@/types'
import { geocodeLocation, geocodeBatch, buildLocationString } from './geocoding'
import {
  getCachedCoordinates,
  setCachedCoordinates,
  getBatchCachedCoordinates,
  setBatchCachedCoordinates,
} from './geocode-cache'

/**
 * Geocode a location with caching
 * Checks cache first, then fetches from API if needed
 * 
 * @param locationName - Location name to geocode
 * @returns Coordinates or null if not found
 */
export async function geocodeWithCache(locationName: string): Promise<Coordinates | null> {
  if (!locationName || locationName.trim() === '') {
    return null
  }

  // Check cache first
  const cached = getCachedCoordinates(locationName)
  if (cached) {
    console.log(`✓ Cache hit: ${locationName}`)
    return cached
  }

  // Cache miss - fetch from API
  console.log(`⚡ Cache miss: ${locationName} - fetching...`)
  const coords = await geocodeLocation(locationName)

  // Cache the result if found
  if (coords) {
    setCachedCoordinates(locationName, coords)
  }

  return coords
}

/**
 * Geocode multiple locations with caching
 * Splits into cached and uncached, only fetches uncached ones
 * 
 * @param locations - Array of location names
 * @param onProgress - Optional progress callback (0-100)
 * @returns Map of location name to coordinates
 */
export async function geocodeBatchWithCache(
  locations: string[],
  onProgress?: (progress: number) => void
): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>()

  if (!locations || locations.length === 0) {
    return results
  }

  // Remove duplicates and empty strings
  const uniqueLocations = Array.from(new Set(locations.filter(loc => loc && loc.trim())))

  // Step 1: Get cached coordinates
  const cachedResults = getBatchCachedCoordinates(uniqueLocations)
  cachedResults.forEach((coords, location) => {
    results.set(location, coords)
  })

  console.log(`Cache hits: ${cachedResults.size}/${uniqueLocations.length}`)

  // Step 2: Identify uncached locations
  const uncachedLocations = uniqueLocations.filter(loc => !cachedResults.has(loc))

  if (uncachedLocations.length === 0) {
    // All cached!
    if (onProgress) onProgress(100)
    return results
  }

  console.log(`Fetching ${uncachedLocations.length} uncached locations...`)

  // Step 3: Fetch uncached locations from API
  const fetchedResults = await geocodeBatch(uncachedLocations, (fetchProgress) => {
    // Calculate overall progress
    const cacheWeight = cachedResults.size / uniqueLocations.length
    const fetchWeight = uncachedLocations.length / uniqueLocations.length
    const totalProgress = Math.round(
      (cacheWeight * 100) + (fetchWeight * fetchProgress)
    )
    if (onProgress) onProgress(totalProgress)
  })

  // Step 4: Cache newly fetched results
  if (fetchedResults.size > 0) {
    setBatchCachedCoordinates(fetchedResults)
  }

  // Step 5: Merge results
  fetchedResults.forEach((coords, location) => {
    results.set(location, coords)
  })

  if (onProgress) onProgress(100)

  console.log(`Geocoding complete: ${results.size}/${uniqueLocations.length} locations found`)
  console.log(`Cache performance: ${cachedResults.size} hits, ${fetchedResults.size} fetches`)

  return results
}

/**
 * Geocode talukas with caching and full location context
 * 
 * @param talukaNames - Array of taluka names
 * @param district - District name
 * @param state - State name
 * @param country - Country name
 * @param onProgress - Optional progress callback
 * @returns Map of original taluka name to coordinates
 */
export async function geocodeTalukasWithCache(
  talukaNames: string[],
  district: string = 'Sangli',
  state: string = 'Maharashtra',
  country: string = 'India',
  onProgress?: (progress: number) => void
): Promise<Map<string, Coordinates>> {
  // Build full location strings
  const locationMap = new Map<string, string>() // fullLocation -> originalTaluka
  const fullLocations: string[] = []

  talukaNames.forEach(taluka => {
    const fullLocation = buildLocationString(taluka, district, state, country)
    locationMap.set(fullLocation, taluka)
    fullLocations.push(fullLocation)
  })

  // Geocode all locations with caching
  const geocodedResults = await geocodeBatchWithCache(fullLocations, onProgress)

  // Map back to original taluka names
  const results = new Map<string, Coordinates>()
  geocodedResults.forEach((coords, fullLocation) => {
    const originalTaluka = locationMap.get(fullLocation)
    if (originalTaluka) {
      results.set(originalTaluka, coords)
    }
  })

  return results
}
