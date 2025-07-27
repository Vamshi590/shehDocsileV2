import React, { useState, useEffect, ReactElement } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Import shared interfaces
interface PatientStats {
  total: number
  new: number
  followUp: number
  average: number
  change: number
  averageChange: number
}

interface RevenueStats {
  total: number
  change: number
  trend?: 'increasing' | 'decreasing' | 'stable'
}

interface MedicineStats {
  dispensed: number
  topItems: {
    name: string
    quantity: number
    revenue: number
    percentage: number
  }[]
  topMedicines?: {
    name: string
    count: number
    revenue: number
    percentage: number
  }[]
}

interface OpticalStats {
  sold: number
  topItems: {
    name: string
    quantity: number
    revenue: number
    percentage: number
    type: string
  }[]
  topBrands: {
    name: string
    count: number
    revenue?: number
    percentage?: number
    type?: string
  }[]
}

interface TimeSeriesData {
  labels: string[]
  patients: number[]
  revenue: number[]
  medicines: number[]
  opticals: number[]
  // Optional fields for detailed graphs
  newPatients?: number[]
  followUpVisits?: number[]
  medicineRevenue?: number[]
  opticalRevenue?: number[]
}

interface AnalyticsData {
  patientStats: PatientStats
  revenueStats: RevenueStats
  medicineStats: MedicineStats
  opticalStats: OpticalStats
  timeSeriesData: TimeSeriesData
  [key: string]: unknown // Better than any
}

interface DetailedGraphsProps {
  data: AnalyticsData | null
  timeFilter: 'today' | 'week' | 'month' | 'custom'
}

