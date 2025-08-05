import React, { useState, useEffect, useCallback } from 'react'
import { departmentOptions, doctorOptions, referredByOptions } from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'
import { toast } from 'sonner'
import { InPatient, PackageInclusion, PaymentRecord, SubItem } from '../../pages/InPatients'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

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
  admissionDate: string
  operationDate: string
  paymentRecords: PaymentRecord[]
  discount: number
  netAmount: number
  totalReceivedAmount: number
  balanceAmount: number
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
  // State for patient search functionality
  const [searchPatientId, setSearchPatientId] = useState('')
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
    admissionDate:
      initialValues?.admissionDate ||
      format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm'),
    operationDate: initialValues?.operationDate || '',
    packageAmount: initialValues?.packageAmount || 0,
    packageInclusions: initialValues?.packageInclusions || [
      { name: 'Surgery Charges', amount: 0, subItems: [] }
    ],
    paymentRecords: initialValues?.paymentRecords || [
      {
        date: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm'),
        amountType: 'Advance',
        paymentMode: 'Cash',
        amount: 0
      }
    ],
    discount: initialValues?.discount || 0,
    netAmount: initialValues?.netAmount || 0,
    totalReceivedAmount: initialValues?.totalReceivedAmount || 0,
    balanceAmount: initialValues?.balanceAmount || 0,
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

  // Payment options
  const [dynamicAmountTypeOptions, setDynamicAmountTypeOptions] = useState<string[]>([
    'Advance',
    'Insurance',
    'Final Payment',
    'Additional Charges'
  ])

  const [dynamicPaymentModeOptions, setDynamicPaymentModeOptions] = useState<string[]>([
    'Cash',
    'UPI',
    'Card',
    'Insurance',
    'Cheque',
    'Bank Transfer',
    'Cash+UPI'
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
          const response = (await api.getLatestInPatientId()) as StandardizedResponse<number>

          if (response.success && response.data) {
            // Extract the numeric part of the ID and increment it
            const latestId = response.data || 0
            const numericPart = latestId + 1
            const nextId = `IP-${String(numericPart).padStart(4, '0')}`

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

    // Special handling for age to ensure it's a valid number but stored as string
    if (name === 'age') {
      // Parse the value to ensure it's a valid number, but store as string
      const parsedValue = value === '' ? '' : String(parseInt(value, 10))
      setFormData((prev) => ({
        ...prev,
        [name]: parsedValue
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
    } else if (field === 'name') {
      updatedInclusions[index].name = value
    }

    setFormData((prev) => ({
      ...prev,
      packageInclusions: updatedInclusions
    }))

    // Update total package amount
    updatePackageTotal(updatedInclusions)
  }

  // Add sub-item to a package inclusion
  const addSubItem = (inclusionIndex: number): void => {
    const updatedInclusions = [...formData.packageInclusions]
    if (!updatedInclusions[inclusionIndex].subItems) {
      updatedInclusions[inclusionIndex].subItems = []
    }

    updatedInclusions[inclusionIndex].subItems?.push({
      itemName: '',
      quantity: 1,
      rate: 0,
      amount: 0
    })

    setFormData((prev) => ({
      ...prev,
      packageInclusions: updatedInclusions
    }))
  }

  // Remove sub-item from a package inclusion
  const removeSubItem = (inclusionIndex: number, subItemIndex: number): void => {
    const updatedInclusions = [...formData.packageInclusions]
    if (updatedInclusions[inclusionIndex].subItems) {
      updatedInclusions[inclusionIndex].subItems = updatedInclusions[
        inclusionIndex
      ].subItems?.filter((_, i) => i !== subItemIndex)

      // Recalculate the total for this inclusion based on remaining sub-items
      updatedInclusions[inclusionIndex].subItems?.reduce((sum, item) => sum + item.amount, 0)

      setFormData((prev) => ({
        ...prev,
        packageInclusions: updatedInclusions
      }))
    }
  }

  // Handle sub-item change
  const handleSubItemChange = (
    inclusionIndex: number,
    subItemIndex: number,
    field: keyof SubItem,
    value: string
  ): void => {
    const updatedInclusions = [...formData.packageInclusions]
    const subItems = updatedInclusions[inclusionIndex].subItems || []

    if (!subItems[subItemIndex]) return

    if (field === 'itemName') {
      subItems[subItemIndex][field] = value
    } else {
      // For numeric fields
      const numValue = parseFloat(value) || 0
      subItems[subItemIndex][field] = numValue

      // If quantity or rate changed, recalculate amount
      if (field === 'quantity' || field === 'rate') {
        const quantity = field === 'quantity' ? numValue : subItems[subItemIndex].quantity
        const rate = field === 'rate' ? numValue : subItems[subItemIndex].rate
        subItems[subItemIndex].amount = quantity * rate
      }
    }

    // Calculate total from sub-items
    subItems.reduce((sum, item) => sum + item.amount, 0)

    // Update the inclusion with the new sub-items
    updatedInclusions[inclusionIndex].subItems = subItems

    setFormData((prev) => ({
      ...prev,
      packageInclusions: updatedInclusions
    }))
  }

  // Calculate remaining amount for an inclusion
  const calculateRemainingAmount = (inclusion: PackageInclusion): number => {
    const subItemsTotal = inclusion.subItems?.reduce((sum, item) => sum + item.amount, 0) || 0
    return inclusion.amount - subItemsTotal
  }

  // Handle payment record changes
  const handlePaymentRecordChange = (
    index: number,
    field: keyof PaymentRecord,
    value: string
  ): void => {
    const updatedRecords = [...formData.paymentRecords]

    if (field === 'amount') {
      updatedRecords[index][field] = parseFloat(value) || 0
    } else {
      updatedRecords[index][field] = value
    }

    setFormData((prev) => ({
      ...prev,
      paymentRecords: updatedRecords
    }))

    // Update calculated amounts after payment record changes
    setTimeout(() => updateCalculatedAmounts(), 0)
  }

  // Add new payment record
  const addPaymentRecord = (): void => {
    setFormData((prev) => ({
      ...prev,
      paymentRecords: [
        ...prev.paymentRecords,
        {
          date: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm'),
          amountType: 'Advance',
          paymentMode: 'Cash',
          amount: 0
        }
      ]
    }))

    // No need to update calculated amounts as the new record has 0 amount
  }

  // Remove payment record
  const removePaymentRecord = (index: number): void => {
    if (formData.paymentRecords.length > 1) {
      const updatedRecords = formData.paymentRecords.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        paymentRecords: updatedRecords
      }))

      // Update calculated amounts after removing a payment record
      setTimeout(() => updateCalculatedAmounts(), 0)
    }
  }

  // Calculate total received amount
  const calculateTotalReceived = (): number => {
    return formData.paymentRecords.reduce((sum, record) => sum + record.amount, 0)
  }

  // Calculate net amount (package amount - discount)
  const calculateNetAmount = (): number => {
    return formData.packageAmount - formData.discount
  }

  // Calculate balance amount (net amount - total received)
  const calculateBalanceAmount = (): number => {
    return calculateNetAmount() - calculateTotalReceived()
  }

  // Update all calculated amounts
  const updateCalculatedAmounts = (): void => {
    const totalReceived = calculateTotalReceived()
    const netAmount = calculateNetAmount()
    const balanceAmount = netAmount - totalReceived

    setFormData((prev) => ({
      ...prev,
      totalReceivedAmount: totalReceived,
      netAmount: netAmount,
      balanceAmount: balanceAmount
    }))
  }

  // Prevent wheel events from changing number input values
  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>): void => {
    e.currentTarget.blur()
  }

  // Handle discount change
  const handleDiscountChange = (value: string): void => {
    const discountValue = parseFloat(value) || 0
    setFormData((prev) => ({
      ...prev,
      discount: discountValue
    }))

    // Update calculated amounts after discount changes
    setTimeout(() => updateCalculatedAmounts(), 0)
  }

  // Add new package inclusion field
  const addInclusionField = (): void => {
    setFormData((prev) => ({
      ...prev,
      packageInclusions: [...prev.packageInclusions, { name: '', amount: 0, subItems: [] }]
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

    // Update calculated amounts after package amount changes
    setTimeout(() => updateCalculatedAmounts(), 0)
  }

  // Define patient data interface for search results
  interface PatientSearchResult {
    id?: string
    patientId?: string
    name?: string
    NAME?: string
    age?: string
    AGE?: string
    gender?: string
    GENDER?: string
    phone?: string
    PHONE?: string
    'MOBILE NUMBER'?: string
    address?: string
    ADDRESS?: string
    dob?: string
    'DATE OF BIRTH'?: string
    guardian?: string
    'GUARDIAN NAME'?: string
  }

  // Function to search for existing patient by ID
  const searchPatient = async (): Promise<void> => {
    if (!searchPatientId.trim()) {
      toast.error('Please enter a patient ID to search')
      return
    }

    try {
      setIsSearching(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.getPatientById(
        searchPatientId.trim()
      )) as StandardizedResponse<PatientSearchResult>

      if (response.success && response.data) {
        const patientData = response.data

        // Update form data with patient information
        setFormData((prev) => ({
          ...prev,
          name: patientData.name || patientData.NAME || '',
          age: patientData.age || patientData.AGE || '',
          gender: patientData.gender || patientData.GENDER || '',
          phone: patientData.phone || patientData.PHONE || patientData['MOBILE NUMBER'] || '',
          address: patientData.address || patientData.ADDRESS || '',
          dateOfBirth: patientData.dob || patientData['DATE OF BIRTH'] || '',
          guardianName: patientData.guardian || patientData['GUARDIAN NAME'] || ''
        }))

        toast.success('Patient found! Information filled automatically.')
      } else {
        toast.error(response.message || 'No patient found with this ID')
      }
    } catch (error) {
      console.error('Error searching for patient:', error)
      toast.error('Failed to search for patient')
    } finally {
      setIsSearching(false)
    }
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

    // Update calculated amounts before submission
    const totalReceived = calculateTotalReceived()
    const netAmount = calculateNetAmount()
    const balanceAmount = calculateBalanceAmount()

    // Create final form data with updated calculated amounts
    const finalFormData = {
      ...formData,
      totalReceivedAmount: totalReceived,
      netAmount: netAmount,
      balanceAmount: balanceAmount
    }

    try {
      // Submit the form data with calculated amounts
      await onSubmit(finalFormData)

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
      admissionDate: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm'),
      operationDate: '',
      packageAmount: 0,
      packageInclusions: [{ name: 'Surgery Charges', amount: 0, subItems: [] }],
      paymentRecords: [
        {
          date: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd HH:mm'),
          amountType: 'Advance',
          paymentMode: 'Cash',
          amount: 0
        }
      ],
      discount: 0,
      netAmount: 0,
      totalReceivedAmount: 0,
      balanceAmount: 0,
      createdBy: getCurrentUser()
    })

    // Generate a new patient ID
    fetchLatestPatientId(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Search Section */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-300 mb-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Search Existing Patient</h3>
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Enter Patient ID to search"
              value={searchPatientId}
              onChange={(e) => setSearchPatientId(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={searchPatient}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Search for existing patients to auto-fill information
        </p>
      </div>

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
            <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Admission
            </label>
            <input
              type="datetime-local"
              id="admissionDate"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="operationDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Operation
            </label>
            <input
              type="datetime-local"
              id="operationDate"
              name="operationDate"
              value={formData.operationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

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
            onWheel={preventWheelChange}
            className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Package Inclusions</label>
          {formData.packageInclusions.map((inclusion, index) => (
            <div key={index} className="mb-4 border border-gray-200 rounded-md p-3">
              <div className="flex items-center mb-2 gap-2">
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
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    id={`inclusion-amount-${index}`}
                    name={`inclusion-amount-${index}`}
                    value={inclusion.amount}
                    onChange={(e) => handleInclusionChange(index, 'amount', e.target.value)}
                    onWheel={preventWheelChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="Amount"
                  />
                </div>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => addSubItem(index)}
                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-1"
                    title="Add Sub Item"
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
                  </button>
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

              {/* Sub Items Section */}
              {inclusion.subItems && inclusion.subItems.length > 0 && (
                <div className="mt-2 ml-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Sub Items</div>
                  <div className="text-xs text-gray-500 mb-2">
                    Remaining amount: ₹{calculateRemainingAmount(inclusion).toLocaleString()}
                  </div>

                  <div className="grid grid-cols-12 gap-2 mb-1 text-xs font-medium text-gray-600">
                    <div className="col-span-5">Item Name</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {inclusion.subItems.map((subItem, subIndex) => (
                    <div key={subIndex} className="grid grid-cols-12 gap-2 mb-1 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={subItem.itemName}
                          onChange={(e) =>
                            handleSubItemChange(index, subIndex, 'itemName', e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={subItem.quantity}
                          onChange={(e) =>
                            handleSubItemChange(index, subIndex, 'quantity', e.target.value)
                          }
                          onWheel={preventWheelChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={subItem.rate}
                          onChange={(e) =>
                            handleSubItemChange(index, subIndex, 'rate', e.target.value)
                          }
                          onWheel={preventWheelChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="w-full px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded">
                          ₹{subItem.amount.toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeSubItem(index, subIndex)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Remove Sub Item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Records Section */}
      <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Records</h3>

        {/* Payment Summary */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Net Amount:</div>
              <div className="text-lg font-semibold text-blue-700">
                ₹{calculateNetAmount().toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">(Package Amount - Discount)</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Total Received:</div>
              <div className="text-lg font-semibold text-green-700">
                ₹{calculateTotalReceived().toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">(Sum of all payments)</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Balance Amount:</div>
              <div className="text-lg font-semibold text-red-700">
                ₹{calculateBalanceAmount().toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">(Net Amount - Total Received)</div>
            </div>
          </div>
        </div>

        {formData.paymentRecords.map((record, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 pb-3 border-b border-gray-200 last:border-b-0"
          >
            <div>
              <label
                htmlFor={`payment-date-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date & Time
              </label>
              <input
                type="datetime-local"
                id={`payment-date-${index}`}
                value={record.date}
                onChange={(e) => handlePaymentRecordChange(index, 'date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor={`payment-type-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount Type
              </label>
              <EditableCombobox
                id={`payment-type-${index}`}
                name={`payment-type-${index}`}
                value={record.amountType}
                options={dynamicAmountTypeOptions}
                onChange={(e) => handlePaymentRecordChange(index, 'amountType', e.target.value)}
                onAddNewOption={(value) => setDynamicAmountTypeOptions((prev) => [...prev, value])}
                placeholder="Select or type amount type..."
                className="bg-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor={`payment-mode-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Mode
              </label>
              <EditableCombobox
                id={`payment-mode-${index}`}
                name={`payment-mode-${index}`}
                value={record.paymentMode}
                options={dynamicPaymentModeOptions}
                onChange={(e) => handlePaymentRecordChange(index, 'paymentMode', e.target.value)}
                onAddNewOption={(value) => setDynamicPaymentModeOptions((prev) => [...prev, value])}
                placeholder="Select or type payment mode..."
                className="bg-white"
                required
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <label
                  htmlFor={`payment-amount-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id={`payment-amount-${index}`}
                  value={record.amount}
                  onChange={(e) => handlePaymentRecordChange(index, 'amount', e.target.value)}
                  onWheel={preventWheelChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="0"
                />
              </div>

              <div className="flex mb-1">
                {index === formData.paymentRecords.length - 1 && (
                  <button
                    type="button"
                    onClick={addPaymentRecord}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    title="Add payment record"
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
                {formData.paymentRecords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePaymentRecord(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 ml-1"
                    title="Remove payment record"
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
          </div>
        ))}

        {/* Payment Summary */}
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Package Amount:</span>
                <span className="text-sm font-semibold">
                  ₹{formData.packageAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Discount:</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">₹</span>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    onWheel={preventWheelChange}
                    className="w-24 text-right bg-white border border-gray-300 rounded"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Net Amount:</span>
                <span className="text-sm font-semibold">
                  ₹{(formData.packageAmount - formData.discount).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Received:</span>
                <span className="text-sm font-semibold">
                  ₹{calculateTotalReceived().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Balance:</span>
                <span className="text-sm font-semibold">
                  ₹
                  {(
                    formData.packageAmount -
                    formData.discount -
                    calculateTotalReceived()
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
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
