import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import LabForm from '../components/labs/LabForm'
import LabTableWithReceipts from '../components/labs/LabTableWithReceipts'
import Modal from '../components/common/Modal'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
// import TodaysPrescriptionLabs from '../components/labs/TodaysPrescriptionLabs'

// Define the Lab type to match with LabTableWithReceipts component
type Lab = {
  id: string
  [key: string]: unknown
}

// Define StandardizedResponse interface for API responses
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  error?: string | null
  statusCode?: number
  message?: string // For backward compatibility
}

// Define the LabTest interface for categorizing tests
interface LabTest {
  name: string
  amount: string
  type: 'vennela' | 'lab'
}

// Define the Prescription type to match with TodaysPrescriptionLabs component
type Prescription = {
  id: string
  'PATIENT ID': string
  'PATIENT NAME': string
  _extractedVennelaTests?: LabTest[]
  _extractedLabTests?: LabTest[]
  [key: string]: unknown
}

// Import the Patient type from LabForm to ensure consistency
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

// Helper function to get current user from localStorage
const getCurrentUser = (): string => {
  try {
    const currentUserStr = localStorage.getItem('currentUser')
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr)
      return currentUser.fullName || currentUser.username || 'Unknown User'
    }
  } catch (error) {
    console.error('Error parsing currentUser from localStorage:', error)
  }
  return 'Unknown User'
}