const DetailedGraphs: React.FC<DetailedGraphsProps> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<
    'patients' | 'revenue' | 'medicines' | 'opticals'
  >('patients')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line')

  // Ensure default chart type matches active category
  useEffect(() => {
    // For medicines and opticals, default to doughnut
    if (
      (activeCategory === 'medicines' || activeCategory === 'opticals') &&
      chartType !== 'doughnut'
    ) {
      setChartType('doughnut')
    }
    // For patients and revenue, default to line if currently doughnut
    if (
      (activeCategory === 'patients' || activeCategory === 'revenue') &&
      chartType === 'doughnut'
    ) {
      setChartType('line')
    }
    // We intentionally leave other combinations as-is to respect user overrides
  }, [activeCategory, chartType])

  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-80 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  // Extract data for detailed graphs
  const { patientStats, revenueStats, medicineStats, opticalStats, timeSeriesData } =
    data as AnalyticsData

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get chart data based on active category
  const getChartData = (): {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor?: string
      backgroundColor: string | string[]
      tension?: number
      borderWidth?: number
    }>
  } => {
    switch (activeCategory) {
      case 'patients':
        return {
          labels: timeSeriesData.labels,
          datasets: [
            {
              label: 'New Patients',
              data: timeSeriesData.patients ?? [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4
            },
            {
              label: 'Follow-up Visits',
              data: timeSeriesData.followUpVisits ?? [],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              tension: 0.4
            }
          ]
        }
      case 'revenue':
        return {
          labels: timeSeriesData.labels,
          datasets: [
            {
              label: 'Total Revenue',
              data: timeSeriesData.revenue,
              borderColor: 'rgb(139, 92, 246)',
              backgroundColor: 'rgba(139, 92, 246, 0.5)',
              tension: 0.3
            }
          ]
        }
      case 'medicines':
        return {
          labels: medicineStats?.topMedicines?.map((item) => item.name) ?? [],
          datasets: [
            {
              label: 'Units Dispensed',
              data: medicineStats?.topMedicines?.map((item) => item.count) ?? [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(244, 63, 94, 0.7)',
                'rgba(249, 115, 22, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(234, 179, 8, 0.7)'
              ],
              borderWidth: 1
            }
          ]
        }
      case 'opticals':
        return {
          labels: opticalStats?.topBrands?.map((item) => item.name) ?? [],
          datasets: [
            {
              label: 'Units Sold',
              data: opticalStats?.topBrands?.map((item) => item.count) ?? [],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(244, 63, 94, 0.7)',
                'rgba(249, 115, 22, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(234, 179, 8, 0.7)'
              ],
              borderWidth: 1
            }
          ]
        }
      default:
        return {
          labels: [],
          datasets: []
        }
    }
  }

  // Chart options - using Record<string, any> due to Chart.js complex type compatibility issues
  // This is a pragmatic solution to avoid complex type errors with Chart.js options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getChartOptions = (): Record<string, any> => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const
        },
        title: {
          display: true,
          text: getChartTitle()
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem: TooltipItem<'line' | 'bar' | 'doughnut'>) {
              let label = tooltipItem.dataset.label || ''
              if (label) {
                label += ': '
              }
              const value = tooltipItem.parsed.y as number
              if (activeCategory === 'revenue') {
                return label + formatCurrency(value)
              }
              return label + value
            }
          }
        }
      }
    }

    // Add scales for line and bar charts
    if (chartType !== 'doughnut') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              // Using a more compatible function signature for Chart.js
              // 'this' is typed as any because Chart.js expects a Scale object that's complex to type
              // index parameter is required by Chart.js but not used in our implementation
              // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
              callback: function (this: any, value: number | string, _index: number) {
                if (activeCategory === 'revenue' && typeof value === 'number') {
                  return formatCurrency(value)
                }
                return value
              }
            }
          }
        }
      }
    }

    return baseOptions
  }

  // Get chart title based on active category
  const getChartTitle = (): string => {
    switch (activeCategory) {
      case 'patients':
        return 'Patient Trends'
      case 'revenue':
        return 'Revenue Analysis'
      case 'medicines':
        return 'Top Medicines Dispensed'
      case 'opticals':
        return 'Top Optical Items Sold'
      default:
        return ''
    }
  }

  // Render chart based on type
  // Using type assertions (as any) due to Chart.js complex type compatibility issues
  // This is necessary because Chart.js has different option types for different chart types
  const renderChart = (type: string): ReactElement => {
    const options = getChartOptions()
    const data = getChartData()

    switch (type) {
      case 'line':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Line options={options as any} data={data} />
      case 'bar':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Bar options={options as any} data={data} />
      case 'doughnut':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Doughnut options={options as any} data={data} />
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <Line options={options as any} data={data} />
    }
  }

  // Get description text based on active category
  const getDescription = (): string => {
    switch (activeCategory) {
      case 'patients':
        return `This chart shows the trend of new patients and follow-up visits over time. ${
          patientStats.change >= 0
            ? `There has been a ${patientStats.change}% increase in patient visits compared to the previous period.`
            : `There has been a ${Math.abs(patientStats.change)}% decrease in patient visits compared to the previous period.`
        }`
      case 'revenue':
        return `This chart shows the revenue breakdown over time. ${
          revenueStats.change >= 0
            ? `There has been a ${revenueStats.change}% increase in total revenue compared to the previous period.`
            : `There has been a ${Math.abs(revenueStats.change)}% decrease in total revenue compared to the previous period.`
        }`
      case 'medicines':
        return `This chart shows the top medicines dispensed by quantity. The most frequently dispensed medicine is ${medicineStats?.topItems?.[0]?.name || 'N/A'} with ${medicineStats?.topMedicines?.[0]?.count || 0} units.`
      case 'opticals':
        return `This chart shows the top optical items sold by quantity. The most popular optical item is ${opticalStats?.topBrands?.[0]?.name || 'N/A'} with ${opticalStats?.topBrands?.[0]?.count || 0} units sold.`
      default:
        return ''
    }
  }

  return (
    <div>
      {/* Category Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Detailed Trends Analysis</h3>
            <p className="text-sm text-gray-500">
              Select a category and chart type to view detailed analytics
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Category Buttons */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveCategory('patients')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeCategory === 'patients'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setActiveCategory('revenue')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeCategory === 'revenue'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveCategory('medicines')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeCategory === 'medicines'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => setActiveCategory('opticals')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeCategory === 'opticals'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Opticals
              </button>
            </div>

            {/* Chart Type Buttons */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  chartType === 'line' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  chartType === 'bar' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('doughnut')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  chartType === 'doughnut'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                disabled={activeCategory === 'patients' || activeCategory === 'revenue'}
              >
                Doughnut
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{getChartTitle()}</h3>
        <div className="h-96">{renderChart(chartType)}</div>
        <p className="mt-4 text-sm text-gray-600">{getDescription()}</p>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Data Table</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeCategory === 'patients' && (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      New Patients
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Follow-up Visits
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                  </>
                )}
                {activeCategory === 'revenue' && (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Optical Revenue
                    </th>
                  </>
                )}
                {activeCategory === 'medicines' && (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Units Dispensed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Revenue
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      % of Total
                    </th>
                  </>
                )}
                {activeCategory === 'opticals' && (
                  <>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Units Sold
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Revenue
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeCategory === 'patients' &&
                timeSeriesData?.labels?.map((date: string, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timeSeriesData?.patients?.[index]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {timeSeriesData?.followUpVisits?.[index]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(timeSeriesData?.patients?.[index] || 0) +
                        (timeSeriesData?.followUpVisits?.[index] || 0)}
                    </td>
                  </tr>
                ))}
              {activeCategory === 'revenue' &&
                timeSeriesData?.labels?.map((date: string, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(timeSeriesData?.revenue?.[index])}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(timeSeriesData?.medicineRevenue?.[index] || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(timeSeriesData?.opticalRevenue?.[index] || 0)}
                    </td>
                  </tr>
                ))}
              {activeCategory === 'medicines' &&
                (medicineStats?.topMedicines || []).map((item, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item?.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item?.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item?.percentage?.toFixed(2) || '0.00'}%
                    </td>
                  </tr>
                ))}
              {activeCategory === 'opticals' &&
                opticalStats.topItems.map(
                  (item: OpticalStats['topItems'][number], index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item?.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item?.revenue)}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DetailedGraphs
