import React, { useState, useEffect, useRef } from 'react'
import { paidForOptions, paidForOptionNames, paymentModeOptions } from '../../utils/dropdownOptions'

export interface Patient {
  id: string
  date: string
  patientId: string
  name: string
  guardian?: string
  phone: string
  age: string
  gender: string
  address: string
  dob?: string
  // Include uppercase versions for compatibility with form data
  AGE?: string
  GENDER?: string
  ADDRESS?: string
  DOB?: string
  doctorName?: string
  department?: string
  referredBy?: string
}

interface Prescription {
  id: string
  [key: string]: unknown
}

interface ReceiptFormProps {
  onSubmit: (formData: Omit<Prescription, 'id'>) => Promise<void>
  onCancel: () => void
  patients: Patient[]
  selectedPatient: Patient | null
  initialData?: Record<string, unknown>
  type?: string
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({
  onSubmit,
  onCancel,
  patients,
  selectedPatient,
  initialData,
  type
}) => {
  // Initialize form data with default values
  const [formData, setFormData] = useState<Omit<Prescription, 'id'>>({
    // Basic information
    Sno: '',
    DATE: new Date().toISOString().split('T')[0],
    'RECEIPT NO': '',

    // Patient information
    'PATIENT ID': '',
    'PATIENT NAME': '',
    'GUARDIAN NAME': '',
    DOB: '',
    AGE: '',
    GENDER: '',
    'PHONE NUMBER': '',
    ADDRESS: '',

    // Doctor information
    'DOCTOR NAME': '',
    DEPARTMENT: '',
    'REFFERED BY': '',
    // Payment information
    'PAID FOR': '',
    MODE: 'Cash',
    'TOTAL AMOUNT': '',
    'ADVANCE PAID': '0',
    'AMOUNT RECEIVED': '',
    'DISCOUNT PERCENTAG': '0',
    'DISCOUNT AMOUNT': '0',
    'AMOUNT DUE': '',

    // Medical information
    TEMPARATURE: '',
    'P.R.': '',
    SPO2: '',
    'PRESENT COMPLAIN': '',
    'PREVIOUS HISTORY': '',
    OTHERS: '',
    OTHERS1: '',

    // Prescription information
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
    'PRESCRIPTION 11': '',
    'DAYS 11': '',
    'TIMING 11': '',
    'PRESCRIPTION 12': '',
    'DAYS 12': '',
    'TIMING 12': '',
    'PRESCRIPTION 13': '',
    'DAYS 13': '',
    'TIMING 13': '',
    'PRESCRIPTION 14': '',
    'DAYS 14': '',
    'TIMING 14': '',
    'PRESCRIPTION 15': '',
    'DAYS 15': '',
    'TIMING 15': '',

    // Advice information
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
    'ADVICE 11': '',
    'ADVICE 12': '',
    'ADVICE 13': '',
    'ADVICE 14': '',
    'ADVICE 15': '',

    NOTES: '',
    'FOLLOW UP DATE': '',

    // Glass prescription - Right Eye Distance
    'GR-RE-D-SPH': '',
    'GR-RE-D-CYL': '',
    'GR-RE-D-AXIS': '',
    'GR-RE-D-VISION': '',
    // Glass prescription - Right Eye Near
    'GR-RE-N-SPH': '',
    'GR-RE-N-CYL': '',
    'GR-RE-N-AXIS': '',
    'GR-RE-N-VISION': '',
    // Glass prescription - Left Eye Distance
    'GR-LE-D-SPH': '',
    'GR-LE-D-CYL': '',
    'GR-LE-D-AXIS': '',
    'GR-LE-D-VISION': '',
    // Glass prescription - Left Eye Near
    'GR-LE-N-SPH': '',
    'GR-LE-N-CYL': '',
    'GR-LE-N-AXIS': '',
    'GR-LE-N-VISION': '',

    // Auto-refraction - Right Eye
    'AR-RE-SPH': '',
    'AR-RE-CYL': '',
    'AR-RE-AXIS': '',
    'AR-RE-VA': '',
    'AR-RE-VAC.P.H': '',
    // Auto-refraction - Left Eye
    'AR-LE-SPH': '',
    'AR-LE-CYL': '',
    'AR-LE-AXIS': '',
    'AR-LE-VA': '',
    'AR-LE-VAC.P.H': '',
    PD: '',

    // PGP - Right Eye Distance
    'PGP-RE-D-SPH': '',
    'PGP-RE-D-CYL': '',
    'PGP-RE-D-AXIS': '',
    'PGP-RE-D-VA': '',
    // PGP - Right Eye Near
    'PGP-RE-N-SPH': '',
    'PGP-RE-N-CYL': '',
    'PGP-RE-N-AXIS': '',
    'PGP-RE-N-VA': '',
    // PGP - Left Eye Distance
    'PGP-LE-D-SPH': '',
    'PGP-LE-D-CYL': '',
    'PGP-LE-D-AXIS': '',
    'PGP-LE-D-BCVA': '',
    // PGP - Left Eye Near
    'PGP-LE-N-SPH': '',
    'PGP-LE-N-CYL': '',
    'PGP-LE-N-AXIS': '',
    'PGP-LE-N-BCVA': '',

    // SR - Right Eye Distance
    'SR-RE-D-SPH': '',
    'SR-RE-D-CYL': '',
    'SR-RE-D-AXIS': '',
    'SR-RE-D-VA': '',
    // SR - Right Eye Near
    'SR-RE-N-SPH': '',
    'SR-RE-N-CYL': '',
    'SR-RE-N-AXIS': '',
    'SR-RE-N-VA': '',
    // SR - Left Eye Distance
    'SR-LE-D-SPH': '',
    'SR-LE-D-CYL': '',
    'SR-LE-D-AXIS': '',
    'SR-LE-D-BCVA': '',
    // SR - Left Eye Near
    'SR-LE-N-SPH': '',
    'SR-LE-N-CYL': '',
    'SR-LE-N-AXIS': '',
    'SR-LE-N-BCVA': '',

    // Clinical findings - Right Eye
    'CF-RE-LIDS': '',
    'CF-RE-CONJUCTIVA': '',
    'CF-RE-CORNEA': '',
    'CF-RE-A.C.': '',
    'CF-RE-IRIS': '',
    'CF-RE-PUPIL': '',
    'CF-RE-LENS': '',
    'CF-RE-SAC': '',
    'CF-RE-TENSION': '',
    'CF-RE-FUNDUS': '',
    'CF-RE-RETINO 1': '',
    'CF-RE-RETINO 2': '',
    'CF-RE-RETINO 3': '',
    'CF-RE-RETINO 4': '',

    // Clinical findings - Left Eye
    'CF-LE-LIDS': '',
    'CF-LE-CONJUCTIVA': '',
    'CF-LE-CORNEA': '',
    'CF-LE-A.C.': '',
    'CF-LE-IRIS': '',
    'CF-LE-PUPIL': '',
    'CF-LE-LENS': '',
    'CF-LE-SAC': '',
    'CF-LE-TENSION': '',
    'CF-LE-FUNDUS': '',
    'CF-LE-RETINO 1': '',
    'CF-LE-RETINO 2': '',
    'CF-LE-RETINO 3': '',
    'CF-LE-RETINO 4': '',

    // Admission and operation details
    'DATE OF ADMIT': '',
    'TIME OF ADMIT': '',
    'DATE OF OPERATION': '',
    'TIME OF OPERATION': '',
    'DATE OF DISCHARGE': '',
    'TIME OF DISCHARGE': '',

    'OPERATION DETAILS': '',
    'OPERATION PROCEDUR': '',
    'PROVISION DIAGNOSIS': '',

    // Particulars and amounts
    'PART. 1': '',
    'AMOUNT 1': '',
    'PART. 2': '',
    'AMOUNT 2': '',
    'PART. 3': '',
    'AMOUNT 3': '',
    'PART. 4': '',
    'AMOUNT 4': '',
    'PART. 5': '',
    'AMOUNT 5': '',
    'PART. 6': '',
    'AMOUNT 6': '',
    'PART. 7': '',
    'AMOUNT 7': '',
    'PART. 8': '',
    'AMOUNT 8': '',
    'PART. 9': '',
    'AMOUNT 9': '',
    'PART. 10': '',
    'AMOUNT 10': '',

    'REVIEW ON': '',

    // Posterior segment examination
    'PDE-RE-OPTIC DISK': '',
    'PDE-RE-OPTIC MACULA': '',
    'PDE-RE-OPTIC BLOOD VESSELS': '',
    'PDE-RE-PR': '',
    'PDE-LE-OPTIC DISK': '',
    'PDE-LE-OPTIC MACULA': '',
    'PDE-LE-OPTIC BLOOD VESSELS': '',
    'PDE-LE-PR': '',

    'CREATED BY': '',
    'UPDATED BY': '',
    'CREATED AT': '',
    'UPDATED AT': '',

    // Add patient information if a patient is selected
    ...(selectedPatient
      ? {
          'PATIENT ID': selectedPatient.patientId,
          'PATIENT NAME': selectedPatient.guardian || selectedPatient.name,
          'PHONE NUMBER': selectedPatient.phone,
          AGE: selectedPatient.age,
          GENDER: selectedPatient.gender,
          ADDRESS: selectedPatient.address
        }
      : {})
  } as Omit<Prescription, 'id'>)

  // No need to fetch patients as they are passed as props

  // State for autocomplete dropdowns
  const [showPaidForDropdown, setShowPaidForDropdown] = useState(false)
  const [filteredPaidForOptions, setFilteredPaidForOptions] = useState<string[]>([])
  const paidForRef = useRef<HTMLDivElement>(null)

  // Payment mode autocomplete states
  const [showPaymentModeDropdown, setShowPaymentModeDropdown] = useState(false)
  const [filteredPaymentModeOptions, setFilteredPaymentModeOptions] =
    useState<string[]>(paymentModeOptions)
  const paymentModeRef = useRef<HTMLDivElement>(null)

  const getCurrentUser = (): string => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}')
    return user.fullName || user.username || 'Unknown User'
  }
  // // Doctor information autocomplete states
  // const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)
  // const [filteredDoctorOptions, setFilteredDoctorOptions] = useState<string[]>(doctorOptions)
  // const doctorRef = useRef<HTMLDivElement>(null)

  // const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  // const [filteredDepartmentOptions, setFilteredDepartmentOptions] =
  //   useState<string[]>(departmentOptions)
  // const departmentRef = useRef<HTMLDivElement>(null)

  // const [showReferredByDropdown, setShowReferredByDropdown] = useState(false)
  // const [filteredReferredByOptions, setFilteredReferredByOptions] =
  //   useState<string[]>(referredByOptions)
  // const referredByRef = useRef<HTMLDivElement>(null)

  // Update form when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          'PATIENT ID': selectedPatient.patientId,
          'PATIENT NAME': selectedPatient.guardian || selectedPatient.name,
          'PHONE NUMBER': selectedPatient.phone,
          AGE: selectedPatient.age,
          GENDER: selectedPatient.gender,
          ADDRESS: selectedPatient.address,
          DOB: selectedPatient.dob || ''
        }
        return updatedData
      })
    }
  }, [selectedPatient])

  // Update form data when initialData changes (for editing existing receipts)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        ...initialData
      }))
    }
  }, [initialData])

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target

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

    // For Paid For field, filter options based on input
    if (name === 'PAID FOR') {
      const filtered = value
        ? paidForOptionNames.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
        : paidForOptionNames
      setFilteredPaidForOptions(filtered)
      setShowPaidForDropdown(true)

      // Set form data
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }))

      // For Paid For field, set the amount automatically based on selection
      const selectedOption = paidForOptions.find((option) => option.name === value)

      if (selectedOption) {
        // If a predefined option is selected, set all values accordingly
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          'TOTAL AMOUNT': selectedOption.amount,
          'DISCOUNT PERCENTAG': 0,
          'DISCOUNT AMOUNT': 0,
          'ADVANCE PAID': 0,
          'AMOUNT RECEIVED': selectedOption.amount,
          'AMOUNT DUE': 0
        }))
        return
      } else {
        // If manually entered (not in predefined list), reset financial fields
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          'TOTAL AMOUNT': '',
          'DISCOUNT PERCENTAG': 0,
          'DISCOUNT AMOUNT': 0,
          'ADVANCE PAID': 0,
          'AMOUNT RECEIVED': '',
          'AMOUNT DUE': 0
        }))
        return
      }
    } else {
      // Update form data for all other fields
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue
      }))
    }

    // Auto-fill patient information when patient ID, name, or phone number is entered
    if (name === 'PATIENT ID' || name === 'GUARDIAN NAME' || name === 'PHONE NUMBER') {
      const searchValue = value.toString().trim().toLowerCase()
      if (searchValue) {
        const foundPatient = patients.find((patient) => {
          return Object.entries(patient).some(([key, value]) => {
            // Skip the id field and null/undefined values
            if (key === 'id' || value == null) return false

            // Convert value to string and check if it includes the search term
            const stringValue = String(value).toLowerCase()
            return stringValue.includes(searchValue)
          })
        })

        if (foundPatient) {
          setFormData((prev) => ({
            ...prev,
            'PATIENT ID': foundPatient['PATIENT ID'],
            'PATIENT NAME': foundPatient['GUARDIAN NAME'],
            'PHONE NUMBER': foundPatient['PHONE NUMBER'],
            AGE: foundPatient.AGE,
            GENDER: foundPatient.GENDER,
            ADDRESS: foundPatient.ADDRESS
          }))
        }
      }
    }

    // When Total Amount changes, update received amount and calculations
    if (name === 'TOTAL AMOUNT') {
      const totalAmount = Number(value) || 0
      const discountPercentage = Number(formData['DISCOUNT PERCENTAG'] || 0)
      const discountAmount = (totalAmount * discountPercentage) / 100

      // Set amount received to total amount - discount by default
      const amountReceived = totalAmount - discountAmount
      const amountDue = 0 // Since amount received equals total - discount

      setFormData((prev) => ({
        ...prev,
        'TOTAL AMOUNT': totalAmount,
        'DISCOUNT AMOUNT': discountAmount,
        'AMOUNT RECEIVED': amountReceived,
        'AMOUNT DUE': amountDue
      }))
    }

    // When Discount Percentage changes
    else if (name === 'DISCOUNT PERCENTAG') {
      const totalAmount = Number(formData['TOTAL AMOUNT'] || 0)
      const discountPercentage = Number(value) || 0
      const discountAmount = (totalAmount * discountPercentage) / 100

      // Update amount received to be total - discount
      const amountReceived = totalAmount - discountAmount
      const amountDue = 0 // Since amount received equals total - discount

      setFormData((prev) => ({
        ...prev,
        'DISCOUNT PERCENTAG': discountPercentage,
        'DISCOUNT AMOUNT': discountAmount,
        'AMOUNT RECEIVED': amountReceived,
        'AMOUNT DUE': amountDue
      }))
    }

    // When Advance Paid changes
    else if (name === 'ADVANCE PAID') {
      const totalAmount = Number(formData['TOTAL AMOUNT'] || 0)
      const discountAmount = Number(formData['DISCOUNT AMOUNT'] || 0)
      const advancePaid = Number(value) || 0

      // Set amount received equal to advance paid
      const amountReceived = advancePaid

      // Calculate amount due
      const amountDue = totalAmount - discountAmount - amountReceived

      setFormData((prev) => ({
        ...prev,
        'ADVANCE PAID': advancePaid,
        'AMOUNT RECEIVED': amountReceived,
        'AMOUNT DUE': amountDue >= 0 ? amountDue : 0
      }))
    }

    // When Amount Received changes
    else if (name === 'AMOUNT RECEIVED') {
      const totalAmount = Number(formData['TOTAL AMOUNT'] || 0)
      const discountAmount = Number(formData['DISCOUNT AMOUNT'] || 0)
      const amountReceived = Number(value) || 0

      // Calculate amount due
      const amountDue = totalAmount - discountAmount - amountReceived

      setFormData((prev) => ({
        ...prev,
        'AMOUNT RECEIVED': amountReceived,
        'AMOUNT DUE': amountDue >= 0 ? amountDue : 0
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    console.log('Submitting form with data:', formData)
    console.log('Selected patient at submission:', selectedPatient)

    // Ensure patient details are included in submission
    const submissionData = {
      ...formData,
      'PATIENT ID': selectedPatient?.patientId || formData['PATIENT ID'] || '',
      'PATIENT NAME':
        selectedPatient?.name || selectedPatient?.guardian || formData['PATIENT NAME'] || '',
      'GUARDIAN NAME': selectedPatient?.guardian || formData['GUARDIAN NAME'] || '',
      'PHONE NUMBER': selectedPatient?.phone || formData['PHONE NUMBER'] || '',
      AGE: selectedPatient?.age || formData.AGE || '',
      GENDER: selectedPatient?.gender || formData.GENDER || '',
      ADDRESS: selectedPatient?.address || formData.ADDRESS || '',
      DOB: selectedPatient?.dob || formData.DOB || '',
      MODE: formData.MODE || 'Cash',
      'DOCTOR NAME': selectedPatient?.doctorName || 'Dr. Srilatha ch',
      DEPARTMENT: selectedPatient?.department || 'Opthalmology',
      'REFFERED BY': selectedPatient?.referredBy || 'Self',
      'CREATED BY': getCurrentUser(),
      'UPDATED BY': '',
      'CREATED AT': new Date().toISOString(),
      'UPDATED AT': ''
    }

    console.log('Submitting form with final data:', submissionData)
    await onSubmit(submissionData)
  }

  // Handle paid for select
  const handlePaidForSelect = (option: string): void => {
    // Find the selected option to get its amount
    const selectedOption = paidForOptions.find((item) => item.name === option)

    if (selectedOption) {
      // Set total amount from the selected option
      const totalAmount = selectedOption.amount

      // Reset discount percentage to 0
      const discountPercentage = 0
      const discountAmount = 0

      // Reset advance paid to 0
      const advancePaid = 0

      // Set amount received equal to total amount initially
      const amountReceived = totalAmount

      // Amount due should be 0 initially since amount received equals total amount
      const amountDue = 0

      setFormData((prevData) => ({
        ...prevData,
        'PAID FOR': option,
        'TOTAL AMOUNT': totalAmount,
        'DISCOUNT PERCENTAG': discountPercentage,
        'DISCOUNT AMOUNT': discountAmount,
        'ADVANCE PAID': advancePaid,
        'AMOUNT RECEIVED': amountReceived,
        'AMOUNT DUE': amountDue
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        'PAID FOR': option,
        'TOTAL AMOUNT': '',
        'DISCOUNT PERCENTAG': 0,
        'DISCOUNT AMOUNT': 0,
        'ADVANCE PAID': 0,
        'AMOUNT RECEIVED': '',
        'AMOUNT DUE': 0
      }))
    }

    setShowPaidForDropdown(false)
  }

  // Handle payment mode select
  const handlePaymentModeSelect = (option: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      MODE: option
    }))
    setShowPaymentModeDropdown(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      // Close Paid For dropdown when clicking outside
      if (paidForRef.current && !paidForRef.current.contains(event.target as Node)) {
        setTimeout(() => setShowPaidForDropdown(false), 200)
      }

      // Close Payment Mode dropdown when clicking outside
      if (paymentModeRef.current && !paymentModeRef.current.contains(event.target as Node)) {
        setTimeout(() => setShowPaymentModeDropdown(false), 200)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Financial Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* PAID FOR */}
          <div ref={paidForRef} className="relative">
            <label htmlFor="PAID FOR" className="block text-sm font-medium text-gray-700">
              Paid For *
            </label>
            <input
              type="text"
              name="PAID FOR"
              id="PAID FOR"
              value={(formData['PAID FOR'] as string) || ''}
              onChange={handleChange}
              onFocus={() => {
                setFilteredPaidForOptions(paidForOptionNames)
                setShowPaidForDropdown(true)
              }}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {showPaidForDropdown && filteredPaidForOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                {filteredPaidForOptions.map((option) => (
                  <div
                    key={option}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePaidForSelect(option)
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* TOTAL AMOUNT */}
          <div>
            <label htmlFor="TOTAL AMOUNT" className="block text-sm font-medium text-gray-700">
              Total Amount *
            </label>
            <input
              type="number"
              name="TOTAL AMOUNT"
              id="TOTAL AMOUNT"
              min="0"
              step="0.01"
              value={(formData['TOTAL AMOUNT'] as number) || ''}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* DISCOUNT PERCENTAG */}
          <div>
            <label htmlFor="DISCOUNT PERCENTAG" className="block text-sm font-medium text-gray-700">
              Discount (%)
            </label>
            <input
              type="number"
              name="DISCOUNT PERCENTAG"
              id="DISCOUNT PERCENTAG"
              min="0"
              max="100"
              step="0.01"
              value={(formData['DISCOUNT PERCENTAG'] as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* DISCOUNT AMOUNT */}
          <div>
            <label htmlFor="DISCOUNT AMOUNT" className="block text-sm font-medium text-gray-700">
              Discount Amount
            </label>
            <input
              type="number"
              name="DISCOUNT AMOUNT"
              id="DISCOUNT AMOUNT"
              min="0"
              step="0.01"
              value={(formData['DISCOUNT AMOUNT'] as number) || ''}
              onChange={handleChange}
              readOnly
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500"
            />
          </div>

          {/* ADVANCE PAID */}
          <div>
            <label htmlFor="ADVANCE PAID" className="block text-sm font-medium text-gray-700">
              Advance Paid
            </label>
            <input
              type="number"
              name="ADVANCE PAID"
              id="ADVANCE PAID"
              min="0"
              step="0.01"
              value={(formData['ADVANCE PAID'] as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* AMOUNT RECEIVED */}
          <div>
            <label htmlFor="AMOUNT RECEIVED" className="block text-sm font-medium text-gray-700">
              Amount Received
            </label>
            <input
              type="number"
              name="AMOUNT RECEIVED"
              id="AMOUNT RECEIVED"
              min="0"
              step="0.01"
              value={(formData['AMOUNT RECEIVED'] as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* AMOUNT DUE */}
          <div>
            <label htmlFor="AMOUNT DUE" className="block text-sm font-medium text-gray-700">
              Amount Due
            </label>
            <input
              type="number"
              name="AMOUNT DUE"
              id="AMOUNT DUE"
              min="0"
              step="0.01"
              value={(formData['AMOUNT DUE'] as number) || ''}
              onChange={handleChange}
              readOnly
              className="mt-1 block w-full border border-gray-300 text-black rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500"
            />
          </div>

          {/* PAYMENT MODE */}
          <div ref={paymentModeRef} className="relative">
            <label htmlFor="MODE" className="block text-sm font-medium text-gray-700">
              Payment Mode *
            </label>
            <input
              type="text"
              name="MODE"
              id="MODE"
              value={(formData.MODE as string) || ''}
              onChange={(e) => {
                handleChange(e)
                const value = e.target.value
                const filtered = value
                  ? paymentModeOptions.filter((option) =>
                      option.toLowerCase().includes(value.toLowerCase())
                    )
                  : paymentModeOptions
                setFilteredPaymentModeOptions(filtered)
                setShowPaymentModeDropdown(true)
              }}
              onFocus={() => {
                setFilteredPaymentModeOptions(paymentModeOptions)
                setShowPaymentModeDropdown(true)
              }}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md text-black shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {showPaymentModeDropdown && filteredPaymentModeOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
                {filteredPaymentModeOptions.map((option, index) => (
                  <div
                    key={index}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePaymentModeSelect(option)
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      {type === 'prescriptionedit' ? (
        ''
      ) : (
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      )}
    </form>
  )
}

export default ReceiptForm
