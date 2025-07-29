// Define interfaces for analytics data

// Basic stat interfaces
export interface ConditionStat {
  name: string
  count: number
  revenue: number
  percentage: number
}

export interface PeakHourStat {
  hour: number
  count: number
}

export interface PeakHour {
  start: string
  end: string
  count: number
}

export interface TimeSeriesData {
  labels: string[]
  patients: number[]
  revenue: number[]
  medicines: number[]
  opticals: number[]
  // For DetailedGraphs component
  newPatients?: number[]
  followUpVisits?: number[]
  medicineRevenue?: number[]
  opticalRevenue?: number[]
}

// For MappingFilters.tsx component
// This interface is used by our code
export interface StaffMember {
  name: string
  role: string
  department: string
  patients: number
  revenue: number
  id?: string // Required by MappingFilters component
}

// This interface is used by our code
export interface RegionData {
  name: string
  value: number
  region?: string // Required by MappingFilters component
  count?: number
  percentage?: number
}

// These interfaces match exactly what MappingFilters component expects
export interface MappingStaffMember {
  id: string
  name: string
}

export interface MappingRegionData {
  region: string
  name: string
  count: number
  percentage: number
  revenue?: number
}

export interface MedicineItem {
  name: string
  quantity: number
  status?: string
  stock: number // Required by SmartSuggestions
  revenue?: number
  percentage?: number
}

export interface OpticalItem extends MedicineItem {
  type: string
}

// Main analytics data interface
export interface AnalyticsData {
  // Patient statistics - Matches OverviewDashboard.PatientStats
  patientStats: {
    total: number
    new: number
    returning: number
    gender: { male: number; female: number; other: number }
    ageGroups: { [key: string]: number }
    conditions: ConditionStat[]
    // Required by OverviewDashboard
    followUp: number
    average: number
    change: number
    averageChange: number
  }

  // For SmartSuggestions
  peakHours?: PeakHour[]
  seasonalTrends?: {
    season: string
    trend: string
    percentage: number
    change?: number
    direction?: string
    condition?: string
  }[]
  followUpRate?: {
    rate: number
    previousRate: number
    change: number
  }

  // Revenue statistics - Matches OverviewDashboard.RevenueStats
  revenueStats: {
    total: number
    change: number
    // Additional fields from our implementation
    consultations: number
    medicines: number
    opticals: number
    operations: number
    labs: number
    vlabs: number
    pending: number
    trend?: 'increasing' | 'decreasing' | 'stable'
  }

  // Medicine statistics - Matches OverviewDashboard.MedicineStats
  medicineStats: {
    dispensed: number
    topItems: {
      name: string
      quantity: number
      revenue: number
      percentage: number
    }[]
    // Additional fields from our implementation
    totalDispensed: number
    topMedicines: ConditionStat[]
    outOfStock: number
    lowStock: MedicineItem[]
    revenue: number
  }

  // Optical statistics - Matches OverviewDashboard.OpticalStats
  opticalStats: {
    sold: number
    topItems: {
      name: string
      quantity: number
      revenue: number
      percentage: number
      type: string
    }[]
    // Additional fields from our implementation
    totalDispensed: number
    frames: number
    lenses: number
    revenue: number
    topBrands: ConditionStat[]
    lowStock: OpticalItem[]
  }

  // Eye condition statistics - Matches OverviewDashboard.EyeConditionStats
  eyeConditionStats: {
    conditions: {
      name: string
      count: number
      percentage?: number
    }[]
    // Additional fields from our implementation
    treatmentSuccess: number
    trends?: {
      condition: string
      trend: string
      percentage: number
    }[]
    commonPrescriptionPatterns?: {
      condition: string
      medicine: string
      frequency: number
      effectiveness: number
    }[]
  }

  // Patient treatment statistics - Matches OverviewDashboard.PatientTreatmentStats
  patientTreatmentStats: {
    labels: string[]
    inflow: number[]
    treatments: number[]
    operations: number
    // Additional fields from our implementation
    completedTreatments: number
    ongoingTreatments: number
    followUps: number
    peakHours: PeakHourStat[]
  }

  // Receipt statistics - Matches OverviewDashboard.ReceiptStats
  receiptStats: {
    total: number
    change: number
    prescriptions: number
    // Additional fields from our implementation
    pending: number
    completed: number
  }

  // Time series data
  timeSeriesData: TimeSeriesData

  // For MappingFilters component
  regions?: string[]
  departments?: string[]
  staff?: StaffMember[]
  patientDistribution?: RegionData[]
  revenueDistribution?: RegionData[]

  // Allow for additional dynamic properties
  [key: string]: unknown
}
