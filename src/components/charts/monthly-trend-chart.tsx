'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig } from '@/lib/plotly-config'
import { IncidentData } from '@/types'
import { parseIncidentDate } from '@/utils/date-parser'

interface MonthlyTrendChartProps {
  data: IncidentData[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = useMemo(() => {
    // Group by month
    const monthlyData = data.reduce((acc, incident) => {
      const date = parseIncidentDate(incident.Timestamp)
      if (date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const key = `${year}-${month.toString().padStart(2, '0')}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Sort by date
    const sorted = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))

    const months = sorted.map(([month]) => month)
    const counts = sorted.map(([, count]) => count)

    return [
      {
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        x: months,
        y: counts,
        line: {
          color: isDark ? '#10b981' : '#059669',
          width: 3,
        },
        marker: {
          color: isDark ? '#10b981' : '#059669',
          size: 8,
          line: {
            color: isDark ? '#1e293b' : '#ffffff',
            width: 2,
          },
        },
        hovertemplate: '<b>%{x}</b><br>Incidents: %{y}<extra></extra>',
      },
    ]
  }, [data, isDark])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Monthly Incident Trend',
        },
        xaxis: {
          title: {
            text: 'Month',
          },
          tickangle: -45,
          automargin: true,
        },
        yaxis: {
          title: {
            text: 'Number of Incidents',
          },
        },
        height: 500,
        margin: { t: 50, b: 100, l: 60, r: 20 },
      }),
    [isDark]
  )

  return (
    <PlotlyWrapper
      data={chartData}
      layout={layout}
      config={plotConfig}
      className="w-full"
      useResizeHandler
      style={{ width: '100%', height: '500px' }}
    />
  )
}
