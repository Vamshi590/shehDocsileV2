import React, { useState, useEffect } from 'react'
import { medicineOptions, timingOptions } from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'

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

interface DischargePriscreptionFormProps {
  onSubmit: (prescription: Omit<Prescription, 'id'>) => Promise<void>
  onCancel: () => void
  prescriptionCount: number
  initialData?: Partial<Prescription>
  selectedPatient?: Patient | null
  patients?: Patient[]
}

const DischargePriscreptionForm: React.FC<DischargePriscreptionFormProps> = ({
  onSubmit,
  onCancel,
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
            AGE: selectedPatient.AGE,
            GENDER: selectedPatient.GENDER,
            ADDRESS: selectedPatient.ADDRESS
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-500 mb-4">Fields marked with * are required</p>

      {/* Prescription Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>

        {/* Dynamic Prescription Fields */}
        {Array.from({ length: visiblePrescriptions }).map((_, index) => (
          <div
            key={`prescription-${index + 1}`}
            className="mb-4 p-3 border border-gray-200 rounded-md"
          >
            <h4 className="font-medium mb-2">Prescription {index + 1}</h4>
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                />
                {/* <div className="relative">
                  <input
                    type="text"
                    name={`TIMING ${index + 1}`}
                    id={`TIMING ${index + 1}`}
                    value={(formData[`TIMING ${index + 1}`] as string) || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Morning, Afternoon, Night"
                    list={`timing-options-${index}`}
                    autoComplete="off"
                  />
                  <datalist id={`timing-options-${index}`}>
                    {timingOptions.map((option, i) => (
                      <option key={i} value={option} />
                    ))}
                  </datalist>
                </div> */}
              </div>
            </div>
          </div>
        ))}

        {/* Add More Prescription Button */}
        {visiblePrescriptions < 10 && (
          <button
            type="button"
            onClick={() => setVisiblePrescriptions((prev) => Math.min(prev + 1, 10))}
            className="mt-2 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

export default DischargePriscreptionForm
