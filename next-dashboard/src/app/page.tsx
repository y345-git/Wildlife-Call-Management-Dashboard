'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchIncidentData } from './actions'
import { IncidentData } from '@/types'
import { DataTable } from '@/components/data-table'
import { ThemeToggle } from '@/components/theme-toggle'
import { FilterPanel } from '@/components/filters/filter-panel'
import { ChartSelector, ChartType } from '@/components/charts/chart-selector'
import { ChartDisplay } from '@/components/charts/chart-display'
import { parseIncidentDate } from '@/utils/date-parser'
import { BarChart3, Database, RefreshCw, Activity, MapPin, Users, TrendingUp, AlertCircle, Home as HomeIcon, Squirrel, Calendar, Clock, Moon, Sun, ArrowUpRight, ArrowDownRight, Minus, FileText, Filter, Download, Printer } from 'lucide-react'

// Dynamically import GeographicalMap (client-side only)
const GeographicalMap = dynamic(
  () => import('@/components/charts/geographical-map').then(mod => mod.GeographicalMap),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }
)

export default function Home() {
  const [data, setData] = useState<IncidentData[]>([])
  const [filteredData, setFilteredData] = useState<IncidentData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<ChartType>('heatmap')
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(2) // minutes
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isMounted, setIsMounted] = useState(false)
  const chartDisplayRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const incidentData = await fetchIncidentData()
      console.log('Loaded incident data:', {
        total: incidentData.length,
        sample: incidentData[0],
        timestamps: incidentData.map(d => d.Timestamp).slice(0, 5)
      })
      setData(incidentData)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return

    const intervalMs = refreshInterval * 60 * 1000
    const timer = setInterval(() => {
      loadData()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [autoRefresh, refreshInterval])

  // Initialize filtered data when data loads
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Auto-scroll to chart when selection changes
  useEffect(() => {
    if (chartDisplayRef.current) {
      chartDisplayRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      })
    }
  }, [activeChart])

  const stats = {
    totalIncidents: filteredData.length,
    uniqueWildlife: new Set(filteredData.map(d => d['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:'])).size,
    uniqueTalukas: new Set(filteredData.map(d => d['तालुका:'])).size,
    uniqueVillages: new Set(filteredData.map(d => d['गावाचे नाव:'])).size,
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-overview elements */
          body * {
            visibility: hidden;
          }
          
          /* Show only overview tab content */
          [role="tabpanel"][data-state="active"] * {
            visibility: visible;
          }
          
          /* Hide navigation, buttons, and interactive elements */
          header,
          nav,
          button,
          [role="tablist"],
          .no-print {
            display: none !important;
          }
          
          /* Optimize page layout */
          body {
            background: white !important;
          }
          
          /* Keep colors and gradients */
          .bg-gradient-to-br,
          .bg-gradient-to-r,
          .bg-gradient-to-t {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          /* Prevent page breaks inside cards */
          .card,
          .grid > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Adjust spacing for print */
          .space-y-6 > * {
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Ensure charts and visualizations are visible */
          svg, canvas {
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="relative min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] dark:opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 dark:bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/30 dark:bg-teal-500/5 rounded-full blur-3xl -z-10"></div>
      
      <main className="relative flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:gap-10 lg:p-10 max-w-[1600px] mx-auto overflow-visible">
        {/* Enhanced Header */}
        <div className="flex flex-col gap-4 no-print">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('overview')}
                className="p-2 md:p-3 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl md:rounded-2xl shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20 transform hover:scale-105 transition-transform cursor-pointer flex-shrink-0"
              >
                <span className="text-2xl md:text-3xl">🦁</span>
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent truncate">
                  Wildlife Incident Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">Forest Department · Real-time Monitoring & Analytics</span>
                  <span className="sm:hidden">Real-time Monitoring</span>
                </p>
              </div>
            </div>
            
            {/* Controls - All in one line on mobile, aligned right on desktop */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-center sm:justify-start">
              {/* Auto-refresh controls */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="autoRefresh" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap">
                  Auto-refresh
                </label>
                {autoRefresh && (
                  <>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="text-xs sm:text-sm border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value={1}>1 min</option>
                      <option value={2}>2 min</option>
                      <option value={5}>5 min</option>
                      <option value={10}>10 min</option>
                      <option value={15}>15 min</option>
                    </select>
                    {isMounted && (
                      <span className="hidden md:inline text-xs text-gray-500 dark:text-slate-400">
                        Updated: {(() => {
                          const hours = lastRefresh.getHours()
                          const minutes = lastRefresh.getMinutes()
                          const seconds = lastRefresh.getSeconds()
                          const hour12 = hours % 12 || 12
                          const ampm = hours >= 12 ? 'PM' : 'AM'
                          return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`
                        })()}
                      </span>
                    )}
                  </>
                )}
              </div>
              <Button 
                onClick={loadData} 
                disabled={loading} 
                variant="outline" 
                size="default"
                className="shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 dark:bg-slate-800 dark:text-slate-200 px-3"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} sm:mr-2`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Error Display with Better Styling */}
        {error && (
          <div className="rounded-xl border-2 border-red-200 dark:border-red-900 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 p-5 shadow-lg animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <div className="font-semibold text-red-700 dark:text-red-300">Error loading data</div>
                <p className="text-sm mt-1 text-red-600/80 dark:text-red-400/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Panel - Above KPI Cards */}
        {data.length > 0 && (
          <div className="relative z-40 no-print">
            <FilterPanel data={data} onFilterChange={setFilteredData} />
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10 no-print">
          <Card className="group relative overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:border-emerald-500 dark:hover:border-emerald-600">
            <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Total Incidents
              </CardTitle>
              <div className="h-12 w-12 rounded-xl bg-emerald-600 dark:bg-gradient-to-br dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden">
                <Database className="h-6 w-6 text-white absolute transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
                <div className="text-xl font-bold text-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                  {stats.totalIncidents}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-emerald-400 transition-all duration-300 group-hover:opacity-0">
                {stats.totalIncidents.toLocaleString()}
              </div>
              
              {/* Mini bar chart on hover */}
              <div className="absolute top-2 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center px-6">
                <div className="w-full h-full flex items-end gap-1">
                  {[65, 45, 70, 55, 80, 60, 75, 50, 85, 65, 90, 70].map((height, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-emerald-500 dark:bg-emerald-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-1 transition-all duration-300 group-hover:opacity-0">
                <TrendingUp className="h-3 w-3" />
                Wildlife incident reports
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-600">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Wildlife Types
              </CardTitle>
              <div className="h-12 w-12 rounded-xl bg-blue-600 dark:bg-gradient-to-br dark:from-blue-600 dark:to-cyan-700 flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden">
                <Squirrel className="h-6 w-6 text-white absolute transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
                <div className="text-xl font-bold text-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                  {stats.uniqueWildlife}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-blue-400 transition-all duration-300 group-hover:opacity-0">
                {stats.uniqueWildlife}
              </div>
              
              {/* Mini pie chart on hover */}
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pb-6">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full bg-blue-500" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}></div>
                  <div className="absolute inset-0 rounded-full bg-cyan-400" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
                  <div className="absolute inset-0 rounded-full bg-blue-600" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-1 transition-all duration-300 group-hover:opacity-0">
                <TrendingUp className="h-3 w-3" />
                Different species reported
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-600">
            <div className="absolute inset-0 bg-purple-50 dark:bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Talukas Covered
              </CardTitle>
              <div className="h-12 w-12 rounded-xl bg-purple-600 dark:bg-gradient-to-br dark:from-purple-600 dark:to-pink-700 flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden">
                <MapPin className="h-6 w-6 text-white absolute transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
                <div className="text-xl font-bold text-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                  {stats.uniqueTalukas}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-purple-400 transition-all duration-300 group-hover:opacity-0">
                {stats.uniqueTalukas}
              </div>
              
              {/* Mini map pins on hover */}
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 pb-6">
                {[...Array(5)].map((_, i) => (
                  <MapPin 
                    key={i}
                    className="h-8 w-8 text-purple-500 dark:text-purple-400"
                  />
                ))}
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-1 transition-all duration-300 group-hover:opacity-0">
                <TrendingUp className="h-3 w-3" />
                Administrative divisions
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 hover:border-orange-500 dark:hover:border-orange-600">
            <div className="absolute inset-0 bg-orange-50 dark:bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Villages
              </CardTitle>
              <div className="h-12 w-12 rounded-xl bg-orange-600 dark:bg-gradient-to-br dark:from-orange-600 dark:to-amber-700 flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden">
                <Users className="h-6 w-6 text-white absolute transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
                <div className="text-xl font-bold text-white scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                  {stats.uniqueVillages}
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold text-gray-900 dark:text-orange-400 transition-all duration-300 group-hover:opacity-0">
                {stats.uniqueVillages}
              </div>
              
              {/* Mini home icons on hover */}
              <div className="absolute top-0 left-0 right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 pb-6">
                {[...Array(5)].map((_, i) => (
                  <HomeIcon 
                    key={i}
                    className="h-8 w-8 text-orange-500 dark:text-orange-400"
                  />
                ))}
              </div>
              
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-2 flex items-center gap-1 transition-all duration-300 group-hover:opacity-0">
                <TrendingUp className="h-3 w-3" />
                Locations affected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-center bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-xl p-2 border border-gray-200 dark:border-slate-700 shadow-sm no-print overflow-x-auto">
            <TabsList className="bg-gray-100 dark:bg-slate-700/50 h-auto min-h-[44px] w-full sm:w-auto">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 transition-all duration-300 px-3 sm:px-6 py-2 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="charts"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 transition-all duration-300 px-3 sm:px-6 py-2 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Charts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="raw-data"
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-emerald-500/30 transition-all duration-300 px-3 sm:px-6 py-2 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Database className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Raw Data</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Quick Stats Summary */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-purple-900 dark:text-purple-200">
                    <Calendar className="h-5 w-5" />
                    Most Active Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const monthCounts = filteredData.reduce((acc, item) => {
                      const date = new Date(item.Timestamp)
                      if (!isNaN(date.getTime())) {
                        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
                        acc[monthYear] = (acc[monthYear] || 0) + 1
                      }
                      return acc
                    }, {} as Record<string, number>)
                    const mostActive = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]
                    return mostActive ? (
                      <>
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{mostActive[0]}</div>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">{mostActive[1]} incidents</p>
                      </>
                    ) : <div className="text-2xl text-purple-400">No data</div>
                  })()}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-teal-900 dark:text-teal-200">
                    <TrendingUp className="h-5 w-5" />
                    Average Per Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    if (filteredData.length === 0) return <div className="text-2xl text-teal-400">No data</div>
                    const dates = filteredData.map(d => new Date(d.Timestamp)).filter(d => !isNaN(d.getTime()))
                    if (dates.length === 0) return <div className="text-2xl text-teal-400">No data</div>
                    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
                    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
                    const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)))
                    const avgPerDay = (filteredData.length / daysDiff).toFixed(1)
                    return (
                      <>
                        <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">{avgPerDay}</div>
                        <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">incidents/day</p>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
                    <Clock className="h-5 w-5" />
                    Peak Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const hourCounts = filteredData.reduce((acc, item) => {
                      const date = new Date(item.Timestamp)
                      if (!isNaN(date.getTime())) {
                        const hour = date.getHours()
                        acc[hour] = (acc[hour] || 0) + 1
                      }
                      return acc
                    }, {} as Record<number, number>)
                    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]
                    return peakHour ? (
                      <>
                        <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                          {(() => {
                            const hour = parseInt(peakHour[0])
                            const hour12 = hour % 12 || 12
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            return `${hour12}:00 ${ampm}`
                          })()}
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{peakHour[1]} incidents</p>
                      </>
                    ) : <div className="text-2xl text-amber-400">No data</div>
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Trend Indicators */}
            <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Trend Analysis
                </CardTitle>
                <CardDescription>Compare current activity with previous periods</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {/* Week Comparison */}
                  <div className="p-5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900/30 hover:shadow-md transition-all">
                    <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">This Week vs Last Week</h4>
                    {(() => {
                      const now = new Date()
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
                      
                      const thisWeek = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= weekAgo
                      }).length
                      
                      const lastWeek = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= twoWeeksAgo && date < weekAgo
                      }).length
                      
                      const change = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : ((thisWeek - lastWeek) / lastWeek * 100)
                      const isPositive = change > 0
                      const isNeutral = Math.abs(change) < 1
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{thisWeek}</div>
                            <div className="text-xs text-blue-600/70 dark:text-blue-400/70">incidents</div>
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">vs {lastWeek} last week</div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            isNeutral ? 'bg-gray-200 dark:bg-slate-600' :
                            isPositive ? 'bg-red-500/20 dark:bg-red-900/40 border border-red-500/30' : 'bg-green-500/20 dark:bg-green-900/40 border border-green-500/30'
                          }`}>
                            {isNeutral ? <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-slate-300" /> :
                             isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> :
                             <ArrowDownRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
                            <span className={`text-xs font-bold ${
                              isNeutral ? 'text-gray-600 dark:text-slate-300' :
                              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Month Comparison */}
                  <div className="p-5 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-900/30 hover:shadow-md transition-all">
                    <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-wide">This Month vs Last Month</h4>
                    {(() => {
                      const now = new Date()
                      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                      
                      const thisMonth = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= thisMonthStart
                      }).length
                      
                      const lastMonth = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= lastMonthStart && date < thisMonthStart
                      }).length
                      
                      const change = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : ((thisMonth - lastMonth) / lastMonth * 100)
                      const isPositive = change > 0
                      const isNeutral = Math.abs(change) < 1
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{thisMonth}</div>
                            <div className="text-xs text-purple-600/70 dark:text-purple-400/70">incidents</div>
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">vs {lastMonth} last month</div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            isNeutral ? 'bg-gray-200 dark:bg-slate-600' :
                            isPositive ? 'bg-red-500/20 dark:bg-red-900/40 border border-red-500/30' : 'bg-green-500/20 dark:bg-green-900/40 border border-green-500/30'
                          }`}>
                            {isNeutral ? <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-slate-300" /> :
                             isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> :
                             <ArrowDownRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
                            <span className={`text-xs font-bold ${
                              isNeutral ? 'text-gray-600 dark:text-slate-300' :
                              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Year Comparison */}
                  <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 hover:shadow-md transition-all">
                    <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 uppercase tracking-wide">This Year vs Last Year</h4>
                    {(() => {
                      const now = new Date()
                      const thisYearStart = new Date(now.getFullYear(), 0, 1)
                      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
                      const lastYearEnd = new Date(now.getFullYear(), 0, 1)
                      
                      const thisYear = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= thisYearStart
                      }).length
                      
                      const lastYear = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= lastYearStart && date < lastYearEnd
                      }).length
                      
                      const change = lastYear === 0 ? (thisYear > 0 ? 100 : 0) : ((thisYear - lastYear) / lastYear * 100)
                      const isPositive = change > 0
                      const isNeutral = Math.abs(change) < 1
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{thisYear}</div>
                            <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">incidents</div>
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400">vs {lastYear} last year</div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            isNeutral ? 'bg-gray-200 dark:bg-slate-600' :
                            isPositive ? 'bg-red-500/20 dark:bg-red-900/40 border border-red-500/30' : 'bg-green-500/20 dark:bg-green-900/40 border border-green-500/30'
                          }`}>
                            {isNeutral ? <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-slate-300" /> :
                             isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> :
                             <ArrowDownRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
                            <span className={`text-xs font-bold ${
                              isNeutral ? 'text-gray-600 dark:text-slate-300' :
                              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* 30-Day Average */}
                  <div className="p-5 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-900/30 hover:shadow-md transition-all">
                    <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-3 uppercase tracking-wide">30-Day Moving Average</h4>
                    {(() => {
                      const now = new Date()
                      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
                      
                      const last30Days = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= thirtyDaysAgo
                      }).length
                      
                      const previous30Days = filteredData.filter(d => {
                        const date = new Date(d.Timestamp)
                        return !isNaN(date.getTime()) && date >= sixtyDaysAgo && date < thirtyDaysAgo
                      }).length
                      
                      const avgLast30 = (last30Days / 30).toFixed(1)
                      const avgPrev30 = (previous30Days / 30).toFixed(1)
                      const change = parseFloat(avgPrev30) === 0 ? (parseFloat(avgLast30) > 0 ? 100 : 0) : ((parseFloat(avgLast30) - parseFloat(avgPrev30)) / parseFloat(avgPrev30) * 100)
                      const isPositive = change > 0
                      const isNeutral = Math.abs(change) < 1
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{avgLast30}</div>
                            <div className="text-xs text-orange-600/70 dark:text-orange-400/70">per day</div>
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400">vs {avgPrev30} previous period</div>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                            isNeutral ? 'bg-gray-200 dark:bg-slate-600' :
                            isPositive ? 'bg-red-500/20 dark:bg-red-900/40 border border-red-500/30' : 'bg-green-500/20 dark:bg-green-900/40 border border-green-500/30'
                          }`}>
                            {isNeutral ? <Minus className="h-3.5 w-3.5 text-gray-600 dark:text-slate-300" /> :
                             isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-red-600 dark:text-red-400" /> :
                             <ArrowDownRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />}
                            <span className={`text-xs font-bold ${
                              isNeutral ? 'text-gray-600 dark:text-slate-300' :
                              isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographical Distribution Map */}
            <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-md">
              <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg shadow-md">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Geographical Distribution
                </CardTitle>
                <CardDescription>Interactive map showing incident locations across talukas</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {isMounted && <GeographicalMap data={filteredData} />}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity Feed */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-md">
                <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg shadow-md">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest 5 incidents reported</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-slate-700">
                    {data
                      .sort((a, b) => {
                        const dateA = parseIncidentDate(a.Timestamp)
                        const dateB = parseIncidentDate(b.Timestamp)
                        if (!dateA && !dateB) return 0
                        if (!dateA) return 1
                        if (!dateB) return -1
                        return dateB.getTime() - dateA.getTime()
                      })
                      .slice(0, 5)
                      .map((incident, idx) => {
                        const date = parseIncidentDate(incident.Timestamp)
                        const isValid = date !== null
                        const hour = isValid ? date.getHours() : 0
                        const isDaytime = hour >= 6 && hour < 18
                        
                        return (
                          <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                                <Squirrel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {incident['गावाचे नाव:']}, {incident['तालुका:']}
                                </p>
                                {isValid && (
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <p className="text-xs text-gray-500 dark:text-slate-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {(() => {
                                        const hours = date.getHours()
                                        const minutes = date.getMinutes()
                                        const hour12 = hours % 12 || 12
                                        const ampm = hours >= 12 ? 'PM' : 'AM'
                                        return `${date.toLocaleDateString()} · ${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
                                      })()}
                                    </p>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                      isDaytime 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    }`}>
                                      {isDaytime ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                                      {isDaytime ? 'Day' : 'Night'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Time-based Analytics */}
              <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-md">
                <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg shadow-md">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    Time-based Analytics
                  </CardTitle>
                  <CardDescription>Day vs Night patterns (all data) • Hourly activity (last 24 hours)</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    // Calculate day/night for ALL data (total)
                    const allDayIncidents = filteredData.filter(d => {
                      const date = new Date(d.Timestamp)
                      if (isNaN(date.getTime())) return false
                      const hour = date.getHours()
                      return hour >= 6 && hour < 18 // 6 AM to 6 PM
                    }).length
                    
                    const allNightIncidents = filteredData.length - allDayIncidents
                    const totalAll = filteredData.length || 1
                    const allDayPercent = (allDayIncidents / totalAll * 100).toFixed(1)
                    const allNightPercent = (allNightIncidents / totalAll * 100).toFixed(1)
                    
                    // Filter data for last 24 hours (for hourly chart only)
                    const now = new Date()
                    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    
                    const last24HoursData = filteredData.filter(d => {
                      const date = parseIncidentDate(d.Timestamp)
                      return date !== null && date >= twentyFourHoursAgo
                    })
                    
                    // Calculate hourly distribution for last 24 hours
                    const hourlyData = last24HoursData.reduce((acc, d) => {
                      const date = parseIncidentDate(d.Timestamp)
                      if (date !== null) {
                        const hour = date.getHours()
                        acc[hour] = (acc[hour] || 0) + 1
                      }
                      return acc
                    }, {} as Record<number, number>)
                    
                    const maxHourlyCount = Math.max(...Object.values(hourlyData), 1)
                    
                    // Create array of hours for the last 24 hours with full date info
                    const currentHour = now.getHours()
                    const hourLabels = Array.from({ length: 24 }, (_, i) => {
                      // Start from 24 hours ago and go to current hour
                      const hoursBack = 23 - i
                      const date = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)
                      return {
                        hour: date.getHours(),
                        date: date,
                        isNewDay: date.getHours() === 0, // Midnight marks new day
                      }
                    })
                    
                    return (
                      <div className="space-y-6">
                        {/* Day Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sun className="h-5 w-5 text-emerald-500" />
                              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Daytime (6 AM - 6 PM)</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{allDayIncidents}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${allDayPercent}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{allDayPercent}% of total incidents</p>
                        </div>

                        {/* Night Stats */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Moon className="h-5 w-5 text-blue-500" />
                              <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Nighttime (6 PM - 6 AM)</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{allNightIncidents}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-700 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${allNightPercent}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{allNightPercent}% of total incidents</p>
                        </div>

                        {/* Hourly Distribution */}
                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Hourly Activity (Last 24 Hours)
                            </span>
                            <span className="text-xs font-normal text-gray-500 dark:text-slate-400">
                              {last24HoursData.length} incident{last24HoursData.length !== 1 ? 's' : ''}
                            </span>
                          </h4>
                          <div className="relative">
                            <div className="grid grid-cols-12 gap-1">
                              {hourLabels.map((item, index) => {
                                const count = hourlyData[item.hour] || 0
                                const heightPercent = (count / maxHourlyCount * 100)
                                const isDaytime = item.hour >= 6 && item.hour < 18
                                const hour12 = item.hour % 12 || 12
                                const ampm = item.hour >= 12 ? 'PM' : 'AM'
                                
                                return (
                                  <div key={`${item.hour}-${index}`} className="flex flex-col items-center gap-1 group relative">
                                    {/* Vertical dotted line for date change */}
                                    {item.isNewDay && index > 0 && (
                                      <div className="absolute left-0 top-0 bottom-0 w-px border-l-2 border-dashed border-orange-500 z-10"></div>
                                    )}
                                    
                                    {/* Bar */}
                                    <div className="relative w-full h-20 flex items-end">
                                      <div 
                                        className={`w-full rounded-t transition-all duration-300 ${
                                          isDaytime 
                                            ? 'bg-gradient-to-t from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600' 
                                            : 'bg-gradient-to-t from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                                        }`}
                                        style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0' }}
                                      >
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                          <div className="bg-gray-900 dark:bg-slate-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                                            <div className="font-semibold">{hour12} {ampm}</div>
                                            <div className="text-[10px] text-gray-300">{item.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</div>
                                            <div className="text-yellow-300 font-bold">{count} incident{count !== 1 ? 's' : ''}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Hour label */}
                                    <span className="text-[10px] text-gray-600 dark:text-slate-400 font-medium">
                                      {hour12} {ampm}
                                    </span>
                                    
                                    {/* Date marker at bottom for new day */}
                                    {item.isNewDay && index > 0 && (
                                      <div className="text-[9px] text-orange-600 dark:text-orange-400 font-bold whitespace-nowrap">
                                        {item.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                              <span className="text-gray-600 dark:text-slate-400">Day (6AM-6PM)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-700"></div>
                              <span className="text-gray-600 dark:text-slate-400">Night (6PM-6AM)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-0">
            {/* Chart Display */}
            <div ref={chartDisplayRef}>
              <ChartDisplay 
                chartType={activeChart} 
                data={filteredData} 
              />
            </div>

            {/* Chart Selector */}
            <ChartSelector 
              activeChart={activeChart} 
              onChartChange={setActiveChart} 
            />
          </TabsContent>

          <TabsContent value="raw-data" className="space-y-6 mt-0">
            <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-md">
              <CardHeader className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-700">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-emerald-600 dark:bg-gradient-to-br dark:from-emerald-600 dark:to-teal-700 rounded-lg shadow-md">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    Raw Incident Data
                  </span>
                </CardTitle>
                <CardDescription className="text-base mt-2 dark:text-slate-400">
                  Complete dataset of wildlife incidents with pagination and search capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <DataTable 
                  data={[...filteredData].sort((a, b) => {
                    const dateA = parseIncidentDate(a.Timestamp)
                    const dateB = parseIncidentDate(b.Timestamp)
                    if (!dateA && !dateB) return 0
                    if (!dateA) return 1
                    if (!dateB) return -1
                    return dateB.getTime() - dateA.getTime()
                  })} 
                  loading={loading} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </>
  )
}
