'use client'

import { useState, useEffect } from 'react'
import { Calendar, Leaf, MapPin, RotateCcw, Squirrel, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DateRangeFilter } from './date-range-filter'
import { MultiSelectFilter } from './multi-select-filter'
import { IncidentData } from '@/types'
import { parseIncidentDate } from '@/utils/date-parser'

interface FilterPanelProps {
  data: IncidentData[]
  onFilterChange: (filtered: IncidentData[]) => void
}

export function FilterPanel({ data, onFilterChange }: FilterPanelProps) {
  // Extract unique values and date range
  const allWildlifeTypes = [...new Set(data.map(d => d['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']).filter(Boolean))]
  const allTalukas = [...new Set(data.map(d => d['तालुका:']).filter(Boolean))]
  
  // Parse dates properly using our date parser
  const dates = data
    .map(d => parseIncidentDate(d.Timestamp))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())
  
  const minDate = dates.length > 0 ? dates[0] : new Date()
  const maxDate = dates.length > 0 ? dates[dates.length - 1] : new Date()

  // Filter states
  const [dateRange, setDateRange] = useState<[Date, Date]>([minDate, maxDate])
  const [selectedWildlife, setSelectedWildlife] = useState<string[]>(allWildlifeTypes)
  const [selectedTalukas, setSelectedTalukas] = useState<string[]>(allTalukas)
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string[]>(['day', 'night'])
  const [filteredCount, setFilteredCount] = useState(data.length)

  // Apply filters whenever they change
  useEffect(() => {
    const filtered = data.filter(row => {
      // Parse the row date
      const rowDate = parseIncidentDate(row.Timestamp)
      
      // Create end of day for the end date to include all times on that day
      const endOfDay = new Date(dateRange[1])
      endOfDay.setHours(23, 59, 59, 999)
      
      // Start of day for start date
      const startOfDay = new Date(dateRange[0])
      startOfDay.setHours(0, 0, 0, 0)
      
      // Check date match - include rows with valid dates OR if no date range filter is active
      const dateMatch = rowDate === null ? false : (
        rowDate >= startOfDay && rowDate <= endOfDay
      )
      
      const wildlifeMatch = selectedWildlife.includes(row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:'])
      const talukaMatch = selectedTalukas.includes(row['तालुका:'])
      
      // Check time of day match
      let timeOfDayMatch = true
      if (selectedTimeOfDay.length > 0 && selectedTimeOfDay.length < 2) {
        if (rowDate) {
          const hour = rowDate.getHours()
          const isDaytime = hour >= 6 && hour < 18
          timeOfDayMatch = (isDaytime && selectedTimeOfDay.includes('day')) || 
                          (!isDaytime && selectedTimeOfDay.includes('night'))
        } else {
          timeOfDayMatch = false
        }
      }
      
      return dateMatch && wildlifeMatch && talukaMatch && timeOfDayMatch
    })
    
    console.log('Filter applied:', {
      dateRange: [
        dateRange[0] && !isNaN(dateRange[0].getTime()) ? dateRange[0].toISOString() : 'Invalid',
        dateRange[1] && !isNaN(dateRange[1].getTime()) ? dateRange[1].toISOString() : 'Invalid'
      ],
      totalData: data.length,
      filteredCount: filtered.length,
      wildlifeSelected: selectedWildlife.length,
      talukasSelected: selectedTalukas.length,
      timeOfDaySelected: selectedTimeOfDay
    })
    
    setFilteredCount(filtered.length)
    onFilterChange(filtered)
  }, [dateRange, selectedWildlife, selectedTalukas, selectedTimeOfDay, data, onFilterChange])

  const resetFilters = () => {
    setDateRange([minDate, maxDate])
    setSelectedWildlife(allWildlifeTypes)
    setSelectedTalukas(allTalukas)
    setSelectedTimeOfDay(['day', 'night'])
  }

  const hasActiveFilters = 
    selectedWildlife.length < allWildlifeTypes.length ||
    selectedTalukas.length < allTalukas.length ||
    dateRange[0].getTime() !== minDate.getTime() ||
    dateRange[1].getTime() !== maxDate.getTime() ||
    selectedTimeOfDay.length < 2

  return (
    <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-md relative z-50">
      <CardContent className="p-3 md:p-6 relative z-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🔎 Filter Data
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 relative z-50">
          <DateRangeFilter
            minDate={minDate}
            maxDate={maxDate}
            value={dateRange}
            onChange={setDateRange}
          />

          <MultiSelectFilter
            label="Type of Wildlife"
            icon={<Squirrel className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            options={allWildlifeTypes}
            value={selectedWildlife}
            onChange={setSelectedWildlife}
            placeholder="Select wildlife types..."
          />

          <MultiSelectFilter
            label="Taluka"
            icon={<MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            options={allTalukas}
            value={selectedTalukas}
            onChange={setSelectedTalukas}
            placeholder="Select talukas..."
          />

          <MultiSelectFilter
            label="Time of Day"
            icon={<Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            options={['Daytime (6 AM - 6 PM)', 'Nighttime (6 PM - 6 AM)']}
            value={selectedTimeOfDay.map(t => t === 'day' ? 'Daytime (6 AM - 6 PM)' : 'Nighttime (6 PM - 6 AM)')}
            onChange={(selected) => {
              const mapped = selected.map(s => s.startsWith('Daytime') ? 'day' : 'night')
              setSelectedTimeOfDay(mapped)
            }}
            placeholder="Select time periods..."
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 flex-wrap">
                <span className="font-medium">Active filters:</span>
                {selectedWildlife.length < allWildlifeTypes.length && (
                  <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    {selectedWildlife.length}/{allWildlifeTypes.length} Wildlife
                  </span>
                )}
                {selectedTalukas.length < allTalukas.length && (
                  <span className="px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">
                    {selectedTalukas.length}/{allTalukas.length} Talukas
                  </span>
                )}
                {(dateRange[0].getTime() !== minDate.getTime() || dateRange[1].getTime() !== maxDate.getTime()) && (
                  <span className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                    Custom Date Range
                  </span>
                )}
                {selectedTimeOfDay.length < 2 && (
                  <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1">
                    {selectedTimeOfDay.includes('day') ? (
                      <>
                        <Sun className="h-3 w-3" />
                        Daytime Only
                      </>
                    ) : (
                      <>
                        <Moon className="h-3 w-3" />
                        Nighttime Only
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-500">
                <div>Data range: {minDate.toLocaleDateString()} to {maxDate.toLocaleDateString()}</div>
                <div className="mt-1">Total records: {data.length} • Filtered: {filteredCount}</div>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs mt-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
