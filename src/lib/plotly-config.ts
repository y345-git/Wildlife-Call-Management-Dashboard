import { Layout, Config } from 'plotly.js'

// Common layout settings for light theme
export const lightLayout: Partial<Layout> = {
  paper_bgcolor: 'white',
  plot_bgcolor: '#f9fafb',
  font: {
    family: 'var(--font-geist-sans), sans-serif',
    size: 12,
    color: '#374151',
  },
  title: {
    font: {
      size: 16,
      color: '#111827',
      family: 'var(--font-geist-sans), sans-serif',
    },
  },
  xaxis: {
    gridcolor: '#e5e7eb',
    linecolor: '#d1d5db',
    tickfont: {
      color: '#6b7280',
    },
  },
  yaxis: {
    gridcolor: '#e5e7eb',
    linecolor: '#d1d5db',
    tickfont: {
      color: '#6b7280',
    },
  },
  hoverlabel: {
    bgcolor: 'white',
    bordercolor: '#10b981',
    font: {
      color: '#111827',
    },
  },
}

// Common layout settings for dark theme
export const darkLayout: Partial<Layout> = {
  paper_bgcolor: 'rgba(30, 41, 59, 0.5)',
  plot_bgcolor: 'rgba(15, 23, 42, 0.5)',
  font: {
    family: 'var(--font-geist-sans), sans-serif',
    size: 12,
    color: '#cbd5e1',
  },
  title: {
    font: {
      size: 16,
      color: '#f1f5f9',
      family: 'var(--font-geist-sans), sans-serif',
    },
  },
  xaxis: {
    gridcolor: '#475569',
    linecolor: '#64748b',
    tickfont: {
      color: '#cbd5e1',
    },
  },
  yaxis: {
    gridcolor: '#475569',
    linecolor: '#64748b',
    tickfont: {
      color: '#cbd5e1',
    },
  },
  hoverlabel: {
    bgcolor: '#1e293b',
    bordercolor: '#10b981',
    font: {
      color: '#f1f5f9',
    },
  },
}

// Common configuration for all charts
export const plotConfig: Partial<Config> = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'wildlife_chart',
    height: 800,
    width: 1200,
    scale: 2,
  },
  responsive: true,
}

// Color palettes for charts
export const colorPalette = {
  primary: [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#a855f7', // purple-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
    '#8b5cf6', // violet-500
    '#f97316', // orange-500
  ],
  wildlife: [
    '#059669', // emerald-600
    '#0284c7', // blue-600
    '#9333ea', // purple-600
    '#d97706', // amber-600
    '#db2777', // pink-600
    '#0891b2', // cyan-600
    '#4f46e5', // indigo-600
    '#0d9488', // teal-600
    '#7c3aed', // violet-600
    '#ea580c', // orange-600
  ],
}

// Helper function to get layout based on theme
export const getLayout = (isDark: boolean, customLayout?: Partial<Layout>): Partial<Layout> => {
  const baseLayout = isDark ? darkLayout : lightLayout
  return { ...baseLayout, ...customLayout }
}

// Helper function to get responsive dimensions
export const getResponsiveDimensions = () => {
  if (typeof window === 'undefined') {
    return { height: 600, isMobile: false }
  }
  
  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  
  return {
    height: isMobile ? 400 : isTablet ? 500 : 600,
    isMobile,
    isTablet,
    tickFontSize: isMobile ? 8 : 10,
    titleFontSize: isMobile ? 12 : 14,
    margin: {
      t: 50,
      b: isMobile ? 80 : 120,
      l: isMobile ? 40 : 60,
      r: isMobile ? 20 : 40,
    }
  }
}
