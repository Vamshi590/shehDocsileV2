import React, { useState, useEffect, useCallback } from 'react'
import PrescriptionForm from '../components/prescriptions/PrescriptionForm'
import PrescriptionTableWithReceipts from '../components/prescriptions/PrescriptionTableWithReceipts'
import PrescriptionEditModal from '../components/prescriptions/PrescriptionEditModal'
import EyeReadingEditModal from '../components/prescriptions/EyeReadingEditModal'
import ReceiptForm, { Patient as ReceiptFormPatient } from '../components/prescriptions/ReceiptForm'
import ReadingForm from '../components/prescriptions/ReadingForm'
import OperationDetailsModal from '../components/operations/OperationDetailsModal'
import { toast, Toaster } from 'sonner'
import { InPatient } from '../pages/InPatients'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Define the Prescription type
export type Prescription = {
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
type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}
// Define the ReportData type to hold all report types
type ReportData = {
  reports: Prescription[]
  inpatients: InPatient[]
  labs: Lab[]
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
      getPrescriptionsById: (id: string) => Promise<Prescription[]>
      getPrescriptionsByPatientId: (patientId: string) => Promise<Prescription[]>
      getDropdownOptions: (fieldName: string) => Promise<string[]>
      deleteDropdownOption: (fieldName: string, value: string) => Promise<void>
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
      getdues: () => Promise<Prescription[]>
      updateDue: (
        id: string,
        type?: string,
        updatedAmount?: number,
        receivedAmount?: number
      ) => Promise<Prescription>
      // Add getReports function to the interface
      getReports: (id: string) => Promise<{
        success: boolean
        data: ReportData
        error: string | null
        statusCode: number
      }>
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
  // Track the selected date for filtering prescriptions
  const [selectedDate, setSelectedDate] = useState<string>(
    format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd')
  )
  // Track patient receipts
  const [patientReceipts, setPatientReceipts] = useState<Prescription[]>([])
  // OP/IP Toggle state
  const [viewMode, setViewMode] = useState<'OP' | 'IP'>('OP')
  // State for in-patient management and operation details modal
  const [inPatients, setInPatients] = useState<InPatient[]>([])
  const [loadingInPatients, setLoadingInPatients] = useState(false)
  const [selectedInPatient, setSelectedInPatient] = useState<InPatient | null>(null)
  const [showOperationDetailsModal, setShowOperationDetailsModal] = useState(false)
  // State for operation details form
  const [operationDetails, setOperationDetails] = useState({
    operationName: '',
    operationDate: '',
    operationDetails: '',
    operationProcedure: '',
    provisionDiagnosis: '',
    followUpDate: ''
  })

  // Reset prescription and eye reading flags when current receipt changes
  useEffect(() => {
    if (!currentReceipt) {
      setHasPrescription(false)
      setHasEyeReading(false)
    }
  }, [currentReceipt])
  // Toast notifications state

  // Function to load in-patients from the backend
  const loadInPatients = useCallback(async (): Promise<void> => {
    try {
      setLoadingInPatients(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.getInPatients()) as ApiResponse<InPatient[]>

      if (response.success && response.data) {
        setInPatients(response.data)
      } else {
        toast.error('Failed to load in-patients')
      }
    } catch (error) {
      console.error('Error loading in-patients:', error)
      toast.error('Failed to load in-patients')
    } finally {
      setLoadingInPatients(false)
    }
  }, [])

  // Load in-patients when view mode changes to IP
  useEffect(() => {
    if (viewMode === 'IP') {
      loadInPatients()
    }
  }, [viewMode, loadInPatients])

  // Function to load patients from the backend
  const loadPatients = useCallback(async (): Promise<void> => {
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
  }, [setLoading, setPatients, setError])

  // Function to load prescriptions from the backend
  const loadPrescriptions = useCallback(
    async (date?: string): Promise<void> => {
      try {
        setLoading(true)
        const dateToLoad = date || selectedDate
        let data

        if (dateToLoad === new Date().toISOString().split('T')[0]) {
          // If today's date, use the getTodaysPrescriptions method
          data = await window.api.getTodaysPrescriptions()
        } else {
          // Otherwise use the new getPrescriptionsByDate method
          data = await window.api.getPrescriptionsByDate(dateToLoad)
        }

        setPrescriptions(data)
        setError('')
      } catch (err) {
        console.error('Error loading prescriptions:', err)
        setError('Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    },
    [selectedDate, setLoading, setPrescriptions, setError]
  )

  // Load prescriptions and patients on component mount
  useEffect(() => {
    loadPatients()
    loadPrescriptions()
  }, [loadPatients, loadPrescriptions])

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
        const updatedReceipt = (await window.api.updatePrescription(
          receiptId,
          updatedReceiptData as Prescription
        )) as unknown as ApiResponse<Prescription>

        if (!updatedReceipt.success || !updatedReceipt.data) {
          toast.error(updatedReceipt.message)
          return
        }

        // Update the current receipt in state
        setCurrentReceipt(updatedReceipt.data)

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
        const newReceipt = (await window.api.addPrescription(
          receiptData
        )) as unknown as ApiResponse<Prescription>
        // Set this as the current receipt
        if (!newReceipt.success || !newReceipt.data) {
          toast.error(newReceipt.message)
          return
        }

        setCurrentReceipt(newReceipt.data as Prescription)

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
        const result = (await window.api.addPrescription(
          receiptData
        )) as unknown as ApiResponse<Prescription>
        console.log('Created new receipt with form data only:', result)

        // Set this as the current receipt if successful
        if (!result.success || !result.data) {
          toast.error(result.message || 'Failed to add receipt')
          return
        }

        setCurrentReceipt(result.data as Prescription)
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
      const result = (await window.api.addPrescription(
        receiptData
      )) as unknown as ApiResponse<Prescription>
      console.log('Added receipt with patient details:', result)

      // Set this as the current receipt we're working with if successful
      if (!result.success || !result.data) {
        toast.error(result.message || 'Failed to add receipt')
        return
      }

      setCurrentReceipt(result.data as Prescription)

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
        const updatedReceipt = (await window.api.updatePrescription(
          receiptId,
          updatedReceiptData as Prescription
        )) as unknown as ApiResponse<Prescription>
        console.log('Updated receipt with reading data:', updatedReceipt)

        if (!updatedReceipt.success || !updatedReceipt.data) {
          toast.error(updatedReceipt.message)
          return
        }

        // Update the current receipt in state
        if (updatedReceipt.success && updatedReceipt.data) {
          setCurrentReceipt(updatedReceipt.data)
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
        const result = (await window.api.addPrescription(
          receiptData
        )) as unknown as ApiResponse<Prescription>
        console.log('Created new receipt with patient details and reading data:', result)

        // Set this as the current receipt if successful
        if (result.success && result.data) {
          setCurrentReceipt(result.data as Prescription)
          setHasEyeReading(true)
          toast.success(result.message || 'Eye reading added successfully')
        } else {
          toast.error(result.message || 'Failed to add eye reading')
        }
      } else {
        // Create a new receipt with just the reading data
        const receiptData = {
          ...reading,
          TYPE: 'RECEIPT',
          DATE: reading.DATE || new Date().toISOString().split('T')[0]
        }

        console.log('Creating new receipt with reading data only:', receiptData)
        const result = (await window.api.addPrescription(
          receiptData
        )) as unknown as ApiResponse<Prescription>
        console.log('Created new receipt with reading data only:', result)

        // Set this as the current receipt if successful
        if (result.success && result.data) {
          setCurrentReceipt(result.data as Prescription)
          setHasEyeReading(true)
          toast.success(result.message || 'Eye reading added successfully')
        } else {
          toast.error(result.message || 'Failed to add eye reading')
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

  // Helper function to extract only the changed fields from form data compared to original data
  // This prevents unnecessary updates and reduces the risk of overwriting concurrent changes
  const getChangedFieldsOnly = (
    originalData: Record<string, unknown>,
    formData: Record<string, unknown>
  ): Record<string, unknown> => {
    // Start with just the ID to ensure we're updating the right record
    const changedFields: Record<string, unknown> = {
      id: formData.id || originalData.id
    }

    // Only include fields that have actually changed
    Object.entries(formData).forEach(([key, value]) => {
      // Skip the id field as we've already included it
      if (key !== 'id' && value !== undefined) {
        // Check if the value has actually changed
        if (JSON.stringify(originalData[key]) !== JSON.stringify(value)) {
          changedFields[key] = value
        }
      }
    })

    return changedFields
  }

  // Function to handle updating a prescription
  const handleUpdatePrescription = async (prescription: Prescription): Promise<void> => {
    try {
      setLoading(true)
      const id = prescription.id

      // First, fetch the latest version of the prescription from the database
      const prescriptionData = (await window.api.getPrescriptionsById(
        id
      )) as unknown as ApiResponse<Prescription>
      const response = prescriptionData.data
      const latestData = Array.isArray(response) ? response.find((p) => p.id === id) : null

      if (!latestData) {
        throw new Error('Prescription not found')
      }

      // Extract only the fields that have actually changed
      const changedFieldsOnly = getChangedFieldsOnly(latestData, prescription)

      // Add update metadata to the changed fields only
      const updatedPrescriptionData = {
        ...changedFieldsOnly,
        'UPDATED BY': getCurrentUser(),
        'UPDATED AT': new Date().toISOString()
      }

      // Update the prescription in the database with only the changed fields
      // Ensure id is included to satisfy TypeScript's Prescription type requirements
      const updatedPrescription = (await window.api.updatePrescription(
        id,
        updatedPrescriptionData as unknown as Prescription
      )) as unknown as ApiResponse<Prescription>

      if (updatedPrescription.success && updatedPrescription.data) {
        setPrescriptions(prescriptions.map((p) => (p.id === id ? updatedPrescription.data : p)))
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
      toast.error('Failed to update prescription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an eye reading
  const handleUpdateEyeReading = async (eyeReading: Prescription): Promise<void> => {
    try {
      setLoading(true)
      const id = eyeReading.id

      // First, fetch the latest version of the eye reading from the database
      const response = await window.api.getPrescriptions()
      const latestData = Array.isArray(response) ? response.find((p) => p.id === id) : null

      if (!latestData) {
        throw new Error('Eye reading not found')
      }

      // Extract only the fields that have actually changed
      const changedFieldsOnly = getChangedFieldsOnly(latestData, eyeReading)

      // Add update metadata to the changed fields only
      const updatedEyeReadingData = {
        ...changedFieldsOnly,
        'UPDATED BY': getCurrentUser(),
        'UPDATED AT': new Date().toISOString()
      }

      // Update the eye reading in the database with only the changed fields
      // Use double casting to avoid TypeScript errors
      const updatedEyeReading = (await window.api.updatePrescription(
        id,
        updatedEyeReadingData as unknown as Prescription
      )) as unknown as ApiResponse<Prescription>

      if (updatedEyeReading.success && updatedEyeReading.data) {
        setPrescriptions(prescriptions.map((p) => (p.id === id ? updatedEyeReading.data : p)))

        // If this is the current receipt, update it
        if (currentReceipt && currentReceipt.id === id) {
          setCurrentReceipt(updatedEyeReading.data)
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
      toast.error('Failed to update eye reading. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Function to find receipts for a patient
  const findReceiptsForPatient = async (patientId: string): Promise<Prescription[]> => {
    console.log('Finding receipts for patient:', patientId)
    console.log('Available receipts:', prescriptions)
    const response = (await window.api.getPrescriptionsByPatientId(
      patientId
    )) as unknown as ApiResponse<Prescription[]>
    return response.data
  }

  // We're using getInPatientStatus for IP patients, and the status is displayed in the UI directly

  // Function to determine in-patient status based on their data
  const getInPatientStatus = (patient: InPatient): string => {
    // Check if operation details, procedure, and diagnosis are all filled in
    if (patient.operationDetails && patient.operationProcedure && patient.provisionDiagnosis) {
      return 'Completed'
    } else if (patient.operationName) {
      return 'In Operation'
    } else if (patient.doctorNames && patient.doctorNames.length > 0) {
      return 'With Doctor'
    } else {
      return 'At Optometrist'
    }
  }

  // Function to handle opening the operation details modal
  const handleOpenOperationDetailsModal = (patient: InPatient): void => {
    setSelectedInPatient(patient)
    // Reset operation details form
    setOperationDetails({
      operationName: patient.operationName || '',
      operationDate: patient.operationDate || '',
      operationDetails: patient.operationDetails || '',
      operationProcedure: patient.operationProcedure || '',
      provisionDiagnosis: patient.provisionDiagnosis || '',
      followUpDate: patient.followUpDate || ''
    })
    setShowOperationDetailsModal(true)
  }

  // Function to handle operation details form input changes
  const handleOperationDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target
    setOperationDetails((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  // Function to save operation details
  const handleSaveOperationDetails = async (): Promise<void> => {
    if (!selectedInPatient) return

    try {
      // Format the operation details
      console.log('operationDetails', operationDetails)
      console.log('selectedInPatient', selectedInPatient)

      // Only update specific fields as requested
      // Use the existing prescriptions from the inpatient record
      // We need to ensure we're not losing prescriptions added via the modal
      const prescriptions = selectedInPatient?.prescriptions || []

      // Create the update payload with all required fields
      const inpatientData = {
        operationDetails: operationDetails.operationDetails,
        operationProcedure: operationDetails.operationProcedure,
        provisionDiagnosis: operationDetails.provisionDiagnosis,
        followUpDate: operationDetails.followUpDate,
        // Make sure we're sending the prescriptions array to the backend
        prescriptions: prescriptions
      }

      console.log('inpatientData', inpatientData)

      // Call the API to update the in-patient record
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      // Ensure we're passing the parameters correctly
      const response = await api.updateInPatientAll({
        id: selectedInPatient.id,
        inpatientData: inpatientData
      })

      if (response && (response as StandardizedResponse<InPatient>).success) {
        // Close the modal first to avoid UI freezing during data refresh
        setShowOperationDetailsModal(false)

        // Force immediate UI update with the updated patient data
        const updatedPatient = {
          ...selectedInPatient,
          ...inpatientData
        }

        // Update the selected patient in the local state immediately
        setSelectedInPatient(updatedPatient)

        // Update the inPatients array with the updated patient
        setInPatients((prevInPatients) =>
          prevInPatients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
        )

        // Show success message
        toast.success('Operation details saved successfully')

        // Then refresh data from the backend to ensure everything is in sync
        // Use setTimeout to ensure the UI updates first
        setTimeout(async () => {
          await loadInPatients()
          await loadPatients()
        }, 100)
      } else {
        toast.error('Failed to save operation details')
      }
    } catch (error) {
      console.error('Error saving operation details:', error)
      toast.error('Error saving operation details')
    }
  }

  // Function to handle in-patient card click
  const handleInPatientCardClick = (patient: InPatient): void => {
    // Convert InPatient to Prescription format for the PrescriptionEditModal
    const prescriptionData: Prescription = {
      id: patient.id,
      'PATIENT ID': patient.patientId,
      'GUARDIAN NAME': patient.guardianName || patient.name,
      'PHONE NUMBER': patient.phone,
      AGE: patient.age,
      GENDER: patient.gender,
      ADDRESS: patient.address,
      DOB: patient.dateOfBirth,
      'OPERATION DETAILS': patient.operationName || '',
      DEPARTMENT: patient.department || '',
      'DOCTOR NAMES': patient.doctorNames?.join(', ') || ''
    }

    setEditingPrescription(prescriptionData)
    setIsModalOpen(true)
  }

  // Function to handle patient search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setFoundPatient(null)
      setCurrentReceipt(null)
      setPatientReceipts([]) // Reset patient receipts

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
        const patientId = String(patient['patientId'] || '').toLowerCase()
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

        // Load patient receipts asynchronously
        const patientId = String(matchedPatient['patientId'] || '')
        console.log('Loading receipts for patient:', patientId)

        // Load receipts asynchronously
        const receipts = await findReceiptsForPatient(patientId)
        setPatientReceipts(receipts || [])
        console.log('Existing receipts for patient:', receipts)

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

          {/* OP/IP Toggle Switch */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('OP')}
              className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'OP' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Out-Patient
            </button>
            <button
              onClick={() => setViewMode('IP')}
              className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'IP' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              In-Patient
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                loadPatients()
                loadPrescriptions()
                toast.success('Data refreshed successfully')
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
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

        {/* IP View - Card Grid */}
        {viewMode === 'IP' && (
          <div className="mt-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4">In-Patient Records</h2>

            {loadingInPatients ? (
              <div className="flex justify-center items-center py-12">
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
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : inPatients.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">No in-patient records found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inPatients.map((patient) => {
                  const status = getInPatientStatus(patient)
                  let statusColor = ''

                  switch (status) {
                    case 'At Optometrist':
                      statusColor = 'bg-yellow-100 text-yellow-800'
                      break
                    case 'With Doctor':
                      statusColor = 'bg-blue-100 text-blue-800'
                      break
                    case 'In Operation':
                      statusColor = 'bg-purple-100 text-purple-800'
                      break
                    case 'Completed':
                      statusColor = 'bg-green-100 text-green-800'
                      break
                    default:
                      statusColor = 'bg-gray-100 text-gray-800'
                  }

                  return (
                    <div
                      key={patient.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-600">{patient.patientId}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 mb-4">
                          <p>
                            Age: {patient.age} | Gender: {patient.gender}
                          </p>
                          <p>Guardian: {patient.guardianName || 'N/A'}</p>
                          <p>Phone: {patient.phone}</p>
                          {patient.operationName && (
                            <p className="font-medium text-gray-700">
                              Operation: {patient.operationName}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleInPatientCardClick(patient)}
                            className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleOpenOperationDetailsModal(patient)}
                            className="flex-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded text-sm font-medium transition-colors"
                          >
                            Add Operation
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Current Receipt Information */}
        {viewMode === 'OP' && (
          <div className="max-w-7xl mx-auto">
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

                  {/* Date Picker */}
                  <div className="ml-2 relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const newDate = e.target.value
                        setSelectedDate(newDate)
                        loadPrescriptions(newDate)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                              .map(
                                (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              )
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
                        console.log(foundPatient)

                        // Use the patientReceipts from state instead of calling the async function directly
                        if (patientReceipts.length > 0) {
                          return (
                            <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                              <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Existing Receipts
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                This patient has {patientReceipts.length} existing receipt(s). You
                                can continue with an existing receipt or create a new one.
                              </p>

                              <div className="space-y-2 mb-4">
                                {patientReceipts.map((receipt) => (
                                  <div
                                    key={receipt.id}
                                    className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-all shadow-sm"
                                  >
                                    <div className="flex justify-between items-center gap-4">
                                      <div className="flex items-center gap-4">
                                        {/* Receipt icon */}
                                        <div className="bg-blue-50 p-2 rounded-full">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 text-blue-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                          </svg>
                                        </div>
                                        {/* Receipt details */}
                                        <div>
                                          <p className="font-medium text-gray-800">
                                            Receipt #
                                            {typeof receipt['RECEIPT NO'] === 'string'
                                              ? receipt['RECEIPT NO'].substring(0, 8)
                                              : 'Unknown'}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            Date:{' '}
                                            {new Date(
                                              receipt.DATE && typeof receipt.DATE === 'string'
                                                ? receipt.DATE
                                                : receipt.DATE && typeof receipt.DATE === 'number'
                                                  ? receipt.DATE
                                                  : Date.now()
                                            ).toDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      {/* Action buttons */}
                                      <div className="flex items-center gap-2">
                                        {/* View button */}
                                        <button
                                          onClick={() => {
                                            // Set this receipt for viewing
                                            setEditingPrescription(receipt)
                                            setIsModalOpen(true)
                                          }}
                                          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm font-medium flex items-center"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                          </svg>
                                          View
                                        </button>
                                        {/* Edit button */}
                                        <button
                                          onClick={() => {
                                            // Set this receipt for editing
                                            setEditingPrescription(receipt)
                                            setIsModalOpen(true)
                                          }}
                                          className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md text-sm font-medium flex items-center"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                          Edit
                                        </button>
                                      </div>
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
                                    Please create a receipt for this patient before adding
                                    prescriptions or readings.
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
                  Prescription Records (
                  {selectedDate === new Date().toISOString().split('T')[0]
                    ? 'Today'
                    : new Date(selectedDate).toLocaleDateString()}
                  )
                </h2>
                <div className="text-sm text-gray-500">
                  {!loading && prescriptions.length > 0 && (
                    <span>
                      {
                        prescriptions.filter((prescription) => {
                          const prescriptionDate = prescription.DATE
                            ? typeof prescription.DATE === 'string'
                              ? prescription.DATE.split('T')[0]
                              : prescription.DATE
                            : ''
                          return prescriptionDate === selectedDate
                        }).length
                      }{' '}
                      {selectedDate === new Date().toISOString().split('T')[0]
                        ? "today's"
                        : "selected date's"}{' '}
                      {prescriptions.filter((prescription) => {
                        const prescriptionDate = prescription.DATE
                          ? typeof prescription.DATE === 'string'
                            ? prescription.DATE.split('T')[0]
                            : prescription.DATE
                          : ''
                        return prescriptionDate === selectedDate
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
                        const prescriptionDate = prescription.DATE
                          ? typeof prescription.DATE === 'string'
                            ? prescription.DATE.split('T')[0]
                            : prescription.DATE
                          : ''
                        return prescriptionDate === selectedDate
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
          </div>
        )}
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
          onRefresh={async () => {
            try {
              // Get the latest prescription data from the API
              const id = editingPrescription.id
              const response = await window.api.getPrescriptionsById(id)

              // Find the prescription with the matching ID
              let freshPrescription: Prescription | null = null
              if (response) {
                // Cast the response to the correct type
                const prescriptionData = response as unknown as { data: Prescription[] }
                const foundPrescription = prescriptionData.data.find((p) => p.id === id)
                if (foundPrescription) {
                  freshPrescription = foundPrescription
                }
              }

              if (freshPrescription) {
                // Update the editing prescription with the fresh data
                setEditingPrescription(freshPrescription)
                toast.success('Prescription data refreshed successfully')
                return freshPrescription
              } else {
                toast.error('Failed to refresh prescription data')
                console.error('Failed to refresh prescription data')
                return null
              }
            } catch (error) {
              console.error('Error refreshing prescription data:', error)
              toast.error('Error refreshing prescription data')
              return null
            }
          }}
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

      {/* Operation Details Modal */}
      <OperationDetailsModal
        isOpen={showOperationDetailsModal}
        onClose={() => setShowOperationDetailsModal(false)}
        selectedInPatient={selectedInPatient}
        operationDetails={operationDetails}
        onOperationDetailsChange={handleOperationDetailsChange}
        onSave={handleSaveOperationDetails}
        prescriptions={prescriptions}
      />
    </div>
  )
}

export default Prescriptions
