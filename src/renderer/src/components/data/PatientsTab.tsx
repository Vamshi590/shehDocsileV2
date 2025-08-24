import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Patient {
  id: string
  date: string
  patientId: string
  name: string
  guardian: string
  dob: string
  age: number
  gender: string
  phone: string
  address: string
}

// Define standardized response format
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
  totalCount?: number
  page?: number
  pageSize?: number
  totalPages?: number
}

const PatientsTab: React.FC = () => {
  // State for patients data
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortField, setSortField] = useState<keyof Patient>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Constants
  const ITEMS_PER_PAGE = 10

  // Load patients on component mount and when page changes
  useEffect(() => {
    const fetchPatients = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as unknown as {
          getPatients?: (
            page: number,
            pageSize: number
          ) => Promise<StandardizedResponse<Patient[]> | Patient[]>
        }

        if (!api.getPatients) {
          throw new Error('API method getPatients is not available')
        }

        const response = await api.getPatients(currentPage, ITEMS_PER_PAGE)
        let patientsData: Patient[] = []
        let totalItems = 0
        let totalPagesCount = 1
        let currentPageNumber = currentPage

        // Handle standardized response format
        if (response && typeof response === 'object') {
          if ('success' in response && 'data' in response) {
            // New standardized format
            const standardizedResponse = response as StandardizedResponse<Patient[]>
            if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
              patientsData = standardizedResponse.data
              totalItems = standardizedResponse.totalCount || 0
              totalPagesCount = standardizedResponse.totalPages || 1
              currentPageNumber = standardizedResponse.page || 1
            } else {
              console.warn(
                'Patients response unsuccessful or data is not an array:',
                standardizedResponse.message || 'No message provided'
              )
              toast.error(
                `Failed to load patients: ${standardizedResponse.message || 'Unknown error'}`
              )
              patientsData = []
            }
          } else if (Array.isArray(response)) {
            // Legacy format (direct array)
            patientsData = response
            totalItems = response.length
            totalPagesCount = Math.ceil(totalItems / ITEMS_PER_PAGE)
          } else {
            console.warn('Unexpected patients response format:', response)
            patientsData = []
          }
        }

        setPatients(patientsData)
        setTotalCount(totalItems)
        setTotalPages(totalPagesCount)
        setCurrentPage(currentPageNumber)
        setError('')
      } catch (err) {
        console.error('Error loading patients:', err)
        setError('Failed to load patients')
        toast.error(
          `Failed to load patients: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [currentPage])

  // Filter and sort patients when search term or sort criteria changes
  useEffect(() => {
    const filtered = patients.filter((patient) => {
      if (!searchTerm.trim()) return true

      const searchLower = searchTerm.toLowerCase()
      return (
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.phone?.toLowerCase().includes(searchLower) ||
        patient.patientId?.toLowerCase().includes(searchLower)
      )
    })

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || ''
      const fieldB = b[sortField]?.toString().toLowerCase() || ''
      if (sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB)
      } else {
        return fieldB.localeCompare(fieldA)
      }
    })

    setFilteredPatients(sorted)
  }, [patients, searchTerm, sortField, sortDirection])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  // Handle sort column click
  const handleSort = (field: keyof Patient): void => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle page change
  const handlePageChange = (page: number): void => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
  }

  // Render sort indicator
  const renderSortIndicator = (field: keyof Patient): string | null => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  // Generate page numbers for pagination
  const getPageNumbers = (): number[] => {
    const pageNumbers: number[] = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max pages to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always include first page
      pageNumbers.push(1)

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the beginning
      if (currentPage <= 3) {
        startPage = 2
        endPage = Math.min(totalPages - 1, 4)
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3)
        endPage = totalPages - 1
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push(-1) // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2) // -2 represents ellipsis
      }

      // Always include last page
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="space-y-4">
      {/* Search bar and total count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, phone number, or ID..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">Total Patients: {totalCount}</div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Patients table */}
      <div className="overflow-x-auto shadow-sm rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('patientId')}
              >
                ID {renderSortIndicator('patientId')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name {renderSortIndicator('name')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('age')}
              >
                Age {renderSortIndicator('age')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gender')}
              >
                Gender {renderSortIndicator('gender')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('phone')}
              >
                Phone {renderSortIndicator('phone')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Registered {renderSortIndicator('date')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.name}
                    {patient.guardian && (
                      <div className="text-xs text-gray-500">Guardian: {patient.guardian}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {patient.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Loading patients...</span>
                    </div>
                  ) : (
                    'No patients found. Try a different search term.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages} ({totalCount} total records)
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Previous
            </button>

            {getPageNumbers().map((pageNum, index) =>
              pageNum < 0 ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  )
}

export default PatientsTab
