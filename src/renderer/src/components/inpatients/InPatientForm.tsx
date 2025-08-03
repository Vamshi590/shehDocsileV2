import React, { useState, useEffect, useCallback } from 'react'
import { departmentOptions, doctorOptions, referredByOptions } from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'
import { toast } from 'sonner'
import { InPatient, PackageInclusion } from '../../pages/InPatients'

// Standardized API response format
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

// Extended form data interface with optional id and update fields
interface ExtendedFormData extends Omit<InPatient, 'id'> {
  id?: string
  updatedBy?: string
  updatedAt?: string
}

interface InPatientFormProps {
  onSubmit: (formData: ExtendedFormData) => Promise<InPatient | unknown>
  initialValues?: Partial<InPatient>
  createdBy?: string
  inpatientCount?: number
}

const InPatientForm: React.FC<InPatientFormProps> = ({
  onSubmit,
  initialValues,
  inpatientCount = 0
}) => {
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

  const [formData, setFormData] = useState<ExtendedFormData>({
    date: initialValues?.date || String(new Date().toISOString().split('T')[0]),
    patientId: initialValues?.patientId || '',
    name: initialValues?.name || '',
    age: initialValues?.age || '',
    gender: initialValues?.gender || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    dateOfBirth: initialValues?.dateOfBirth || '',
    guardianName: initialValues?.guardianName || '',
    operationName: initialValues?.operationName || '',
    department: initialValues?.department || 'Opthalmology',
    doctorNames: initialValues?.doctorNames || [''],
    onDutyDoctor: initialValues?.onDutyDoctor || '',
    referredBy: initialValues?.referredBy || 'Self',
    packageAmount: initialValues?.packageAmount || 0,
    packageInclusions: initialValues?.packageInclusions || [{ name: 'Room Charges', amount: 0 }],
    createdBy: initialValues?.createdBy || getCurrentUser(),
    // Include id if it exists in initialValues
    ...(initialValues?.id ? { id: initialValues.id } : {})
  })

  // Dynamic dropdown options state - fetched from backend
  const [dynamicDoctorOptions, setDynamicDoctorOptions] = useState<string[]>([])
  const [dynamicDepartmentOptions, setDynamicDepartmentOptions] = useState<string[]>([])
  const [dynamicReferredByOptions, setDynamicReferredByOptions] = useState<string[]>([])
  const [dynamicInclusionOptions, setDynamicInclusionOptions] = useState<string[]>([
    'Room Charges',
    'Medicine',
    'Consumables',
    'Surgery Charges',
    'Doctor Fee',
    'Nursing Care',
    'Food',
    'Lab Tests'
  ])

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
  const fetchLatestPatientId = useCallback(
    async (force = false): Promise<void> => {
      try {
        // Only proceed if we're not in edit mode and either we don't have a patient ID yet or force is true
        if ((!initialValues?.id && !formData.patientId) || force) {
          const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
          const response = (await api.getLatestPatientId()) as StandardizedResponse<{
            latestId: string
          }>

          if (response.success && response.data) {
            // Extract the numeric part of the ID and increment it
            const latestId = response.data.latestId || 'IP-0000'
            const numericPart = parseInt(latestId.split('-')[1], 10)
            const nextId = `IP-${String(numericPart + 1).padStart(4, '0')}`

            setFormData((prev) => ({
              ...prev,
              patientId: nextId
            }))
          } else {
            // If no patients exist yet, start with IP-0001
            setFormData((prev) => ({
              ...prev,
              patientId: 'IP-0001'
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching latest patient ID:', error)
        // Fallback to a generated ID based on count
        const nextId = `IP-${String(inpatientCount + 1).padStart(4, '0')}`
        setFormData((prev) => ({
          ...prev,
          patientId: nextId
        }))
      }
    },
    [initialValues?.id, formData.patientId, inpatientCount]
  )

  // Fetch patient ID on component mount
  useEffect(() => {
    fetchLatestPatientId()
  }, [fetchLatestPatientId])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (fieldName: string): Promise<string[]> => {
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.getDropdownOptions(fieldName)) as StandardizedResponse<string[]>

      if (response.success && response.data) {
        return response.data
      } else {
        // Fallback to default options if API call fails
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
      // Fallback to default options if API call fails
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
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.addDropdownOption(fieldName, value)) as StandardizedResponse<{
        success: boolean
      }>

      if (response.success) {
        // Update the local state with the new option
        switch (fieldName) {
          case 'doctorName':
            setDynamicDoctorOptions((prev) => [...prev, value])
            break
          case 'department':
            setDynamicDepartmentOptions((prev) => [...prev, value])
            break
          case 'referredBy':
            setDynamicReferredByOptions((prev) => [...prev, value])
            break
          case 'packageInclusion':
            setDynamicInclusionOptions((prev) => [...prev, value])
            break
          default:
            break
        }
      } else {
        console.error(`Failed to add ${fieldName} option:`, response.message)
      }
    } catch (error) {
      console.error(`Error adding ${fieldName} option:`, error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target

    // Special handling for age to ensure it's a number
    if (name === 'age') {
      const numValue = value === '' ? '' : parseInt(value, 10)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue
      }))
      return
    }

    // Special handling for packageAmount to ensure it's a number
    if (name === 'packageAmount') {
      const numValue = value === '' ? 0 : parseFloat(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue
      }))
      return
    }

    // Handle all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle doctor names changes
  const handleDoctorChange = (index: number, value: string): void => {
    const updatedDoctors = [...formData.doctorNames]
    updatedDoctors[index] = value
    setFormData((prev) => ({
      ...prev,
      doctorNames: updatedDoctors
    }))
  }

  // Add new doctor field
  const addDoctorField = (): void => {
    setFormData((prev) => ({
      ...prev,
      doctorNames: [...prev.doctorNames, '']
    }))
  }

  // Remove doctor field
  const removeDoctorField = (index: number): void => {
    if (formData.doctorNames.length > 1) {
      const updatedDoctors = formData.doctorNames.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        doctorNames: updatedDoctors
      }))
    }
  }

  // Handle package inclusion changes
  const handleInclusionChange = (index: number, field: 'name' | 'amount', value: string): void => {
    const updatedInclusions = [...formData.packageInclusions]

    if (field === 'amount') {
      updatedInclusions[index].amount = parseFloat(value) || 0
    } else {
      updatedInclusions[index].name = value
    }

    setFormData((prev) => ({
      ...prev,
      packageInclusions: updatedInclusions
    }))

    // Update total package amount
    if (field === 'amount') {
      updatePackageTotal(updatedInclusions)
    }
  }

  // Add new package inclusion field
  const addInclusionField = (): void => {
    setFormData((prev) => ({
      ...prev,
      packageInclusions: [...prev.packageInclusions, { name: '', amount: 0 }]
    }))
  }

  // Remove package inclusion field
  const removeInclusionField = (index: number): void => {
    if (formData.packageInclusions.length > 1) {
      const updatedInclusions = formData.packageInclusions.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        packageInclusions: updatedInclusions
      }))

      // Update total package amount
      updatePackageTotal(updatedInclusions)
    }
  }

  // Update package total amount
  const updatePackageTotal = (inclusions: PackageInclusion[]): void => {
    const total = inclusions.reduce((sum, item) => sum + item.amount, 0)
    setFormData((prev) => ({
      ...prev,
      packageAmount: total
    }))
  }

  // Function to display error in UI and console
  const displayError = (message: string): void => {
    console.error(message)
    toast.error(message)
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.patientId) {
      displayError('Please fill in all required fields')
      return
    }

    try {
      // Submit the form data
      await onSubmit(formData)

      // Reset form after successful submission
      if (!initialValues?.id) {
        resetForm()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      displayError('Failed to submit form')
    }
  }

  // Helper function to reset the form
  const resetForm = (): void => {
    setFormData({
      date: String(new Date().toISOString().split('T')[0]),
      patientId: '',
      name: '',
      age: '',
      gender: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      guardianName: '',
      operationName: '',
      department: 'Opthalmology',
      doctorNames: [''],
      onDutyDoctor: '',
      referredBy: 'Self',
      packageAmount: 0,
      packageInclusions: [{ name: 'Room Charges', amount: 0 }],
      createdBy: getCurrentUser()
    })

    // Generate a new patient ID
    fetchLatestPatientId(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Information Section */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              readOnly
            />
          </div>

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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
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
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
              Guardian Name
            </label>
            <input
              type="text"
              id="guardianName"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
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
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Operation Information Section */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operation Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="operationName" className="block text-sm font-medium text-gray-700 mb-1">
              Operation Name
            </label>
            <input
              type="text"
              id="operationName"
              name="operationName"
              value={formData.operationName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
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
              onAddNewOption={(value) => addNewOptionPermanently('department', value)}
              placeholder="Select or type department..."
              className="bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor(s) Name</label>
            {formData.doctorNames.map((doctor, index) => (
              <div key={index} className="flex items-center mb-2">
                <EditableCombobox
                  id={`doctor-${index}`}
                  name={`doctor-${index}`}
                  value={doctor}
                  options={dynamicDoctorOptions}
                  onChange={(e) => handleDoctorChange(index, e.target.value)}
                  onAddNewOption={(value) => addNewOptionPermanently('doctorName', value)}
                  placeholder="Select or type doctor name..."
                  className="bg-white flex-grow"
                  required
                />
                <div className="ml-2 flex">
                  {index === formData.doctorNames.length - 1 && (
                    <button
                      type="button"
                      onClick={addDoctorField}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                    </button>
                  )}
                  {formData.doctorNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDoctorField(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="onDutyDoctor" className="block text-sm font-medium text-gray-700 mb-1">
              On-Duty Call Doctor
            </label>
            <EditableCombobox
              id="onDutyDoctor"
              name="onDutyDoctor"
              value={formData.onDutyDoctor}
              options={dynamicDoctorOptions}
              onChange={handleChange}
              onAddNewOption={(value) => addNewOptionPermanently('doctorName', value)}
              placeholder="Select or type on-duty doctor..."
              className="bg-white"
              required
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
              onAddNewOption={(value) => addNewOptionPermanently('referredBy', value)}
              placeholder="Select or type referrer..."
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Package Details Section */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
        <div className="mb-4">
          <label htmlFor="packageAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Package Amount (₹)
          </label>
          <input
            type="number"
            id="packageAmount"
            name="packageAmount"
            value={formData.packageAmount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Package Inclusions</label>
          {formData.packageInclusions.map((inclusion, index) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              <div className="flex-grow">
                <EditableCombobox
                  id={`inclusion-name-${index}`}
                  name={`inclusion-name-${index}`}
                  value={inclusion.name}
                  options={dynamicInclusionOptions}
                  onChange={(e) => handleInclusionChange(index, 'name', e.target.value)}
                  onAddNewOption={(value) => addNewOptionPermanently('packageInclusion', value)}
                  placeholder="Select or type inclusion..."
                  className="bg-white"
                  required
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  id={`inclusion-amount-${index}`}
                  name={`inclusion-amount-${index}`}
                  value={inclusion.amount}
                  onChange={(e) => handleInclusionChange(index, 'amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Amount"
                  required
                />
              </div>
              <div className="flex">
                {index === formData.packageInclusions.length - 1 && (
                  <button
                    type="button"
                    onClick={addInclusionField}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                  </button>
                )}
                {formData.packageInclusions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInclusionField(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 cursor-pointer text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
        >
          {initialValues?.id ? 'Update In-Patient' : 'Add In-Patient'}
        </button>
      </div>
    </form>
  )
}

export default InPatientForm
