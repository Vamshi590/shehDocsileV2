import React from 'react'

// Define interfaces for the data structure
interface MedicineItem {
  name: string
  quantity: number
  stock: number
}

interface OpticalItem {
  name: string
  quantity: number
  stock: number
  type: string
}

interface PeakHour {
  start: string
  end: string
  count: number
}

interface PatientStats {
  total: number
  new: number
  returning: number
  gender: { male: number; female: number; other: number }
  ageGroups: { [key: string]: number }
  conditions: { name: string; count: number; percentage?: number }[]
  followUp: number
  average: number
  change: number
  averageChange: number
  followUpRate?: {
    rate: number
    previousRate: number
    change: number
  }
}

interface MedicineStats {
  lowStock: MedicineItem[]
}

interface OpticalStats {
  lowStock: OpticalItem[]
}

interface RevenueStats {
  trend?: 'increasing' | 'decreasing' | 'stable'
}

interface EyeConditionStats {
  conditions: {
    name: string
    count: number
    percentage?: number
  }[]
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

interface AnalyticsData {
  medicineStats: MedicineStats
  opticalStats: OpticalStats
  patientStats: PatientStats
  revenueStats: RevenueStats
  eyeConditionStats: EyeConditionStats
  patientTreatmentStats: unknown
  peakHours?: PeakHour[]
  seasonalTrends?: {
    season: string
    trend: string
    percentage: number
    change?: number
    direction?: string
    condition?: string
  }[]
  [key: string]: unknown
}

interface SmartSuggestionsProps {
  data: AnalyticsData | null
}

interface SuggestionCardProps {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  actionText?: string
  onAction?: () => void
}

interface Suggestion {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: React.ReactNode
  actionText?: string
  onAction?: () => void
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  title,
  description,
  priority,
  icon,
  actionText,
  onAction
}) => {
  // Define color scheme based on priority
  const getPriorityColors = (): {
    bg: string
    border: string
    icon: string
    badge: string
    button: string
  } => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-800',
          button: 'bg-red-100 text-red-700 hover:bg-red-200'
        }
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-100',
          icon: 'bg-yellow-100 text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800',
          button: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        }
      case 'low':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          icon: 'bg-blue-100 text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
          button: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          icon: 'bg-gray-100 text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
          button: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
    }
  }

  const colors = getPriorityColors()

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-5`}>
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${colors.icon} mr-4`}>{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} capitalize`}
            >
              {priority} priority
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {actionText && onAction && (
            <button
              onClick={onAction}
              className={`px-4 py-2 rounded-md text-sm font-medium ${colors.button} transition-colors`}
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ data }) => {
  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <div className="flex items-start">
              <div className="bg-gray-200 rounded-full w-12 h-12 mr-4"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Extract data for smart suggestions
  const { medicineStats, opticalStats, patientStats, revenueStats, eyeConditionStats } =
    data as AnalyticsData

  // Generate suggestions based on data
  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = []

    // Low stock medicine suggestions
    const lowStockMedicines = medicineStats.lowStock || []
    if (lowStockMedicines.length > 0) {
      suggestions.push({
        title: 'Low Stock Medicines',
        description: `${lowStockMedicines.length} medicines are running low on stock. Consider reordering ${lowStockMedicines[0].name}, ${lowStockMedicines.length > 1 ? lowStockMedicines[1].name : ''} ${lowStockMedicines.length > 2 ? 'and others' : ''}.`,
        priority: 'high',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        actionText: 'View Low Stock Items',
        onAction: () => {
          window.location.hash = '/medicines'
          return
        }
      })
    }

    // Low stock optical items suggestions
    const lowStockOpticals = opticalStats.lowStock || []
    if (lowStockOpticals.length > 0) {
      suggestions.push({
        title: 'Low Stock Optical Items',
        description: `${lowStockOpticals.length} optical items are running low on stock. Consider reordering ${lowStockOpticals[0].name}, ${lowStockOpticals.length > 1 ? lowStockOpticals[1].name : ''} ${lowStockOpticals.length > 2 ? 'and others' : ''}.`,
        priority: 'high',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
        actionText: 'View Low Stock Items',
        onAction: () => {
          window.location.hash = '/opticals'
          return
        }
      })
    }

    // Peak hours suggestion
    if (data.peakHours && data.peakHours.length > 0) {
      const peakHour = data.peakHours[0]
      suggestions.push({
        title: 'Peak Hours Identified',
        description: `Patient visits are highest between ${peakHour.start} and ${peakHour.end}. Consider optimizing staff allocation during these hours for better service.`,
        priority: 'medium',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      })
    }

    // Revenue trend suggestion
    if (revenueStats.trend) {
      const trend = revenueStats.trend
      suggestions.push({
        title: 'Revenue Trend Analysis',
        description:
          trend === 'increasing'
            ? 'Revenue is showing an upward trend. Keep up the good work!'
            : trend === 'decreasing'
              ? 'Revenue is showing a downward trend. Consider reviewing pricing or marketing strategies.'
              : 'Revenue is stable. Consider growth opportunities in high-demand services.',
        priority: trend === 'decreasing' ? 'high' : 'medium',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        )
      })
    }

    // Check for prescription patterns
    if (
      eyeConditionStats.commonPrescriptionPatterns &&
      eyeConditionStats.commonPrescriptionPatterns.length > 0
    ) {
      const pattern = eyeConditionStats.commonPrescriptionPatterns[0]
      suggestions.push({
        title: 'Common Prescription Pattern',
        description: `For ${pattern.condition}, ${pattern.medicine} is prescribed ${pattern.frequency}% of the time with ${pattern.effectiveness}% effectiveness.`,
        priority: 'medium',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        )
      })
    }

    // Seasonal trends
    if (data.seasonalTrends && data.seasonalTrends.length > 0) {
      const trend = data.seasonalTrends[0]
      suggestions.push({
        title: 'Seasonal Trend Detected',
        description: `We've noticed a ${trend.percentage}% ${trend.change && trend.change > 0 ? 'increase' : 'decrease'} in ${trend.condition || trend.trend} cases during ${trend.season}. Consider stocking up on related medicines and treatments.`,
        priority: 'low',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        )
      })
    }

    // Patient follow-up suggestion
    if (patientStats.followUpRate && patientStats.followUpRate.rate < 70) {
      suggestions.push({
        title: 'Follow-up Rate Analysis',
        description: `Your patient follow-up rate is ${patientStats.followUpRate.rate}%, which is ${patientStats.followUpRate.change}% ${patientStats.followUpRate.change > 0 ? 'higher' : 'lower'} than last month. ${patientStats.followUpRate.rate < 70 ? 'This is below the recommended rate of 70%.' : ''}`,
        priority: patientStats.followUpRate.rate < 70 ? 'medium' : 'low',
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
        actionText: 'View Follow-ups',
        onAction: () => {
          window.location.hash = '/duesfollowup'
          return
        }
      })
    }

    // Return all generated suggestions
    return suggestions
  }

  const suggestions = generateSuggestions()

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-800">Smart Suggestions</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                title={suggestion.title}
                description={suggestion.description}
                priority={suggestion.priority}
                icon={suggestion.icon}
                actionText={suggestion.actionText}
                onAction={suggestion.onAction}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div>
                No suggestions available at this time. Check back later as more data is collected.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">AI Insights</h3>
        <div
          className="flex p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800"
          role="alert"
        >
          <div className="p-2 bg-blue-100 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-md font-medium text-blue-800 mb-1">How AI Suggestions Work</h4>
            <p className="text-sm text-blue-600">
              These suggestions are generated based on patterns in your hospital&apos;s data. The AI
              analyzes trends, inventory levels, patient flow, and other metrics to provide
              actionable insights. As more data is collected, the suggestions will become more
              accurate and personalized.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Future Enhancements</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Predictive patient flow forecasting
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Automated inventory management recommendations
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Staff scheduling optimization
              </li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Feedback</h4>
            <p className="text-sm text-gray-600 mb-3">
              Help us improve these suggestions by providing feedback on their usefulness.
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
                Very Useful
              </button>
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
                Somewhat Useful
              </button>
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
                Not Useful
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartSuggestions
