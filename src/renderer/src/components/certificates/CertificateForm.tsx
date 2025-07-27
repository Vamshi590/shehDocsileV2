import React, { useState, useEffect } from 'react'

// Standardized API response format
interface StandardizedResponse<T> {
  success: boolean
  data?: T | null
  message?: string
}

// Define interfaces for form data and patient search
interface Patient {
  id: string
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

// Certificate types
const CERTIFICATE_TYPES = {
  EMERGENCY: 'emergency',
  ESSENTIALITY: 'essentiality',
  NON_CLAIM: 'nonClaim'
}

export interface PatientData {
  patientName: string
  patientId: string
  guardianName: string
  gender: string
  resident: string
  age: string
  department: string
}

export interface AdmissionData {
  date: string
  dateOfAdmission: string
  timeOfAdmission: string
  provisionalDiagnosis: string
}

export interface TreatmentData {
  date: string
  underwentOn: string
  operationDetails: string
  dischargedOn: string
  chargedAmount: number
  department: string
}

export interface BillingItem {
  particulars: string
  amount: number | string
}

export interface BillingData {
  totalAmount: number
  advancePaid: number
  discountPercent: number
  discountAmount: number
  amountReceived: number
  balance: number
}

export interface CertificateFormData {
  patientData: PatientData
  admissionData: AdmissionData
  treatmentData: TreatmentData
  billingItems: BillingItem[]
  billingData: BillingData
  authorizedSignatory: string
}

interface CertificateFormProps {
  certificateType: string
  onFormDataChange: (data: CertificateFormData) => void
  onShowPreview: () => void
}

const CertificateForm: React.FC<CertificateFormProps> = ({
  certificateType,
  onFormDataChange,
  onShowPreview
}) => {
  // Patient search state
  const [isSearching, setIsSearching] = useState(false)
  const [searchPatientId, setSearchPatientId] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)

