'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface WildlifeIncidentsChartProps {
  data: IncidentData[]
}

export function WildlifeIncidentsChart({ data }: WildlifeIncidentsChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const responsive = getResponsiveDimensions()

  const chartData = useMemo(() => {
    // Count incidents by wildlife type
    const wildlifeCounts = data.reduce((acc, incident) => {
      const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
      if (wildlife) {
        acc[wildlife] = (acc[wildlife] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Sort by count and get top 15
    const sorted = Object.entries(wildlifeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)

    const labels = sorted.map(([name]) => name)
    const values = sorted.map(([, count]) => count)

    // Generate colors for all bars, repeating the palette if needed
    const colors = labels.map((_, idx) => colorPalette.wildlife[idx % colorPalette.wildlife.length])

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
          text: 'Wildlife Incidents by Species (All)',
          font: {
            size: responsive.titleFontSize,
          },
        },
        xaxis: {
          title: {
            text: 'Wildlife Species',
          },
          tickangle: -45,
          automargin: true,
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        yaxis: {
          title: {
            text: 'Number of Incidents',
          },
        },
        height: responsive.height,
        margin: responsive.margin,
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
      style={{ width: '100%', height: `${responsive.height}px` }}
    />
  )
}
