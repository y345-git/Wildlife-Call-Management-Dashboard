'use client'

import { useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Filter, BarChart3, PieChart, Table } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Wildlife Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Forest Department
            </p>
          </SidebarHeader>
          <SidebarContent className="px-4 py-4">
            {sidebar || <DefaultSidebar />}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-6">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold">🦁 Wildlife Incident Dashboard</h1>
              </div>
            </div>
          </header>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function DefaultSidebar() {
  const [activeChart, setActiveChart] = useState<string>('')

  const chartOptions = [
    { id: 'wildlife', label: 'Wildlife Incidents', icon: BarChart3 },
    { id: 'taluka', label: 'Taluka Distribution', icon: PieChart },
    { id: 'types', label: 'Incident Types', icon: BarChart3 },
    { id: 'incident_freq', label: 'Incident Frequency', icon: BarChart3 },
    { id: 'top_talukas', label: 'Top Talukas', icon: BarChart3 },
    { id: 'monthly', label: 'Monthly Trend', icon: BarChart3 },
    { id: 'repeat', label: 'Repeat Taluka', icon: BarChart3 },
    { id: 'timeline', label: 'Wildlife Timeline', icon: BarChart3 },
    { id: 'monthly_taluka', label: 'Monthly by Taluka', icon: BarChart3 },
    { id: 'villages', label: 'Top Villages', icon: BarChart3 },
    { id: 'callers', label: 'Frequent Callers', icon: BarChart3 },
    { id: 'hourly', label: 'Hourly Distribution', icon: BarChart3 },
    { id: 'heatmap', label: 'Heatmap', icon: BarChart3 },
    { id: 'table', label: 'Raw Data Table', icon: Table },
  ]

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </h3>
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Date picker will be implemented here
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">🦝 Wildlife Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Multiselect will be implemented here
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">📍 Talukas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Multiselect will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Charts Section */}
      <div>
        <h3 className="text-sm font-medium mb-3">📊 Charts</h3>
        <div className="grid grid-cols-1 gap-2">
          {chartOptions.map((chart) => {
            const Icon = chart.icon
            return (
              <Button
                key={chart.id}
                variant={activeChart === chart.id ? "default" : "ghost"}
                size="sm"
                className="justify-start h-auto py-2 px-3 text-left"
                onClick={() => setActiveChart(chart.id)}
              >
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{chart.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
