import React, { JSX, useState } from 'react'

interface MappingFiltersProps {
  data: {
    regions: string[]
    departments: string[]
    staff: StaffMember[]
    patientDistribution: RegionData[]
    revenueDistribution: RegionData[]
  } | null
  timeFilter: 'today' | 'week' | 'month' | 'custom'
}

interface StaffMember {
  id: string
  name: string
}

interface RegionData {
  region: string
  name: string
  count: number
  percentage: number
  revenue?: number
}

interface FilterOption {
  id: string
  label: string
}

const MappingFilters: React.FC<MappingFiltersProps> = ({ data }) => {
  const [activeView, setActiveView] = useState<'map' | 'filters'>('map')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })

  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  // Extract data for mapping and filters
  const { regions, departments, staff, patientDistribution, revenueDistribution } = data

  // Filter options
  const regionOptions: FilterOption[] = regions?.map((region: string) => ({
    id: region,
    label: region
  }))

  const departmentOptions: FilterOption[] = departments?.map((dept: string) => ({
    id: dept,
    label: dept
  }))

  const staffOptions: FilterOption[] = staff?.map((person: StaffMember) => ({
    id: person.id,
    label: person.name
  }))

  // Handle filter changes
  const handleRegionChange = (region: string | null): void => {
    setSelectedRegion(region)
  }

  const handleDepartmentChange = (department: string | null): void => {
    setSelectedDepartment(department)
  }

  const handleStaffChange = (staff: string | null): void => {
    setSelectedStaff(staff)
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string): void => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const applyFilters = (): void => {
    // In a real implementation, this would trigger an API call to fetch filtered data
    console.log('Applying filters:', {
      region: selectedRegion,
      department: selectedDepartment,
      staff: selectedStaff,
      dateRange
    })
  }

  const resetFilters = (): void => {
    setSelectedRegion(null)
    setSelectedDepartment(null)
    setSelectedStaff(null)
    setDateRange({ start: '', end: '' })
  }

  // Render the map view
  const renderMapView = (): JSX.Element => {
    return (
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Patient Distribution by Region</h3>
          <div className="relative h-96 bg-gray-50 rounded-lg border border-gray-200">
            {/* This would be replaced with an actual map component like react-leaflet or google-maps-react */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-gray-500">Interactive map would be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">
                  Showing patient distribution across regions
                </p>
              </div>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Patient Count</h4>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-blue-200"></div>
                <span className="text-xs text-gray-600">1-10</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-blue-400"></div>
                <span className="text-xs text-gray-600">11-50</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-blue-600"></div>
                <span className="text-xs text-gray-600">51-100</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-sm bg-blue-800"></div>
                <span className="text-xs text-gray-600">100+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Regions by Patient Count */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Top Regions by Patient Count</h3>
            <div className="space-y-4">
              {patientDistribution?.slice(0, 5)?.map((region: RegionData, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">{region?.name}</div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${(region.count / patientDistribution[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-800">
                    {region.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Regions by Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Top Regions by Revenue</h3>
            <div className="space-y-4">
              {revenueDistribution?.slice(0, 5)?.map((region: RegionData, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">{region?.name}</div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                        style={{
                          width: `${((region.revenue ?? 0) / (revenueDistribution[0]?.revenue ?? 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm font-medium text-gray-800">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(region.revenue ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render the filters view
  const renderFiltersView = (): JSX.Element => {
    return (
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-6">Advanced Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Region Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedRegion || ''}
                onChange={(e) => handleRegionChange(e.target.value || null)}
              >
                <option value="">All Regions</option>
                {regionOptions?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedDepartment || ''}
                onChange={(e) => handleDepartmentChange(e.target.value || null)}
              >
                <option value="">All Departments</option>
                {departmentOptions?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member</label>
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedStaff || ''}
                onChange={(e) => handleStaffChange(e.target.value || null)}
              >
                <option value="">All Staff</option>
                {staffOptions?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Filtered Results Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Filtered Results Preview</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Region
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Department
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patients
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
                    Avg. Per Patient
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* This would be populated with actual filtered data */}
                {patientDistribution.slice(0, 5).map((region: RegionData, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {departments[index % departments.length]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {region.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(revenueDistribution[index]?.revenue ?? 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format((revenueDistribution[index]?.revenue ?? 0) / (region.count || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing 5 of {patientDistribution.length} results
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Regional Analysis</h3>
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveView('map')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                activeView === 'map' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setActiveView('filters')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                activeView === 'filters' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Render active view */}
      {activeView === 'map' ? renderMapView() : renderFiltersView()}
    </div>
  )
}

export default MappingFilters
