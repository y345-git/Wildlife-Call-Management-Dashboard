/**
 * useGeocoding Hook
 * React hook for geocoding locations with caching and loading states
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coordinates } from '@/types'
import { geocodeBatchWithCache, geocodeTalukasWithCache } from '@/lib/geocoding-service'

export interface UseGeocodingResult {
  coordinates: Map<string, Coordinates>
  loading: boolean
  error: string | null
  progress: number
  successRate: number
}

export interface UseGeocodingOptions {
  /** Automatically geocode on mount */
  autoGeocode?: boolean
  /** District context for better accuracy */
  district?: string
  /** State context for better accuracy */
  state?: string
  /** Country context for better accuracy */
  country?: string
}

/**
 * Hook for geocoding locations with caching
 * 
 * @param locations - Array of location names to geocode
 * @param options - Configuration options
 * @returns Geocoding result with coordinates, loading state, error, and progress
 * 
 * @example
 * ```tsx
 * const { coordinates, loading, progress } = useGeocoding(talukas, { autoGeocode: true })
 * ```
 */
export function useGeocoding(
  locations: string[],
  options: UseGeocodingOptions = {}
): UseGeocodingResult {
  const {
    autoGeocode = false,
    district = 'Sangli',
    state = 'Maharashtra',
    country = 'India',
  } = options

  const [coordinates, setCoordinates] = useState<Map<string, Coordinates>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const geocode = useCallback(async () => {
    if (!locations || locations.length === 0) {
      setCoordinates(new Map())
      setLoading(false)
      setProgress(100)
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const results = await geocodeTalukasWithCache(
        locations,
        district,
        state,
        country,
        (progressValue) => {
          setProgress(progressValue)
        }
      )

      setCoordinates(results)
      setProgress(100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode locations'
      setError(errorMessage)
      console.error('Geocoding error:', err)
    } finally {
      setLoading(false)
    }
  }, [locations, district, state, country])

  // Auto-geocode on mount or when locations change
  useEffect(() => {
    if (autoGeocode) {
      geocode()
    }
  }, [autoGeocode, geocode])

  // Calculate success rate
  const successRate = locations.length > 0
    ? Math.round((coordinates.size / locations.length) * 100)
    : 0

  return {
    coordinates,
    loading,
    error,
    progress,
    successRate,
  }
}

/**
 * Hook for geocoding with manual trigger
 * Use this when you want more control over when geocoding happens
 * 
 * @param options - Configuration options
 * @returns Geocoding result and trigger function
 * 
 * @example
 * ```tsx
 * const { coordinates, loading, geocodeTrigger } = useManualGeocoding()
 * 
 * const handleClick = () => {
 *   geocodeTrigger(['Mumbai', 'Pune', 'Nagpur'])
 * }
 * ```
 */
export function useManualGeocoding(options: UseGeocodingOptions = {}) {
  const {
    district = 'Sangli',
    state = 'Maharashtra',
    country = 'India',
  } = options

  const [coordinates, setCoordinates] = useState<Map<string, Coordinates>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [lastLocations, setLastLocations] = useState<string[]>([])

  const geocodeTrigger = useCallback(async (locations: string[]) => {
    if (!locations || locations.length === 0) {
      setCoordinates(new Map())
      setProgress(100)
      return
    }

    setLastLocations(locations)
    setLoading(true)
    setError(null)
    setProgress(0)

    try {
      const results = await geocodeTalukasWithCache(
        locations,
        district,
        state,
        country,
        (progressValue) => {
          setProgress(progressValue)
        }
      )

      setCoordinates(results)
      setProgress(100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode locations'
      setError(errorMessage)
      console.error('Geocoding error:', err)
    } finally {
      setLoading(false)
    }
  }, [district, state, country])

  const successRate = lastLocations.length > 0
    ? Math.round((coordinates.size / lastLocations.length) * 100)
    : 0

  return {
    coordinates,
    loading,
    error,
    progress,
    successRate,
    geocodeTrigger,
  }
}
