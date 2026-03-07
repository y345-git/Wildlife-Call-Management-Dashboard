'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MultiSelectFilterProps {
  label: string
  icon?: React.ReactNode
  options: string[]
  value: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelectFilter({ 
  label, 
  icon, 
  options, 
  value, 
  onChange,
  placeholder = 'Select...'
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const selectAll = () => {
    onChange([...options])
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-2">
        {icon}
        {label}
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-600 focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
        >
          <span className="truncate">
            {value.length === 0 ? (
              <span className="text-gray-400 dark:text-slate-500">{placeholder}</span>
            ) : value.length === options.length ? (
              'All Selected'
            ) : (
              `${value.length} selected`
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[9999] mt-2 w-full rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-emerald-500/10">
            <div className="p-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 px-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="p-2 flex gap-2 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAll}
                className="flex-1 h-7 text-xs border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-500"
              >
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearAll}
                className="flex-1 h-7 text-xs border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-500 dark:hover:border-red-500"
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar bg-white dark:bg-slate-900">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700/80 cursor-pointer transition-colors"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      value.includes(option)
                        ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {value.includes(option) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
                      {option}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {value.length > 0 && value.length < options.length && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
            >
              {item.length > 15 ? `${item.substring(0, 15)}...` : item}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOption(item)
                }}
                className="hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {value.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 text-xs">
              +{value.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