const Labs: React.FC = () => {
  // State for labs and patients data
  const [labs, setLabs] = useState<Lab[]>([])
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(
    format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd')
  )

  // State for searched prescriptions with lab advice
  const [searchedPrescriptions, setSearchedPrescriptions] = useState<Prescription[]>([])

  // State for managing lab creation from prescriptions
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [isAddingNewLab, setIsAddingNewLab] = useState<boolean>(false)
  const [isAddingVennelaLab, setIsAddingVennelaLab] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // State for extracted lab tests from prescriptions
  const [currentExtractedVennelaTests, setCurrentExtractedVennelaTests] = useState<LabTest[]>([])
  const [currentExtractedLabTests, setCurrentExtractedLabTests] = useState<LabTest[]>([])

  // Load labs and today's labs data on component mount
  useEffect(() => {
    loadLabsByDate(selectedDate)
  }, [selectedDate])

  // Load labs by date
  const loadLabsByDate = async (date: string): Promise<void> => {
    setIsLoading(true)
    try {
      // Use getTodaysLabs as a fallback if date is today's date
      const todayDate = new Date().toISOString().split('T')[0]
      let response

      if (date === todayDate) {
        response = await window.api.getTodaysLabs()
      } else {
        // For other dates, we'll query the database with a filter
        response = await window.api.getLabs()
        // We'll filter the labs by date on the client side
        if (response && typeof response === 'object' && 'success' in response) {
          const standardizedResponse = response as StandardizedResponse<Lab[]>
          if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
            standardizedResponse.data = standardizedResponse.data.filter((lab) => {
              return lab.DATE === date || lab.date === date
            })
            response = standardizedResponse
          }
        } else if (Array.isArray(response)) {
          response = response.filter((lab) => lab.DATE === date || lab.date === date)
        }
      }

      // Handle standardized response format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as StandardizedResponse<Lab[]>

        if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
          setLabs(standardizedResponse.data)
        } else {
          console.error(
            `Failed to load labs for date ${date}:`,
            standardizedResponse.error || 'Unknown error'
          )
          toast.error(
            `Failed to load labs for date ${date}: ${standardizedResponse.error || 'Unknown error'}`
          )
          setLabs([])
        }
      } else if (Array.isArray(response)) {
        // Legacy format (direct array)
        setLabs(response)
      } else {
        console.error(`Invalid labs data format for date ${date}:`, response)
        setLabs([])
      }
    } catch (error) {
      console.error(`Error loading labs for date ${date}:`, error)
      toast.error(`Failed to load labs data for date ${date}`)
      setLabs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handler for creating a lab from a prescription
  const handleCreateLabFromPrescription = (prescription: Prescription): void => {
    // Create a patient object directly from the prescription data
    const patientFromPrescription: Patient = {
      'PATIENT ID': String(prescription['PATIENT ID'] || ''),
      'GUARDIAN NAME': String(prescription['GUARDIAN NAME'] || ''),
      DOB: String(prescription['DOB'] || ''),
      AGE: Number(prescription['AGE'] || 0),
      GENDER: String(prescription['GENDER'] || ''),
      'PHONE NUMBER': String(prescription['PHONE NUMBER'] || ''),
      ADDRESS: String(prescription['ADDRESS'] || ''),
      // Add any other required fields with default values
      'PATIENT NAME': String(prescription['PATIENT NAME'] || '')
    }

    // Set the found patient directly from prescription data
    setFoundPatient(patientFromPrescription)

    // Extract and categorize lab tests from the prescription
    const { vennelaTests, labTests } = extractCategorizedLabTests(prescription)

    // Store the extracted tests in the prescription object for UI display
    prescription._extractedVennelaTests = vennelaTests
    prescription._extractedLabTests = labTests

    // Set the state to show the lab form
    setIsAddingNewLab(true)

    // The LabForm will receive these tests as props and use them to pre-fill the form
    setCurrentExtractedVennelaTests(vennelaTests)
    setCurrentExtractedLabTests(labTests)
  }
  // We no longer need to load patients data since we're using prescription data directly

  // Predefined lab tests with their types and amounts
  const predefinedLabTests: LabTest[] = [
    { name: 'IOP', amount: '400', type: 'vennela' },
    { name: 'BE SYRINGING', amount: '800', type: 'vennela' },
    { name: 'RE SYRINGING', amount: '400', type: 'vennela' },
    { name: 'LE SYRINGING', amount: '400', type: 'vennela' },
    { name: '2%XST', amount: '100', type: 'vennela' },
    { name: 'DLT BE I/O', amount: '400', type: 'vennela' },
    { name: 'BE CYCLOPENT', amount: '400', type: 'vennela' },
    { name: 'SCHIMERS TEST', amount: '150', type: 'vennela' },
    { name: 'FLOURESCIN STAIN', amount: '150', type: 'vennela' },
    { name: 'KERATOMETRIC', amount: '400', type: 'vennela' },
    { name: 'RE ANTERIOR PHOTOGRAPHY', amount: '500', type: 'vennela' },
    { name: 'LE ANTERIOR PHOTOGRAPHY', amount: '500', type: 'vennela' },
    { name: 'BE ANTERIOR PHOTOGRAPHY', amount: '1000', type: 'vennela' },
    { name: 'A SCAN', amount: '500', type: 'vennela' },
    { name: 'GONIO', amount: '500', type: 'vennela' },
    { name: 'RE OFI', amount: '1000', type: 'vennela' },
    { name: 'LE OFI', amount: '1000', type: 'vennela' },
    { name: 'RE OCT', amount: '2500', type: 'vennela' },
    { name: 'LE OCT', amount: '2500', type: 'vennela' },
    { name: 'BE OFI', amount: '2000', type: 'vennela' },
    { name: 'OCT', amount: '2500', type: 'vennela' },
    { name: 'BE OCT', amount: '3000', type: 'vennela' },
    { name: 'FIELDS', amount: '3500', type: 'vennela' },
    { name: 'FFA', amount: '2500', type: 'vennela' },
    { name: 'PANAROMA', amount: '1500', type: 'vennela' },
    { name: 'RE PANAROMA', amount: '1500', type: 'vennela' },
    { name: 'LE PANAROMA', amount: '1500', type: 'vennela' },
    { name: 'BE PANAROMA', amount: '3000', type: 'vennela' },
    { name: 'GLUCOMA EVALUTION', amount: '8900', type: 'vennela' },
    { name: 'CBP', amount: '250', type: 'lab' },
    { name: 'RBS', amount: '100', type: 'lab' },
    { name: 'FBS', amount: '100', type: 'lab' },
    { name: 'PLBS', amount: '100', type: 'lab' },
    { name: 'BT', amount: '50', type: 'lab' },
    { name: 'CT', amount: '50', type: 'lab' },
    { name: 'HIV', amount: '450', type: 'lab' },
    { name: 'HBsAg', amount: '500', type: 'lab' },
    { name: 'HBA1C', amount: '600', type: 'lab' },
    { name: 'HCV', amount: '300', type: 'lab' },
    { name: 'CUE', amount: '100', type: 'lab' },
    { name: 'URINE-MICRO', amount: '100', type: 'lab' },
    { name: 'ESR', amount: '100', type: 'lab' },
    { name: 'BLOOD UREA', amount: '300', type: 'lab' },
    { name: 'S.CREATININE', amount: '250', type: 'lab' },
    { name: 'S.BILIRUBIN', amount: '300', type: 'lab' },
    { name: 'LIPID PROFILE', amount: '600', type: 'lab' },
    { name: 'VRDL', amount: '400', type: 'lab' },
    { name: 'MANTOUX', amount: '800', type: 'lab' },
    { name: 'X-RAY-CHEST', amount: '350', type: 'lab' },
    { name: 'X-RAY-PNS', amount: '350', type: 'lab' },
    { name: 'ECG', amount: '300', type: 'lab' },
    { name: 'CORNEAL SMEAR', amount: '1800', type: 'lab' },
    { name: 'CULTURE & SENSITIVITY', amount: '1800', type: 'lab' }
  ]

  // Helper function to identify and categorize lab tests from prescription advice
  const identifyLabTests = (advice: string): LabTest[] => {
    // Skip advice containing "investigations" word
    if (advice.toLowerCase().includes('investigations')) {
      return []
    }

    const foundTests: LabTest[] = []
    let matchFound = false

    // Check each predefined test to see if it's mentioned in the advice
    predefinedLabTests.forEach((test) => {
      // Case insensitive search for the test name in the advice
      const testNameLower = test.name.toLowerCase()
      const adviceLower = advice.toLowerCase()

      // Check for exact match or whole word match
      // Options:
      // 1. The advice is exactly equal to the test name
      // 2. The test name is surrounded by word boundaries (spaces, punctuation, etc.)
      if (adviceLower === testNameLower) {
        foundTests.push(test)
        matchFound = true
      }
    })

    // If no match found, create a default lab test with the advice as name
    if (!matchFound) {
      foundTests.push({
        name: advice,
        amount: '0',
        type: 'lab'
      })
    }

    return foundTests
  }

  // Helper function to extract and categorize lab tests from a prescription
  const extractCategorizedLabTests = (
    prescription: Prescription
  ): { vennelaTests: LabTest[]; labTests: LabTest[]; hasOnlyInvestigations: boolean } => {
    const allTests: LabTest[] = []
    const vennelaTests: LabTest[] = []
    const labTests: LabTest[] = []
    let adviceCount = 0
    let investigationAdviceCount = 0

    // Check each ADVICE field
    for (let i = 1; i <= 10; i++) {
      const adviceKey = `ADVICE ${i}` as keyof Prescription
      const advice = prescription[adviceKey] as string

      if (advice && advice.trim() !== '') {
        adviceCount++

        // Check if this advice contains investigation word
        if (advice.toLowerCase().includes('investigation')) {
          investigationAdviceCount++
          continue // Skip this advice
        }

        // Find any predefined tests mentioned in this advice
        const testsInAdvice = identifyLabTests(advice)
        allTests.push(...testsInAdvice)
      }
    }

    // Remove duplicates by name (keep the first occurrence)
    const uniqueTests = allTests.filter(
      (test, index, self) => index === self.findIndex((t) => t.name === test.name)
    )

    // Categorize tests by type
    uniqueTests.forEach((test) => {
      if (test.type === 'vennela') {
        vennelaTests.push(test)
      } else {
        labTests.push(test)
      }
    })

    // Check if all advice entries were investigation-related
    const hasOnlyInvestigations = adviceCount > 0 && adviceCount === investigationAdviceCount

    return { vennelaTests, labTests, hasOnlyInvestigations }
  }

  // Function to handle patient search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')
    setSearchedPrescriptions([])

    if (!searchTerm.trim()) {
      // If no search term but date is selected, just load labs for that date
      loadLabsByDate(selectedDate)
      return
    }

    setIsLoading(true)
    // Start loading

    try {
      // Close any open forms first
      setIsAddingNewLab(false)

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue)

      // Check if the API method is available
      if (!window.api || !window.api.getPrescriptionsByPatientId) {
        console.error('API method getPrescriptionsByPatientId not available')
        toast.error('API method not available')
        setIsLoading(false)
        // Search cannot proceed
        return
      }

      // Get prescriptions by patient ID
      const response = await window.api.getPrescriptionsByPatientId(searchValue)
      let prescriptions: Prescription[] = []

      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as StandardizedResponse<Prescription[]>
        if (standardizedResponse.success && standardizedResponse.data) {
          prescriptions = standardizedResponse.data
          console.log(`Found ${prescriptions.length} prescriptions for patient ID: ${searchValue}`)
        } else {
          console.warn(
            'No prescriptions found or unsuccessful response:',
            standardizedResponse.message
          )
        }
      } else if (Array.isArray(response)) {
        prescriptions = response as Prescription[]
      }

      // If no prescriptions found by exact ID, try searching by name or partial ID
      if (prescriptions.length === 0) {
        console.log('No prescriptions found by exact ID, trying general search...')

        if (!window.api.getPrescriptions) {
          console.error('API method getPrescriptions not available')
          toast.error('API method not available')
          setIsLoading(false)
          // End loading
          return
        }

        // Get all prescriptions
        const allResponse = await window.api.getPrescriptions()
        let allPrescriptions: Prescription[] = []

        if (allResponse && typeof allResponse === 'object' && 'success' in allResponse) {
          const standardizedResponse = allResponse as StandardizedResponse<Prescription[]>
          if (standardizedResponse.success && standardizedResponse.data) {
            allPrescriptions = standardizedResponse.data
          }
        } else if (Array.isArray(allResponse)) {
          allPrescriptions = allResponse as Prescription[]
        }

        // Filter prescriptions by patient ID or name
        prescriptions = allPrescriptions.filter((prescription) => {
          const patientId = String(prescription['PATIENT ID'] || '').toLowerCase()
          const patientName = String(prescription['PATIENT NAME'] || '').toLowerCase()

          return patientId.includes(searchValue) || patientName.includes(searchValue)
        })
      }

      // Set patient information if prescriptions are found
      if (prescriptions.length > 0) {
        const firstPrescription = prescriptions[0]
        const patientFromPrescription: Patient = {
          'PATIENT ID': String(firstPrescription['PATIENT ID'] || ''),
          'GUARDIAN NAME': String(firstPrescription['GUARDIAN NAME'] || ''),
          DOB: String(firstPrescription['DOB'] || ''),
          AGE: Number(firstPrescription['AGE'] || 0),
          GENDER: String(firstPrescription['GENDER'] || ''),
          'PHONE NUMBER': String(firstPrescription['PHONE NUMBER'] || ''),
          ADDRESS: String(firstPrescription['ADDRESS'] || ''),
          'PATIENT NAME': String(firstPrescription['PATIENT NAME'] || '')
        }
        setFoundPatient(patientFromPrescription)
      } else {
        setFoundPatient(null)
      }

      // Process each prescription to extract lab tests
      const processedPrescriptions: Prescription[] = []

      for (const prescription of prescriptions) {
        // Extract lab tests from this prescription
        const { vennelaTests, labTests, hasOnlyInvestigations } =
          extractCategorizedLabTests(prescription)

        // If this prescription has lab tests or vennela tests, include it
        if ((vennelaTests.length > 0 || labTests.length > 0) && !hasOnlyInvestigations) {
          // Add the extracted tests to the prescription object for display
          const enhancedPrescription = {
            ...prescription,
            _extractedVennelaTests: vennelaTests,
            _extractedLabTests: labTests
          }
          processedPrescriptions.push(enhancedPrescription)
        }
      }

      console.log('Prescriptions with lab tests:', processedPrescriptions)
      setSearchedPrescriptions(processedPrescriptions)

      if (processedPrescriptions.length === 0) {
        setError('No prescriptions with lab tests found')
        // Note: We don't need to set foundPatient to null here since we already handle that earlier
      } else {
        setError('')
      }

      // Search completed
    } catch (err) {
      console.error('Error searching:', err)
      setError('Failed to search')
      setFoundPatient(null)
      setSearchedPrescriptions([])
      // Search failed
      toast.error('Failed to search')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle adding a new lab
  const handleAddLab = async (labData: Omit<Lab, 'id'>): Promise<void> => {
    try {
      // Add createdBy field
      const labWithCreatedBy = {
        ...labData,
        createdBy: getCurrentUser()
      }

      const response = await window.api.addLab(labWithCreatedBy)
      // Handle standardized response format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as unknown as StandardizedResponse<Lab>

        if (standardizedResponse.success && standardizedResponse.data) {
          toast.success('Lab record added successfully')
          await loadLabsByDate(selectedDate)
          setIsAddingNewLab(false)
          setIsAddingVennelaLab(false)
          setFoundPatient(null)
          setSearchTerm('')
          setSearchedPrescriptions([])
        } else {
          console.error('Failed to add lab record:', standardizedResponse.error || 'Unknown error')
          toast.error(`Failed to add lab record: ${standardizedResponse.error || 'Unknown error'}`)
        }
      } else if (response) {
        // Legacy format (direct object) - cast to unknown first to avoid type errors
        const legacyResponse = response as unknown
        if (legacyResponse) {
          toast.success('Lab record added successfully')
          await loadLabsByDate(selectedDate)
          setIsAddingNewLab(false)
          setIsAddingVennelaLab(false)
          setFoundPatient(null)
          setSearchTerm('')
          setSearchedPrescriptions([])
        }
      } else {
        toast.error('Failed to add lab record')
      }
    } catch (error) {
      console.error('Error adding lab:', error)
      toast.error(
        `Failed to add lab record: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Handle updating an existing lab
  const handleUpdateLab = async (labData: Lab): Promise<void> => {
    try {
      // Make sure we have a valid lab object with ID
      if (!labData.id) {
        console.error('Cannot update lab without ID')
        toast.error('Failed to update lab record: Missing ID')
        return
      }

      // No need to pass ID separately as we're passing the full lab object with ID
      const response = await window.api.updateLab(labData)
      // Handle standardized response format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as unknown as StandardizedResponse<Lab>

        if (standardizedResponse.success && standardizedResponse.data) {
          toast.success('Lab record updated successfully')
          await loadLabsByDate(selectedDate)
          setIsModalOpen(false)
          setEditingLab(null)
        } else {
          console.error(
            'Failed to update lab record:',
            standardizedResponse.error || 'Unknown error'
          )
          toast.error(
            `Failed to update lab record: ${standardizedResponse.error || 'Unknown error'}`
          )
        }
      } else if (response) {
        // Legacy format (direct object) - cast to unknown first to avoid type errors
        const legacyResponse = response as unknown
        if (legacyResponse) {
          toast.success('Lab record updated successfully')
          await loadLabsByDate(selectedDate)
          setIsModalOpen(false)
          setEditingLab(null)
        }
      } else {
        toast.error('Failed to update lab record')
      }
    } catch (error) {
      console.error('Error updating lab:', error)
      toast.error(
        `Failed to update lab record: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Handle deleting a lab
  const handleDeleteLab = async (id: string): Promise<void> => {
    try {
      const response = await window.api.deleteLab(id)
      // Handle standardized response format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as StandardizedResponse<boolean>

        if (standardizedResponse.success) {
          toast.success('Lab record deleted successfully')
          await loadLabsByDate(selectedDate)
        } else {
          console.error(
            'Failed to delete lab record:',
            standardizedResponse.error || 'Unknown error'
          )
          toast.error(
            `Failed to delete lab record: ${standardizedResponse.error || 'Unknown error'}`
          )
        }
      } else if (response === true) {
        // Legacy format (direct boolean)
        toast.success('Lab record deleted successfully')
        await loadLabsByDate(selectedDate)
      } else {
        toast.error('Failed to delete lab record')
      }
    } catch (error) {
      console.error('Error deleting lab:', error)
      toast.error(
        `Failed to delete lab record: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Handle editing a lab
  const handleEditLab = (lab: Lab): void => {
    setEditingLab(lab)
    setIsModalOpen(true)
  }

  // Handle canceling lab form
  const handleCancelLabForm = (): void => {
    setIsAddingNewLab(false)
    setFoundPatient(null)
  }

  // Handle canceling vennela lab form
  const handleCancelVennelaLabForm = (): void => {
    setIsAddingVennelaLab(false)
  }

  // Handle closing the edit modal
  const handleCloseModal = (): void => {
    setIsModalOpen(false)
    setEditingLab(null)
  }

  // Handle form submission from the edit modal
  const handleEditFormSubmit = async (
    labData: Omit<Lab, 'id'> & { id?: string }
  ): Promise<void> => {
    // Make sure we have an id for the lab being edited
    if (editingLab && editingLab.id) {
      await handleUpdateLab({
        ...labData,
        id: editingLab.id // Ensure we have the id from the editing lab
      } as Lab)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 mb-6">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Labs Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsAddingVennelaLab(true)
                setFoundPatient(null) // Clear any selected patient for general customer form
              }}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Create Vennela Lab</span>
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
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-2 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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
          <div className="flex items-center gap-2">
            <div>
              <input
                type="date"
                id="labDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Patient Information Display */}
      {foundPatient && (
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Patient Information</h2>
            <button
              onClick={() => {
                setFoundPatient(null)
                setIsAddingNewLab(false)
              }}
              className="ml-2 text-gray-400 hover:text-gray-600"
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

          {!isAddingNewLab && (
            <button
              onClick={() => setIsAddingNewLab(true)}
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
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Create Lab Record</span>
            </button>
          )}
        </div>
      )}
      {/* Display searched prescriptions with lab advice or create new lab options */}
      {searchedPrescriptions.length > 0 ? (
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 mb-8 bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Search Results: {searchedPrescriptions.length} Prescription(s) with Lab Advice
            </h2>
            <button
              onClick={() => {
                setSearchTerm('')
                setSearchedPrescriptions([])
              }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Clear search results"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchedPrescriptions.map((prescription, index) => (
              <div key={index} className="border rounded-lg p-4 bg-blue-50 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-blue-800">
                      {prescription['PATIENT NAME'] || 'Unknown Patient'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {prescription['PATIENT ID'] || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateLabFromPrescription(prescription)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                  >
                    Create Lab
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Lab Advice:</p>
                  <div className="text-sm text-gray-600 mt-1">
                    {Array.from({ length: 10 }, (_, i) => {
                      const adviceKey = `ADVICE ${i + 1}` as keyof typeof prescription
                      const advice = prescription[adviceKey] as string
                      if (
                        advice &&
                        typeof advice === 'string' &&
                        (advice.toLowerCase().includes('lab') ||
                          advice.toLowerCase().includes('test'))
                      ) {
                        return (
                          <p key={i} className="mb-1 border-l-2 border-blue-300 pl-2">
                            {advice}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>

                  {/* Display extracted lab tests */}
                  {prescription._extractedLabTests &&
                    prescription._extractedLabTests.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wider font-bold text-gray-700 mb-2 border-b pb-1 border-gray-200">
                          Lab Tests
                        </p>
                        <ul className="space-y-1.5">
                          {prescription._extractedLabTests.map((test, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 font-medium">{test.name}</span>
                              {test.amount && test.amount !== '0' && (
                                <span className="text-gray-500 text-sm">₹{test.amount}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Display extracted vennela tests */}
                  {prescription._extractedVennelaTests &&
                    prescription._extractedVennelaTests.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs uppercase tracking-wider font-bold text-blue-800 mb-2 border-b pb-1 border-blue-100">
                          Vennela Tests
                        </p>
                        <ul className="space-y-1.5">
                          {prescription._extractedVennelaTests.map((test, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-blue-700 font-medium">{test.name}</span>
                              {test.amount && (
                                <span className="text-gray-500 text-sm">₹{test.amount}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        ''
      )}
      {/* Lab Form Section */}
      {isAddingNewLab && (
        <div className="max-w-7xl mx-auto py-4 sm:px-8 mb-8 bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Lab Record</h2>
          </div>
          <LabForm
            onSubmit={handleAddLab}
            onCancel={handleCancelLabForm}
            selectedPatient={foundPatient}
            extractedVennelaTests={currentExtractedVennelaTests}
            extractedLabTests={currentExtractedLabTests}
          />
        </div>
      )}

      {/* Vennela Lab Form Section */}
      {isAddingVennelaLab && (
        <div className="max-w-7xl mx-auto py-4 sm:px-8 mb-8 bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add Vennela Lab Record</h2>
          </div>
          <LabForm
            onSubmit={handleAddLab}
            onCancel={handleCancelVennelaLabForm}
            selectedPatient={foundPatient} // This can be null for general customers
            isVennelaMode={true}
            isGeneralCustomer={!foundPatient} // Flag to indicate this is for a general customer
            extractedVennelaTests={currentExtractedVennelaTests}
            extractedLabTests={currentExtractedLabTests}
          />
        </div>
      )}

      {/* Today's Prescription Labs Section */}
      {/* <TodaysPrescriptionLabs onCreateLab={handleCreateLabFromPrescription} /> */}

      {/* Labs Table Section */}
      <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-8 bg-white p-4 rounded-lg border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Lab Records for {selectedDate}</h2>
        {isLoading ? (
          <div className="text-center py-4">Loading labs data...</div>
        ) : (
          <LabTableWithReceipts
            labs={labs}
            onEditLab={handleEditLab}
            onDeleteLab={handleDeleteLab}
          />
        )}
      </div>

      {/* Edit Lab Modal */}
      {isModalOpen && editingLab && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Edit Lab Record">
          <LabForm
            onSubmit={handleEditFormSubmit}
            onCancel={handleCloseModal}
            initialData={editingLab}
          />
        </Modal>
      )}
      {/* Toast Container */}
      <Toaster />
    </div>
  )
}

export default Labs
