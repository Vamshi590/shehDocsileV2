import React from 'react'
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
  Filler
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

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

// Define interfaces for the data structure
interface PatientStats {
  total: number
  new: number
  followUp: number
  average: number
  change: number
  averageChange: number
  ageGroups: { [key: string]: number }
}

interface ReceiptStats {
  total: number
  change: number
  prescriptions: number
}

interface RevenueStats {
  total: number
  change: number
  consultations: number
  medicines: number
  opticals: number
  operations: number
  labs: number
  vlabs: number
  pending: number
}

interface MedicineStats {
  dispensed: number
  topItems: {
    name: string
    quantity: number
    revenue: number
    percentage: number
  }[]
  topMedicines: {
    name: string
    count: number
    percentage?: number
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
    percentage?: number
  }[]
}

interface EyeConditionStats {
  conditions: {
    name: string
    count: number
  }[]
}

interface PatientTreatmentStats {
  labels: string[]
  inflow: number[]
  treatments: number[]
  operations: number
  completedTreatments: number
}

interface AnalyticsData {
  patientStats: PatientStats
  receiptStats: ReceiptStats
  revenueStats: RevenueStats
  medicineStats: MedicineStats
  opticalStats: OpticalStats
  eyeConditionStats: EyeConditionStats
  patientTreatmentStats: PatientTreatmentStats
  timeSeriesData?: {
    labels: string[]
    patients: number[]
    revenue: number[]
    medicines: number[]
    opticals: number[]
  }
  conversionRate: number
  totalExpenses: number
  patientwithsurgery: number
  convertedPatientsCount: number
}

