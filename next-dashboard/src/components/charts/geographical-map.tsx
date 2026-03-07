'use client'

import { useMemo, useEffect, useState, Fragment } from 'react'
import { IncidentData } from '@/types'
import { useGeocoding } from '@/hooks/use-geocoding'
import { Skeleton } from '@/components/ui/skeleton'

interface GeographicalMapProps {
  data: IncidentData[]
}

export function GeographicalMap({ data }: GeographicalMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const talukas = useMemo(() => {
    const uniqueTalukas = new Set<string>()
    data.forEach(incident => {
      const taluka = incident['तालुका:']
      if (taluka && taluka.trim()) {
        uniqueTalukas.add(taluka.trim())
      }
    })
    return Array.from(uniqueTalukas)
  }, [data])

  const { coordinates, loading, error, progress, successRate } = useGeocoding(talukas, {
    autoGeocode: true,
    district: 'Sangli',
    state: 'Maharashtra',
    country: 'India',
  })

  const talukaCounts = useMemo(() => {
    const counts = new Map<string, number>()
    data.forEach(incident => {
      const taluka = incident['तालुका:']?.trim()
      if (taluka) {
        counts.set(taluka, (counts.get(taluka) || 0) + 1)
      }
    })
    return counts
  }, [data])

  const maxCount = useMemo(() => {
    return Math.max(...Array.from(talukaCounts.values()), 1)
  }, [talukaCounts])

  const markers = useMemo(() => {
    const markerData: Array<{
      taluka: string
      coords: { lat: number; lon: number }
      count: number
      radius: number
      color: string
    }> = []

    // Iterate over talukas seen in incidents and find coords from coordinates map
    Array.from(talukaCounts.keys()).forEach((taluka) => {
      const count = talukaCounts.get(taluka) || 0
      if (count === 0) return

      // Get coordinates from the geocoding hook's results
      const coords = coordinates.get(taluka)

      if (coords) {
        const normalizedSize = count / maxCount
        const radius = 8 + (normalizedSize * 17)

        let color: string
        if (normalizedSize < 0.25) {
          color = '#22c55e'
        } else if (normalizedSize < 0.5) {
          color = '#eab308'
        } else if (normalizedSize < 0.75) {
          color = '#f97316'
        } else {
          color = '#ef4444'
        }

        markerData.push({ taluka, coords, count, radius, color })
      }
    })

    return markerData
  }, [coordinates, talukaCounts, maxCount])

  // Compute district bounds from coordinates
  const districtBounds = useMemo(() => {
    try {
      if (coordinates.size > 0) {
        const coords: [number, number][] = []
        coordinates.forEach((c) => {
          coords.push([c.lat, c.lon])
        })
        return coords
      }
      return []
    } catch (e) {
      return []
    }
  }, [coordinates])

  const center = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 16.85, lon: 74.56 }
    }
    const avgLat = markers.reduce((sum, m) => sum + m.coords.lat, 0) / markers.length
    const avgLon = markers.reduce((sum, m) => sum + m.coords.lon, 0) / markers.length
    return { lat: avgLat, lon: avgLon }
  }, [markers])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Geocoding locations... {progress}%
          </div>
          <div className="text-xs text-muted-foreground">
            {coordinates.size}/{talukas.length} found
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Skeleton className="w-full h-[500px] rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4 border border-dashed border-destructive/50 rounded-lg">
        <div className="text-destructive text-lg font-semibold">Failed to load map</div>
        <div className="text-sm text-muted-foreground max-w-md text-center">{error}</div>
      </div>
    )
  }

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4 border border-dashed rounded-lg">
        <div className="text-muted-foreground text-lg font-semibold">No location data available</div>
        <div className="text-sm text-muted-foreground">
          {successRate < 100 && <span>Geocoding success rate: {successRate}%</span>}
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Showing {markers.length} location{markers.length !== 1 ? 's' : ''} with {data.length} total incidents
        </div>
        {successRate < 100 && (
          <div className="text-xs text-muted-foreground">Geocoding: {successRate}% successful</div>
        )}
      </div>

      <MapRenderer center={center} markers={markers} districtBounds={districtBounds} />

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#22c55e] border border-[#22c55e]/50" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#eab308] border border-[#eab308]/50" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#f97316] border border-[#f97316]/50" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ef4444] border border-[#ef4444]/50" />
          <span>Very High</span>
        </div>
      </div>
    </div>
  )
}

