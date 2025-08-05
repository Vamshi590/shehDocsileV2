import React, { useState, useEffect } from 'react'
import { medicineOptions, timingOptions } from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'
import { InPatient } from '../../pages/InPatients'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define the Lab type to match with other components
type Lab = {
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

// Extend window.api interface to include getPatients method
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

interface DischargePriscreptionFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  prescriptionCount: number // Make this required
  initialData?: Record<string, unknown>
  selectedPatient?: InPatient | null
  patients?: Patient[]
}

const DischargePriscreptionForm: React.FC<DischargePriscreptionFormProps> = ({
  onSubmit,
  prescriptionCount,
  initialData = {},
  selectedPatient = null,
  patients = []
}) => {
  // Form state
  // Track visible prescription fields based on initialData or default count
  const [visiblePrescriptions, setVisiblePrescriptions] = useState(() => {
    // Count how many prescriptions are in initialData
    if (Object.keys(initialData).length > 0) {
      let count = 0
      for (let i = 1; i <= 10; i++) {
        if (initialData[`PRESCRIPTION ${i}`]) {
          count = i
        }
      }
      return Math.max(count, 1) // At least 1 prescription field
    }
    return Math.max(prescriptionCount, 1) // At least 1 prescription field
  })

  // Function to handle removing a prescription
  const handleRemovePrescription = (indexToRemove: number): void => {
    // Create a new form data object without the removed prescription
    const newFormData = { ...formData }

    // Remove the prescription fields for the removed index
    delete newFormData[`PRESCRIPTION ${indexToRemove + 1}`]
    delete newFormData[`DAYS ${indexToRemove + 1}`]
    delete newFormData[`TIMING ${indexToRemove + 1}`]

    // Shift all prescriptions after the removed one up by one
    for (let i = indexToRemove + 1; i < visiblePrescriptions; i++) {
      newFormData[`PRESCRIPTION ${i}`] = newFormData[`PRESCRIPTION ${i + 1}`]
      newFormData[`DAYS ${i}`] = newFormData[`DAYS ${i + 1}`]
      newFormData[`TIMING ${i}`] = newFormData[`TIMING ${i + 1}`]

      // Delete the original entries that were moved
      delete newFormData[`PRESCRIPTION ${i + 1}`]
      delete newFormData[`DAYS ${i + 1}`]
      delete newFormData[`TIMING ${i + 1}`]
    }

    // Update form data
    setFormData(newFormData)

    // Decrease visible prescriptions count
    setVisiblePrescriptions((prev) => Math.max(prev - 1, 1))
  }

  const [formData, setFormData] = useState<Omit<Prescription, 'id'>>(() => {
    // Initialize with default values
    const defaultData = {
      // Prescription fields
      'PRESCRIPTION 1': '',
      'DAYS 1': '',
      'TIMING 1': '',
      'PRESCRIPTION 2': '',
      'DAYS 2': '',
      'TIMING 2': '',
      'PRESCRIPTION 3': '',
      'DAYS 3': '',
      'TIMING 3': '',
      'PRESCRIPTION 4': '',
      'DAYS 4': '',
      'TIMING 4': '',
      'PRESCRIPTION 5': '',
      'DAYS 5': '',
      'TIMING 5': '',
      'PRESCRIPTION 6': '',
      'DAYS 6': '',
      'TIMING 6': '',
      'PRESCRIPTION 7': '',
      'DAYS 7': '',
      'TIMING 7': '',
      'PRESCRIPTION 8': '',
      'DAYS 8': '',
      'TIMING 8': '',
      'PRESCRIPTION 9': '',
      'DAYS 9': '',
      'TIMING 9': '',
      'PRESCRIPTION 10': '',
      'DAYS 10': '',
      'TIMING 10': '',

      // Advice fields
      'ADVICE 1': '',
      'ADVICE 2': '',
      'ADVICE 3': '',
      'ADVICE 4': '',
      'ADVICE 5': '',
      'ADVICE 6': '',
      'ADVICE 7': '',
      'ADVICE 8': '',
      'ADVICE 9': '',
      'ADVICE 10': '',

      NOTES: '',
      'FOLLOW UP DATE': '',
      // Add patient information if a patient is selected
      ...(selectedPatient
        ? {
            'PATIENT ID': selectedPatient['PATIENT ID'],
            'PATIENT NAME': selectedPatient['GUARDIAN NAME'], // Using guardian name as patient name
            'PHONE NUMBER': selectedPatient['PHONE NUMBER'],
            AGE: selectedPatient['AGE'],
            GENDER: selectedPatient['GENDER'],
            ADDRESS: selectedPatient['ADDRESS']
          }
        : {})
    }

    // Override with initial data if available
    return {
      ...defaultData,
      ...initialData
    }
  })

  // No need to fetch patients as they are passed as props

  // Auto-generate Sno based on prescription count and update when initialData changes
  useEffect(() => {
    if (!initialData.Sno) {
      setFormData((prev) => {
        // Only update if the Sno value would actually change
        if (prev.Sno !== prescriptionCount + 1) {
          return {
            ...prev,
            Sno: prescriptionCount + 1
          }
        }
        return prev
      })
    }
    // Log for debugging
    console.log('DischargePriscreptionForm initialData:', initialData)
    console.log('DischargePriscreptionForm selectedPatient:', selectedPatient)
  }, [prescriptionCount, initialData, selectedPatient])
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target
    let processedValue: string | number = value

    // Convert numeric fields to numbers
    if (
      type === 'number' ||
      name === 'AGE' ||
      name === 'TOTAL AMOUNT' ||
      name === 'ADVANCE PAID' ||
      name === 'AMOUNT RECEIVED' ||
      name === 'DISCOUNT PERCENTAG' ||
      name === 'DISCOUNT AMOUNT' ||
      name === 'AMOUNT DUE' ||
      name === 'TEMPARATURE' ||
      name === 'P.R.' ||
      name === 'SPO2'
    ) {
      processedValue = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }))

    // Auto-fill patient information when patient ID, name, or phone number is entered
    if (name === 'PATIENT ID' || name === 'GUARDIAN NAME' || name === 'PHONE NUMBER') {
      const searchValue = value.toString().trim().toLowerCase()
      if (searchValue) {
        const foundPatient = patients.find((patient) => {
          return (
            (patient['PATIENT ID'] &&
              patient['PATIENT ID'].toString().toLowerCase().includes(searchValue)) ||
            (patient['GUARDIAN NAME'] &&
              patient['GUARDIAN NAME'].toString().toLowerCase().includes(searchValue)) ||
            (patient['PHONE NUMBER'] &&
              patient['PHONE NUMBER'].toString().toLowerCase().includes(searchValue))
          )
        })

        if (foundPatient) {
          setFormData((prev) => ({
            ...prev,
            'PATIENT ID': foundPatient['PATIENT ID'] || prev['PATIENT ID'],
            'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || prev['GUARDIAN NAME'],
            'PHONE NUMBER': foundPatient['PHONE NUMBER'] || prev['PHONE NUMBER'],
            DOB: foundPatient.DOB || prev.DOB,
            AGE: foundPatient.AGE || prev.AGE,
            GENDER: foundPatient.GENDER || prev.GENDER,
            ADDRESS: foundPatient.ADDRESS || prev.ADDRESS
          }))
        }
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      // Add current date if not present
      if (!formData.DATE) {
        const updatedFormData = {
          ...formData,
          DATE: new Date().toISOString().split('T')[0]
        }
        console.log('Submitting prescription form data:', updatedFormData)
        await onSubmit(updatedFormData)
      } else {
        console.log('Submitting prescription form data:', formData)
        await onSubmit(formData)
      }
      // Don't reset the form after submission as it's used in the operation form
      // The operation form will handle resetting when needed
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  // Add date to form data when submitting

  return (
    <form id="discharge-prescription-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Prescription Section */}
      <div className="border border-gray-200 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>

        {/* Dynamic Prescription Fields */}
        {Array.from({ length: visiblePrescriptions }).map((_, index) => (
          <div
            key={`prescription-${index + 1}`}
            className="mb-4 p-3 border border-gray-200 bg-blue-50 rounded-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Prescription {index + 1}</h4>
              {visiblePrescriptions > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePrescription(index)}
                  className="text-gray-500 hover:text-red-500 focus:outline-none"
                  title="Remove prescription"
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
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prescription */}
              <div>
                <label
                  htmlFor={`PRESCRIPTION${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Prescription {index + 1}
                </label>
                <EditableCombobox
                  id={`PRESCRIPTION ${index + 1}`}
                  name={`PRESCRIPTION ${index + 1}`}
                  value={(formData[`PRESCRIPTION ${index + 1}`] as string) || ''}
                  options={medicineOptions}
                  onChange={handleChange}
                  placeholder="Select or type medicine name, dosage..."
                  className="bg-white"
                />
              </div>

              {/* Days */}
              <div>
                <label
                  htmlFor={`DAYS ${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Days {index + 1}
                </label>
                <input
                  type="text"
                  name={`DAYS ${index + 1}`}
                  id={`DAYS ${index + 1}`}
                  value={(formData[`DAYS ${index + 1}`] as string) || ''}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of days"
                />
              </div>
              {/* Timing */}
              <div>
                <label
                  htmlFor={`TIMING ${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Timing {index + 1}
                </label>
                <EditableCombobox
                  id={`TIMING ${index + 1}`}
                  name={`TIMING ${index + 1}`}
                  options={timingOptions}
                  value={(formData[`TIMING ${index + 1}`] as string) || ''}
                  onChange={handleChange}
                  placeholder="Select or type timing..."
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add More Prescription Button */}
        {visiblePrescriptions < 10 && (
          <button
            type="button"
            onClick={() => setVisiblePrescriptions((prev) => Math.min(prev + 1, 10))}
            className="mt-2 flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add More Prescription
          </button>
        )}
      </div>

      {/* Buttons removed - now using parent component buttons */}
    </form>
  )
}

export default DischargePriscreptionForm
