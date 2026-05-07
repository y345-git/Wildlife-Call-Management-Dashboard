'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import { PlotlyWrapper } from './plotly-wrapper'
import { getLayout, plotConfig, colorPalette } from '@/lib/plotly-config'
import { IncidentData } from '@/types'

interface IncidentTypesChartProps {
  data: IncidentData[]
}

export function IncidentTypesChart({ data }: IncidentTypesChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = useMemo(() => {
    // Group by wildlife and incident type
    const grouped = data.reduce((acc, incident) => {
      const wildlife = incident['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']
      const type = incident['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']
      
      if (wildlife && type) {
        const key = `${wildlife}|||${type}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Get unique wildlife types and incident types
    const wildlifeTypes = [...new Set(data.map(d => d['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']).filter(Boolean))]
    const incidentTypes = [...new Set(data.map(d => d['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']).filter(Boolean))]

    // Create traces for each incident type
    return incidentTypes.map((type, index) => {
      const values = wildlifeTypes.map(wildlife => {
        const key = `${wildlife}|||${type}`
        return grouped[key] || 0
      })

      return {
        type: 'bar' as const,
        name: type,
        x: wildlifeTypes,
        y: values,
        marker: {
          color: colorPalette.primary[index % colorPalette.primary.length],
        },
        hovertemplate: `<b>${type}</b><br>%{x}<br>Count: %{y}<extra></extra>`,
      }
    })
  }, [data])

  const layout = useMemo(
    () =>
      getLayout(isDark, {
        title: {
          text: 'Incident Types by Wildlife Species',
        },
        xaxis: {
          title: {
            text: 'Wildlife Species',
          },
          tickangle: -45,
          automargin: true,
        },
        yaxis: {
          title: {
            text: 'Number of Incidents',
          },
        },
        barmode: 'group',
        height: 500,
        margin: { t: 50, b: 150, l: 60, r: 20 },
        showlegend: true,
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: -0.5,
          xanchor: 'center',
          x: 0.5,
        },
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