function MapRenderer({ center, markers, districtBounds }: {
  center: { lat: number; lon: number }
  markers: Array<{
    taluka: string
    coords: { lat: number; lon: number }
    count: number
    radius: number
    color: string
  }>
  districtBounds: [number, number][]
}) {
  const [mounted, setMounted] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [initialViewSet, setInitialViewSet] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically inject Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
      
      setMounted(true)
    }
  }, [])

  // Reset map to initial view
  const handleResetMap = () => {
    if (map) {
      try {
        // First try to fit all markers
        if (markers && markers.length > 0) {
          const bounds = markers.map(m => [m.coords.lat, m.coords.lon])
          map.fitBounds(bounds, { 
            padding: [60, 60], 
            maxZoom: 11 
          })
        }
        // Fallback to district bounds if available
        else if (districtBounds && districtBounds.length > 0) {
          map.fitBounds(districtBounds, { padding: [80, 80], paddingTopLeft: [0, 120], maxZoom: 10 })
        } 
        // Final fallback to center
        else {
          map.setView([center.lat, center.lon], 10)
        }
      } catch (err) {
        console.error('Error resetting map:', err)
      }
    }
  }

  // On first mount, fit all markers to ensure they're all visible
  useEffect(() => {
    if (!map || initialViewSet) return
    if (!markers || markers.length === 0) return
    
    try {
      const bounds = markers.map(m => [m.coords.lat, m.coords.lon])
      map.fitBounds(bounds, { 
        padding: [60, 60], 
        maxZoom: 11 
      })
      setInitialViewSet(true)
    } catch (e) {
      // Fallback to district bounds
      if (districtBounds && districtBounds.length > 0) {
        try {
          map.fitBounds(districtBounds, { padding: [80, 80], paddingTopLeft: [0, 120], maxZoom: 10 })
          setInitialViewSet(true)
        } catch (err) {
          // ignore
        }
      }
    }
  }, [map, markers, districtBounds, initialViewSet])

  // Fit bounds whenever markers change (after initial view is set)
  useEffect(() => {
    if (!map) return
    if (!initialViewSet) return
    if (!markers || markers.length === 0) return

    try {
      const bounds = markers.map(m => [m.coords.lat, m.coords.lon])
      map.fitBounds(bounds, { 
        padding: [60, 60], 
        maxZoom: 11 
      })
    } catch (err) {
      // ignore
    }
  }, [map, markers, initialViewSet])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[500px] md:h-[600px] border rounded-lg bg-muted/10">
        <div className="text-muted-foreground animate-pulse">Initializing map...</div>
      </div>
    )
  }

  const { MapContainer, TileLayer, CircleMarker, Marker, Popup } = require('react-leaflet')
  const L = require('leaflet')

  // Custom control component for reset button
  const ResetControl = () => {
    useEffect(() => {
      if (!map) return

      const L = require('leaflet')
      
      // Create custom control
      const ResetButton = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
          const button = L.DomUtil.create('a', 'leaflet-control-reset', container)
          button.innerHTML = '⌂'
          button.href = '#'
          button.title = 'Reset Map View'
          button.style.fontSize = '20px'
          button.style.width = '30px'
          button.style.height = '30px'
          button.style.lineHeight = '30px'
          button.style.textAlign = 'center'
          button.style.textDecoration = 'none'
          button.style.color = '#000'
          button.style.backgroundColor = 'white'
          button.style.cursor = 'pointer'
          
          L.DomEvent.on(button, 'click', function(e: any) {
            L.DomEvent.preventDefault(e)
            handleResetMap()
          })
          
          return container
        }
      })

      const control = new ResetButton()
      control.addTo(map)

      return () => {
        control.remove()
      }
    }, [map])

    return null
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <ResetControl />
        
        {/* Try OpenStreetMap with boundaries visible */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.7}
        />
        
        {/* Add boundary layer */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          opacity={0.3}
        />
        
        {markers.map((marker, index) => (
          <Fragment key={`group-${marker.taluka}-${index}`}>
            <CircleMarker
              key={`circle-${marker.taluka}-${index}`}
              center={[marker.coords.lat, marker.coords.lon]}
              radius={marker.radius}
              pathOptions={{
                fillColor: marker.color,
                fillOpacity: 0.8,
                color: '#fff',
                weight: 2,
                opacity: 1,
              }}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <div className="font-semibold text-base">{marker.taluka}</div>
                  <div className="text-sm text-gray-600">
                    {marker.count} incident{marker.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
            
            {/* Count label in center of bubble - more subtle */}
            <Marker
              key={`count-${marker.taluka}-${index}`}
              position={[marker.coords.lat, marker.coords.lon]}
              icon={L.divIcon({
                className: 'custom-marker-label',
                html: `<div style="color: white; font-weight: 600; font-size: 13px; text-shadow: 0 1px 3px rgba(0,0,0,0.9); text-align: center;">${marker.count}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
              })}
            />
            
            {/* Taluka name label below bubble - more subtle */}
            <Marker
              key={`label-${marker.taluka}-${index}`}
              position={[marker.coords.lat, marker.coords.lon]}
              icon={L.divIcon({
                className: 'custom-marker-label',
                html: `<div style="background: rgba(0,0,0,0.6); color: white; font-size: 10px; font-weight: 500; padding: 1px 5px; border-radius: 3px; white-space: nowrap; text-align: center;">${marker.taluka}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, -(marker.radius + 8)],
              })}
            />
          </Fragment>
        ))}
      </MapContainer>
    </div>
  )
}
