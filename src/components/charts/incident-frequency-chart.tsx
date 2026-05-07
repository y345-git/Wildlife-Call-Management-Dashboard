'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface IncidentFrequencyChartProps {
  data: IncidentData[]
}

export function IncidentFrequencyChart({ data }: IncidentFrequencyChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = useMemo(() => {
    // Count incidents by type
    const typeCounts = data.reduce((acc, incident) => {
      const type = incident['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']
      if (type) {
        acc[type] = (acc[type] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Sort by count
    const sorted = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)

    const labels = sorted.map(([name]) => name)
    const values = sorted.map(([, count]) => count)

    // Create color array based on values
    const colors = values.map((_, index) => colorPalette.primary[index % colorPalette.primary.length])

    return [
      {
        type: 'bar' as const,
        x: labels,
        y: values,
        marker: {
          color: colors,
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
          text: 'Incident Frequency by Type',
        },
        xaxis: {
          title: {
            text: 'Incident Type',
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
        margin: { t: 50, b: 150, l: 60, r: 20 },
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
