import React, { useState, useEffect } from 'react'
import EditableCombobox from '../common/EditableCombobox'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { adviceOptions } from '@renderer/utils/dropdownOptions'

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
      getPatients: () => Promise<Patient[]>
      getPrescriptions: () => Promise<Prescription[]>
      addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
      updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
      deletePrescription: (id: string) => Promise<void>
      searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>
      getTodaysPrescriptions: () => Promise<Prescription[]>
      getPrescriptionsById: (id: string) => Promise<Prescription[]>
      getLatestPrescriptionId: () => Promise<number>
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
    }
  }
}

// Define the LabTest interface for categorizing tests
interface LabTest {
  name: string
  amount: string
  type: 'vennela' | 'lab'
}

interface LabFormProps {
  onSubmit: (lab: Omit<Lab, 'id'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Lab>
  selectedPatient?: Patient | null
  isVennelaMode?: boolean
  isGeneralCustomer?: boolean
  extractedVennelaTests?: LabTest[]
  extractedLabTests?: LabTest[]
  // Removed unused patients parameter
}

const LabForm: React.FC<LabFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  selectedPatient = null,
  // isVennelaMode is no longer needed since we're combining both forms
  isGeneralCustomer = false,
  extractedVennelaTests = [],
  extractedLabTests = []
  // Removing unused patients parameter
}) => {
  // We no longer need tab state since we're combining both forms

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

  // Prevent wheel events from changing number input values
  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>): void => {
    e.currentTarget.blur()
  }

  // Helper function to get default form values
  const getDefaultFormValues = (isVannela = false): Record<string, unknown> => {
    const prefix = isVannela ? 'V' : ''
    const patientInfo = getPatientInfo()

    const labTestFields: Record<string, string | number> = {}

    // Initialize all lab test fields as empty
    for (let i = 1; i <= 10; i++) {
      labTestFields[`${prefix}LAB TEST ${i}`] = ''
      labTestFields[`${prefix}AMOUNT ${i}`] = ''
    }

    // If we have extracted tests, use them to populate the form
    if (isVannela && extractedVennelaTests.length > 0) {
      // Fill in the vennela lab tests
      extractedVennelaTests.forEach((test, index) => {
        if (index < 10) {
          // Only use up to 10 tests
          labTestFields[`${prefix}LAB TEST ${index + 1}`] = test.name
          labTestFields[`${prefix}AMOUNT ${index + 1}`] = test.amount
        }
      })

      // No need to update state here - we'll handle it in useEffect
    } else if (!isVannela && extractedLabTests.length > 0) {
      // Fill in the regular lab tests
      extractedLabTests.forEach((test, index) => {
        if (index < 10) {
          // Only use up to 10 tests
          labTestFields[`${prefix}LAB TEST ${index + 1}`] = test.name
          labTestFields[`${prefix}AMOUNT ${index + 1}`] = test.amount
        }
      })

      // No need to update state here - we'll handle it in useEffect
    }

    // Calculate total amount
    let totalAmount = 0
    for (let i = 1; i <= 10; i++) {
      const amount = Number(labTestFields[`${prefix}AMOUNT ${i}`] || 0)
      totalAmount += amount
    }

    // Base form values
    const baseValues = {
      'DOCTOR NAME': 'Dr. Srilatha ch',
      DEPARTMENT: 'Opthalmology',
      'REFFERED BY': 'Self',

      // Lab test fields
      ...labTestFields,

      // Billing fields
      [`${prefix}TOTAL AMOUNT`]: totalAmount,
      [`${prefix}DISCOUNT PERCENTAGE`]: 0,
      [`${prefix}AMOUNT RECEIVED`]: totalAmount,
      [`${prefix}AMOUNT DUE`]: 0,

      // Add current date
      DATE: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd'),

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

  // Effect to update visible test counts based on extracted tests
  useEffect(() => {
    if (extractedVennelaTests.length > 0) {
      setVisibleVannelaLabTests(Math.max(2, Math.min(extractedVennelaTests.length, 10)))
    }
    if (extractedLabTests.length > 0) {
      setVisibleLabTests(Math.max(2, Math.min(extractedLabTests.length, 10)))
    }
  }, [extractedVennelaTests, extractedLabTests])

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
    const { name, value, type } = e.target

    console.log('name', name)
    console.log('value', value)
    console.log('type', type)

    // Process value based on input type
    let processedValue: string | number = value
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value)
    }

    // Update form data with the new value
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }))

    // When an individual amount field changes, recalculate total
    if (name.startsWith('AMOUNT ') && name !== 'AMOUNT RECEIVED' && name !== 'AMOUNT DUE') {
      console.log('formData', formData)
      let total = 0
      // Create a temporary updated data object with the new value
      const updatedData = { ...formData, [name]: processedValue }

      // Sum all amount fields
      for (let i = 1; i <= 10; i++) {
        const amountKey = `AMOUNT ${i}`
        const amountValue = updatedData[amountKey]
        if (amountValue && !isNaN(Number(amountValue))) {
          total += Number(amountValue)
        }
      }

      // Calculate discount and amount due
      const discountPercentage = Number(updatedData['DISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (total * discountPercentage) / 100
      const amountReceived = Number(updatedData['AMOUNT RECEIVED'] || 0)
      const amountDue = total - discountAmount - amountReceived

      // Update all financial fields
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        'TOTAL AMOUNT': total,
        'AMOUNT DUE': amountDue >= 0 ? amountDue : 0
      }))
    }

    // When Total Amount changes directly
    else if (name === 'TOTAL AMOUNT') {
      const totalAmount = Number(value) || 0
      const discountPercentage = Number(formData['DISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (totalAmount * discountPercentage) / 100

      // Set amount received to total amount - discount by default
      const amountReceived = Number(formData['AMOUNT RECEIVED'] || 0)
      const amountDue = totalAmount - discountAmount - amountReceived

      // Create the updated data object
      const updatedData = {
        ...formData,
        'TOTAL AMOUNT': totalAmount,
        'AMOUNT DUE': amountDue >= 0 ? amountDue : 0
      }

      // Update the state
      setFormData(updatedData)
    }

    // When Discount Percentage changes
    else if (name === 'DISCOUNT PERCENTAGE') {
      const totalAmount = Number(formData['TOTAL AMOUNT'] || 0)
      const discountPercentage = Number(value) || 0
      const discountAmount = (totalAmount * discountPercentage) / 100
      const amountReceived = Number(formData['AMOUNT RECEIVED'] || 0)
      const amountDue = totalAmount - discountAmount - amountReceived

      console.log('Discount Percentage:', discountPercentage)
      console.log('Discount Amount:', discountAmount)
      console.log('Amount Received:', amountReceived)
      console.log('Amount Due:', amountDue)

      // Create the updated data object
      const updatedData = {
        ...formData,
        'DISCOUNT PERCENTAGE': discountPercentage,
        'AMOUNT DUE': amountDue
      }

      // Update the state
      setFormData(updatedData)
    }

    // When Amount Received changes
    else if (name === 'AMOUNT RECEIVED') {
      const totalAmount = Number(formData['TOTAL AMOUNT'] || 0)
      const discountPercentage = Number(formData['DISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (totalAmount * discountPercentage) / 100
      const amountReceived = Number(value) || 0
      const amountDue = totalAmount - discountAmount - amountReceived

      console.log('amountDue', amountDue)
      console.log('amountReceived', amountReceived)
      console.log('discountAmount', discountAmount)
      console.log('totalAmount', totalAmount)

      // Create the updated data object
      const updatedData = {
        ...formData,
        'AMOUNT RECEIVED': amountReceived.toString(),
        'AMOUNT DUE': amountDue
      }

      // Log the updated data that will be set
      console.log('Updated formData will be:', updatedData)

      // Update the state
      setFormData(updatedData)
    }
  }

  // Handle vannela form input changes
  const handleVannelaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target

    // Process value based on input type
    let processedValue: string | number = value
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value)
    }

    // Update form data with the new value
    setVannelaFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }))

    // When an individual amount field changes, recalculate total
    if (name.startsWith('VAMOUNT ') && name !== 'VAMOUNT RECEIVED' && name !== 'VAMOUNT DUE') {
      let total = 0
      // Create a temporary updated data object with the new value
      const updatedData = { ...vannelaFormData, [name]: processedValue }

      // Sum all amount fields
      for (let i = 1; i <= 10; i++) {
        const amountKey = `VAMOUNT ${i}`
        const amountValue = updatedData[amountKey]
        if (amountValue && !isNaN(Number(amountValue))) {
          total += Number(amountValue)
        }
      }

      // Calculate discount and amount due
      const discountPercentage = Number(updatedData['VDISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (total * discountPercentage) / 100
      const amountReceived = Number(updatedData['VAMOUNT RECEIVED'] || 0)
      const amountDue = total - discountAmount - amountReceived

      // Update all financial fields
      setVannelaFormData((prev) => ({
        ...prev,
        [name]: processedValue,
        'VTOTAL AMOUNT': total,
        'VAMOUNT DUE': amountDue
      }))
    }

    // When Total Amount changes directly
    else if (name === 'VTOTAL AMOUNT') {
      const totalAmount = Number(value) || 0
      const discountPercentage = Number(vannelaFormData['VDISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (totalAmount * discountPercentage) / 100

      // Set amount received to total amount - discount by default
      const amountReceived = Number(vannelaFormData['VAMOUNT RECEIVED'] || 0)
      const amountDue = totalAmount - discountAmount - amountReceived

      setVannelaFormData((prev) => ({
        ...prev,
        'VTOTAL AMOUNT': totalAmount,
        'VAMOUNT DUE': amountDue
      }))
    }

    // When Discount Percentage changes
    else if (name === 'VDISCOUNT PERCENTAGE') {
      const totalAmount = Number(vannelaFormData['VTOTAL AMOUNT'] || 0)
      const discountPercentage = Number(value) || 0
      const discountAmount = (totalAmount * discountPercentage) / 100
      const amountReceived = Number(vannelaFormData['VAMOUNT RECEIVED'] || 0)
      const amountDue = totalAmount - discountAmount - amountReceived

      setVannelaFormData((prev) => ({
        ...prev,
        'VDISCOUNT PERCENTAGE': discountPercentage,
        'VAMOUNT DUE': amountDue
      }))
    }

    // When Amount Received changes
    else if (name === 'VAMOUNT RECEIVED') {
      const totalAmount = Number(vannelaFormData['VTOTAL AMOUNT'] || 0)
      const discountPercentage = Number(vannelaFormData['VDISCOUNT PERCENTAGE'] || 0)
      const discountAmount = (totalAmount * discountPercentage) / 100
      const amountReceived = Number(value) || 0
      const amountDue = totalAmount - discountAmount - amountReceived

      setVannelaFormData((prev) => ({
        ...prev,
        'VAMOUNT RECEIVED': amountReceived,
        'VAMOUNT DUE': amountDue
      }))
    } else if (name === 'PATIENT NAME') {
      const patientName = value as string
      setFormData((prev) => ({
        ...prev,
        'PATIENT NAME': patientName
      }))
    }
  }

  // Combined form submission handler
  const handleCombinedSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Create a completely fresh object with only the values we want
    const submissionData = {
      // Patient info
      'PATIENT NAME': formData['PATIENT NAME'],
      'PATIENT ID': formData['PATIENT ID'],
      'GUARDIAN NAME': formData['GUARDIAN NAME'],
      DOB: formData['DOB'],
      AGE: formData['AGE'],
      GENDER: formData['GENDER'],
      'PHONE NUMBER': formData['PHONE NUMBER'],
      ADDRESS: formData['ADDRESS'],

      // Doctor info
      'DOCTOR NAME': formData['DOCTOR NAME'],
      DEPARTMENT: formData['DEPARTMENT'],
      'REFFERED BY': formData['REFFERED BY'],
      DATE: formData['DATE'],

      // Lab tests
      ...Object.fromEntries(
        Array.from({ length: 10 }).flatMap((_, i) => {
          const index = i + 1
          return [
            [`LAB TEST ${index}`, formData[`LAB TEST ${index}`] || ''],
            [`AMOUNT ${index}`, formData[`AMOUNT ${index}`] || '']
          ]
        })
      ),

      // Financial fields - explicitly use the current values
      'TOTAL AMOUNT': Number(formData['TOTAL AMOUNT'] || 0),
      'DISCOUNT PERCENTAGE': Number(formData['DISCOUNT PERCENTAGE'] || 0),
      'AMOUNT RECEIVED': Number(formData['AMOUNT RECEIVED'] || 0),
      'AMOUNT DUE': Number(formData['AMOUNT DUE'] || 0),

      // Vannela fields
      ...Object.fromEntries(
        Array.from({ length: 10 }).flatMap((_, i) => {
          const index = i + 1
          return [
            [`VLAB TEST ${index}`, vannelaFormData[`VLAB TEST ${index}`] || ''],
            [`VAMOUNT ${index}`, vannelaFormData[`VAMOUNT ${index}`] || '']
          ]
        })
      ),

      // Vannela financial fields
      'VTOTAL AMOUNT': Number(vannelaFormData['VTOTAL AMOUNT'] || 0),
      'VDISCOUNT PERCENTAGE': Number(vannelaFormData['VDISCOUNT PERCENTAGE'] || 0),
      'VAMOUNT RECEIVED': Number(vannelaFormData['VAMOUNT RECEIVED'] || 0),
      'VAMOUNT DUE': Number(vannelaFormData['VAMOUNT DUE'] || 0),

      // Metadata
      createdBy: getCurrentUser(),
      Sno: 1,
      type: 'combined',

      // Preserve ID if it exists
      ...(formData.id ? { id: formData.id } : {}),
      ...(formData.createdAt ? { createdAt: formData.createdAt } : {})
    }

    // Submit the data we just created, not the original form data
    await onSubmit(submissionData)

    // Reset both forms after submission while preserving patient info

    // Reset regular form
    setFormData({
      ...getDefaultFormValues(true)
    })

    // Reset vennela form
    setVannelaFormData({
      ...getDefaultFormValues(true)
    })

    // Reset visible test counts
    setVisibleLabTests(2)
    setVisibleVannelaLabTests(2)
  }

  return (
    <div className="space-y-6 min-w-[80vw]">
      {/* Forms side by side */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lab Record</h2>
      </div>

      <form onSubmit={handleCombinedSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regular Labs Form */}
          {!isGeneralCustomer && (
            <div className="space-y-6 border-r pr-4">
              <h3 className="text-lg font-medium text-blue-800 border-b pb-2">Regular Labs</h3>
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
                          <label
                            htmlFor={testKey}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Lab Test {testNumber}
                          </label>
                          <EditableCombobox
                            id={testKey}
                            name={testKey}
                            value={(formData[testKey] as string) || ''}
                            onChange={(e) => handleChange(e)}
                            options={adviceOptions}
                            placeholder={`Enter lab test name ${testNumber}`}
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
                    <label
                      htmlFor="TOTAL AMOUNT"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        onWheel={preventWheelChange}
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
                        value={(formData['DISCOUNT PERCENTAGE'] as number)?.toString() || '0'}
                        onWheel={preventWheelChange}
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
                        value={(formData['AMOUNT RECEIVED'] as number)?.toString() || '0'}
                        onWheel={preventWheelChange}
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
                        value={(formData['AMOUNT DUE'] as number)?.toString() || '0'}
                        onWheel={preventWheelChange}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vannela Labs Form */}
          <div className="space-y-6 pl-4">
            <h3 className="text-lg font-medium text-purple-800 border-b pb-2">Vannela Labs</h3>
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
                    <label
                      htmlFor="VDOCTOR NAME"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        <label
                          htmlFor={testKey}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Vannela Lab Test {testNumber}
                        </label>
                        <EditableCombobox
                          id={testKey}
                          name={testKey}
                          value={(vannelaFormData[testKey] as string) || ''}
                          onChange={(e) => handleVannelaChange(e)}
                          options={adviceOptions}
                          placeholder={`Enter vannela lab test name ${testNumber}`}
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
                            onWheel={preventWheelChange}
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
                  onClick={() =>
                    setVisibleVannelaLabTests(Math.min(visibleVannelaLabTests + 1, 10))
                  }
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
                  <label
                    htmlFor="VTOTAL AMOUNT"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                      onWheel={preventWheelChange}
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
                      onWheel={preventWheelChange}
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
                      onWheel={preventWheelChange}
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
                      onWheel={preventWheelChange}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-700 font-medium">
                Both Regular and Vennela Lab data will be submitted together
              </p>
            </div>
            <div className="flex">
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
                Save Lab Record
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LabForm
