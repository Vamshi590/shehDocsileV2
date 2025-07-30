import React, { useState, useEffect } from 'react'
import OperationForm from '../components/operations/OperationForm'
import OperationTableWithReceipts from '../components/operations/OperationTableWithReceipts'
import { Toaster, toast } from 'sonner'
// Define Operation interface to match OperationForm component's type
interface Operation {
  id: string
  billNumber?: string
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
  part1?: string
  amount1?: string
  days1?: number
  part2?: string
  amount2?: string
  days2?: number
  part3?: string
  amount3?: string
  days3?: number
  part4?: string
  amount4?: string
  days4?: number
  part5?: string
  amount5?: string
  days5?: number
  part6?: string
  amount6?: string
  days6?: number
  part7?: string
  amount7?: string
  days7?: number
  part8?: string
  amount8?: string
  days8?: number
  part9?: string
  amount9?: string
  days9?: number
  part10?: string
  amount10?: string
  days10?: number
  reviewOn?: string
  totalAmount?: number
  modeOfPayment?: string
  pdeReOpticDisk?: string
  pdeReOpticMacula?: string
  pdeReOpticBloodVessels?: string
  pdeRePr?: string
  pdeLeOpticDisk?: string
  pdeLeOpticMacula?: string
  pdeLeOpticBloodVessels?: string
  pdeLePr?: string
  operatedBy?: string
  date?: string
  operationType?: string
  surgeon?: string
  preOpDiagnosis?: string
  procedure?: string
  prescriptionData?: string
  [key: string]: unknown
}

// Define API response interface
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

// Define API interface for window.api
interface API {
  // Operation methods
  getOperations?: () => Promise<ApiResponse<Operation[]>>
  getPatientOperations?: (patientId: string) => Promise<ApiResponse<Operation[]>>
  addOperation?: (operation: Omit<Operation, 'id'>) => Promise<ApiResponse<Operation>>
  updateOperation?: (id: string, operation: Operation) => Promise<ApiResponse<Operation>>
  deleteOperation?: (id: string) => Promise<ApiResponse<void>>

  // Other methods that might be used
  getPatients?: () => Promise<ApiResponse<Patient[]>>
  getPatientById?: (patientId: string) => Promise<ApiResponse<Patient>>
  searchPatients?: (searchTerm: string) => Promise<ApiResponse<Patient[]>>
}

// Define Patient type to match both modules
type Patient = {
  'PATIENT ID': string
  'PATIENT NAME'?: string
  'GUARDIAN NAME'?: string
  'PHONE NUMBER'?: string
  DOB?: string
  AGE?: number | string
  GENDER?: string
  ADDRESS?: string
  id?: string
  name?: string
  phone?: string
  [key: string]: unknown
}

// Define FormPatient type to match OperationForm component's expected Patient type
type FormPatient = {
  patientId: string
  name: string
  guardian?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  [key: string]: unknown
}

// Using Operation interface imported from api.d.ts

