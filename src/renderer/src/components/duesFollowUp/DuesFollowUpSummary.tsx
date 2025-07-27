import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Define StandardizedResponse interface for API responses
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

// Define Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  followUpDate?: string
  reviewOn?: string
  [key: string]: unknown
}

type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  date?: string
  receiptId?: string
  amount?: string | number
  paymentMethod?: string
  amountReceived?: number
  amountDue?: number
  totalAmount?: number
  [key: string]: unknown
}

interface API {
  // Operation methods
  getOperations?: () => Promise<StandardizedResponse<Operation[]> | Operation[]>
  getPatientOperations?: (
    patientId: string
  ) => Promise<StandardizedResponse<Operation[]> | Operation[]>
  addOperation?: (
    operation: Omit<Operation, 'id'>
  ) => Promise<StandardizedResponse<Operation> | Operation>
  updateOperation?: (
    id: string,
    operation: Operation
  ) => Promise<StandardizedResponse<Operation> | Operation>
  deleteOperation?: (id: string) => Promise<StandardizedResponse<void> | void>
  getPrescriptions?: () => Promise<StandardizedResponse<Prescription[]> | Prescription[]>
}

interface DuesFollowUpSummaryProps {
  onClick?: () => void
}

const DuesFollowUpSummary: React.FC<DuesFollowUpSummaryProps> = ({ onClick }) => {
  const [duesCount, setDuesCount] = useState<number>(0)
  const [followUpsCount, setFollowUpsCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Load counts on component mount
    loadCounts()
  }, [])

  // Function to load dues and follow-up counts
  const loadCounts = async (): Promise<void> => {
    try {
      setLoading(true)

      // Load prescriptions to count dues
      if (window.api.getPrescriptions) {
        const response = await window.api.getPrescriptions()
        let prescriptions: Prescription[] = []

        // Handle standardized response format
        if (response && typeof response === 'object') {
          if ('success' in response && 'data' in response) {
            // New standardized format
            const standardizedResponse = response as StandardizedResponse<Prescription[]>
            if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
              prescriptions = standardizedResponse.data
            } else {
              console.warn(
                'Prescriptions response unsuccessful or data is not an array:',
                standardizedResponse.message || 'No message provided'
              )
              toast.error(
                `Failed to load prescriptions: ${standardizedResponse.message || 'Unknown error'}`
              )
            }
          } else if (Array.isArray(response)) {
            // Legacy format (direct array)
            prescriptions = response
          } else {
            console.warn('Unexpected prescriptions response format:', response)
          }
        }

        // Count prescriptions with due amounts
        const prescriptionsWithDues = prescriptions.filter((prescription) => {
          const totalAmount = Number(prescription['TOTAL AMOUNT'] || prescription.AMOUNT || 0)
          const amountReceived = Number(
            prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
          )
          const amountDue = totalAmount - amountReceived
          return amountDue > 0
        })
        setDuesCount(prescriptionsWithDues.length)
      }

      // Load operations to count follow-ups for the next 5 days
      // Check if getOperations exists in the API
      try {
        // Use type assertion to handle potential missing method
        const api = window.api as API
        const getOperations = api.getOperations
        const getPrescriptions = api.getPrescriptions

        // Generate dates for today and the next 4 days (5 days total)
        const followUpDates: string[] = []
        for (let i = 0; i < 5; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          followUpDates.push(date.toISOString().split('T')[0])
        }

        if (typeof getOperations === 'function') {
          const response = await getOperations()
          let operations: Operation[] = []

          // Handle standardized response format
          if (response && typeof response === 'object') {
            if ('success' in response && 'data' in response) {
              // New standardized format
              const standardizedResponse = response as StandardizedResponse<Operation[]>
              if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
                operations = standardizedResponse.data
              } else {
                console.warn(
                  'Operations response unsuccessful or data is not an array:',
                  standardizedResponse.message || 'No message provided'
                )
                toast.error(
                  `Failed to load operations: ${standardizedResponse.message || 'Unknown error'}`
                )
              }
            } else if (Array.isArray(response)) {
              // Legacy format (direct array)
              operations = response
            } else {
              console.warn('Unexpected operations response format:', response)
            }
          }

          // Filter operations with follow-up dates in the next 5 days
          const upcomingFollowUps = operations.filter((operation) => {
            const followUpDate = operation.followUpDate || operation.reviewOn || ''
            return followUpDates.includes(followUpDate)
          })

          setFollowUpsCount((prev) => prev + upcomingFollowUps.length)
        }

        if (typeof getPrescriptions === 'function') {
          const response = await getPrescriptions()
          let prescriptions: Prescription[] = []

          // Handle standardized response format
          if (response && typeof response === 'object') {
            if ('success' in response && 'data' in response) {
              // New standardized format
              const standardizedResponse = response as StandardizedResponse<Prescription[]>
              if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
                prescriptions = standardizedResponse.data
              } else {
                console.warn(
                  'Prescriptions response unsuccessful or data is not an array:',
                  standardizedResponse.message || 'No message provided'
                )
                toast.error(
                  `Failed to load prescriptions: ${standardizedResponse.message || 'Unknown error'}`
                )
              }
            } else if (Array.isArray(response)) {
              // Legacy format (direct array)
              prescriptions = response
            } else {
              console.warn('Unexpected prescriptions response format:', response)
            }
          }

          // Filter prescriptions with follow-up dates in the next 5 days
          const upcomingFollowUps = prescriptions.filter((prescription) => {
            const followUpDate = String(prescription['FOLLOW UP DATE'] || '')
            return followUpDates.includes(followUpDate)
          })

          setFollowUpsCount((prev) => prev + upcomingFollowUps.length)
        }
      } catch (error) {
        console.error('getOperations not available:', error)
      }
    } catch (err) {
      console.error('Error loading dues/follow-up counts:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
    >
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Dues / Follow-Up</h3>
      </div>

      <div className="ml-16 flex items-center space-x-4">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">📌 Dues:</span>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {duesCount}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Follow-Ups:</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {Math.round(followUpsCount / 2)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DuesFollowUpSummary
