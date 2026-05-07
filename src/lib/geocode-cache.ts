/**
 * Geocode Cache Management
 * Uses localStorage to cache geocoded coordinates with 30-day expiration
 */

import { Coordinates } from '@/types'

// Cache configuration
const CACHE_PREFIX = 'geocode_cache_'
const CACHE_VERSION = 'v1'
const CACHE_EXPIRATION_DAYS = 30
const CACHE_EXPIRATION_MS = CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000

export interface GeocodeCache {
  coordinates: Coordinates
  timestamp: number
  version: string
}

/**
 * Generate cache key for a location
 */
function getCacheKey(locationName: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${locationName.toLowerCase().trim()}`
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(cache: GeocodeCache): boolean {
  const now = Date.now()
  const age = now - cache.timestamp
  
  // Check version match and expiration
  return cache.version === CACHE_VERSION && age < CACHE_EXPIRATION_MS
}

/**
 * Get cached coordinates for a location
 * 
 * @param locationName - Location name to look up
 * @returns Cached coordinates or null if not found/expired
 */
export function getCachedCoordinates(locationName: string): Coordinates | null {
  if (typeof window === 'undefined') {
    return null // SSR - no localStorage available
  }

  try {
    const key = getCacheKey(locationName)
    const cached = localStorage.getItem(key)

    if (!cached) {
      return null
    }

    const cacheData: GeocodeCache = JSON.parse(cached)

    if (!isCacheValid(cacheData)) {
      // Expired - remove from cache
      localStorage.removeItem(key)
      return null
    }

    return cacheData.coordinates
  } catch (error) {
    console.error(`Error reading cache for "${locationName}":`, error)
    return null
  }
}

/**
 * Save coordinates to cache
 * 
 * @param locationName - Location name
 * @param coordinates - Coordinates to cache
 */
export function setCachedCoordinates(locationName: string, coordinates: Coordinates): void {
  if (typeof window === 'undefined') {
    return // SSR - no localStorage available
  }

  try {
    const key = getCacheKey(locationName)
    const cacheData: GeocodeCache = {
      coordinates,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    }

    localStorage.setItem(key, JSON.stringify(cacheData))
  } catch (error) {
    console.error(`Error caching coordinates for "${locationName}":`, error)
    // QuotaExceededError - cache is full, but continue gracefully
  }
}

/**
 * Get multiple cached coordinates at once
 * 
 * @param locationNames - Array of location names
 * @returns Map of location name to coordinates (only cached entries)
 */
export function getBatchCachedCoordinates(locationNames: string[]): Map<string, Coordinates> {
  const results = new Map<string, Coordinates>()

  locationNames.forEach(location => {
    const coords = getCachedCoordinates(location)
    if (coords) {
      results.set(location, coords)
    }
  })

  return results
}

/**
 * Save multiple coordinates to cache at once
 * 
 * @param coordinatesMap - Map of location name to coordinates
 */
export function setBatchCachedCoordinates(coordinatesMap: Map<string, Coordinates>): void {
  coordinatesMap.forEach((coords, location) => {
    setCachedCoordinates(location, coords)
  })
}

/**
 * Clear all geocode cache entries
 */
export function clearGeocodeCache(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log(`Cleared ${cacheKeys.length} geocode cache entries`)
  } catch (error) {
    console.error('Error clearing geocode cache:', error)
  }
}

/**
 * Clear expired cache entries
 * 
 * @returns Number of entries cleared
 */
export function clearExpiredCache(): number {
  if (typeof window === 'undefined') {
    return 0
  }

  let cleared = 0

  try {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const cacheData: GeocodeCache = JSON.parse(cached)
          if (!isCacheValid(cacheData)) {
            localStorage.removeItem(key)
            cleared++
          }
        }
      } catch (error) {
        // Invalid cache entry - remove it
        localStorage.removeItem(key)
        cleared++
      }
    })

    if (cleared > 0) {
      console.log(`Cleared ${cleared} expired geocode cache entries`)
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error)
  }

  return cleared
}

/**
 * Get cache age in days for a location
 * 
 * @param locationName - Location name
 * @returns Age in days or null if not cached
 */
export function getCacheAge(locationName: string): number | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const key = getCacheKey(locationName)
    const cached = localStorage.getItem(key)

    if (!cached) {
      return null
    }

    const cacheData: GeocodeCache = JSON.parse(cached)
    const ageMs = Date.now() - cacheData.timestamp
    const ageDays = ageMs / (24 * 60 * 60 * 1000)

    return ageDays
  } catch (error) {
    return null
  }
}

/**
 * Get cache statistics
 * 
 * @returns Statistics about the geocode cache
 */
export function getCacheStats(): {
  total: number
  valid: number
  expired: number
  totalSizeKB: number
} {
  if (typeof window === 'undefined') {
    return { total: 0, valid: 0, expired: 0, totalSizeKB: 0 }
  }

  let total = 0
  let valid = 0
  let expired = 0
  let totalSize = 0

  try {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
    total = cacheKeys.length

    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          totalSize += cached.length
          const cacheData: GeocodeCache = JSON.parse(cached)
          if (isCacheValid(cacheData)) {
            valid++
          } else {
            expired++
          }
        }
      } catch (error) {
        expired++
      }
    })
  } catch (error) {
    console.error('Error getting cache stats:', error)
  }

  return {
    total,
    valid,
    expired,
    totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
  }
}
