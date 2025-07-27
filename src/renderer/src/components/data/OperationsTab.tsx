import React, { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

// Define StandardizedResponse interface for API responses
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

// Define Operation interface based on the Operations page
interface Operation {
  id: string
  patientId: string
  patientName: string
  dateOfAdmit?: string
  timeOfAdmit?: string
  dateOfOperation?: string
  timeOfOperation?: string
  dateOfDischarge?: string
  timeOfDischarge?: string
  operationDetails?: string
  operationProcedure?: string
  provisionDiagnosis?: string
  operatedBy?: string
  totalAmount?: number
  modeOfPayment?: string
  reviewOn?: string
  part1?: string
  amount1?: number
  days1?: number
  part2?: string
  amount2?: number
  days2?: number
  part3?: string
  amount3?: number
  days3?: number
  part4?: string
  amount4?: number
  days4?: number
  part5?: string
  amount5?: number
  days5?: number
  part6?: string
  amount6?: number
  days6?: number
  part7?: string
  amount7?: number
  days7?: number
  part8?: string
  amount8?: number
  days8?: number
  part9?: string
  amount9?: number
  days9?: number
  part10?: string
  amount10?: number
  days10?: number
}

const OperationsTab: React.FC = () => {
  // State for operations data
  const [operations, setOperations] = useState<Operation[]>([])
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([])
  const [currentPageOperations, setCurrentPageOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Operation>('dateOfOperation')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Constants
  const ITEMS_PER_PAGE = 20

  // Refs
  const observer = useRef<IntersectionObserver | null>(null)
  const lastOperationElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  // Fetch operations data
  useEffect(() => {
    const fetchOperations = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as {
          getOperations?: () => Promise<StandardizedResponse<Operation[]> | Operation[]>
        }
        if (!api.getOperations) {
          throw new Error('API method getOperations is not available')
        }

        const response = await api.getOperations()
        let operationsData: Operation[] = []

        // Handle standardized response format
        if (response && typeof response === 'object') {
          if ('success' in response && 'data' in response) {
            // New standardized format
            const standardizedResponse = response as StandardizedResponse<Operation[]>
            if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
              operationsData = standardizedResponse.data
            } else {
              console.warn(
                'Operations response unsuccessful or data is not an array:',
                standardizedResponse.message || 'No message provided'
              )
              toast.error(
                `Failed to load operations: ${standardizedResponse.message || 'Unknown error'}`
              )
              operationsData = []
            }
          } else if (Array.isArray(response)) {
            // Legacy format (direct array)
            operationsData = response
          } else {
            console.warn('Unexpected operations response format:', response)
            operationsData = []
          }
        }

        setOperations(operationsData)
        setFilteredOperations(operationsData)
        setHasMore(operationsData.length > ITEMS_PER_PAGE)
        setError('')
      } catch (err) {
        console.error('Error loading operations:', err)
        setError('Failed to load operations data')
        toast.error(
          `Failed to load operations: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOperations()
  }, [])

  // Filter and sort operations when search term or sort criteria changes
  useEffect(() => {
    const filtered = operations.filter((operation) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        operation.patientName?.toLowerCase().includes(searchLower) ||
        operation.patientId?.toLowerCase().includes(searchLower) ||
        operation.operationDetails?.toLowerCase().includes(searchLower) ||
        operation.operationProcedure?.toLowerCase().includes(searchLower)
      )
    })

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || ''
      const fieldB = b[sortField]?.toString().toLowerCase() || ''

      // Special handling for numeric fields
      if (['totalAmount'].includes(sortField)) {
        const numA = parseFloat(fieldA) || 0
        const numB = parseFloat(fieldB) || 0
        return sortDirection === 'asc' ? numA - numB : numB - numA
      }

      // Special handling for date fields
      if (['dateOfAdmit', 'dateOfOperation', 'dateOfDischarge', 'reviewOn'].includes(sortField)) {
        const dateA = new Date(fieldA).getTime() || 0
        const dateB = new Date(fieldB).getTime() || 0
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }

      // Default string comparison
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    })

    setFilteredOperations(sorted)
    setPage(1) // Reset to first page when filter/sort changes
  }, [searchTerm, sortField, sortDirection, operations])

  // Update current page operations when page or filtered operations change
  useEffect(() => {
    setCurrentPageOperations(filteredOperations.slice(0, page * ITEMS_PER_PAGE))
    setHasMore(filteredOperations.length > page * ITEMS_PER_PAGE)
  }, [filteredOperations, page])

  // Handle sort click
  const handleSort = (field: keyof Operation): void => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Update current page operations when page or filtered operations change

  // Render sort indicator
  const renderSortIndicator = (field: string): string | null => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return dateString
    }
  }

  // Format currency
  const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined || amount === null) return '₹0.00'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(numAmount)
  }

  return (
    <div className="space-y-4">
      {/* Search and Total Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search by patient name, ID, or operation details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Total Operations: {filteredOperations.length}
        </div>
      </div>

      {/* Operations Table */}
      <div
        className="overflow-x-auto  sm:rounded-lg"
        style={{
          overflowX: 'auto',
          /* Custom scrollbar styling */
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f9fafb'
        }}
      >
        <style>
          {`
          /* Custom scrollbar for WebKit browsers (Chrome, Safari) */
          div::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #f9fafb;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #cbd5e0;
            border-radius: 6px;
          }
          `}
        </style>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('patientId')}
              >
                Patient ID{renderSortIndicator('patientId')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('patientName')}
              >
                Patient Name{renderSortIndicator('patientName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dateOfAdmit')}
              >
                Date of Admission{renderSortIndicator('dateOfAdmit')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('timeOfAdmit')}
              >
                Time of Admission{renderSortIndicator('timeOfAdmit')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dateOfDischarge')}
              >
                Date of Discharge{renderSortIndicator('dateOfDischarge')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('timeOfDischarge')}
              >
                Time of Discharge{renderSortIndicator('timeOfDischarge')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dateOfOperation')}
              >
                Operation Date{renderSortIndicator('dateOfOperation')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('timeOfOperation')}
              >
                Time of Operation{renderSortIndicator('timeOfOperation')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationProcedure')}
              >
                Procedure{renderSortIndicator('operationProcedure')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Details{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Provisional Diagnosis{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Operated By{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 1{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 1{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 1{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 2{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 2{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 2{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 3{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 3{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 3{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 4{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 4{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 4{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 5{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 5{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 5{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 6{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 6{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 6{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 7{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 7{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 7{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 8{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 8{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 8{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 9{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 9{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 9{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Part 10{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Days 10{renderSortIndicator('operationDetails')}
              </th>{' '}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('operationDetails')}
              >
                Amount 10{renderSortIndicator('operationDetails')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalAmount')}
              >
                Total Amount{renderSortIndicator('totalAmount')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('modeOfPayment')}
              >
                Mode of Payment{renderSortIndicator('modeOfPayment')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('reviewOn')}
              >
                Review Date{renderSortIndicator('reviewOn')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageOperations.length > 0 ? (
              currentPageOperations.map((operation, index) => (
                <tr
                  key={operation.id}
                  ref={index === currentPageOperations.length - 1 ? lastOperationElementRef : null}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {operation.patientId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {operation.patientName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(operation.dateOfAdmit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.timeOfAdmit || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(operation.dateOfDischarge)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.timeOfDischarge || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(operation.dateOfOperation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.timeOfOperation || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {operation.operationProcedure || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {operation.operationDetails || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.provisionDiagnosis || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.operatedBy || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part1 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days1 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount1 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days2 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part3 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days3 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount3 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part4 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days4 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount4 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part5 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days5 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount5 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part6 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days6 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount6 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part7 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days7 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount7 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part8 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days8 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount8 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part9 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days9 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount9 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.part10 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.days10 || '-'}
                  </td>{' '}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.amount10 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(operation.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {operation.modeOfPayment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(operation.reviewOn)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? (
                    <div className="flex justify-center items-center">
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
                      <span className="ml-2">Loading operations...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : (
                    'No operations found'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loading indicator for infinite scroll */}
      {loading && page > 1 && (
        <div className="flex justify-center my-4">
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

export default OperationsTab
