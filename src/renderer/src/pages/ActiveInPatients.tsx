import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { InPatient } from './InPatients'
import ActiveInPatientTableWithReceipts from '../components/inpatients/ActiveInPatientTableWithReceipts'

// Define types for API responses
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

const ActiveInPatients: React.FC = () => {
  const [activeInPatients, setActiveInPatients] = useState<InPatient[]>([])
  const [loading, setLoading] = useState(true)

  // Load active in-patients on component mount
  useEffect(() => {
    const fetchActiveInPatients = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const response = (await api.getInPatients()) as ApiResponse<InPatient[]>

        if (response.success) {
          setActiveInPatients(response.data)
        } else {
          console.error('Error loading active in-patients:', response.message)
          toast.error(response.message)
        }
      } catch (err) {
        console.error('Error loading active in-patients:', err)
        toast.error('Failed to load active in-patients')
      } finally {
        setLoading(false)
      }
    }

    fetchActiveInPatients()
  }, [])

  // Handle discharge of in-patient
  const handleDischargeInPatient = async (inpatient: InPatient): Promise<void> => {
    try {
      // Update the in-patient with discharge date and time
      // The dischargeDate field is already set by the DischargeModal component
      const updatedInPatient = {
        id: inpatient.id,
        inpatientData: inpatient
        // dischargeDate is already included from the modal
      }

      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.updateInPatientAll(updatedInPatient)) as ApiResponse<InPatient>

      if (response.success) {
        toast.success('In-patient discharged successfully')
        // Remove the discharged in-patient from the active list
        setActiveInPatients((prev) => prev.filter((ip) => ip.id !== inpatient.id))
      } else {
        toast.error(response.message)
      }
    } catch (err) {
      console.error('Error discharging in-patient:', err)
      toast.error('Failed to discharge in-patient')
    }
  }

  // Handle update of in-patient
  const handleUpdateInPatient = async (
    id: string,
    updatedData: Omit<InPatient, 'id'>
  ): Promise<void> => {
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.updateInPatientAll({
        id,
        inpatientData: updatedData
      })) as ApiResponse<InPatient>

      if (response.success) {
        toast.success('In-patient updated successfully')
        // Update the in-patient in the active list with the response data
        setActiveInPatients((prev) => prev.map((ip) => (ip.id === id ? response.data : ip)))
      } else {
        toast.error(response.message || 'Failed to update in-patient')
      }
    } catch (err) {
      console.error('Error updating in-patient:', err)
      toast.error('Failed to update in-patient')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Active In-Patients</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
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
      <Toaster position="top-right" />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : activeInPatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No active in-patients found</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6 mt-4 bg-white rounded-lg shadow ">
          <ActiveInPatientTableWithReceipts
            inpatients={activeInPatients}
            onDischargeInPatient={handleDischargeInPatient}
            onUpdateInPatient={handleUpdateInPatient}
          />
        </div>
      )}
    </div>
  )
}

export default ActiveInPatients
