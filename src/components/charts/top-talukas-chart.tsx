'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface TopTalukasChartProps {
  data: IncidentData[]
}

export function TopTalukasChart({ data }: TopTalukasChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const responsive = getResponsiveDimensions()

  const chartData = useMemo(() => {
    // Count incidents by taluka
    const talukaCounts = data.reduce((acc, incident) => {
      const taluka = incident['तालुका:']
      if (taluka) {
        acc[taluka] = (acc[taluka] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get top 10 and sort by count (ascending for horizontal bar)
    const sorted = Object.entries(talukaCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reverse() // Reverse for horizontal bar so highest is on top

    const labels = sorted.map(([name]) => name)
    const values = sorted.map(([, count]) => count)

    return [
      {
        type: 'bar' as const,
        orientation: 'h' as const,
        y: labels,
        x: values,
        marker: {
          color: colorPalette.wildlife,
          line: {
            color: isDark ? '#1e293b' : '#ffffff',
            width: 2,
          },
        },
        hovertemplate: '<b>%{y}</b><br>Incidents: %{x}<extra></extra>',
      },
    ]
  }, [data, isDark])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Top 10 Talukas by Incident Count',
          font: {
            size: responsive.titleFontSize,
          },
        },
        xaxis: {
          title: {
            text: 'Number of Incidents',
          },
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        yaxis: {
          title: {
            text: 'Taluka',
          },
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        height: responsive.isMobile ? 400 : 500,
        margin: { 
          t: 60, 
          b: responsive.isMobile ? 50 : 60, 
          l: responsive.isMobile ? 80 : 150, 
          r: responsive.isMobile ? 20 : 40 
        },
      }),
    [isDark, responsive]
  )

  return (
    <PlotlyWrapper
      data={chartData}
      layout={layout}
      config={plotConfig}
      className="w-full overflow-x-auto"
      useResizeHandler
      style={{ width: '100%', height: responsive.isMobile ? '400px' : '500px' }}
    />
  )
}
