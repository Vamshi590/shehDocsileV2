import React, { useState, useEffect } from 'react'
import ReportSearch from '../components/reports/ReportSearch'
import ReportDisplay from '../components/reports/ReportDisplay'
import { toast, Toaster } from 'sonner'

// Define the Prescription type (same as in Prescriptions.tsx)
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Patient type (same as in Prescriptions.tsx)
type Patient = {
  'PATIENT ID': string
  'GUARDIAN NAME': string
  DOB: string
  AGE: number
  GENDER: string
  'PHONE NUMBER': string
  ADDRESS: string
  [key: string]: unknown
}

// Define the Lab type to match with other components
type Lab = {
  id: string
  [key: string]: unknown
}

// Extend the window API interface for TypeScript
// Extend the existing window API interface
declare global {
  interface Window {
    api: {
      getPatients: () => Promise<Patient[]>
      getPrescriptions: () => Promise<Prescription[]>
      addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
      updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
      deletePrescription: (id: string) => Promise<void>
      searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>
      getTodaysPrescriptions: () => Promise<Prescription[]>
      getLatestPrescriptionId: () => Promise<number>
      getPrescriptionsByPatientId: (patientId: string) => Promise<Prescription[]>
      getDropdownOptions: (fieldName: string) => Promise<string[]>
      addDropdownOption: (fieldName: string, value: string) => Promise<void>
      openPdfInWindow: (pdfBuffer: Uint8Array) => Promise<{ success: boolean; error?: string }>
      getLatestPatientId: () => Promise<number>
      getLabs: () => Promise<Lab[]>
      addLab: (lab: Omit<Lab, 'id'>) => Promise<Lab>
      updateLab: (lab: Lab) => Promise<Lab>
      deleteLab: (id: string) => Promise<boolean>
      searchLabs: (patientId: string) => Promise<Lab[]>
      getTodaysLabs: () => Promise<Lab[]>
      getPrescriptionsByDate: (date: string) => Promise<Prescription[]>
    }
  }
}

const Reports: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  // We'll keep patients state even if not used directly in the UI
  // as it might be needed for future enhancements
  const [, setPatients] = useState<Patient[]>([])
  const [foundReports, setFoundReports] = useState<Prescription[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'id' | 'name' | 'phone'>('id')
  // Toast notifications state

  // Load prescriptions and patients on component mount
  useEffect(() => {
    loadPrescriptions()
    loadPatients()
  }, [])

  // Function to load patients from the backend
  const loadPatients = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPatients()
      setPatients(data)
    } catch (err) {
      console.error('Error loading patients:', err)
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  // Function to load prescriptions from the backend
  const loadPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPrescriptions()
      setPrescriptions(data)
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setFoundReports([])

      if (!searchTerm.trim()) {
        setError('Please enter a search term')
        setLoading(false)
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue, 'by', searchType)

      // Filter prescriptions based on search type and term
      let matchedReports: Prescription[] = []

      if (searchType === 'id') {
        // Search by Patient ID
        matchedReports = prescriptions.filter((prescription) => {
          const patientId = String(
            prescription['PATIENT ID'] || prescription.patientId || ''
          ).toLowerCase()
          return patientId === searchValue
        })
      } else if (searchType === 'name') {
        // Search by Patient Name
        matchedReports = prescriptions.filter((prescription) => {
          const patientName = String(prescription['PATIENT NAME'] || '').toLowerCase()
          return patientName.includes(searchValue)
        })
      } else if (searchType === 'phone') {
        // Search by Phone Number
        matchedReports = prescriptions.filter((prescription) => {
          const phoneNumber = String(prescription['PHONE NUMBER'] || '').toLowerCase()
          return phoneNumber.includes(searchValue)
        })
      }

      if (matchedReports.length > 0) {
        console.log('Found reports:', matchedReports)
        setFoundReports(matchedReports)
        setError('')
        toast.success(`Found ${matchedReports.length} reports`)
      } else {
        setFoundReports([])
        setError('No reports found')
      }
    } catch (err) {
      console.error('Error searching reports:', err)
      setError('Failed to search reports')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Patient Reports</h1>
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

        {/* Search Component */}
        <ReportSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          handleSearch={handleSearch}
          loading={loading}
        />

        {/* Report Display Component */}
        {foundReports.length > 0 && <ReportDisplay reports={foundReports} />}

        {/* Toast Container */}
        <Toaster />
      </main>
    </div>
  )
}

export default Reports
