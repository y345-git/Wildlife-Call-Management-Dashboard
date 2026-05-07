'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartType } from './chart-selector'
import { IncidentData } from '@/types'
import { Construction } from 'lucide-react'
import { WildlifeIncidentsChart } from './wildlife-incidents-chart'
import { TalukaDistributionChart } from './taluka-distribution-chart'
import { IncidentTypesChart } from './incident-types-chart'
import { IncidentFrequencyChart } from './incident-frequency-chart'
import { TopTalukasChart } from './top-talukas-chart'
import { MonthlyTrendChart } from './monthly-trend-chart'
import { FrequentCallersChart } from './frequent-callers-chart'
import { HourlyDistributionChart } from './hourly-distribution-chart'
import { RepeatTalukaChart } from './repeat-taluka-chart'
import { WildlifeTimelineChart } from './wildlife-timeline-chart'
import { MonthlyByTalukaChart } from './monthly-by-taluka-chart'
import { HeatmapChart } from './heatmap-chart'

interface ChartDisplayProps {
  chartType: ChartType
  data: IncidentData[]
}

const chartTitles: Record<ChartType, string> = {
  wildlife: 'Wildlife Incidents by Species',
  taluka: 'Taluka Distribution',
  types: 'Incident Types Breakdown',
  incident_freq: 'Incident Frequency Over Time',
  top_talukas: 'Top 10 Talukas by Incidents',
  monthly: 'Monthly Incident Trend',
  repeat: 'Repeat Taluka Analysis',
  timeline: 'Wildlife Timeline',
  monthly_taluka: 'Monthly Incidents by Taluka',
  callers: 'Frequent Callers Analysis',
  hourly: 'Hourly Distribution of Incidents',
  heatmap: 'Incident Heatmap',
}

export function ChartDisplay({ chartType, data }: ChartDisplayProps) {
  // Helper to render chart card
  const renderChart = (title: string, ChartComponent: React.ComponentType<{ data: IncidentData[] }>) => (
    <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-md">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-6">
        <ChartComponent data={data} />
      </CardContent>
    </Card>
  )

  // Render actual charts
  switch (chartType) {
    case 'wildlife':
      return renderChart(chartTitles[chartType], WildlifeIncidentsChart)
    case 'taluka':
      return renderChart(chartTitles[chartType], TalukaDistributionChart)
    case 'types':
      return renderChart(chartTitles[chartType], IncidentTypesChart)
    case 'incident_freq':
      return renderChart(chartTitles[chartType], IncidentFrequencyChart)
    case 'top_talukas':
      return renderChart(chartTitles[chartType], TopTalukasChart)
    case 'monthly':
      return renderChart(chartTitles[chartType], MonthlyTrendChart)
    case 'callers':
      return renderChart(chartTitles[chartType], FrequentCallersChart)
    case 'hourly':
      return renderChart(chartTitles[chartType], HourlyDistributionChart)
    case 'repeat':
      return renderChart(chartTitles[chartType], RepeatTalukaChart)
    case 'timeline':
      return renderChart(chartTitles[chartType], WildlifeTimelineChart)
    case 'monthly_taluka':
      return renderChart(chartTitles[chartType], MonthlyByTalukaChart)
    case 'heatmap':
      return renderChart(chartTitles[chartType], HeatmapChart)
  }

  // This should never be reached as all chart types are handled
  return (
    <Card className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {chartTitles[chartType]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="p-6 bg-gray-100 dark:bg-slate-700/50 rounded-full mb-6">
            <Construction className="h-16 w-16 text-gray-400 dark:text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chart Under Construction
          </h3>
          <p className="text-gray-600 dark:text-slate-400 text-center max-w-md">
            This chart is currently being developed. It will display <span className="font-semibold text-emerald-600 dark:text-emerald-400">{chartTitles[chartType]}</span> once implemented.
          </p>
          <div className="mt-6 text-sm text-gray-500 dark:text-slate-500">
            Data points available: <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.length.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
