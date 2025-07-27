import React, { useState, useEffect } from 'react'
import OverviewDashboard from '../components/analytics/OverviewDashboard'
import DetailedGraphs from '../components/analytics/DetailedGraphs'
import SmartSuggestions from '../components/analytics/SmartSuggestions'
import MappingFilters from '../components/analytics/MappingFilters'
import { AnalyticsData, MappingRegionData, MappingStaffMember } from '../types/analytics'

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'suggestions' | 'reports'>(
    'overview'
  )
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'custom'>('month')
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // Load analytics data based on selected time filter
  useEffect(() => {
    const fetchAnalyticsData = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)

        // Use type assertion for API calls
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

        let startDate: string
        let endDate = new Date().toISOString().split('T')[0] // Today

        // Calculate start date based on time filter
        switch (timeFilter) {
          case 'today':
            startDate = endDate
            break
          case 'week':
            startDate = new Date(new Date().setDate(new Date().getDate() - 7))
              .toISOString()
              .split('T')[0]
            break
          case 'month':
            startDate = new Date(new Date().setDate(new Date().getDate() - 30))
              .toISOString()
              .split('T')[0]
            break
          case 'custom':
            startDate = customDateRange.start
            endDate = customDateRange.end
            break
          default:
            startDate = new Date(new Date().setDate(new Date().getDate() - 30))
              .toISOString()
              .split('T')[0]
        }

        // Fetch analytics data from API
        const data = (await api.getAnalyticsData(startDate, endDate)) as AnalyticsData
        console.log(data)
        setAnalyticsData(data)
      } catch (err) {
        console.error('Error loading analytics data:', err)
        setError('Failed to load analytics data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [timeFilter, customDateRange])

  // Handle time filter change
  const handleTimeFilterChange = (filter: 'today' | 'week' | 'month' | 'custom'): void => {
    setTimeFilter(filter)
  }

  // Handle custom date range change
  const handleDateRangeChange = (start: string, end: string): void => {
    setCustomDateRange({ start, end })
  }

  // Handle export data
  const handleExportData = (format: 'pdf' | 'csv' | 'excel'): void => {
    const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

    try {
      api.exportAnalyticsData(
        activeTab,
        timeFilter === 'custom' ? customDateRange.start : undefined,
        timeFilter === 'custom' ? customDateRange.end : undefined,
        timeFilter !== 'custom' ? timeFilter : undefined,
        format
      )
    } catch (err) {
      console.error('Error exporting data:', err)
      setError('Failed to export data. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>

          {/* Time Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex p-1">
              <button
                onClick={() => handleTimeFilterChange('today')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  timeFilter === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleTimeFilterChange('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  timeFilter === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => handleTimeFilterChange('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  timeFilter === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => handleTimeFilterChange('custom')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  timeFilter === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Export Controls */}
            <div className="relative group">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 hidden group-hover:block z-20">
                <div className="py-1">
                  <button
                    onClick={() => handleExportData('pdf')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExportData('excel')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.hash = '/dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Selector (visible only when custom is selected) */}
        {timeFilter === 'custom' && (
          <div className="max-w-7xl mx-auto px-6 py-3 sm:px-8 lg:px-10 flex items-center space-x-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
                Start Date:
              </label>
              <input
                type="date"
                id="start-date"
                value={customDateRange.start}
                onChange={(e) => handleDateRangeChange(e.target.value, customDateRange.end)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
                End Date:
              </label>
              <input
                type="date"
                id="end-date"
                value={customDateRange.end}
                onChange={(e) => handleDateRangeChange(customDateRange.start, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 border-t border-gray-100">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10 flex-grow w-full">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Active Tab Content */}
            {activeTab === 'overview' && (
              <OverviewDashboard data={analyticsData} timeFilter={timeFilter} />
            )}
            {activeTab === 'trends' && (
              <DetailedGraphs data={analyticsData} timeFilter={timeFilter} />
            )}
            {activeTab === 'suggestions' && <SmartSuggestions data={analyticsData} />}
            {activeTab === 'reports' && (
              <MappingFilters
                data={{
                  regions: analyticsData?.regions || [],
                  departments: analyticsData?.departments || [],
                  staff:
                    analyticsData?.staff?.map((s) => {
                      // Convert StaffMember to MappingStaffMember
                      const mappingStaff: MappingStaffMember = {
                        id: s.id || s.name,
                        name: s.name
                      }
                      return mappingStaff
                    }) || [],
                  patientDistribution:
                    analyticsData?.patientDistribution?.map((d) => {
                      // Convert RegionData to MappingRegionData
                      const mappingRegion: MappingRegionData = {
                        region: d.region || d.name,
                        name: d.name,
                        count: d.count || 0,
                        percentage: d.percentage || 0
                      }
                      return mappingRegion
                    }) || [],
                  revenueDistribution:
                    analyticsData?.revenueDistribution?.map((d) => {
                      // Convert RegionData to MappingRegionData
                      const mappingRegion: MappingRegionData = {
                        region: d.region || d.name,
                        name: d.name,
                        count: d.count || 0,
                        percentage: d.percentage || 0,
                        revenue: d.value // Map value to revenue
                      }
                      return mappingRegion
                    }) || []
                }}
                timeFilter={timeFilter}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Analytics