const Operations: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([]) /* State for loading indicator */
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [patientOperations, setPatientOperations] = useState<Operation[]>([])
  const [allOperations, setAllOperations] = useState<Operation[]>([])
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [showOperationForm, setShowOperationForm] = useState(false)
  // Track where the operation form should be displayed

  // Load patients and operations when component mounts
  useEffect(() => {
    loadPatients()
    loadAllOperations()
  }, [])

  // Filter operations to only include those still admitted, future discharge, or added today
  const todayDateStr = new Date().toISOString().split('T')[0]
  const activeOperations = allOperations.filter((op) => {
    const dischargeDate = op.dateOfDischarge
      ? typeof op.dateOfDischarge === 'string'
        ? op.dateOfDischarge.split('T')[0]
        : op.dateOfDischarge
      : ''

    // Show if no discharge date or discharge date is in the future
    if (!dischargeDate || dischargeDate > todayDateStr) return true

    // Also show if the record was added today (based on admit or operation date)
    const admitDate = op.dateOfAdmit
      ? typeof op.dateOfAdmit === 'string'
        ? op.dateOfAdmit.split('T')[0]
        : op.dateOfAdmit
      : ''

    const operationDate = op.dateOfOperation
      ? typeof op.dateOfOperation === 'string'
        ? op.dateOfOperation.split('T')[0]
        : op.dateOfOperation
      : ''

    return admitDate === todayDateStr || operationDate === todayDateStr
  })

  // Merge additional patient details (age, guardian, phone, etc.) into each operation
  const operationsWithPatientInfo = activeOperations.map((op) => {
    const patient = patients.find((p) => (p['patientId'] ?? p.id) == op.patientId)
    if (!patient) return op
    return {
      ...op,
      guardianName:
        (patient['GUARDIAN NAME'] as string | undefined) ??
        (patient as { guardianName?: string })?.guardianName ??
        (patient as { guardian?: string })?.guardian ??
        '',
      phone:
        (patient['PHONE NUMBER'] as string | undefined) ??
        (patient as { phone?: string })?.phone ??
        '',
      age: patient.AGE ?? (patient as { age?: string | number })?.age ?? '',
      gender: patient.GENDER ?? (patient as { gender?: string })?.gender ?? '',
      address: patient.ADDRESS ?? (patient as { address?: string })?.address ?? ''
    }
  })

  console.log('operationsWithPatientInfo', operationsWithPatientInfo)
  // Load patients and operations on component mount
  useEffect(() => {
    loadPatients()
    loadAllOperations()
  }, [])

  // Function to load patients from the backend
  const loadPatients = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as unknown as API
      if (api.getPatients) {
        const response = await api.getPatients()

        if (response.success) {
          setPatients(response.data || [])
          setError('')
        } else {
          console.error('Failed to load patients:', response.message)
          setError(`Failed to load patients: ${response.message}`)
        }
      } else {
        console.error('getPatients method is not available')
        setError('Failed to load patients: API method not available')
      }
    } catch (err) {
      console.error('Error loading patients:', err)
      setError(`Failed to load patients: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to load all operations
  const loadAllOperations = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as unknown as API
      if (api.getOperations) {
        const response = await api.getOperations()
        if (response.success) {
          setAllOperations(response.data || [])
          setError('')
        } else {
          console.error('Failed to load operations:', response.message)
          setError(`Failed to load operations: ${response.message}`)
        }
      } else {
        console.error('getOperations method is not available')
        setError('Failed to load operations: API method not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError(`Failed to load operations: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Convert Patient to FormPatient for the OperationForm component
  const convertToFormPatient = (patient: Patient): FormPatient => {
    // Ensure all fields are of the correct type
    const patientId =
      typeof patient['PATIENT ID'] === 'string'
        ? patient['PATIENT ID']
        : typeof patient.patientId === 'string'
          ? patient.patientId
          : ''

    const name =
      typeof patient['PATIENT NAME'] === 'string'
        ? patient['PATIENT NAME']
        : typeof patient.name === 'string'
          ? patient.name
          : ''

    const guardian = typeof patient.guardian === 'string' ? patient.guardian : ''

    const phone = typeof patient.phone === 'string' ? patient.phone : ''

    const age =
      typeof patient.age === 'string' || typeof patient.age === 'number' ? patient.age : ''

    const gender = typeof patient.gender === 'string' ? patient.gender : ''

    const address = typeof patient.address === 'string' ? patient.address : ''

    console.log('Converting patient with ID:', patientId)

    return {
      patientId,
      name,
      guardian,
      phone,
      age,
      gender,
      address
    }
  }

  // Handle operation save (both add and update)
  const handleOperationSave = async (
    operation: Operation | Omit<Operation, 'id'>,
    prescriptionData?: string | null
  ): Promise<void> => {
    try {
      if ('id' in operation && operation.id) {
        // It's an update operation with a valid ID
        await handleUpdateOperation(operation as Operation, prescriptionData)
      } else {
        // It's a new operation or has an invalid ID
        // Create a new operation without the ID to ensure we're adding a new operation
        const operationData = { ...operation } as Partial<Operation>
        // Delete any existing ID to force creation of a new operation
        delete operationData.id
        // Include prescription data if available
        if (prescriptionData) {
          // Store prescription data as a JSON string to ensure proper serialization
          operationData.prescriptionData = prescriptionData
        }
        await handleAddOperation(operationData as Omit<Operation, 'id'>)
      }
    } catch (err) {
      console.error('Error in handleOperationSave:', err)
      setError(`Failed to save operation: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle operation delete
  const handleDeleteOperation = async (operationId: string): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as unknown as API
      if (api.deleteOperation) {
        const response = await api.deleteOperation(operationId)

        if (response.success) {
          toast.success('Operation deleted successfully')
          // Remove from all operations list
          setAllOperations(allOperations.filter((op) => op.id !== operationId))
          // Remove from patient operations list if applicable
          setPatientOperations(patientOperations.filter((op) => op.id !== operationId))
          setSelectedOperation(null)
        } else {
          console.error('Failed to delete operation:', response.message)
          toast.error(`Failed to delete operation: ${response.message}`)
        }
      } else {
        console.error('deleteOperation method is not available')
        setError('Failed to delete operation: API method not available')
      }
    } catch (err) {
      console.error('Error deleting operation:', err)
      setError(
        `Failed to delete operation: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle selecting an operation for editing
  const handleOperationSelect = (operation: Operation): void => {
    setSelectedOperation(operation)
    setShowOperationForm(true)

    // Find the patient associated with this operation and set it as selected patient
    const patient = patients.find(
      (p) => p['PATIENT ID'] === operation.patientId || p.id === operation.patientId
    )
    if (patient) {
      setSelectedPatient(patient)
    } else {
      console.warn(
        `Patient not found for operation: ${operation.id} with patientId: ${operation.patientId}`
      )
      // Create a minimal patient object from operation data to allow editing
      setSelectedPatient({
        'PATIENT ID': operation.patientId,
        'PATIENT NAME': operation.patientName
      })
    }
  }

  // Handle adding a new operation
  const handleAddOperation = async (operationData: Omit<Operation, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as unknown as API

      if (!api.addOperation) {
        console.error('addOperation method is not available')
        toast.error('Failed to add operation: API method not available')
        return
      }

      console.log('Adding operation with data:', operationData)
      const response = await api.addOperation(operationData)

      if (response.success && response.data) {
        const newOperation = response.data
        console.log('Operation added successfully:', newOperation)

        // Add to the operations list
        setAllOperations((prev) => [newOperation, ...prev])

        // If this is for the selected patient, add to their operations too
        if (
          selectedPatient &&
          newOperation.patientId ===
            (selectedPatient.patientId || selectedPatient.id || selectedPatient['PATIENT ID'])
        ) {
          setPatientOperations((prev) => [newOperation, ...prev])
        }

        // Reset form and UI state
        setShowOperationForm(false)
        setSelectedOperation(null)
        setSelectedPatient(null)
        setSearchTerm('')
        toast.success('Operation added successfully')
      } else {
        console.error('Failed to add operation:', response?.message || 'Unknown error')
        toast.error(`Failed to add operation: ${response?.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error adding operation:', err)
      toast.error(
        `Failed to add operation: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle updating an existing operation
  const handleUpdateOperation = async (
    operationData: Operation,
    prescriptionData?: string | null
  ): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      // Include prescription data if provided
      const dataToUpdate = prescriptionData ? { ...operationData, prescriptionData } : operationData

      const api = window.api as unknown as API
      if (api.updateOperation) {
        const response = await api.updateOperation(operationData.id, dataToUpdate)

        if (response.success) {
          const updatedOperation = response.data
          toast.success('Operation updated successfully')

          // Update in all operations list
          setAllOperations(
            allOperations.map((op) => (op.id === updatedOperation.id ? updatedOperation : op))
          )

          // Update in patient operations list if applicable
          setPatientOperations(
            patientOperations.map((op) => (op.id === updatedOperation.id ? updatedOperation : op))
          )

          setShowOperationForm(false)
          setSelectedOperation(null)
          setSelectedPatient(null)
          setSearchTerm('')
        } else {
          console.error('Failed to update operation:', response.message)
          setError(`Failed to update operation: ${response.message}`)
        }
      } else {
        console.error('updateOperation method is not available')
        setError('Failed to update operation: API method not available')
      }
    } catch (err) {
      console.error('Error updating operation:', err)
      setError(
        `Failed to update operation: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to load operations for a specific patient
  const loadPatientOperations = async (patientId: string): Promise<void> => {
    if (!patientId || patientId === 'undefined' || patientId === 'null') {
      console.error('Invalid patient ID provided:', patientId)
      setError('Cannot load operations: Invalid patient ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log(`Loading operations for patient ID: ${patientId}`)

      const api = window.api as unknown as API
      if (!api.getPatientOperations) {
        console.error('getPatientOperations method is not available')
        setError('Failed to load patient operations: API method not available')
        return
      }

      // Call the API with the patient ID
      const response = await api.getPatientOperations(patientId)

      // Check if the response exists and has the expected structure
      if (!response) {
        console.error('Empty response from getPatientOperations')
        setError('Failed to load patient operations: No response from server')
        return
      }

      // Handle the API response
      if (response.success) {
        console.log(`Loaded ${response.data?.length || 0} operations for patient ${patientId}`)
        setPatientOperations(response.data || [])
        setError('')

        // If no operations found, show a friendly message
        if (!response.data || response.data.length === 0) {
          toast.info('No operations found for this patient')
        }
      } else {
        console.error('Failed to load patient operations:', response.message)
        setError(`Failed to load patient operations: ${response.message || 'Unknown error'}`)
        toast.error(`Failed to load operations: ${response.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Error loading patient operations:', err)
      setError(`Failed to load operations: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error(`Error: ${err instanceof Error ? err.message : 'Failed to load operations'}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle patient search - modified to not automatically show operation form
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      setFoundPatient(null)
      setSelectedPatient(null)
      setPatientOperations([])
      setSelectedOperation(null)
      setShowOperationForm(false)

      if (!searchTerm.trim()) {
        setError('Please enter a search term')
        setLoading(false)
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue)

      if (!patients || patients.length === 0) {
        console.log('No patients available in the system')
        setError('No patient data available. Please check the patient database.')
        setLoading(false)
        return
      }

      console.log(`Searching through ${patients.length} patients`)

      // First try to find an exact match by patient ID
      let matchedPatient = patients.find((patient) => {
        const patientId = String(patient['PATIENT ID'] || patient.patientId || '').toLowerCase()
        return patientId === searchValue
      })

      // If no exact match by ID, try partial match on name
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          const patientName = String(patient['PATIENT NAME'] || patient.name || '').toLowerCase()
          return patientName.includes(searchValue)
        })
      }

      // If still no match, try partial match on phone
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          const phoneNumber = String(patient['PHONE NUMBER'] || patient.phone || '').toLowerCase()
          return phoneNumber.includes(searchValue)
        })
      }

      // If still no match, try partial match on any field
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
        setSelectedPatient(matchedPatient)

        // Fetch operations for this patient - check all possible ID fields
        const patientId =
          matchedPatient['PATIENT ID'] || matchedPatient.patientId || matchedPatient.id || ''

        // Convert to string and ensure it's not empty
        const patientIdStr = String(patientId)

        if (!patientIdStr || patientIdStr === 'undefined' || patientIdStr === 'null') {
          console.error('Patient ID is missing or invalid in the matched patient:', matchedPatient)
          setError('Patient ID is missing or invalid. Cannot fetch operations.')
          setLoading(false)
          return
        }

        console.log('Found valid patient ID:', patientIdStr)

        // Load operations for the found patient
        await loadPatientOperations(patientIdStr)
      } else {
        console.log('No matching patient found for:', searchValue)
        setError(`No patients found matching "${searchTerm}"`)
      }
    } catch (err) {
      console.error('Error searching patients:', err)
      setError(
        `Error searching for patients: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Operations / Surgeries</h1>
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
        <div className="flex-1 overflow-auto">
          {/* Patient Search Section */}
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
                    setSelectedPatient(null)
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
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {loading && <p className="text-blue-500 mt-2">Searching...</p>}
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
                  onClick={() => {
                    setFoundPatient(null)
                    setSelectedPatient(null)
                  }}
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
              <div className="overflow-x-auto mb-6 border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Display all patient fields dynamically */}
                    {Object.entries(foundPatient).map(([key, value], index) => {
                      // Skip the id field as it's internal
                      if (key === 'id') return null

                      // Create a new row for every two fields
                      if (index % 2 === 0) {
                        const nextKey = Object.keys(foundPatient)[index + 1]
                        const nextValue = nextKey ? foundPatient[nextKey as keyof Patient] : null

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
            </div>
          )}

          {/* Previous Operations Table - Show when a patient is selected */}
          {selectedPatient && patientOperations.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous Operations
                </h2>
                <button
                  onClick={() => {
                    setShowOperationForm(true)
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
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Add New Operation</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <p className="text-blue-500">Loading operations...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Patient ID
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Patient Name
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operation Details
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Procedure
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Provision Diagnosis
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operated By
                        </th>{' '}
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Review On
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientOperations.map((operation) => (
                        <tr
                          key={operation.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOperationSelect(operation)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.patientId || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.patientName || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfAdmit || '-'}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfOperation || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfDischarge || '-'}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationDetails && operation.operationDetails.length > 30
                              ? `${operation.operationDetails.substring(0, 30)}...`
                              : operation.operationDetails || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationProcedure &&
                            operation.operationProcedure.length > 30
                              ? `${operation.operationProcedure.substring(0, 30)}...`
                              : operation.operationProcedure || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.provisionDiagnosis &&
                            operation.provisionDiagnosis.length > 30
                              ? `${operation.provisionDiagnosis.substring(0, 30)}...`
                              : operation.provisionDiagnosis || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {typeof operation.operatedBy === 'object' &&
                            operation.operatedBy !== null &&
                            Object.keys(operation.operatedBy).length === 0
                              ? '-'
                              : typeof operation.operatedBy === 'string'
                                ? operation.operatedBy
                                : '-'}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfAdmit || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfOperation || '-'}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfDischarge || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.reviewOn || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOperationSelect(operation)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 mr-3"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              Send Receipt
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this operation?')) {
                                  handleDeleteOperation(operation.id)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Show Add New Operation button if patient is selected but no operations exist */}
          {selectedPatient && patientOperations.length === 0 && !loading && !showOperationForm && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 mb-4">No previous operations found for this patient.</p>
              <button
                onClick={() => {
                  setShowOperationForm(true)
                }}
                className="px-4 py-2 bg-green-500 cursor-pointer hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5 mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Add First Operation</span>
              </button>
            </div>
          )}
          {/* Inline Operation Form */}
          {showOperationForm && (
            <div className="mt-6 mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedOperation ? 'Edit Operation' : 'New Operation'}
                </h2>
                <button
                  onClick={() => {
                    setShowOperationForm(false)
                    setSelectedOperation(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedPatient && (
                <OperationForm
                  patient={convertToFormPatient(selectedPatient)}
                  operation={selectedOperation}
                  onSave={handleOperationSave}
                  onCancel={() => {
                    setShowOperationForm(false)
                    setSelectedOperation(null)
                  }}
                />
              )}

              {!selectedPatient && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Please select a patient first to add an operation.
                  </p>
                  <button
                    onClick={() => {
                      setShowOperationForm(false)
                      setSelectedOperation(null)
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
          {/* All Operations Records Section */}
          <div className="bg-white p-6  rounded-lg shadow-sm border border-gray-100">
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
                Active Operation Records
              </h2>
              <div className="text-sm text-gray-500">
                {!loading && allOperations.length > 0 && (
                  <span>
                    {activeOperations.length} {activeOperations.length === 1 ? 'record' : 'records'}{' '}
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
                  <p className="mt-3 text-gray-500">Loading operations...</p>
                </div>
              </div>
            )}
            {!loading && activeOperations.length === 0 ? (
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
                <p className="text-gray-600 text-lg mb-2">No operations found</p>
                <p className="text-gray-500 mb-6">
                  Search for the &quot;Patient&quot; to add new operation record
                </p>
              </div>
            ) : (
              !loading && (
                <OperationTableWithReceipts
                  operations={operationsWithPatientInfo}
                  onEditOperation={handleOperationSelect}
                  onDeleteOperation={handleDeleteOperation}
                />
              )
            )}
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

export default Operations
