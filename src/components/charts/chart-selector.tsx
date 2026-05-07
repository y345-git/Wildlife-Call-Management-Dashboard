'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Clock, 
  Grid3x3,
  Activity,
  Map
} from 'lucide-react'

export type ChartType = 
  | 'wildlife' 
  | 'taluka' 
  | 'types' 
  | 'incident_freq' 
  | 'top_talukas' 
  | 'monthly' 
  | 'repeat' 
  | 'timeline' 
  | 'monthly_taluka' 
  | 'callers' 
  | 'hourly' 
  | 'heatmap'

interface ChartButton {
  label: string
  key: ChartType
  icon: React.ReactNode
  color: string
}

const chartButtons: ChartButton[] = [
  { label: 'Heatmap', key: 'heatmap', icon: <Grid3x3 className="h-4 w-4" />, color: 'fuchsia' },
  { label: 'Wildlife Incidents', key: 'wildlife', icon: <BarChart3 className="h-4 w-4" />, color: 'emerald' },
  { label: 'Taluka Distribution', key: 'taluka', icon: <PieChart className="h-4 w-4" />, color: 'blue' },
  { label: 'Incident Types', key: 'types', icon: <Activity className="h-4 w-4" />, color: 'purple' },
  { label: 'Incident Frequency', key: 'incident_freq', icon: <TrendingUp className="h-4 w-4" />, color: 'orange' },
  { label: 'Top Talukas', key: 'top_talukas', icon: <MapPin className="h-4 w-4" />, color: 'pink' },
  { label: 'Monthly Trend', key: 'monthly', icon: <Calendar className="h-4 w-4" />, color: 'cyan' },
  { label: 'Repeat Taluka', key: 'repeat', icon: <TrendingUp className="h-4 w-4" />, color: 'indigo' },
  { label: 'Wildlife Timeline', key: 'timeline', icon: <Calendar className="h-4 w-4" />, color: 'teal' },
  { label: 'Monthly by Taluka', key: 'monthly_taluka', icon: <BarChart3 className="h-4 w-4" />, color: 'violet' },
  { label: 'Frequent Callers', key: 'callers', icon: <Phone className="h-4 w-4" />, color: 'rose' },
  { label: 'Hourly Distribution', key: 'hourly', icon: <Clock className="h-4 w-4" />, color: 'lime' },
]

const getColorClasses = (color: string, isActive: boolean) => {
  const colorMap: Record<string, { bg: string, hover: string, active: string, text: string, activeBg: string, activeText: string }> = {
    emerald: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-600',
      active: 'border-emerald-500 dark:border-emerald-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-emerald-600 dark:bg-emerald-600',
      activeText: 'text-white dark:text-white'
    },
    blue: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 dark:hover:border-blue-600',
      active: 'border-blue-500 dark:border-blue-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-blue-600 dark:bg-blue-600',
      activeText: 'text-white dark:text-white'
    },
    purple: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-500 dark:hover:border-purple-600',
      active: 'border-purple-500 dark:border-purple-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-purple-600 dark:bg-purple-600',
      activeText: 'text-white dark:text-white'
    },
    orange: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-500 dark:hover:border-orange-600',
      active: 'border-orange-500 dark:border-orange-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-orange-600 dark:bg-orange-600',
      activeText: 'text-white dark:text-white'
    },
    pink: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:border-pink-500 dark:hover:border-pink-600',
      active: 'border-pink-500 dark:border-pink-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-pink-600 dark:bg-pink-600',
      activeText: 'text-white dark:text-white'
    },
    cyan: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-500 dark:hover:border-cyan-600',
      active: 'border-cyan-500 dark:border-cyan-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-cyan-600 dark:bg-cyan-600',
      activeText: 'text-white dark:text-white'
    },
    indigo: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-500 dark:hover:border-indigo-600',
      active: 'border-indigo-500 dark:border-indigo-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-indigo-600 dark:bg-indigo-600',
      activeText: 'text-white dark:text-white'
    },
    teal: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-500 dark:hover:border-teal-600',
      active: 'border-teal-500 dark:border-teal-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-teal-600 dark:bg-teal-600',
      activeText: 'text-white dark:text-white'
    },
    violet: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-500 dark:hover:border-violet-600',
      active: 'border-violet-500 dark:border-violet-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-violet-600 dark:bg-violet-600',
      activeText: 'text-white dark:text-white'
    },
    amber: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-500 dark:hover:border-amber-600',
      active: 'border-amber-500 dark:border-amber-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-amber-600 dark:bg-amber-600',
      activeText: 'text-white dark:text-white'
    },
    rose: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-500 dark:hover:border-rose-600',
      active: 'border-rose-500 dark:border-rose-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-rose-600 dark:bg-rose-600',
      activeText: 'text-white dark:text-white'
    },
    lime: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-lime-50 dark:hover:bg-lime-900/30 hover:border-lime-500 dark:hover:border-lime-600',
      active: 'border-lime-500 dark:border-lime-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-lime-600 dark:bg-lime-600',
      activeText: 'text-white dark:text-white'
    },
    fuchsia: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30 hover:border-fuchsia-500 dark:hover:border-fuchsia-600',
      active: 'border-fuchsia-500 dark:border-fuchsia-600',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-fuchsia-600 dark:bg-fuchsia-600',
      activeText: 'text-white dark:text-white'
    },
    slate: { 
      bg: 'bg-white dark:bg-slate-800', 
      hover: 'hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-500 dark:hover:border-slate-500',
      active: 'border-slate-500 dark:border-slate-500',
      text: 'text-gray-700 dark:text-slate-300',
      activeBg: 'bg-slate-600 dark:bg-slate-600',
      activeText: 'text-white dark:text-white'
    },
  }

  const colors = colorMap[color] || colorMap.emerald

  if (isActive) {
    return `${colors.activeBg} ${colors.activeText} shadow-lg scale-105`
  }
  
  return `${colors.bg} ${colors.hover} ${colors.text} border-gray-200 dark:border-slate-700`
}

interface ChartSelectorProps {
  activeChart: ChartType
  onChartChange: (chart: ChartType) => void
}

export function ChartSelector({ activeChart, onChartChange }: ChartSelectorProps) {
  return (
    <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-md">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📊 Chart Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {chartButtons.map((chart) => (
            <Button
              key={chart.key}
              onClick={() => onChartChange(chart.key)}
              variant="outline"
              className={`h-auto py-3 md:py-5 px-2 flex flex-col items-center gap-2 md:gap-3 transition-all duration-300 border text-xs md:text-sm ${getColorClasses(chart.color, activeChart === chart.key)}`}
            >
              <div className="flex items-center justify-center">
                {chart.icon}
              </div>
              <span className="font-medium text-center leading-tight">
                {chart.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
