import React, { useState, useEffect } from 'react'
import {
  departmentOptions,
  doctorOptions,
  referredByOptions,
  statusOptions
} from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Standardized API response format
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

interface Patient {
  id: string
  date: string
  patientId: string
  name: string
  guardian: string
  dob: string
  age: number | string
  gender: string
  phone: string
  address: string
  status: string
  doctorName: string
  department: string
  referredBy: string
  createdBy: string
}

// Extended form data interface with optional id and update fields
interface ExtendedFormData extends Omit<Patient, 'id'> {
  id?: string
  updatedBy?: string
  updatedAt?: string
}

interface PatientFormProps {
  onSubmit: (formData: ExtendedFormData) => Promise<Patient | unknown>
  onCreateReceipt?: (patient: Patient) => void
  initialValues?: Partial<Patient>
  createdBy?: string
  patientCount?: number
}

const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  onCreateReceipt,
  initialValues,
  patientCount = 0
}) => {
  const [isExistingPatientMode, setIsExistingPatientMode] = useState(false)
  const [searchPatientId, setSearchPatientId] = useState('')
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Helper function to get current user from localStorage
  const getCurrentUser = (): string => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        return user.fullName || user.username || 'Unknown User'
      }
      return 'Unknown User'
    } catch (error) {
      console.error('Error getting current user:', error)
      return 'Unknown User'
    }
  }

  // This section intentionally left empty as the ExtendedFormData interface is now defined at the top level

  const [formData, setFormData] = useState<ExtendedFormData>({
    date: initialValues?.date || format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd'),
    patientId: initialValues?.patientId || '',
    name: initialValues?.name || '',
    guardian: initialValues?.guardian || '',
    dob: initialValues?.dob || '',
    age: initialValues?.age || (0 as number | string),
    gender: initialValues?.gender || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    status: initialValues?.status || 'Regular',
    doctorName: initialValues?.doctorName || 'Dr. Srilatha ch',
    department: initialValues?.department || 'Opthalmology',
    referredBy: initialValues?.referredBy || 'Self',
    createdBy: initialValues?.createdBy || getCurrentUser(),
    // Include id if it exists in initialValues
    ...(initialValues?.id ? { id: initialValues.id } : {})
  })

  // Dynamic dropdown options state - fetched from backend
  const [dynamicDoctorOptions, setDynamicDoctorOptions] = useState<string[]>([])
  const [dynamicDepartmentOptions, setDynamicDepartmentOptions] = useState<string[]>([])
  const [dynamicReferredByOptions, setDynamicReferredByOptions] = useState<string[]>([])

  // Load dropdown options on component mount
  useEffect(() => {
    const loadDropdownOptions = async (): Promise<void> => {
      const [doctorOpts, departmentOpts, referredByOpts] = await Promise.all([
        fetchDropdownOptions('doctorName'),
        fetchDropdownOptions('department'),
        fetchDropdownOptions('referredBy')
      ])
      setDynamicDoctorOptions(doctorOpts)
      setDynamicDepartmentOptions(departmentOpts)
      setDynamicReferredByOptions(referredByOpts)
    }
    loadDropdownOptions()
  }, [])

  // Function to fetch the latest patient ID and generate the next one
  const fetchLatestPatientId = async (force = false): Promise<void> => {
    try {
      // Only proceed if we're not in edit mode and either we don't have a patient ID yet or force is true
      if ((!initialValues && !formData.patientId && !isExistingPatientMode) || force) {
        // Get the patient count directly from the backend (more efficient)
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const response = (await api.getLatestPatientId()) as {
          success: boolean
          data: number
          message: string
        }

        if (response.success) {
          // Start with the next ID after the latest
          let nextNumericId = response.data + 1
          let isUnique = false

          // Keep checking until we find a unique ID
          while (!isUnique) {
            // Format with leading zeros (4 digits)
            const nextId = String(nextNumericId).padStart(4, '0')

            // Check if this ID already exists
            const checkResponse = (await api.getPatientById(nextId)) as {
              success: boolean
              data: unknown | null
              message: string
            }

            // If no patient found with this ID, it's unique
            if (!checkResponse.data) {
              isUnique = true
              setFormData((prev) => ({ ...prev, patientId: nextId }))
            } else {
              // ID exists, try the next one
              console.log(`Patient ID ${nextId} already exists, trying next ID`)
              nextNumericId++
            }
          }
        } else {
          console.error('Failed to get latest patient ID:', response.message)
          // Fallback to the old method if API call fails
          if (!initialValues && patientCount !== null && !formData.patientId) {
            const nextId = String(patientCount + 1).padStart(4, '0')
            setFormData((prev) => ({ ...prev, patientId: nextId }))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching latest patient ID:', error)
      // Fallback to the old method if API call fails
      if (!initialValues && patientCount !== null && !formData.patientId) {
        const nextId = String(patientCount + 1).padStart(4, '0')
        setFormData((prev) => ({ ...prev, patientId: nextId }))
      }
    }
  }

  // Call fetchLatestPatientId on component mount or when dependencies change
  useEffect(() => {
    fetchLatestPatientId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, formData.patientId, isExistingPatientMode, patientCount])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (fieldName: string): Promise<string[]> => {
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const result = (await api.getDropdownOptions(fieldName)) as {
        success: boolean
        options?: string[]
        error?: string
      }
      if (result.success && result.options) {
        return result.options
      } else {
        console.warn(`Failed to fetch ${fieldName} options:`, result.error)
        // Return fallback options from static imports
        switch (fieldName) {
          case 'doctorName':
            return doctorOptions
          case 'department':
            return departmentOptions
          case 'referredBy':
            return referredByOptions
          default:
            return []
        }
      }
    } catch (error) {
      console.error(`Error fetching ${fieldName} options:`, error)
      // Return fallback options from static imports
      switch (fieldName) {
        case 'doctorName':
          return doctorOptions
        case 'department':
          return departmentOptions
        case 'referredBy':
          return referredByOptions
        default:
          return []
      }
    }
  }

  // Helper function to add new option permanently and refresh options
  const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
    if (!value.trim()) return

    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const result = await api.addDropdownOption(fieldName, value)
      if (result) {
        console.log(`Added '${value}' to ${fieldName} options permanently`)
        // Refresh the options from backend to get the updated list
        const updatedOptions = await fetchDropdownOptions(fieldName)
        switch (fieldName) {
          case 'doctorName':
            setDynamicDoctorOptions(updatedOptions)
            break
          case 'department':
            setDynamicDepartmentOptions(updatedOptions)
            break
          case 'referredBy':
            setDynamicReferredByOptions(updatedOptions)
            break
        }
      }
    } catch (error) {
      console.error('Error adding dropdown option:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target

    // Calculate age if DOB changes
    if (name === 'dob') {
      const birthDate = new Date(value)
      const today = new Date()

      // Calculate difference in milliseconds
      const diffTime = today.getTime() - birthDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      // Calculate years, months, and days
      let years = today.getFullYear() - birthDate.getFullYear()
      let months = today.getMonth() - birthDate.getMonth()

      // Adjust years and months if needed
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--
        months += 12
      }

      // Adjust for day of month
      if (today.getDate() < birthDate.getDate()) {
        months--
      }

      // Format age as appropriate
      let ageValue: string | number = years

      if (years === 0) {
        if (months > 0) {
          ageValue = `${months} months`
        } else {
          ageValue = `${diffDays} days`
        }
      }

      setFormData({
        ...formData,
        [name]: value,
        age: ageValue
      })
    }
    // Calculate DOB if age changes
    else if (name === 'age') {
      // Check if the input contains only digits (a simple age in years)
      const isNumericAge = /^\d+$/.test(value)

      if (isNumericAge) {
        const ageValue = parseInt(value) || 0
        const today = new Date()
        const birthYear = today.getFullYear() - ageValue
        // Set to January 1st of the calculated birth year
        const dob = `${birthYear}-01-01`

        setFormData({
          ...formData,
          [name]: value, // Keep as string for display
          dob: dob
        })
      } else {
        // For text inputs like "3 months" or "15 days", just store the value
        // but don't try to calculate DOB
        setFormData({
          ...formData,
          [name]: value
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleExistingPatientClick = (): void => {
    const newMode = !isExistingPatientMode
    setIsExistingPatientMode(newMode)

    if (newMode) {
      // Entering existing patient mode - reset search
      setSearchPatientId('')
      setSearchedPatient(null)
    } else {
      // Switching back to new patient mode - reset form data
      setSearchedPatient(null)
      setFormData({
        date: String(new Date().toISOString().split('T')[0]),
        patientId: '',
        name: '',
        guardian: '',
        dob: '',
        age: 0,
        gender: 'Male',
        phone: '',
        address: '',
        status: 'New',
        doctorName: 'Dr. Srilatha ch',
        department: 'Opthalmology',
        referredBy: 'Self',
        createdBy: getCurrentUser()
      })

      // Re-fetch latest patient ID for the new patient
      // Force parameter ensures it runs even if conditions wouldn't normally allow it
      fetchLatestPatientId(true)
    }
  }

  const handleSearchPatient = async (): Promise<void> => {
    if (!searchPatientId.trim()) {
      toast.error('Please enter a Patient ID to search')
      return
    }

    setIsSearching(true)
    try {
      // Call the main process to search for patient
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = await api.getPatientById(searchPatientId)

      // Handle standardized response format
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // This is the new standardized response format
          const standardizedResponse = response as StandardizedResponse<Patient>
          if (standardizedResponse.success && standardizedResponse.data) {
            const patient = standardizedResponse.data as Patient
            setSearchedPatient(patient)
            // Populate form with patient data but keep status and doctor fields editable
            setFormData({
              ...patient,
              status: 'Regular', // Reset status for new visit
              doctorName: 'Dr. Srilatha ch', // Reset doctor
              department: 'Opthalmology', // Reset department
              referredBy: 'Self' // Reset referred by
            })
          } else {
            toast.error(`Patient not found: ${standardizedResponse.message || 'Unknown error'}`)
            setSearchedPatient(null)
          }
        } else {
          // Handle legacy response format (direct patient object)
          const patient = response as Patient
          if (patient && 'patientId' in patient) {
            setSearchedPatient(patient)
            // Populate form with patient data but keep status and doctor fields editable
            setFormData({
              ...patient,
              status: 'Regular', // Reset status for new visit
              doctorName: 'Dr. Srilatha ch', // Reset doctor
              department: 'Opthalmology', // Reset department
              referredBy: 'Self' // Reset referred by
            })
          } else {
            toast.error('Patient not found with ID: ' + searchPatientId)
            setSearchedPatient(null)
          }
        }
      } else {
        toast.error('Invalid response format from server')
        setSearchedPatient(null)
      }
    } catch (error) {
      console.error('Error searching patient:', error)
      toast.error('Error searching for patient. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Using toast notifications instead of local error state
  const [error, setError] = useState('')

  // Function to display error in UI and console
  const displayError = (message: string): void => {
    console.error(message)
    setError(message)
    // In a real app, you might want to use a toast notification system here
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      // Validate required fields
      if (!formData.name || !formData.patientId) {
        displayError('Name and Patient ID are required')
        return
      }

      // If we're in existing patient mode with a found patient, directly create a cash receipt
      if (isExistingPatientMode && searchedPatient) {
        // Create a patient object from the searched patient
        const patientData = searchedPatient

        // Call onCreateReceipt to show the cash receipt form
        if (onCreateReceipt) {
          onCreateReceipt(patientData)
          return // Exit early as we're just creating a receipt, not saving patient data
        }
      }

      // For new patients or updates, proceed with normal flow
      // Prepare submission data
      let submissionData: ExtendedFormData = { ...formData }

      // For existing patients being updated, preserve the ID to update the existing record
      if (isExistingPatientMode && searchedPatient) {
        submissionData = {
          ...submissionData,
          // Preserve the original ID to update the existing record
          id: searchedPatient.id,
          // Update the modification metadata
          updatedBy: getCurrentUser(),
          updatedAt: new Date().toISOString()
        }
      }

      // Submit the form data and get the updated/new patient
      const result = await onSubmit(submissionData)

      // Create a patient object from the submission data
      const patientData =
        typeof result === 'object' && result !== null
          ? (result as unknown as Patient)
          : ({ ...submissionData, id: submissionData.id || String(Date.now()) } as Patient)

      // Call onCreateReceipt if provided (for new patients)
      // This is the ONLY place where we should trigger receipt creation for new patients
      if (onCreateReceipt && patientData && !isExistingPatientMode) {
        onCreateReceipt(patientData)
      }

      // Only show success message for new patients or when in existing patient mode
      // For updates (when initialValues is provided), we'll let the parent component handle the success message
      if (!initialValues) {
        toast.success(
          isExistingPatientMode && searchedPatient
            ? `Patient ${patientData.name} updated successfully`
            : `Patient ${patientData.name} added successfully`
        )
      }

      // Reset form if not in existing patient mode or not editing
      if (!isExistingPatientMode && !initialValues) {
        resetForm()
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      displayError('Failed to submit form')
      toast.error('Failed to save patient data')
    }
  }

  // Helper function to reset the form
  const resetForm = (): void => {
    setFormData({
      date: String(new Date().toISOString().split('T')[0]),
      patientId: '',
      name: '',
      guardian: '',
      dob: '',
      age: 0,
      gender: '',
      phone: '',
      address: '',
      doctorName: 'Dr. Srilatha ch',
      department: 'Opthalmology',
      referredBy: 'Self',
      status: 'Regular',
      createdBy: getCurrentUser()
    })
    setIsExistingPatientMode(false)
    setSearchPatientId('')
    setSearchedPatient(null)
    setIsSearching(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
          <p
            className="text-sm text-gray-600 underline cursor-pointer hover:text-blue-600"
            onClick={handleExistingPatientClick}
          >
            {isExistingPatientMode ? 'new patient' : 'existing patient'}
          </p>
        </div>

        {/* Search Interface for Existing Patient */}
        {isExistingPatientMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label
                  htmlFor="searchPatientId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Patient by ID
                </label>
                <input
                  type="text"
                  id="searchPatientId"
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  placeholder="Enter Patient ID (e.g., 0001)"
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchPatient()
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPatient}
                disabled={isSearching || !searchPatientId.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchedPatient && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Patient found: {searchedPatient.name} (ID: {searchedPatient.patientId})
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                (!initialValues && !isExistingPatientMode) ||
                (isExistingPatientMode && searchedPatient)
                  ? 'bg-gray-50'
                  : ''
              }`}
              readOnly={
                (!initialValues && !isExistingPatientMode) ||
                (isExistingPatientMode && !!searchedPatient)
              }
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
              required
            />
          </div>

          <div>
            <label htmlFor="guardian" className="block text-sm font-medium text-gray-700 mb-1">
              Guardian
            </label>
            <input
              type="text"
              id="guardian"
              name="guardian"
              value={formData.guardian}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              readOnly={isExistingPatientMode && !!searchedPatient}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              disabled={isExistingPatientMode && !!searchedPatient}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Visit Type
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            >
              <option value="">Select Status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name
            </label>
            <EditableCombobox
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              options={dynamicDoctorOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type doctor name..."
              className="bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <EditableCombobox
              id="department"
              name="department"
              value={formData.department}
              options={dynamicDepartmentOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type department..."
              className="bg-white"
            />
          </div>

          <div>
            <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700 mb-1">
              Referred By
            </label>
            <EditableCombobox
              id="referredBy"
              name="referredBy"
              value={formData.referredBy}
              options={dynamicReferredByOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type referrer..."
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className={`px-4 py-2 cursor-pointer text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 ${isExistingPatientMode && searchedPatient ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}`}
        >
          {initialValues
            ? 'Update Patient'
            : isExistingPatientMode && searchedPatient
              ? 'Add Cash Receipt'
              : 'Add Patient'}
        </button>
      </div>
    </form>
  )
}

export default PatientForm
