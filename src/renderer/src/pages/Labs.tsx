import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import LabForm from '../components/labs/LabForm'
import LabTableWithReceipts from '../components/labs/LabTableWithReceipts'
import Modal from '../components/common/Modal'

// Define the Lab type to match with LabTableWithReceipts component
type Lab = {
  id: string
  [key: string]: unknown
}

// Define StandardizedResponse interface for API responses
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
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
  const [patients, setPatients] = useState<Patient[]>([])
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [labCount, setLabCount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [error, setError] = useState<string>('')

  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingLab, setEditingLab] = useState<Lab | null>(null)
  const [isAddingNewLab, setIsAddingNewLab] = useState<boolean>(false)

  // Load labs and patients data on component mount
  useEffect(() => {
    loadLabs()
    loadPatients()
    loadTodaysLabs()
  }, [])

  // Load all labs
  const loadLabs = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const result = await window.api.getLabs()
      if (result && Array.isArray(result)) {
        setLabs(result)
      } else {
        console.error('Invalid labs data format:', result)
        setLabs([])
      }
    } catch (error) {
      console.error('Error loading labs:', error)
      toast.error('Failed to load labs data')
      setLabs([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load today's labs to get the lab count
  const loadTodaysLabs = async (): Promise<void> => {
    try {
      const result = await window.api.getTodaysLabs()
      if (result && Array.isArray(result)) {
        // Just set the lab count based on today's labs
        setLabCount(result.length + 1) // Set the count for the next lab
      } else {
        console.error("Invalid today's labs data format:", result)
        setLabCount(1)
      }
    } catch (error) {
      console.error("Error loading today's labs:", error)
      setLabCount(1)
    }
  }

  // Load patients data
  const loadPatients = async (): Promise<void> => {
    try {
      const response = await window.api.getPatients()
      let patientsData: Patient[] = []

      // Handle standardized response format
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // New standardized format
          const standardizedResponse = response as unknown as StandardizedResponse<Patient[]>
          if (standardizedResponse.success && Array.isArray(standardizedResponse.data)) {
            patientsData = standardizedResponse.data as unknown as Patient[]
          } else {
            console.warn(
              'Patients response unsuccessful or data is not an array:',
              standardizedResponse.message || 'No message provided'
            )
            toast.error(
              `Failed to load patients: ${standardizedResponse.message || 'Unknown error'}`
            )
          }
        } else if (Array.isArray(response)) {
          // Legacy format (direct array)
          patientsData = response as unknown as Patient[]
        } else {
          console.warn('Unexpected patients response format:', response)
        }
      }

      setPatients(patientsData)
    } catch (error) {
      console.error('Error loading patients:', error)
      toast.error(
        `Failed to load patients: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      setPatients([])
    }
  }

  // Function to handle patient search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setFoundPatient(null)
      setError('')

      // Close any open forms first
      setIsAddingNewLab(false)

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
        setError('')
      } else {
        setFoundPatient(null)
        setError('No patients found')
      }
    } catch (err) {
      console.error('Error searching patients:', err)
      setError('Failed to search patients')
      setFoundPatient(null)
      toast.error('Failed to search patients')
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

      const result = await window.api.addLab(labWithCreatedBy)
      if (result) {
        toast.success('Lab record added successfully')
        await loadLabs()
        await loadTodaysLabs()
        setIsAddingNewLab(false)
        setFoundPatient(null)
      } else {
        toast.error('Failed to add lab record')
      }
    } catch (error) {
      console.error('Error adding lab:', error)
      toast.error('Failed to add lab record')
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
      const result = await window.api.updateLab(labData)
      if (result) {
        toast.success('Lab record updated successfully')
        await loadLabs()
        await loadTodaysLabs()
        setIsModalOpen(false)
        setEditingLab(null)
      } else {
        toast.error('Failed to update lab record')
      }
    } catch (error) {
      console.error('Error updating lab:', error)
      toast.error('Failed to update lab record')
    }
  }

  // Handle deleting a lab
  const handleDeleteLab = async (id: string): Promise<void> => {
    try {
      const result = await window.api.deleteLab(id)
      if (result) {
        toast.success('Lab record deleted successfully')
        await loadLabs()
        await loadTodaysLabs()
      }
    } catch (error) {
      console.error('Error deleting lab:', error)
      toast.error('Failed to delete lab record')
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
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Patient Management</h1>
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
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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

      {/* Lab Form Section */}
      {isAddingNewLab && foundPatient && (
        <div className="max-w-7xl mx-auto  py-4 sm:px-8 mb-8 bg-white p-4 rounded-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Add Lab Record</h2>
          <LabForm
            onSubmit={handleAddLab}
            onCancel={handleCancelLabForm}
            labCount={labCount}
            selectedPatient={foundPatient}
          />
        </div>
      )}

      {/* Labs Table Section */}
      <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-8 bg-white p-4 rounded-lg border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Lab Records</h2>
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
            labCount={labCount}
          />
        </Modal>
      )}
      {/* Toast Container */}
      <Toaster />
    </div>
  )
}

export default Labs
