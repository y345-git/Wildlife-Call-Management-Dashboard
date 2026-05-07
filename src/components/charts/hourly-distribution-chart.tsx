'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig } from '@/lib/plotly-config'
import { IncidentData } from '@/types'
import { parseIncidentDate } from '@/utils/date-parser'

interface HourlyDistributionChartProps {
  data: IncidentData[]
}

export function HourlyDistributionChart({ data }: HourlyDistributionChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = useMemo(() => {
    // Extract hours from timestamps
    const hours = data
      .map(incident => {
        const date = parseIncidentDate(incident.Timestamp)
        return date ? date.getHours() : null
      })
      .filter(h => h !== null) as number[]

    return [
      {
        type: 'histogram' as const,
        x: hours,
        nbinsx: 24,
        marker: {
          color: isDark ? '#10b981' : '#059669',
          line: {
            color: isDark ? '#1e293b' : '#ffffff',
            width: 1,
          },
        },
        hovertemplate: 'Hour: %{x}<br>Incidents: %{y}<extra></extra>',
      },
    ]
  }, [data, isDark])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Hourly Distribution of Incidents',
        },
        xaxis: {
          title: {
            text: 'Hour of Day (0-23)',
          },
          dtick: 1,
          range: [-0.5, 23.5],
        },
        yaxis: {
          title: {
            text: 'Number of Incidents',
          },
        },
        height: 500,
        margin: { t: 50, b: 60, l: 60, r: 20 },
        bargap: 0.1,
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
