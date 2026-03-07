'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette, getResponsiveDimensions } from '@/lib/plotly-config'
import { IncidentData } from '@/types'
import { parseIncidentDate } from '@/utils/date-parser'

interface WildlifeTimelineChartProps {
  data: IncidentData[]
}

export function WildlifeTimelineChart({ data }: WildlifeTimelineChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const responsive = getResponsiveDimensions()

  const chartData = useMemo(() => {
    // Group by date and wildlife type
    const dailyWildlifeData = data.reduce((acc, incident) => {
      const date = parseIncidentDate(incident.Timestamp)
      if (date) {
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
        const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
        
        if (wildlife) {
          const key = `${dateStr}|||${wildlife}`
          acc[key] = (acc[key] || 0) + 1
        }
      }
      return acc
    }, {} as Record<string, number>)

    // Get all wildlife types by total incidents
    const wildlifeCounts = data.reduce((acc, incident) => {
      const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
      if (wildlife) {
        acc[wildlife] = (acc[wildlife] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const allWildlife = Object.entries(wildlifeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([wildlife]) => wildlife)

    // Create a trace for each wildlife type
    return allWildlife.map((wildlife, index) => {
      // Get all dates for this wildlife
      const wildlifeData = Object.entries(dailyWildlifeData)
        .filter(([key]) => key.endsWith(`|||${wildlife}`))
        .map(([key, count]) => ({
          date: key.split('|||')[0],
          count
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const dates = wildlifeData.map(d => d.date)
      const counts = wildlifeData.map(d => d.count)

      return {
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: wildlife,
        x: dates,
        y: counts,
        line: {
          color: colorPalette.wildlife[index % colorPalette.wildlife.length],
          width: 2,
        },
        marker: {
          color: colorPalette.wildlife[index % colorPalette.wildlife.length],
          size: responsive.isMobile ? 3 : 5,
        },
        hovertemplate: `<b>${wildlife}</b><br>%{x}<br>Incidents: %{y}<extra></extra>`,
      }
    })
  }, [data, responsive])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Wildlife Incident Timeline (All Species)',
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
