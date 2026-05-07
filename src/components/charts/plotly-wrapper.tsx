'use client'

import dynamic from 'next/dynamic'
import { PlotParams } from 'react-plotly.js'

// Dynamic import to avoid SSR issues with Plotly
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
    </div>
  )
})

interface PlotlyWrapperProps extends PlotParams {
  className?: string
}

export function PlotlyWrapper({ className = '', ...props }: PlotlyWrapperProps) {
  return (
    <div className={className}>
      <Plot {...props} />
    </div>
  )
}
