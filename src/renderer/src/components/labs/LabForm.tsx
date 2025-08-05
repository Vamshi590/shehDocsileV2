import React, { useState, useEffect } from 'react'
import EditableCombobox from '../common/EditableCombobox'

// Define the Lab type to match with other components
type Lab = {
  id: string
  [key: string]: unknown
}

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define the Patient type
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

// Extend window.api interface to include lab methods
declare global {
  interface Window {
    api: {
      // Lab-specific methods
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

interface LabFormProps {
  onSubmit: (lab: Omit<Lab, 'id'>) => Promise<void>
  onCancel: () => void
  labCount: number
  initialData?: Partial<Lab>
  selectedPatient?: Patient | null
  isVennelaMode?: boolean
  isGeneralCustomer?: boolean
  // Removed unused patients parameter
}

const LabForm: React.FC<LabFormProps> = ({
  onSubmit,
  onCancel,
  labCount,
  initialData = {},
  selectedPatient = null,
  isVennelaMode = false,
  isGeneralCustomer = false
  // Removing unused patients parameter
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'regular' | 'vannela'>(
    isVennelaMode ? 'vannela' : 'regular'
  )

  // Helper function to get patient information
  const getPatientInfo = (): Record<string, unknown> => {
    if (!selectedPatient) return {}

    return {
      'PATIENT ID': selectedPatient['patientId'] || selectedPatient['PATIENT ID'],
      'PATIENT NAME': selectedPatient['name'] || selectedPatient['PATIENT NAME'],
      'PHONE NUMBER': selectedPatient['phone'] || selectedPatient['PHONE NUMBER'],
      AGE: selectedPatient['age'] || selectedPatient['AGE'],
      GENDER: selectedPatient['gender'] || selectedPatient['GENDER'],
      ADDRESS: selectedPatient['address'] || selectedPatient['ADDRESS'],
      DOB: selectedPatient['dob'] || selectedPatient['DOB'],
      'GUARDIAN NAME': selectedPatient['guardian'] || selectedPatient['GUARDIAN NAME']
    }
  }

  // Helper function to get default form values
  const getDefaultFormValues = (isVannela = false): Record<string, unknown> => {
    const prefix = isVannela ? 'V' : ''
    const patientInfo = getPatientInfo()

    const labTestFields: Record<string, string> = {}
    for (let i = 1; i <= 10; i++) {
      labTestFields[`${prefix}LAB TEST ${i}`] = ''
      labTestFields[`${prefix}AMOUNT ${i}`] = ''
    }

    // Base form values
    const baseValues = {
      'DOCTOR NAME': 'Dr. Srilatha ch',
      DEPARTMENT: 'Opthalmology',
      'REFFERED BY': 'Self',

      // Lab test fields
      ...labTestFields,

      // Billing fields
      [`${prefix}TOTAL AMOUNT`]: 0,
      [`${prefix}DISCOUNT PERCENTAGE`]: 0,
      [`${prefix}AMOUNT RECEIVED`]: 0,
      [`${prefix}AMOUNT DUE`]: 0,

      // Add current date
      DATE: new Date().toISOString().split('T')[0],

      // Add type
      type: isVannela ? 'vannela' : 'regular'
    }

    // Add Vennela-specific fields for general customers
    if (isVannela && isGeneralCustomer) {
      return {
        ...baseValues,
        'PATIENT NAME': '',
        'DOCTOR NAME': 'Dr. Srilatha ch'
      }
    }

    // Add patient information for registered patients
    return {
      ...baseValues,
      ...patientInfo
    }
  }

  // Form state
  const [formData, setFormData] = useState<Omit<Lab, 'id'>>(() => {
    return {
      ...getDefaultFormValues(false),
      ...initialData
    } as Omit<Lab, 'id'>
  })

  // State to track number of visible lab test fields
  const [visibleLabTests, setVisibleLabTests] = useState(2)

  // Vannela Labs form state
  const [vannelaFormData, setVannelaFormData] = useState<Omit<Lab, 'id'>>(() => {
    return {
      ...getDefaultFormValues(true),
      ...initialData
    } as Omit<Lab, 'id'>
  })

  // State to track number of visible vannela lab test fields
  const [visibleVannelaLabTests, setVisibleVannelaLabTests] = useState(2)

  // Dynamic dropdown options state
  const [dynamicLabTestOptions, setDynamicLabTestOptions] = useState<string[]>([])

  // Effect to fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (): Promise<void> => {
    try {
      // Fetch lab test options
      const labTestOptions = await window.api.getDropdownOptions('labTestOptions')
      if (labTestOptions && labTestOptions.length > 0) {
        setDynamicLabTestOptions(labTestOptions)
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    }
  }

  // Helper function to add new option permanently
  const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
    try {
      // Use the general dropdown API method
      await window.api.addDropdownOption(fieldName, value)
      await fetchDropdownOptions()
    } catch (error) {
      console.error(`Error adding new option to ${fieldName}:`, error)
    }
  }

  // Helper function to get current user
  const getCurrentUser = (): string => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return currentUser.fullName || currentUser.username || 'Unknown User'
    } catch (error) {
      console.error('Error getting current user:', error)
      return 'Unknown User'
    }
  }

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target

    // For number inputs, preserve the exact value entered by the user
    const processedValue = e.target.type === 'number' ? value : value

    // Update the form data
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: processedValue }

      // If this is an amount field, recalculate total without modifying the current field
      if (name.startsWith('AMOUNT ')) {
        let total = 0
        // Sum all amount fields
        for (let i = 1; i <= 10; i++) {
          const amountKey = `AMOUNT ${i}`
          const amountValue = updatedData[amountKey]
          if (amountValue && !isNaN(Number(amountValue))) {
            // Use parseFloat to avoid rounding issues
            total += parseFloat(Number(amountValue).toFixed(2))
          }
        }

        // Update total amount - use toFixed(2) to avoid floating point precision issues
        // but store as number by using parseFloat
        updatedData['TOTAL AMOUNT'] = parseFloat(total.toFixed(2))

        // Recalculate amount due
        const discount = updatedData['DISCOUNT PERCENTAGE']
          ? parseFloat(((total * Number(updatedData['DISCOUNT PERCENTAGE'])) / 100).toFixed(2))
          : 0
        const amountReceived = updatedData['AMOUNT RECEIVED']
          ? Number(updatedData['AMOUNT RECEIVED'])
          : 0

        updatedData['AMOUNT DUE'] = parseFloat((total - discount - amountReceived).toFixed(2))
      }

      // If discount percentage or amount received changes, recalculate amount due
      if (name === 'DISCOUNT PERCENTAGE' || name === 'AMOUNT RECEIVED') {
        const total = updatedData['TOTAL AMOUNT'] ? Number(updatedData['TOTAL AMOUNT']) : 0
        const discount = updatedData['DISCOUNT PERCENTAGE']
          ? parseFloat(((total * Number(updatedData['DISCOUNT PERCENTAGE'])) / 100).toFixed(2))
          : 0
        const amountReceived = updatedData['AMOUNT RECEIVED']
          ? Number(updatedData['AMOUNT RECEIVED'])
          : 0

        updatedData['AMOUNT DUE'] = parseFloat((total - discount - amountReceived).toFixed(2))
      }

      return updatedData
    })
  }

  // Handle vannela form input changes
  const handleVannelaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target

    // Update the form data
    setVannelaFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value }

      // If this is an amount field, recalculate total
      if (name.startsWith('VAMOUNT ')) {
        let total = 0
        // Sum all amount fields
        for (let i = 1; i <= 10; i++) {
          const amountKey = `VAMOUNT ${i}`
          const amountValue = updatedData[amountKey]
          if (amountValue && !isNaN(Number(amountValue))) {
            total += Number(amountValue)
          }
        }

        // Update total amount
        updatedData['VTOTAL AMOUNT'] = total

        // Recalculate amount due
        const discount = updatedData['VDISCOUNT PERCENTAGE']
          ? (total * Number(updatedData['VDISCOUNT PERCENTAGE'])) / 100
          : 0
        const amountReceived = updatedData['VAMOUNT RECEIVED']
          ? Number(updatedData['VAMOUNT RECEIVED'])
          : 0

        updatedData['VAMOUNT DUE'] = total - discount - amountReceived
      }

      // If discount percentage or amount received changes, recalculate amount due
      if (name === 'VDISCOUNT PERCENTAGE' || name === 'VAMOUNT RECEIVED') {
        const total = updatedData['VTOTAL AMOUNT'] ? Number(updatedData['VTOTAL AMOUNT']) : 0
        const discount = updatedData['VDISCOUNT PERCENTAGE']
          ? (total * Number(updatedData['VDISCOUNT PERCENTAGE'])) / 100
          : 0
        const amountReceived = updatedData['VAMOUNT RECEIVED']
          ? Number(updatedData['VAMOUNT RECEIVED'])
          : 0

        updatedData['VAMOUNT DUE'] = total - discount - amountReceived
      }

      return updatedData
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Add createdBy field and ensure type is set
    const submissionData = {
      ...formData,
      createdBy: getCurrentUser(),
      Sno: labCount + 1, // Set the serial number
      type: 'regular'
    }

    await onSubmit(submissionData)

    // Reset form after submission while preserving patient info
    const patientInfo = getPatientInfo()
    setFormData({
      ...getDefaultFormValues(false),
      ...patientInfo,
      createdBy: getCurrentUser()
    } as Omit<Lab, 'id'>)

    setVisibleLabTests(2)
  }

  // Handle vannela form submission
  const handleVannelaSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Add createdBy field and ensure type is set
    const submissionData = {
      ...vannelaFormData,
      createdBy: getCurrentUser(),
      Sno: labCount + 1, // Set the serial number
      type: 'vannela'
    }

    await onSubmit(submissionData)

    // Reset form after submission while preserving patient info
    const patientInfo = getPatientInfo()
    setVannelaFormData({
      ...getDefaultFormValues(true),
      ...patientInfo,
      createdBy: getCurrentUser(),
      type: 'vannela'
    } as Omit<Lab, 'id'>)

    setVisibleVannelaLabTests(2)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'regular' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('regular')}
        >
          Regular Labs
        </button>
        <button
          type="button"
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'vannela' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('vannela')}
        >
          Vannela Labs
        </button>
      </div>

      {/* Regular Labs Form */}
      {activeTab === 'regular' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lab Tests Section */}
          <div className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Tests</h3>
            <div className="space-y-4">
              {Array.from({ length: visibleLabTests }).map((_, index) => {
                const testNumber = index + 1
                const testKey = `LAB TEST ${testNumber}`
                const amountKey = `AMOUNT ${testNumber}`

                return (
                  <div key={testNumber} className="grid grid-cols-2 gap-4">
                    {/* Lab Test Name */}
                    <div>
                      <label htmlFor={testKey} className="block text-sm font-medium text-gray-700">
                        Lab Test {testNumber}
                      </label>
                      <EditableCombobox
                        id={testKey}
                        name={testKey}
                        value={(formData[testKey] as string) || ''}
                        onChange={(e) => handleChange(e)}
                        options={dynamicLabTestOptions}
                        placeholder={`Enter lab test name ${testNumber}`}
                        onAddNewOption={(_fieldName, value) =>
                          addNewOptionPermanently('labTestOptions', value)
                        }
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label
                        htmlFor={amountKey}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Amount {testNumber}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          name={amountKey}
                          id={amountKey}
                          value={(formData[amountKey] as string) || ''}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {visibleLabTests < 10 && (
              <button
                type="button"
                onClick={() => setVisibleLabTests(Math.min(visibleLabTests + 1, 10))}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add More Lab Tests
              </button>
            )}
          </div>

          {/* Billing Section */}
          <div className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Total Amount */}
              <div>
                <label htmlFor="TOTAL AMOUNT" className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="TOTAL AMOUNT"
                    id="TOTAL AMOUNT"
                    value={(formData['TOTAL AMOUNT'] as number) || 0}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label
                  htmlFor="DISCOUNT PERCENTAGE"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="DISCOUNT PERCENTAGE"
                    id="DISCOUNT PERCENTAGE"
                    value={(formData['DISCOUNT PERCENTAGE'] as number) || 0}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Amount Received */}
              <div>
                <label
                  htmlFor="AMOUNT RECEIVED"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount Received
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="AMOUNT RECEIVED"
                    id="AMOUNT RECEIVED"
                    value={(formData['AMOUNT RECEIVED'] as number) || 0}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Amount Due */}
              <div>
                <label htmlFor="AMOUNT DUE" className="block text-sm font-medium text-gray-700">
                  Amount Due
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="AMOUNT DUE"
                    id="AMOUNT DUE"
                    value={(formData['AMOUNT DUE'] as number) || 0}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
              >
                Save Regular Lab
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Vannela Labs Form */}
      {activeTab === 'vannela' && (
        <form onSubmit={handleVannelaSubmit} className="space-y-6">
          {/* General Customer Fields - Only shown when isGeneralCustomer is true */}
          {isGeneralCustomer && (
            <div className="bg-white p-4 rounded-md shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div>
                  <label
                    htmlFor="VPATIENT NAME"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="PATIENT NAME"
                    id="PATIENT NAME"
                    value={(vannelaFormData['PATIENT NAME'] as string) || ''}
                    onChange={handleVannelaChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label htmlFor="VDOCTOR NAME" className="block text-sm font-medium text-gray-700">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    name="DOCTOR NAME"
                    id="DOCTOR NAME"
                    value={(vannelaFormData['DOCTOR NAME'] as string) || 'Dr. Srilatha ch'}
                    onChange={handleVannelaChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter doctor name"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lab Tests Section */}
          <div className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vannela Lab Tests</h3>
            <div className="space-y-4">
              {Array.from({ length: visibleVannelaLabTests }).map((_, index) => {
                const testNumber = index + 1
                const testKey = `VLAB TEST ${testNumber}`
                const amountKey = `VAMOUNT ${testNumber}`

                return (
                  <div key={testNumber} className="grid grid-cols-2 gap-4">
                    {/* Lab Test Name */}
                    <div>
                      <label htmlFor={testKey} className="block text-sm font-medium text-gray-700">
                        Vannela Lab Test {testNumber}
                      </label>
                      <EditableCombobox
                        id={testKey}
                        name={testKey}
                        value={(vannelaFormData[testKey] as string) || ''}
                        onChange={(e) => handleVannelaChange(e)}
                        options={dynamicLabTestOptions}
                        placeholder={`Enter vannela lab test name ${testNumber}`}
                        onAddNewOption={(_fieldName, value) =>
                          addNewOptionPermanently('labTestOptions', value)
                        }
                      />
                    </div>

                    {/* Amount */}
                    <div>
                      <label
                        htmlFor={amountKey}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Amount {testNumber}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <input
                          type="number"
                          name={amountKey}
                          id={amountKey}
                          value={(vannelaFormData[amountKey] as string) || ''}
                          onChange={handleVannelaChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {visibleVannelaLabTests < 10 && (
              <button
                type="button"
                onClick={() => setVisibleVannelaLabTests(Math.min(visibleVannelaLabTests + 1, 10))}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add More Vannela Lab Tests
              </button>
            )}
          </div>

          {/* Billing Section */}
          <div className="bg-white p-4 rounded-md shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Total Amount */}
              <div>
                <label htmlFor="VTOTAL AMOUNT" className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="VTOTAL AMOUNT"
                    id="VTOTAL AMOUNT"
                    value={(vannelaFormData['VTOTAL AMOUNT'] as number) || 0}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label
                  htmlFor="VDISCOUNT PERCENTAGE"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount (%)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="VDISCOUNT PERCENTAGE"
                    id="VDISCOUNT PERCENTAGE"
                    value={(vannelaFormData['VDISCOUNT PERCENTAGE'] as number) || 0}
                    onChange={handleVannelaChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Amount Received */}
              <div>
                <label
                  htmlFor="VAMOUNT RECEIVED"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount Received
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="VAMOUNT RECEIVED"
                    id="VAMOUNT RECEIVED"
                    value={(vannelaFormData['VAMOUNT RECEIVED'] as number) || 0}
                    onChange={handleVannelaChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Amount Due */}
              <div>
                <label htmlFor="VAMOUNT DUE" className="block text-sm font-medium text-gray-700">
                  Amount Due
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="VAMOUNT DUE"
                    id="VAMOUNT DUE"
                    value={(vannelaFormData['VAMOUNT DUE'] as number) || 0}
                    readOnly
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
              >
                Save Vannela Lab
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default LabForm