  // Handle patient search
  const handleSearchPatient = async (): Promise<void> => {
    if (!searchPatientId.trim()) {
      setSearchError('Please enter a Patient ID to search')
      return
    }

    setIsSearching(true)
    setSearchError(null)
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
            // Map patient data to certificate form data
            setFormData((prevData) => ({
              ...prevData,
              patientData: {
                ...prevData.patientData,
                patientName: patient.name || '',
                patientId: patient.patientId || '',
                guardianName: patient.guardian || '',
                gender: patient.gender || '',
                resident: patient.address || '',
                age: patient.age?.toString() || '',
                department: patient.department || ''
              }
            }))
          } else {
            // Check for the specific database error about multiple rows
            if (standardizedResponse.message?.includes('multiple (or no) rows returned')) {
              setSearchError(
                'Patient ID may be duplicated in the database. Please contact your administrator.'
              )
            } else {
              setSearchError(
                `Patient not found: ${standardizedResponse.message || 'Unknown error'}`
              )
            }
          }
        } else {
          // Handle legacy response format (direct patient object)
          const patient = response as Patient
          if (patient && 'patientId' in patient) {
            // Map patient data to certificate form data
            setFormData((prevData) => ({
              ...prevData,
              patientData: {
                ...prevData.patientData,
                patientName: patient.name || '',
                patientId: patient.patientId || '',
                guardianName: patient.guardian || '',
                gender: patient.gender || '',
                resident: patient.address || '',
                age: patient.age?.toString() || '',
                department: patient.department || ''
              }
            }))
          } else {
            setSearchError('Patient not found with ID: ' + searchPatientId)
          }
        }
      } else {
        setSearchError('Invalid response format from server')
      }
    } catch (error) {
      console.error('Error searching patient:', error)
      setSearchError('Error searching for patient. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchPatientId(e.target.value)
    setSearchError(null)
  }

  // Initialize form state based on certificate type
  const [formData, setFormData] = useState<CertificateFormData>({
    patientData: {
      patientName: '',
      patientId: '',
      guardianName: '',
      gender: '',
      resident: '',
      age: '',
      department: ''
    },
    admissionData: {
      date: new Date().toISOString().split('T')[0],
      dateOfAdmission: '',
      timeOfAdmission: '',
      provisionalDiagnosis: ''
    },
    treatmentData: {
      date: new Date().toISOString().split('T')[0],
      underwentOn: '',
      operationDetails: '',
      dischargedOn: '',
      chargedAmount: 0,
      department: ''
    },
    billingItems: [{ particulars: '', amount: 0 }],
    billingData: {
      totalAmount: 0,
      advancePaid: 0,
      discountPercent: 0,
      discountAmount: 0,
      amountReceived: 0,
      balance: 0
    },
    authorizedSignatory: 'For SRI HARSHA EYE HOSPITAL'
  })

  // Update parent component when form data changes
  useEffect(() => {
    onFormDataChange(formData)
  }, [formData, onFormDataChange])

  // Handle input changes for patient data
  const handlePatientDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      patientData: {
        ...formData.patientData,
        [name]: value
      }
    })
  }

  // Handle input changes for admission data
  const handleAdmissionDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      admissionData: {
        ...formData.admissionData,
        [name]: value
      }
    })
  }

  // Handle input changes for treatment data
  const handleTreatmentDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    const updatedValue = name === 'chargedAmount' ? parseFloat(value) || 0 : value
    setFormData({
      ...formData,
      treatmentData: {
        ...formData.treatmentData,
        [name]: updatedValue
      }
    })
  }

  // Handle changes to billing items
  const handleBillingItemChange = (index: number, field: string, value: string | number): void => {
    const updatedItems = [...formData.billingItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'amount' ? (value === '' ? '' : parseFloat(value.toString()) || 0) : value
    }

    setFormData({
      ...formData,
      billingItems: updatedItems
    })

    // Update total amount
    if (field === 'amount') {
      const totalAmount = updatedItems.reduce((sum, item) => {
        const itemAmount =
          typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0
        return sum + itemAmount
      }, 0)
      const updatedBillingData = {
        ...formData.billingData,
        totalAmount
      }

      // Recalculate discount amount
      updatedBillingData.discountAmount = (totalAmount * updatedBillingData.discountPercent) / 100

      // Update balance
      updatedBillingData.balance =
        totalAmount -
        updatedBillingData.advancePaid -
        updatedBillingData.discountAmount -
        updatedBillingData.amountReceived

      setFormData({
        ...formData,
        billingData: updatedBillingData
      })
    }
  }

  // Add new billing item
  const addBillingItem = (): void => {
    const updatedBillingItems = [...formData.billingItems, { particulars: '', amount: 0 }]
    setFormData({
      ...formData,
      billingItems: updatedBillingItems
    })
  }

  // Remove billing item
  const removeBillingItem = (index: number): void => {
    if (formData.billingItems.length > 1) {
      const updatedBillingItems = formData.billingItems.filter((_, i: number) => i !== index)
      setFormData({
        ...formData,
        billingItems: updatedBillingItems
      })
      updateBillingTotals(updatedBillingItems)
    }
  }

  // Handle input changes for billing data
  const handleBillingDataChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    const numValue = parseFloat(value) || 0

    const updatedBillingData = {
      ...formData.billingData,
      [name]: numValue
    }

    // Update discount amount when discount percent changes
    if (name === 'discountPercent') {
      updatedBillingData.discountAmount = (updatedBillingData.totalAmount * numValue) / 100
    }

    // Update balance
    updatedBillingData.balance =
      updatedBillingData.totalAmount -
      updatedBillingData.advancePaid -
      updatedBillingData.discountAmount -
      updatedBillingData.amountReceived

    setFormData({
      ...formData,
      billingData: updatedBillingData
    })
  }

  // Update billing totals based on billing items
  const updateBillingTotals = (billingItems: BillingItem[]): void => {
    const totalAmount = billingItems.reduce((sum, item) => {
      const itemAmount =
        typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0
      return sum + itemAmount
    }, 0)

    const updatedBillingData = {
      ...formData.billingData,
      totalAmount
    }

    // Recalculate discount amount
    updatedBillingData.discountAmount = (totalAmount * updatedBillingData.discountPercent) / 100

    // Update balance
    updatedBillingData.balance =
      totalAmount -
      updatedBillingData.advancePaid -
      updatedBillingData.discountAmount -
      updatedBillingData.amountReceived

    setFormData({
      ...formData,
      billingData: updatedBillingData
    })
  }

  // Handle authorized signatory change
  const handleAuthorizedSignatoryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      authorizedSignatory: e.target.value
    })
  }

  // Render form fields based on certificate type
  const renderFormFields = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        {/* Patient Search Section */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-md font-medium text-gray-900 mb-2">Patient Search</h3>
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
                onChange={handleSearchInputChange}
                placeholder="Enter Patient ID (e.g., 0001)"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          {searchError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {searchError}
            </div>
          )}
        </div>

        {/* Patient Information - Common to all certificate types */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium mb-3">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={formData.patientData.patientName}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
              <input
                type="text"
                name="patientId"
                value={formData.patientData.patientId}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
              <input
                type="text"
                name="guardianName"
                value={formData.patientData.guardianName}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.patientData.gender}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="text"
                name="age"
                value={formData.patientData.age}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resident of</label>
              <input
                type="text"
                name="resident"
                value={formData.patientData.resident}
                onChange={handlePatientDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Certificate-specific fields */}
        {certificateType === CERTIFICATE_TYPES.EMERGENCY && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium mb-3">Emergency Admission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.admissionData.date}
                  onChange={handleAdmissionDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.patientData.department}
                  onChange={handlePatientDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Admission
                </label>
                <input
                  type="date"
                  name="dateOfAdmission"
                  value={formData.admissionData.dateOfAdmission}
                  onChange={handleAdmissionDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time of Admission
                </label>
                <input
                  type="time"
                  name="timeOfAdmission"
                  value={formData.admissionData.timeOfAdmission}
                  onChange={handleAdmissionDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provisional Diagnosis
                </label>
                <textarea
                  name="provisionalDiagnosis"
                  value={formData.admissionData.provisionalDiagnosis}
                  onChange={handleAdmissionDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {certificateType === CERTIFICATE_TYPES.ESSENTIALITY && (
          <>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium mb-3">Treatment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.treatmentData.date}
                    onChange={handleTreatmentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Underwent On
                  </label>
                  <input
                    type="date"
                    name="underwentOn"
                    value={formData.treatmentData.underwentOn}
                    onChange={handleTreatmentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operation Details
                  </label>
                  <input
                    type="text"
                    name="operationDetails"
                    value={formData.treatmentData.operationDetails}
                    onChange={handleTreatmentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discharged On
                  </label>
                  <input
                    type="date"
                    name="dischargedOn"
                    value={formData.treatmentData.dischargedOn}
                    onChange={handleTreatmentDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium mb-3">Billing Items</h3>
              {formData.billingItems.map((item: BillingItem, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Particulars"
                      value={item.particulars}
                      onChange={(e) =>
                        handleBillingItemChange(index, 'particulars', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount || ''}
                      onChange={(e) => handleBillingItemChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBillingItem(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addBillingItem}
                className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Item
              </button>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium mb-3">Billing Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.billingData.totalAmount}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Paid
                  </label>
                  <input
                    type="number"
                    name="advancePaid"
                    value={formData.billingData.advancePaid}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.billingData.discountPercent}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.billingData.discountAmount}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    name="amountReceived"
                    value={formData.billingData.amountReceived}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.billingData.balance}
                    onChange={handleBillingDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {certificateType === CERTIFICATE_TYPES.NON_CLAIM && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-medium mb-3">Treatment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.treatmentData.date}
                  onChange={handleTreatmentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.treatmentData.department}
                  onChange={handleTreatmentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Underwent On</label>
                <input
                  type="date"
                  name="underwentOn"
                  value={formData.treatmentData.underwentOn}
                  onChange={handleTreatmentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discharged On
                </label>
                <input
                  type="date"
                  name="dischargedOn"
                  value={formData.treatmentData.dischargedOn}
                  onChange={handleTreatmentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charged Amount
                </label>
                <input
                  type="number"
                  name="chargedAmount"
                  value={formData.treatmentData.chargedAmount}
                  onChange={handleTreatmentDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Authorized Signatory - Common to all certificate types */}
        <div>
          <h3 className="text-md font-medium mb-3">Signature</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Authorized Signatory
            </label>
            <input
              type="text"
              value={formData.authorizedSignatory}
              onChange={handleAuthorizedSignatoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Preview Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onShowPreview}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            Show Preview
          </button>
        </div>
      </div>
    )
  }

  return renderFormFields()
}

export default CertificateForm
