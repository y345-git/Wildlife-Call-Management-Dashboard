'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface HeatmapChartProps {
  data: IncidentData[]
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const responsive = getResponsiveDimensions()

  const chartData = useMemo(() => {
    // Group by taluka and wildlife type
    const grouped = data.reduce((acc, incident) => {
      const taluka = incident['तालुका:']
      const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
      
      if (taluka && wildlife) {
        const key = `${taluka}|||${wildlife}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get unique talukas and wildlife types (sorted by total count)
    const talukaCounts = data.reduce((acc, incident) => {
      const taluka = incident['तालुका:']
      if (taluka) acc[taluka] = (acc[taluka] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const wildlifeCounts = data.reduce((acc, incident) => {
      const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
      if (wildlife) acc[wildlife] = (acc[wildlife] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get top 15 of each for better visualization (fewer on mobile)
    const limit = responsive.isMobile ? 10 : 15
    const talukas = Object.entries(talukaCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([t]) => t)

    const wildlifeTypes = Object.entries(wildlifeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([w]) => w)

    // Create the z-matrix (2D array) for the heatmap
    const zMatrix = talukas.map(taluka => 
      wildlifeTypes.map(wildlife => {
        const key = `${taluka}|||${wildlife}`
        return grouped[key] || 0
      })
    )

    // Create text annotations for each cell
    const textMatrix = zMatrix.map(row => row.map(val => val > 0 ? val.toString() : ''))

    return [
      {
        type: 'heatmap' as const,
        x: wildlifeTypes,
        y: talukas,
        z: zMatrix,
        text: textMatrix as any,
        texttemplate: '%{text}',
        textfont: {
          color: isDark ? '#f1f5f9' : '#1e293b',
          size: responsive.isMobile ? 8 : 10,
        },
        colorscale: [
          [0, isDark ? '#0f172a' : '#f1f5f9'],
          [0.2, isDark ? '#1e3a5f' : '#dbeafe'],
          [0.4, isDark ? '#2563eb' : '#93c5fd'],
          [0.6, isDark ? '#059669' : '#6ee7b7'],
          [0.8, isDark ? '#f59e0b' : '#fcd34d'],
          [1, isDark ? '#dc2626' : '#f87171'],
        ] as Array<[number, string]>,
        hovertemplate: '<b>Taluka:</b> %{y}<br><b>Wildlife:</b> %{x}<br><b>Incidents:</b> %{z}<extra></extra>',
        colorbar: {
          title: {
            text: 'Incidents',
            side: 'right' as const,
          },
          tickfont: {
            color: isDark ? '#cbd5e1' : '#6b7280',
            size: responsive.isMobile ? 8 : 10,
          },
        },
        xgap: 0.75,
        ygap: 0.75,
        showscale: true,
      },
    ]
  }, [data, isDark, responsive])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Incident Heatmap: Taluka vs Wildlife Type',
          font: {
            size: responsive.titleFontSize,
          },
        },
        xaxis: {
          title: {
            text: 'Wildlife Type',
          },
          tickangle: -45,
          automargin: true,
          side: 'bottom',
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        yaxis: {
          title: {
            text: 'Taluka',
          },
          automargin: true,
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        height: responsive.height + 100,
        margin: { 
          t: 50, 
          b: responsive.isMobile ? 80 : 120, 
          l: responsive.isMobile ? 80 : 120, 
          r: responsive.isMobile ? 40 : 80 
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
      style={{ width: '100%', height: `${responsive.height + 100}px` }}
    />
  )
}
