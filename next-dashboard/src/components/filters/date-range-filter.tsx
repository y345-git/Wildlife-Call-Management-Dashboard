'use client'

import { useState, useEffect } from 'react'
import { Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface DateRangeFilterProps {
  minDate: Date
  maxDate: Date
  value: [Date, Date]
  onChange: (range: [Date, Date]) => void
}

export function DateRangeFilter({ minDate, maxDate, value, onChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(value[0])
  const [endDate, setEndDate] = useState(value[1])

  // Sync with parent when value prop changes (e.g., on reset)
  useEffect(() => {
    setStartDate(value[0])
    setEndDate(value[1])
  }, [value])

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return ''
    }
    try {
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value)
    setStartDate(newStart)
    onChange([newStart, endDate])
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value)
    setEndDate(newEnd)
    onChange([startDate, newEnd])
  }

  const handleReset = () => {
    setStartDate(minDate)
    setEndDate(maxDate)
    onChange([minDate, maxDate])
  }

  const isModified = startDate.getTime() !== minDate.getTime() || endDate.getTime() !== maxDate.getTime()

  return (
    <div className="space-y-2 flex flex-col justify-center h-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Date Range
        </label>
        {isModified && (
          <Button
            onClick={handleReset}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={formatDate(startDate)}
          min={formatDate(minDate)}
          max={formatDate(maxDate)}
          onChange={handleStartChange}
          className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <span className="text-gray-500 dark:text-slate-400 text-sm">to</span>
        <input
          type="date"
          value={formatDate(endDate)}
          min={formatDate(minDate)}
          max={formatDate(maxDate)}
          onChange={handleEndChange}
          className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  )
}
