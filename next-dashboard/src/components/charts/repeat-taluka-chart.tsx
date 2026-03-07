'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'
import { parseIncidentDate } from '@/utils/date-parser'

interface RepeatTalukaChartProps {
  data: IncidentData[]
}

export function RepeatTalukaChart({ data }: RepeatTalukaChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const responsive = getResponsiveDimensions()

  const chartData = useMemo(() => {
    // Group by date and taluka
    const dailyTalukaData = data.reduce((acc, incident) => {
      const date = parseIncidentDate(incident.Timestamp)
      if (date) {
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
        const taluka = incident['तालुका:']
        
        if (taluka) {
          const key = `${dateStr}|||${taluka}`
          acc[key] = (acc[key] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)

    // Get all talukas by total incidents
    const talukaCounts = data.reduce((acc, incident) => {
      const taluka = incident['तालुका:']
      if (taluka) {
        acc[taluka] = (acc[taluka] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const allTalukas = Object.entries(talukaCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([taluka]) => taluka)

    // Create a trace for each taluka
    return allTalukas.map((taluka, index) => {
      // Get all dates for this taluka
      const talukaData = Object.entries(dailyTalukaData)
        .filter(([key]) => key.endsWith(`|||${taluka}`))
        .map(([key, count]) => ({
          date: key.split('|||')[0],
          count
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const dates = talukaData.map(d => d.date)
      const counts = talukaData.map(d => d.count)

      return {
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: taluka,
        x: dates,
        y: counts,
        line: {
          color: colorPalette.primary[index % colorPalette.primary.length],
          width: 2,
        },
        marker: {
          color: colorPalette.primary[index % colorPalette.primary.length],
          size: responsive.isMobile ? 4 : 6,
        },
        hovertemplate: `<b>${taluka}</b><br>%{x}<br>Incidents: %{y}<extra></extra>`,
      }
    })
  }, [data, responsive])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Repeat Taluka Analysis (All Talukas)',
          font: {
            size: responsive.titleFontSize,
          },
        },
        xaxis: {
          title: {
            text: 'Date',
          },
          tickangle: -45,
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        yaxis: {
          title: {
            text: 'Daily Incident Count',
          },
          tickfont: {
            size: responsive.tickFontSize,
          },
        },
        height: responsive.isMobile ? 500 : 600,
        margin: { 
          t: 60, 
          b: responsive.isMobile ? 100 : 120, 
          l: responsive.isMobile ? 50 : 70, 
          r: responsive.isMobile ? 10 : 20 
        },
        showlegend: !responsive.isMobile,
        legend: responsive.isMobile ? {} : {
          orientation: 'v',
          yanchor: 'top',
          y: 1,
          xanchor: 'right',
          x: 0.99,
          font: {
            size: 9,
          },
          bgcolor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
      style={{ width: '100%', height: responsive.isMobile ? '500px' : '600px' }}
    />
  )
}
