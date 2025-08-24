import React, { useState, useEffect } from 'react'
import DuesSection from '../components/duesFollowUp/DuesSection'
import FollowUpSection, {
  Prescription,
  Operation
} from '../components/duesFollowUp/FollowUpSection'
import { toast, Toaster } from 'sonner'

// Using imported types from FollowUpSection.tsx

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

  // Follow-up methods
  getFollowUps?: () => Promise<
    StandardizedResponse<Array<Prescription | Operation>> | Array<Prescription | Operation>
  >

  // Dues methods
  getdues?: () => Promise<StandardizedResponse<Prescription[]> | Prescription[]>
  updateDue?: (
    id: string,
    type?: string,
    updatedAmount?: number,
    receivedAmount?: number
  ) => Promise<StandardizedResponse<Prescription> | Prescription>
}

// Define a local prescription type for dues that doesn't require the 'type' field
interface LocalPrescription {
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
  type?: string
  [key: string]: unknown
}

const DuesFollowUp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'followup'>('dues')
  const [prescriptions, setPrescriptions] = useState<LocalPrescription[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // Toast notifications state
  const [followUpPrescriptions, setFollowUpPrescriptions] = useState<
    Array<Prescription | Operation>
  >([])

  // Load prescriptions and operations on component mount
  useEffect(() => {
    loadPrescriptions()
    loadFollowUps()
  }, [])

  // Function to load prescriptions from the backend
  const loadPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await window.api.getdues()

      console.log('Dues:', response)

      // Handle standardized response format
      let prescriptionsData: LocalPrescription[] = []

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
        const amountDue = Number(
          prescription.amountDue || prescription['AMOUNT DUE'] || prescription.balanceAmount || 0
        )
        return amountDue > 0
      })

      // Cast to LocalPrescription[] since we're handling dues differently than follow-ups
      setPrescriptions(prescriptionsWithDues as LocalPrescription[])
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  const loadFollowUps = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as unknown as API

      // Check if getFollowUps method exists
      if (!api.getFollowUps) {
        console.error('getFollowUps method not available')
        setError('Failed to load follow-ups: API method not available')
        return
      }

      const response = await api.getFollowUps()

      // Handle standardized response format
      let followUpsData: Array<Prescription | Operation> = []

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // New standardized format
          const standardizedResponse = response as StandardizedResponse<Prescription[]>
          if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
            followUpsData = standardizedResponse.data
          } else {
            console.warn(
              'Follow-ups response unsuccessful or data is not an array:',
              standardizedResponse.message || 'No message provided'
            )
            followUpsData = []
          }
        } else if (Array.isArray(response)) {
          // Legacy format (direct array)
          followUpsData = response
        } else {
          console.warn('Unexpected follow-ups response format:', response)
          followUpsData = []
        }
      }

      console.log('Follow-ups loaded:', followUpsData.length)
      setFollowUpPrescriptions(followUpsData)
    } catch (err) {
      console.error('Error loading follow-ups:', err)
      setError('Failed to load follow-ups')
    } finally {
      setLoading(false)
    }
  }

  // Function to update due amount
  const handleUpdateDue = async (
    id: string,
    type?: string,
    updatedAmount?: number,
    receivedAmount?: number
  ): Promise<void> => {
    try {
      setLoading(true)

      // Find the due record to update
      const dueRecord = prescriptions.find((p) => p.id === id)

      if (!dueRecord) {
        throw new Error('Due record not found')
      }

      // Get the type of the due record (prescription, inpatient, or labs)
      const dueType = type || (dueRecord.type as string) || 'prescription'
      console.log(`Updating due of type: ${dueType} with ID: ${id} to amount: ${updatedAmount}`)

      // Use the unified updateDue handler for all due types
      const response = await window.api.updateDue(id, dueType, updatedAmount, receivedAmount)

      // Check if response has standardized format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as unknown as StandardizedResponse<unknown>
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

          {/* OP/IP Toggle Switch */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'dues' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Dues
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'followup' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Follow-Up
            </button>
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

        {/* Content based on active tab */}
        {activeTab === 'dues' ? (
          <DuesSection
            prescriptions={prescriptions}
            loading={loading}
            onUpdateDue={handleUpdateDue}
          />
        ) : (
          <FollowUpSection
            prescriptions={followUpPrescriptions.map((item) => {
              // Ensure each item has a type field
              if (!item.type) {
                // Create a new object with all properties from item plus the type property
                const itemWithType = Object.assign({}, item, { type: 'prescription' as const })
                return itemWithType
              }
              return item
            })}
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
