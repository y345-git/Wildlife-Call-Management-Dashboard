'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface TalukaDistributionChartProps {
  data: IncidentData[]
}

export function TalukaDistributionChart({ data }: TalukaDistributionChartProps) {
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

    // Sort by count for better visualization
    const sorted = Object.entries(talukaCounts)
      .sort(([, a], [, b]) => b - a)

    const labels = sorted.map(([name]) => name)
    const values = sorted.map(([, count]) => count)

    return [
      {
        type: 'pie' as const,
        labels: labels,
        values: values,
        marker: {
          colors: colorPalette.primary,
          line: {
            color: isDark ? '#1e293b' : '#ffffff',
            width: 2,
          },
        },
        textinfo: 'label+percent' as const,
        textposition: 'auto' as const,
        hovertemplate: '<b>%{label}</b><br>Incidents: %{value}<br>Percentage: %{percent}<extra></extra>',
        hole: 0.3, // Makes it a donut chart for better aesthetics
        textfont: {
          size: responsive.isMobile ? 9 : 11,
        },
      },
    ]
  }, [data, isDark, responsive])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Incident Distribution by Taluka',
          font: {
            size: responsive.titleFontSize,
          },
        },
        height: responsive.isMobile ? 450 : 600,
        showlegend: true,
        legend: {
          orientation: 'v',
          yanchor: 'middle',
          y: 0.5,
          xanchor: 'left',
          x: 1.02,
          font: {
            size: responsive.isMobile ? 9 : 11,
          },
        },
        margin: { 
          t: 60, 
          b: responsive.isMobile ? 40 : 60, 
          l: responsive.isMobile ? 40 : 80, 
          r: responsive.isMobile ? 120 : 200 
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
      style={{ width: '100%', height: responsive.isMobile ? '450px' : '600px' }}
    />
  )
}
