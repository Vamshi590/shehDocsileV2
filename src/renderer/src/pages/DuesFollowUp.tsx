import React, { useState, useEffect } from 'react'
import DuesSection from '../components/duesFollowUp/DuesSection'
import FollowUpSection from '../components/duesFollowUp/FollowUpSection'
import { toast, Toaster } from 'sonner'

// Define the Prescription type
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

// Define Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  operatedBy: string
  followUpDate?: string
  reviewOn?: string
  [key: string]: unknown
}

// Define standardized response format
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

// Define API interface for window.api
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

  // Prescription methods
  getPrescriptions?: () => Promise<StandardizedResponse<Prescription[]> | Prescription[]>
  updatePrescription?: (
    id: string,
    prescription: Prescription
  ) => Promise<StandardizedResponse<Prescription> | Prescription>
}

const DuesFollowUp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'followup'>('dues')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // Toast notifications state
  const [followUpPrescriptions, setFollowUpPrescriptions] = useState<Prescription[]>([])

  // Load prescriptions and operations on component mount
  useEffect(() => {
    loadPrescriptions()
    loadOperations()
    loadFollowUpPrescriptions()
  }, [])

  // Function to load prescriptions from the backend
  const loadPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await window.api.getPrescriptions()

      // Handle standardized response format
      let prescriptionsData: Prescription[] = []

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // New standardized format
          const standardizedResponse = response as StandardizedResponse<Prescription[]>
          if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
            prescriptionsData = standardizedResponse.data
          } else {
            console.warn(
              'Prescription response unsuccessful or data is not an array:',
              standardizedResponse.message || 'No message provided'
            )
            prescriptionsData = []
          }
        } else if (Array.isArray(response)) {
          // Legacy format (direct array)
          prescriptionsData = response
        } else {
          console.warn('Unexpected prescriptions response format:', response)
          prescriptionsData = []
        }
      }

      // Filter prescriptions with due amounts
      const prescriptionsWithDues = prescriptionsData.filter((prescription) => {
        const totalAmount = Number(prescription['TOTAL AMOUNT'] || prescription.AMOUNT || 0)
        const amountReceived = Number(
          prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
        )
        const amountDue = totalAmount - amountReceived
        return amountDue > 0
      })

      setPrescriptions(prescriptionsWithDues)
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to load operations from the backend
  const loadOperations = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as API
      // Check if getOperations method exists
      if (api.getOperations) {
        const response = await api.getOperations()

        // Handle standardized response format
        let operationsData: Operation[] = []

        if (response && typeof response === 'object') {
          if ('success' in response && 'data' in response) {
            // New standardized format
            const standardizedResponse = response as StandardizedResponse<Operation[]>
            if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
              operationsData = standardizedResponse.data
            } else {
              console.warn(
                'Operation response unsuccessful or data is not an array:',
                standardizedResponse.message || 'No message provided'
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

        // Generate dates for today and the next 4 days (5 days total)
        const followUpDates: string[] = []
        for (let i = 0; i < 5; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          followUpDates.push(date.toISOString().split('T')[0])
        }

        // Filter operations with follow-up dates in the next 5 days
        const upcomingFollowUps = operationsData.filter((operation) => {
          const followUpDate = operation.followUpDate || operation.reviewOn || ''
          return followUpDates.includes(followUpDate)
        })

        setOperations(upcomingFollowUps)
      } else {
        console.error('getOperations method not available')
        setError('Failed to load operations: API method not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError('Failed to load operations')
    } finally {
      setLoading(false)
    }
  }

  const loadFollowUpPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await window.api.getPrescriptions()

      // Handle standardized response format
      let prescriptionsData: Prescription[] = []

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // New standardized format
          const standardizedResponse = response as StandardizedResponse<Prescription[]>
          if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
            prescriptionsData = standardizedResponse.data
          } else {
            console.warn(
              'Prescription response unsuccessful or data is not an array:',
              standardizedResponse.message || 'No message provided'
            )
            prescriptionsData = []
          }
        } else if (Array.isArray(response)) {
          // Legacy format (direct array)
          prescriptionsData = response
        } else {
          console.warn('Unexpected prescriptions response format:', response)
          prescriptionsData = []
        }
      }

      // Check if prescriptions data exists
      if (prescriptionsData.length > 0) {
        // Generate dates for today and the next 4 days (5 days total)
        const followUpDates: string[] = []
        for (let i = 0; i < 5; i++) {
          const date = new Date()
          date.setDate(date.getDate() + i)
          followUpDates.push(date.toISOString().split('T')[0])
        }

        // Filter prescriptions with follow-up dates in the next 5 days
        const upcomingFollowUps = prescriptionsData.filter((prescription) => {
          const followUpDate = String(prescription['FOLLOW UP DATE'] || '')
          return followUpDates.includes(followUpDate)
        })

        setFollowUpPrescriptions(upcomingFollowUps)
      } else {
        console.error('No prescription data available')
        setFollowUpPrescriptions([])
      }
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to update due amount
  const handleUpdateDue = async (id: string, updatedAmount: number): Promise<void> => {
    try {
      setLoading(true)

      // Find the prescription to update
      const prescription = prescriptions.find((p) => p.id === id)

      if (!prescription) {
        throw new Error('Prescription not found')
      }

      // Calculate total amount from the prescription
      const totalAmount = Number(
        prescription['TOTAL AMOUNT'] || prescription.AMOUNT || prescription.amount || 0
      )

      // If marking as paid (updatedAmount = 0), set amountReceived to totalAmount
      const amountReceived =
        updatedAmount === 0
          ? totalAmount
          : Number(prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0)

      // Update both amountDue and amountReceived fields
      const updatedPrescription = {
        ...prescription,
        amountDue: updatedAmount,
        'AMOUNT DUE': updatedAmount,
        amountReceived: amountReceived,
        'AMOUNT RECEIVED': amountReceived // Update both formats for compatibility
      }

      // Call the API to update the prescription
      const response = await window.api.updatePrescription(id, updatedPrescription)

      // Check if response has standardized format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as unknown as StandardizedResponse<Prescription>
        if (!standardizedResponse.success) {
          throw new Error(standardizedResponse.message || 'Update failed')
        }
      }

      // Refresh the prescriptions list
      await loadPrescriptions()

      const message =
        updatedAmount === 0 ? 'Payment marked as complete' : 'Due amount updated successfully'
      toast.success(message)
    } catch (err) {
      console.error('Error updating due amount:', err)
      toast.error(
        `Failed to update due amount: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Dues & Follow-Up</h1>
            <p className="text-sm text-gray-500">Sri Harshini Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
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
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
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
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dues')}
                className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === 'dues'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dues
              </button>
              <button
                onClick={() => setActiveTab('followup')}
                className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === 'followup'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Follow-Up
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dues' ? (
          <DuesSection
            prescriptions={prescriptions}
            loading={loading}
            onUpdateDue={handleUpdateDue}
          />
        ) : (
          <FollowUpSection
            operations={operations}
            prescriptions={followUpPrescriptions}
            loading={loading}
          />
        )}

        {/* Toast Container */}
        <Toaster />
      </main>
    </div>
  )
}

export default DuesFollowUp
