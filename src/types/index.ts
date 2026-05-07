// Types for the Wildlife Incident Dashboard

export interface IncidentData {
  Timestamp: string
  'कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:': string
  'तालुका:': string
  'गावाचे नाव:': string
  'वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:': string
  'संपर्क करणाऱ्याचे नाव:': string
  [key: string]: string // Allow additional columns
}

export interface FilterState {
  dateRange: [Date, Date]
  wildlifeTypes: string[]
  talukas: string[]
}

export interface DashboardStats {
  totalIncidents: number
  wildlifeTypesCount: number
  villagesCount: number
  totalCalls: number
}

export interface Coordinates {
  lat: number
  lon: number
}

export type ChartType =
  | 'wildlife'
  | 'taluka'
  | 'types'
  | 'incident_freq'
  | 'top_talukas'
  | 'monthly'
  | 'repeat'
  | 'timeline'
  | 'monthly_taluka'
  | 'villages'
  | 'callers'
  | 'hourly'
  | 'heatmap'
  | 'geomap'
  | 'table'
