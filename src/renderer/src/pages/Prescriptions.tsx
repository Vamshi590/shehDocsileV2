import React, { useState, useEffect } from 'react'
import PrescriptionForm from '../components/prescriptions/PrescriptionForm'
import PrescriptionTableWithReceipts from '../components/prescriptions/PrescriptionTableWithReceipts'
import PrescriptionEditModal from '../components/prescriptions/PrescriptionEditModal'
import EyeReadingEditModal from '../components/prescriptions/EyeReadingEditModal'
import ReceiptForm, { Patient as ReceiptFormPatient } from '../components/prescriptions/ReceiptForm'
import ReadingForm from '../components/prescriptions/ReadingForm'
import { toast, Toaster } from 'sonner'
// Define the Prescription type
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Patient type
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

// Define the Lab and Patient types
type Lab = {
  id: string
  [key: string]: unknown
}

// Define the window API interface for TypeScript
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
    }
  }
}

const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState(false)
  const [editingEyeReading, setEditingEyeReading] = useState<Prescription | null>(null)
  const [isEyeReadingModalOpen, setIsEyeReadingModalOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState('')
  // Track the current active receipt to link prescriptions and readings to it
  const [currentReceipt, setCurrentReceipt] = useState<Prescription | null>(null)
  // Track if prescription and eye reading have been added to the current receipt
  const [hasPrescription, setHasPrescription] = useState<boolean>(false)
  const [hasEyeReading, setHasEyeReading] = useState<boolean>(false)

  // Reset prescription and eye reading flags when current receipt changes
  useEffect(() => {
    if (!currentReceipt) {
      setHasPrescription(false)
      setHasEyeReading(false)
    }
  }, [currentReceipt])
  // Toast notifications state

  // Load prescriptions and patients on component mount
  useEffect(() => {
    loadPrescriptions()
    loadPatients()
  }, [])

  const getCurrentUser = (): string => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return currentUser.fullName || currentUser.username || 'Unknown User'
  }
  // Define the standardized response type
  interface StandardizedResponse<T> {
    success: boolean
    data: T | null
    message?: string
  }

  // Function to load patients from the backend
  const loadPatients = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await window.api.getPatients()

      // Handle standardized response format
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // New standardized format
          const standardizedResponse = response as StandardizedResponse<Patient[]>
          if (standardizedResponse.success && standardizedResponse.data) {
            setPatients(standardizedResponse.data)
          } else {
            setError(standardizedResponse.message || 'Failed to load patients')
          }
        } else {
          // Legacy format - direct array of patients
          setPatients(response as Patient[])
        }
      } else {
        setError('Invalid response format from server')
      }
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
      const data = await window.api.getTodaysPrescriptions()
      setPrescriptions(data)
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle adding a new prescription
  const handleAddPrescription = async (formData: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      console.log('Adding prescription with form data:', formData)

      // Initialize patient details
      let patientDetails = {}

      // Priority 1: If we have a current receipt, use its patient details and UPDATE the receipt
      if (currentReceipt) {
        console.log('Using patient details from current receipt:', currentReceipt)

        // Extract receipt ID and patient ID
        const receiptId = typeof currentReceipt.id === 'string' ? currentReceipt.id : ''
        const patientId =
          typeof currentReceipt['PATIENT ID'] === 'string'
            ? currentReceipt['PATIENT ID']
            : typeof currentReceipt.patientId === 'string'
              ? currentReceipt.patientId
              : ''

        // Extract all patient details from the receipt
        patientDetails = {
          'PATIENT ID': patientId,
          'PATIENT NAME': currentReceipt['PATIENT NAME'] || '',
          'GUARDIAN NAME': currentReceipt['GUARDIAN NAME'] || '',
          'PHONE NUMBER': currentReceipt['PHONE NUMBER'] || '',
          AGE: currentReceipt.AGE || '',
          GENDER: currentReceipt.GENDER || '',
          ADDRESS: currentReceipt.ADDRESS || '',
          DOB: currentReceipt.DOB || ''
        }

        // Instead of creating a new record, update the existing receipt with prescription data
        const updatedReceiptData = {
          ...currentReceipt,
          ...formData, // Add the prescription data to the receipt
          // Make sure we preserve the original patient details and receipt type
          ...patientDetails,
          TYPE: 'RECEIPT', // Keep it as a receipt
          receiptId, // Keep the receipt ID link
          patientId, // Keep the patient ID
          // Preserve the original date
          DATE: currentReceipt.DATE || new Date().toISOString().split('T')[0]
        }

        // Update the existing receipt instead of creating a new record
        const updatedReceipt = await window.api.updatePrescription(
          receiptId,
          updatedReceiptData as Prescription
        )

        // Update the current receipt in state
        setCurrentReceipt(updatedReceipt)

        // Close form and show success message
        await loadPrescriptions()
        setShowAddForm(false)
        setError('')
        setHasPrescription(true)
        toast.success('Prescription added successfully')
      }
      // Priority 2: If we have a found patient from search but no receipt, create a new receipt
      else if (foundPatient) {
        console.log('Using patient details from search:', foundPatient)

        patientDetails = {
          'PATIENT ID': foundPatient['PATIENT ID'] || '',
          'PATIENT NAME': foundPatient.name || '',
          'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || '',
          'PHONE NUMBER': foundPatient['PHONE NUMBER'] || '',
          AGE: foundPatient.AGE || '',
          GENDER: foundPatient.GENDER || '',
          ADDRESS: foundPatient.ADDRESS || '',
          DOB: foundPatient.DOB || ''
        }

        // Create a new receipt with patient details and prescription data
        const receiptData = {
          ...formData,
          ...patientDetails,
          TYPE: 'RECEIPT',
          patientId: foundPatient['PATIENT ID'] || '',
          DATE: formData.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Creating new receipt with patient details and prescription data:', receiptData)
        const newReceipt = await window.api.addPrescription(receiptData)
        console.log('Created new receipt with patient details and prescription data:', newReceipt)

        // Set this as the current receipt
        setCurrentReceipt(newReceipt)

        // Close form and show success message
        await loadPrescriptions()
        setShowAddForm(false)
        setError('')
        setHasPrescription(true)
        toast.success('Prescription added successfully')
      }
      // Priority 3: No receipt or found patient, create a new receipt with just the form data
      else {
        console.log('No receipt or found patient, creating new receipt with form data only')

        // Create a new receipt with just the form data
        const receiptData = {
          ...formData,
          TYPE: 'RECEIPT',
          DATE: formData.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Creating new receipt with form data only:', receiptData)
        const newReceipt = await window.api.addPrescription(receiptData)
        console.log('Created new receipt with form data only:', newReceipt)

        // Set this as the current receipt
        setCurrentReceipt(newReceipt)
        await loadPrescriptions()
        setShowAddForm(false)
        setError('')
        setHasPrescription(true)
        toast.success('Prescription added successfully')
      }

      // All cases now handle their own success flow with form closing and toast notifications
    } catch (err) {
      console.error('Error adding prescription:', err)
      setError('Failed to add prescription')
    } finally {
      setLoading(false)
    }
  }

  // Convert Patient type from Prescriptions.tsx to the Patient interface expected by ReceiptForm.tsx
  const convertToReceiptFormPatient = (patient: Patient): ReceiptFormPatient => {
    // IMPORTANT: The patient object structure uses camelCase fields, not uppercase fields
    // Extract fields directly from the patient object based on the actual structure we see in the logs

    // First try direct field access for the most common structure
    const patientId = String(patient.patientId || '')
    const patientName = String(patient.name || '')
    const guardianName = String(patient.guardian || '')
    const phoneNumber = String(patient.phone || '')

    // Handle age - it could be in age field or calculated from dob
    let age = ''
    if ('age' in patient) {
      age = String(patient.age || '')
    } else if ('dob' in patient && typeof patient.dob === 'string') {
      // Calculate age from DOB if available and it's a valid string
      try {
        const dobDate = new Date(patient.dob)
        const today = new Date()
        age = String(today.getFullYear() - dobDate.getFullYear())
      } catch (error) {
        console.error('Error calculating age from DOB:', error)
        age = ''
      }
    }

    const gender = String(patient.gender || '')
    const address = String(patient.address || '')

    // Extract DOB if available
    const dob = 'dob' in patient && typeof patient.dob === 'string' ? patient.dob : ''

    // Create the converted patient object with the correct field names
    const convertedPatient = {
      id: patientId,
      date: new Date().toISOString().split('T')[0],
      patientId: patientId,
      name: patientName,
      guardian: guardianName,
      phone: phoneNumber,
      age: age,
      gender: gender,
      address: address,
      dob: dob
    }
    return convertedPatient
  }

  // Function to fetch prescriptions from the API
  const fetchPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPrescriptions()
      setPrescriptions(data)
      console.log('Fetched prescriptions:', data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      setError('Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle completing a patient visit
  const handleCompleteVisit = async (): Promise<void> => {
    try {
      // Clear current receipt state
      setCurrentReceipt(null)

      // Reset UI states
      setShowAddForm(false)
      setShowReceiptForm(false)
      setShowReadingForm(false)
      setIsModalOpen(false)

      // Reset patient search if needed
      setFoundPatient(null)
      setSearchTerm('')

      // Refresh prescriptions list
      await fetchPrescriptions()
      console.log('Patient visit completed, UI reset')
      // Show success toast
      toast.success('Patient visit completed')
    } catch (error) {
      console.error('Error completing patient visit:', error)
      setError('Failed to complete patient visit')
    }
  }

  // Function to handle adding a new receipt
  const handleAddReceipt = async (formData: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)

      // Log the raw form data to verify what we're receiving
      console.log('Raw receipt form data received:', formData)

      // Extract patient details from form data
      const patientId = formData['PATIENT ID'] || ''
      const patientName = formData['PATIENT NAME'] || ''
      const guardianName = formData['GUARDIAN NAME'] || ''
      const phoneNumber = formData['PHONE NUMBER'] || ''
      const age = formData.AGE || ''
      const gender = formData.GENDER || ''
      const address = formData.ADDRESS || ''

      console.log('Extracted patient details from form:', {
        patientId,
        patientName,
        guardianName,
        phoneNumber,
        age,
        gender,
        address
      })

      // Create the receipt data with explicit patient fields
      const receiptData = {
        ...formData,
        // Explicitly include all patient fields with proper names
        'PATIENT ID': patientId,
        'PATIENT NAME': patientName,
        'GUARDIAN NAME': guardianName,
        'PHONE NUMBER': phoneNumber,
        AGE: age,
        GENDER: gender,
        ADDRESS: address,
        patientId: patientId, // Also include patientId as a separate field
        TYPE: 'RECEIPT',
        DATE: formData.DATE || new Date().toISOString().split('T')[0] // Ensure we have a date
      }

      console.log('Final receipt data to be saved:', receiptData)

      // Add the receipt and get the newly created receipt with its ID
      const newReceipt = await window.api.addPrescription(receiptData)
      console.log('Added receipt with patient details:', newReceipt)

      // Set this as the current receipt we're working with
      setCurrentReceipt(newReceipt)

      // Hide the receipt form after creating
      setShowReceiptForm(false)

      await loadPrescriptions()
      setError('')
      // Show success toast
      toast.success('Receipt added successfully')
    } catch (err) {
      console.error('Error adding receipt:', err)
      setError('Failed to add receipt')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle adding a new eye reading
  const handleAddReading = async (reading: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      setError('')

      // If we have a found patient from search, add their details to the reading
      let patientDetails = {}
      if (foundPatient) {
        patientDetails = {
          'PATIENT ID': foundPatient['PATIENT ID'] || '',
          'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || '',
          'PHONE NUMBER': foundPatient['PHONE NUMBER'] || '',
          AGE: foundPatient.AGE || '',
          GENDER: foundPatient.GENDER || '',
          ADDRESS: foundPatient.ADDRESS || ''
        }
      }

      // If we have a current receipt, update it with the reading data
      if (currentReceipt) {
        const receiptId = typeof currentReceipt.id === 'string' ? currentReceipt.id : ''
        const patientId =
          typeof currentReceipt['PATIENT ID'] === 'string'
            ? currentReceipt['PATIENT ID']
            : typeof currentReceipt.patientId === 'string'
              ? currentReceipt.patientId
              : ''

        // Extract all patient details from the receipt
        const receiptPatientDetails = {
          'PATIENT ID': patientId,
          'PATIENT NAME': currentReceipt['PATIENT NAME'] || '',
          'GUARDIAN NAME': currentReceipt['GUARDIAN NAME'] || '',
          'PHONE NUMBER': currentReceipt['PHONE NUMBER'] || '',
          AGE: currentReceipt.AGE || '',
          GENDER: currentReceipt.GENDER || '',
          ADDRESS: currentReceipt.ADDRESS || '',
          DOB: currentReceipt.DOB || ''
        }

        // Update the existing receipt with reading data
        const updatedReceiptData = {
          ...currentReceipt,
          ...reading, // Add the reading data to the receipt
          // Make sure we preserve the original patient details and receipt type
          ...receiptPatientDetails,
          TYPE: 'RECEIPT', // Keep it as a receipt
          receiptId, // Keep the receipt ID link
          patientId, // Keep the patient ID
          // Preserve the original date
          DATE: currentReceipt.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Updating receipt with reading data:', updatedReceiptData)
        // Update the existing receipt instead of creating a new record
        const updatedReceipt = await window.api.updatePrescription(
          receiptId,
          updatedReceiptData as Prescription
        )
        console.log('Updated receipt with reading data:', updatedReceipt)

        // Update the current receipt in state
        if (updatedReceipt) {
          setCurrentReceipt(updatedReceipt)
          setHasEyeReading(true)
          toast.success('Eye reading added successfully')
        }
      } else if (foundPatient) {
        // Create a new receipt with patient details and reading data
        const receiptData = {
          ...reading,
          ...patientDetails,
          TYPE: 'RECEIPT',
          patientId: foundPatient['PATIENT ID'] || '',
          DATE: reading.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Creating new receipt with patient details and reading data:', receiptData)
        const newReceipt = await window.api.addPrescription(receiptData)
        console.log('Created new receipt with patient details and reading data:', newReceipt)

        // Set this as the current receipt
        if (newReceipt) {
          setCurrentReceipt(newReceipt)
          setHasEyeReading(true)
          toast.success('Eye reading added successfully')
        }
      } else {
        // Create a new receipt with just the reading data
        const receiptData = {
          ...reading,
          TYPE: 'RECEIPT',
          DATE: reading.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Creating new receipt with reading data only:', receiptData)
        const newReceipt = await window.api.addPrescription(receiptData)
        console.log('Created new receipt with reading data only:', newReceipt)

        // Set this as the current receipt
        if (newReceipt) {
          setCurrentReceipt(newReceipt)
          setHasEyeReading(true)
          toast.success('Eye reading added successfully')
        }
      }

      await loadPrescriptions()
      setShowReadingForm(false)
    } catch (err) {
      console.error('Error adding reading:', err)
      setError('Failed to add reading')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating a prescription
  const handleUpdatePrescription = async (prescription: Prescription): Promise<void> => {
    try {
      setLoading(true)
      const id = prescription.id
      prescription = {
        ...prescription,
        'UPDATED BY': getCurrentUser(),
        'UPDATED AT': new Date().toISOString()
      }
      const updatedPrescription = await window.api.updatePrescription(id, prescription)
      if (updatedPrescription) {
        setPrescriptions(prescriptions.map((p) => (p.id === id ? updatedPrescription : p)))
        setIsModalOpen(false)
        setEditingPrescription(null)
        setShowAddForm(false)
        setError('')
        // Show success toast
        toast.success('Prescription updated successfully')
      }
    } catch (err) {
      console.error('Error updating prescription:', err)
      setError('Failed to update prescription')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an eye reading
  const handleUpdateEyeReading = async (eyeReading: Prescription): Promise<void> => {
    try {
      setLoading(true)
      const id = eyeReading.id
      eyeReading = {
        ...eyeReading,
        'UPDATED BY': getCurrentUser(),
        'UPDATED AT': new Date().toISOString()
      }
      const updatedEyeReading = await window.api.updatePrescription(id, eyeReading)
      if (updatedEyeReading) {
        setPrescriptions(prescriptions.map((p) => (p.id === id ? updatedEyeReading : p)))

        // If this is the current receipt, update it
        if (currentReceipt && currentReceipt.id === id) {
          setCurrentReceipt(updatedEyeReading)
        }
        setIsEyeReadingModalOpen(false)
        setEditingEyeReading(null)
        setError('')
        // Show success toast
        toast.success('Eye reading updated successfully')
      }
    } catch (err) {
      console.error('Error updating eye reading:', err)
      setError('Failed to update eye reading')
    } finally {
      setLoading(false)
    }
  }

  // Function to find receipts for a patient
  const findReceiptsForPatient = (patientId: string): Prescription[] => {
    return prescriptions.filter((p) => p.patientId === patientId && p.TYPE === 'RECEIPT')
  }

  // Function to handle patient search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setFoundPatient(null)
      setCurrentReceipt(null)

      // Close any open forms first
      setShowAddForm(false)
      setShowReadingForm(false)

      if (!searchTerm.trim()) {
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue)
      console.log('Available patients:', patients)

      // First try to find an exact match by patient ID
      let matchedPatient = patients.find((patient) => {
        const patientId = String(patient['PATIENT ID'] || '').toLowerCase()
        return patientId === searchValue
      })

      // If no exact match by ID, try partial match on any field
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          // Check all properties of the patient object for matches
          return Object.entries(patient).some(([key, value]) => {
            // Skip null/undefined values
            if (value == null) return false

            // Convert value to string and check if it includes the search term
            const stringValue = String(value).toLowerCase()
            const matches = stringValue.includes(searchValue)

            if (matches) {
              console.log(`Match found in field ${key}: ${stringValue}`)
            }

            return matches
          })
        })
      }

      if (matchedPatient) {
        console.log('Found patient:', matchedPatient)
        setFoundPatient(matchedPatient)

        // Always reset the current receipt when searching for a new patient
        // This ensures we don't automatically go to the prescription stage
        setCurrentReceipt(null)

        // Check if this patient has any existing receipts
        const patientId = String(matchedPatient['PATIENT ID'] || '')
        const patientReceipts = findReceiptsForPatient(patientId)
        console.log('Existing receipts for patient:', patientReceipts)

        // We'll show existing receipts in the UI, but won't automatically set one as current
        // This way, the user must explicitly create a new receipt or select an existing one
        console.log('Patient found, waiting for user to click Create Receipt button')

        setError('')
      } else {
        setFoundPatient(null)
        setError('No patients found')
      }
    } catch (err) {
      console.error('Error searching patients:', err)
      setError('Failed to search patients')
      setFoundPatient(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Receipts & Prescriptions</h1>
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

        {/* Current Receipt Information */}
        {currentReceipt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium">Current Patient Visit</h3>
                  <p className="text-sm">
                    {`${currentReceipt['GUARDIAN NAME'] || 'Patient'} • ${currentReceipt['PHONE NUMBER'] || 'No phone'} • Receipt #${currentReceipt.id ? currentReceipt.id.substring(0, 8) : 'N/A'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCompleteVisit}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center space-x-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Complete Visit</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Patients
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <input
                type="text"
                id="search"
                placeholder="Search by Patient ID, Name, or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch(e)
                  }
                }}
              />
            </div>
            <div className="flex">
              <button
                onClick={(e) => handleSearch(e)}
                type="button"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFoundPatient(null)
                  setError('')
                }}
                className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Details Display */}
        {foundPatient && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Patient Details
              </h2>
              <button
                onClick={() => setFoundPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Patient Information Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Display all patient fields dynamically */}
                  {Object.entries(foundPatient).map(([key, value], index) => {
                    // Skip the id field as it's internal
                    if (key === 'id') return null

                    // Create a new row for every two fields
                    if (index % 2 === 0) {
                      const nextKey = Object.keys(foundPatient)[index + 1]
                      const nextValue = nextKey ? foundPatient[nextKey] : null

                      // Format the field names for display
                      const formatFieldName = (field: string): string => {
                        return field
                          .replace(/_/g, ' ')
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ')
                      }

                      return (
                        <tr key={key}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                            {formatFieldName(key)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {value !== null && value !== undefined ? String(value) : 'N/A'}
                          </td>

                          {nextKey && nextKey !== 'id' && (
                            <>
                              <td className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                                {formatFieldName(nextKey)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {nextValue !== null && nextValue !== undefined
                                  ? String(nextValue)
                                  : 'N/A'}
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              {/* Show existing receipts for the patient if any */}
              {foundPatient && !currentReceipt && (
                <div className="w-full mb-4">
                  {/* Check for existing receipts */}
                  {(() => {
                    // Make sure we have a valid patient ID
                    const patientId = typeof foundPatient.id === 'string' ? foundPatient.id : ''
                    const patientReceipts = findReceiptsForPatient(patientId)

                    if (patientReceipts.length > 0) {
                      return (
                        <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                          <h3 className="text-lg font-medium text-gray-800 mb-2">
                            Existing Receipts
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            This patient has {patientReceipts.length} existing receipt(s). You can
                            continue with an existing receipt or create a new one.
                          </p>

                          <div className="space-y-2 mb-4">
                            {patientReceipts.map((receipt) => (
                              <div
                                key={receipt.id}
                                className="border border-gray-200 rounded-md p-3 hover:bg-gray-50"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      Receipt #
                                      {typeof receipt.id === 'string'
                                        ? receipt.id.substring(0, 8)
                                        : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Date:{' '}
                                      {new Date(
                                        receipt.createdAt && typeof receipt.createdAt === 'string'
                                          ? receipt.createdAt
                                          : receipt.createdAt &&
                                              typeof receipt.createdAt === 'number'
                                            ? receipt.createdAt
                                            : Date.now()
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Set this receipt as the current receipt
                                      setCurrentReceipt(receipt)
                                      // Close any open forms
                                      setShowAddForm(false)
                                      setShowReceiptForm(false)
                                      setShowReadingForm(false)
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium"
                                  >
                                    Continue with this receipt
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 pt-3 mt-2">
                            <button
                              onClick={() => {
                                // Close other forms if open
                                if (showAddForm) setShowAddForm(false)
                                if (showReadingForm) setShowReadingForm(false)
                                // Open receipt form
                                setShowReceiptForm(true)
                              }}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Create New Receipt</span>
                            </button>
                          </div>
                        </div>
                      )
                    } else {
                      // No existing receipts, show the create receipt button prominently
                      return (
                        <div className="bg-green-50 p-4 rounded-md shadow-sm mb-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-2 text-green-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Patient Found - Create Receipt First
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                Please create a receipt for this patient before adding prescriptions
                                or readings.
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                // Close other forms if open
                                if (showAddForm) setShowAddForm(false)
                                if (showReadingForm) setShowReadingForm(false)
                                // Open receipt form
                                setShowReceiptForm(true)
                              }}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Create Receipt</span>
                            </button>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              )}

              {/* Show Prescription and Reading buttons only after a receipt has been created */}
              {currentReceipt && (
                <>
                  <button
                    onClick={() => {
                      // Close other forms if open
                      if (showReceiptForm) setShowReceiptForm(false)
                      if (showReadingForm) setShowReadingForm(false)
                      // Open prescription form
                      setShowAddForm(true)
                      if (hasPrescription) {
                        // If editing, load the existing prescription data into the form
                        // We can use the current receipt data since it contains the prescription
                        setEditingPrescription(currentReceipt)
                        setIsModalOpen(true)
                        // Show toast message indicating edit mode
                        toast.info('Editing existing prescription')
                      } else {
                        // If adding new, clear any editing state
                        setEditingPrescription(null)
                        setShowAddForm(true)
                        setIsModalOpen(false)
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {hasPrescription ? (
                        // Edit icon
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      ) : (
                        // Add prescription icon
                        <>
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </>
                      )}
                    </svg>
                    <span>{hasPrescription ? 'Edit Prescription' : 'Add Prescription'}</span>
                  </button>

                  <button
                    onClick={() => {
                      // Close other forms if open
                      if (showAddForm) setShowAddForm(false)
                      if (showReceiptForm) setShowReceiptForm(false)

                      if (hasEyeReading) {
                        // If editing, open the eye reading edit modal with the current receipt data
                        setEditingEyeReading(currentReceipt)
                        setIsEyeReadingModalOpen(true)
                        // Show toast message indicating edit mode
                        toast.info('Editing existing eye reading')
                      } else {
                        // If adding new, open the reading form
                        setShowReadingForm(true)
                        setEditingPrescription(null)
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {hasEyeReading ? (
                        // Edit icon
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      ) : (
                        // Eye reading chart icon
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      )}
                    </svg>
                    <span>{hasEyeReading ? 'Edit Eye Reading' : 'Add Eye Reading'}</span>
                  </button>
                </>
              )}

              {/* If there's a current receipt, show a button to finish and reset */}
              {currentReceipt && (
                <button
                  onClick={handleCompleteVisit}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Complete Patient Visit</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Prescription Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                New Prescription
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <PrescriptionForm
              onSubmit={handleAddPrescription}
              onCancel={() => setShowAddForm(false)}
              prescriptionCount={prescriptions.length}
              patients={patients}
              selectedPatient={foundPatient}
            />
          </div>
        )}

        {/* Receipt Form */}
        {showReceiptForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Create Receipt</span>
              </h2>
              <button
                onClick={() => setShowReceiptForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <ReceiptForm
              onSubmit={handleAddReceipt}
              onCancel={() => setShowReceiptForm(false)}
              patients={patients.map(convertToReceiptFormPatient)}
              selectedPatient={foundPatient ? convertToReceiptFormPatient(foundPatient) : null}
            />
          </div>
        )}

        {/* Add Reading Form */}
        {showReadingForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-purple-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                New Eye Reading
              </h2>
              <button
                onClick={() => setShowReadingForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <ReadingForm
              onSubmit={handleAddReading}
              onCancel={() => setShowReadingForm(false)}
              patients={patients.map(convertToReceiptFormPatient)}
              selectedPatient={foundPatient ? convertToReceiptFormPatient(foundPatient) : null}
            />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Prescription Records (Today)
            </h2>
            <div className="text-sm text-gray-500">
              {!loading && prescriptions.length > 0 && (
                <span>
                  {
                    prescriptions.filter((prescription) => {
                      const today = new Date().toISOString().split('T')[0]
                      const prescriptionDate = prescription.DATE
                        ? typeof prescription.DATE === 'string'
                          ? prescription.DATE.split('T')[0]
                          : prescription.DATE
                        : ''
                      return prescriptionDate === today
                    }).length
                  }{' '}
                  today&apos;s{' '}
                  {prescriptions.filter((prescription) => {
                    const today = new Date().toISOString().split('T')[0]
                    const prescriptionDate = prescription.DATE
                      ? typeof prescription.DATE === 'string'
                        ? prescription.DATE.split('T')[0]
                        : prescription.DATE
                      : ''
                    return prescriptionDate === today
                  }).length === 1
                    ? 'record'
                    : 'records'}{' '}
                  found
                </span>
              )}
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
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
                    strokeWidth="3"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-gray-500">Loading prescriptions...</p>
              </div>
            </div>
          )}
          {!loading && prescriptions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No prescriptions found for today</p>
              <p className="text-gray-500 mb-6">
                Search for a patient to create a new prescription record
              </p>
            </div>
          ) : (
            !loading && (
              <div>
                <PrescriptionTableWithReceipts
                  prescriptions={prescriptions.filter((prescription) => {
                    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
                    const prescriptionDate = prescription.DATE
                      ? typeof prescription.DATE === 'string'
                        ? prescription.DATE.split('T')[0]
                        : prescription.DATE
                      : ''
                    return prescriptionDate === today
                  })}
                  onEditPrescription={(prescription) => {
                    setEditingPrescription(prescription)
                    setIsModalOpen(true)
                  }}
                  onDeletePrescription={(id) => {
                    // Delete prescription
                    window.api
                      .deletePrescription(id)
                      .then(() => {
                        // Remove from local state
                        setPrescriptions(prescriptions.filter((p) => p.id !== id))
                        toast.success('Prescription deleted successfully')
                      })
                      .catch((error) => {
                        console.error('Error deleting prescription:', error)
                        toast.error('Failed to delete prescription')
                      })
                  }}
                />
              </div>
            )
          )}
        </div>
      </main>

      {isModalOpen && editingPrescription && (
        <PrescriptionEditModal
          prescription={editingPrescription}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPrescription(null)
          }}
          onSave={handleUpdatePrescription}
          prescriptionCount={prescriptions.length}
        />
      )}
      {isEyeReadingModalOpen && editingEyeReading && (
        <EyeReadingEditModal
          eyeReading={editingEyeReading}
          isOpen={isEyeReadingModalOpen}
          onClose={() => {
            setIsEyeReadingModalOpen(false)
            setEditingEyeReading(null)
          }}
          onSave={handleUpdateEyeReading}
        />
      )}
      {/* Toast Container */}
      <Toaster />
    </div>
  )
}

export default Prescriptions