interface OverviewDashboardProps {
  data: AnalyticsData | null
  timeFilter: 'today' | 'week' | 'month' | 'custom'
}

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-gray-800">{value}</h3>
          <div
            className={`flex items-center w-full mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {change >= 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-xs font-medium ml-1">
              {Math.abs(change)}% from previous period
            </span>
          </div>
        </div>
        <div className={`p-1 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data, timeFilter }) => {
  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse h-80">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  // Extract data for the overview dashboard
  const {
    patientStats,
    receiptStats,
    revenueStats,
    medicineStats,
    opticalStats,
    eyeConditionStats,
    patientTreatmentStats
  } = data as AnalyticsData

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Age group data for bar chart
  const ageGroupData = {
    datasets: [
      {
        label: 'Patients by Age Group',
        data: patientStats?.ageGroups || [], // Sample data - replace with actual data from API
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 40
      }
    ]
  }

  const revenueData = {
    labels: ['Consultations', 'Medicines', 'Opticals', 'Operations', 'Labs', 'Vennela Labs'],
    datasets: [
      {
        label: 'Revenue by Category',
        data: [
          revenueStats?.consultations,
          revenueStats?.medicines,
          revenueStats?.opticals,
          revenueStats?.operations,
          revenueStats?.labs,
          revenueStats?.vlabs
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 40
      }
    ]
  }

  // Common eye conditions data for pie chart
  const eyeConditionsData = {
    labels: eyeConditionStats?.conditions?.map((item) => item.name),
    datasets: [
      {
        data: eyeConditionStats?.conditions?.map((item) => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  }

  const topOpticalsPieChartData = {
    labels: opticalStats?.topBrands?.map((item) => item.name) || [],
    datasets: [
      {
        data: opticalStats?.topBrands?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  }

  const topMedicinesPieChartData = {
    labels: medicineStats?.topMedicines?.map((item) => item.name) || [],
    datasets: [
      {
        data: medicineStats?.topMedicines?.map((item) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  }

  const ageGroupChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Common Eye Conditions'
      }
    }
  }

  const topOpticalsPieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Top Optical Items'
      }
    }
  }

  const topMedicinesPieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Top Medicines'
      }
    }
  }

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={patientStats?.total}
          change={patientStats?.change}
          color="bg-blue-100"
          icon={
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Receipts"
          value={receiptStats?.total}
          change={receiptStats?.change}
          color="bg-green-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueStats?.total)}
          change={revenueStats?.change}
          color="bg-purple-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(data?.totalExpenses || 0)}
          change={0} // You can calculate change if you have previous period data
          color="bg-red-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Conversion Rate"
          value={`${data?.conversionRate || 0}% (${data?.convertedPatientsCount}/${data?.patientwithsurgery})`}
          change={0} // You can calculate change if you have previous period data
          color="bg-yellow-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
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
          }
        />
        <StatCard
          title="Total Dues"
          value={formatCurrency(revenueStats?.pending || 0)}
          change={0} // You can calculate change if you have previous period data
          color="bg-orange-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-orange-600"
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
          }
        />
        <StatCard
          title="Avg. Daily Patients"
          value={patientStats?.average}
          change={patientStats?.averageChange}
          color="bg-pink-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-600"
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
          }
        />
      </div>

      {/* Revenue Breakdown Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Consultation Revenue"
          value={formatCurrency(revenueStats?.consultations)}
          change={0}
          color="bg-indigo-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          }
        />{' '}
        <StatCard
          title="Operation Revenue"
          value={formatCurrency(revenueStats?.operations)}
          change={0}
          color="bg-emerald-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          }
        />
        <StatCard
          title="Lab Revenue"
          value={formatCurrency(revenueStats?.labs)}
          change={0}
          color="bg-teal-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          }
        />
        <StatCard
          title="Virtual Lab Revenue"
          value={formatCurrency(revenueStats?.vlabs)}
          change={0}
          color="bg-amber-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Medicine Revenue"
          value={formatCurrency(revenueStats?.medicines)}
          change={0}
          color="bg-rose-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-rose-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          }
        />
        <StatCard
          title="Optical Revenue"
          value={formatCurrency(revenueStats?.opticals)}
          change={0}
          color="bg-cyan-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-cyan-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          }
        />
      </div> */}

      {/* Age Group and Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Age Group Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-8">Patients by Age Group</h3>
          <div className="h-80">
            <Bar options={ageGroupChartOptions} data={ageGroupData} />
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-8">Revenue Trend</h3>
          <div className="h-80">
            <Bar options={revenueChartOptions} data={revenueData} />
          </div>
        </div>
      </div>

      {/* Top Items and Eye Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Medicines</h3>
          <div className="h-64">
            <Pie options={topMedicinesPieChartOptions} data={topMedicinesPieChartData} />
          </div>
        </div>

        {/* Top Optical Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Optical Items</h3>
          <div className="h-64">
            <Pie options={topOpticalsPieChartOptions} data={topOpticalsPieChartData} />
          </div>
        </div>

        {/* Common Eye Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Common Eye Conditions</h3>
          <div className="h-64">
            <Pie options={pieChartOptions} data={eyeConditionsData} />
          </div>
        </div>
      </div>

      {/* Time Period Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Summary for{' '}
          {timeFilter === 'today'
            ? 'Today'
            : timeFilter === 'week'
              ? 'This Week'
              : timeFilter === 'month'
                ? 'This Month'
                : 'Custom Period'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm text-gray-500">New Patients</p>
            <p className="text-xl font-semibold">{patientStats?.new}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Follow-up Visits</p>
            <p className="text-xl font-semibold">{patientStats?.followUp}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Prescriptions Issued</p>
            <p className="text-xl font-semibold">{receiptStats?.prescriptions}</p>
          </div>
          <div className="border-l-4 border-pink-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Medicines Dispensed</p>
            <p className="text-xl font-semibold">{medicineStats?.dispensed}</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Optical Items Sold</p>
            <p className="text-xl font-semibold">{opticalStats?.sold}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Operations Performed</p>
            <p className="text-xl font-semibold">{patientTreatmentStats?.completedTreatments}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewDashboard
