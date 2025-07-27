import React, { useState } from 'react'
import { toast } from 'sonner'

// Define standardized API response type
interface StandardizedResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Define Operation type
// Define Prescription type
interface Prescription {
  id: string
  patientId?: string
  patientName?: string
  doctorName?: string
  followUpDate?: string
  notes?: string
  [key: string]: unknown
}
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  operatedBy: string
  assistants?: string
  preOpDiagnosis?: string
  postOpDiagnosis?: string
  procedure?: string
  findings?: string
  complications?: string
  followUpDate?: string
  reviewOn?: string
  notes?: string
  [key: string]: unknown
}

interface Patient {
  id?: string
  date?: string
  patientId: string
  name?: string
  guardian?: string
  dob?: string
  age?: number | string
  gender?: string
  phone?: string
  address?: string
  [key: string]: unknown
}

interface FollowUpSectionProps {
  operations: Operation[]
  prescriptions?: Prescription[]
  loading: boolean
}

const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  operations,
  prescriptions = [],
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])

  // Load patients once on mount
  React.useEffect(() => {
    const loadPatients = async (): Promise<void> => {
      try {
        if (window.api?.getPatients) {
          const response = await window.api.getPatients()

          let patientsData: Patient[] = []

          if (response && typeof response === 'object') {
            if ('success' in response && 'data' in response) {
              // Handle standardized response format
              const standardizedResponse = response as StandardizedResponse<unknown>
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
                patientsData = []
              }
            } else if (Array.isArray(response)) {
              // Handle legacy format (direct array)
              patientsData = response as unknown as Patient[]
            } else {
              console.warn('Unexpected patients response format:', response)
              patientsData = []
            }
          }

          setPatients(patientsData)
        }
      } catch (err) {
        console.error('Failed to load patients:', err)
        toast.error(
          `Failed to load patients: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }
    loadPatients()
  }, [])

  // Filter operations based on search term
  const filteredOperations = operations.filter((operation) => {
    const patientName = String(operation.patientName || '').toLowerCase()
    const patientId = String(operation.patientId || '').toLowerCase()
    const doctorName = String(operation.surgeon || operation.operatedBy || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return (
      patientName.includes(searchLower) ||
      patientId.includes(searchLower) ||
      doctorName.includes(searchLower)
    )
  })

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = String(
      prescription.patientName || prescription['PATIENT NAME'] || ''
    ).toLowerCase()
    const patientId = String(
      prescription.patientId || prescription['PATIENT ID'] || ''
    ).toLowerCase()
    const doctorName = String(
      prescription.doctorName || prescription['DOCTOR NAME'] || ''
    ).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      patientName.includes(searchLower) ||
      patientId.includes(searchLower) ||
      doctorName.includes(searchLower)
    )
  })

  // Combine operations and prescriptions into a single list with a _type flag
  const combinedFollowUps = [
    ...filteredOperations.map((o) => ({ ...o, _type: 'Operation' as const })),
    ...filteredPrescriptions.map((p) => ({ ...p, _type: 'Prescription' as const }))
  ]

  // Format date for display
  // const formatDate = (dateString: unknown): string => {
  //   if (!dateString || typeof dateString !== 'string') return 'N/A'
  //   try {
  //     const date = new Date(dateString)
  //     return date.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric'
  //     })
  //   } catch (error) {
  //     console.error('Error formatting date:', error)
  //     return String(dateString)
  //   }
  // }

  // Get reason for visit/follow-up
  // Get reason for visit/follow-up for operations
  const getFollowUpReason = (operation: Operation): string => {
    // Check various fields that might contain follow-up reason
    return (
      operation.notes ||
      operation.preOpDiagnosis ||
      operation.postOpDiagnosis ||
      operation.findings ||
      operation.operationType ||
      'Follow-up visit'
    )
  }

  // Get reason for prescriptions follow-up
  const getPrescriptionReason = (prescription: Prescription): string => {
    return String(prescription['NOTES'] || 'Prescription follow-up')
  }

  // Helper to get phone number depending on item type
  const getPhoneNumber = (item: Operation | Prescription): string => {
    const isOp = (item as Operation)._type === 'Operation'
    if (isOp) {
      const op = item as Operation
      const patient = patients.find((p) => p.patientId === op.patientId)
      return String(patient?.phone || patient?.['PHONE NUMBER'] || '')
    }
    return String((item as Prescription)['PHONE NUMBER'] || (item as Prescription).phone || '')
  }

  const handleWhatsappClick = (item: Operation | Prescription): void => {
    // Craft a professional, multi-line WhatsApp message with bold highlights (use * for bold on WhatsApp)
    const lines = [
      `*Dear ${item['PATIENT NAME'] || item.patientName || 'Patient'},*`,
      '',
      'We hope you are doing well. This is a gentle reminder to follow up on your prescribed medication and ongoing treatment. If you’ve completed your course or are experiencing any issues, please don’t hesitate to schedule a review with us.',
      '',
      'Your health is our priority, and we’re here to support you at every step.',
      '',
      '*Warm regards*,',
      '*Sri Harsha Eye Hospital*'
    ]
    const message = lines.join('\n')
    const encoded = encodeURIComponent(message)

    // Ensure the phone number is in international format without the leading + and free of non-digit characters
    let phone = getPhoneNumber(item).replace(/\D/g, '') // keep digits only
    phone = `91${phone}` // prepend country code

    // Open WhatsApp chat with the encoded message
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }
  console.log(combinedFollowUps)
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Follow-Up / Review</h2>
        <div className="relative w-1/4">
          <input
            type="text"
            placeholder="Search by patient name, ID or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : combinedFollowUps.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No follow-ups scheduled for today.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor / Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes / Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Follow Up
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedFollowUps.map((item) => {
                  const isOp = item._type === 'Operation'
                  const reviewDate = isOp
                    ? item['reviewOn'] || item['FOLLOW UP DATE'] || ''
                    : item['FOLLOW UP DATE'] || '-'
                  const doctorName = isOp
                    ? String(item.operatedBy) || 'N/A'
                    : String(item.doctorName || item['DOCTOR NAME'] || 'N/A')
                  const followUpReason = isOp
                    ? getFollowUpReason(item)
                    : getPrescriptionReason(item)
                  const patientName = isOp
                    ? String(item.patientName || 'N/A')
                    : String(item.patientName || item['PATIENT NAME'] || 'N/A')
                  const patientId = isOp
                    ? String(item.patientId || 'N/A')
                    : String(item.patientId || item['PATIENT ID'] || 'N/A')
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item._type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patientName}</div>
                        <div className="text-xs text-gray-500">ID: {patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctorName}</div>
                        {isOp && <div className="text-xs text-gray-500">OPHTHALMOLOGY</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {followUpReason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {(() => {
                            const phone = getPhoneNumber(item)
                            return phone || 'N/A'
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {reviewDate}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleWhatsappClick(item)}
                          className="p-1 inline-flex text-xs leading-5 cursor-pointer font-semibold rounded-full bg-green-100 text-green-800"
                        >
                          WhatsApp
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default FollowUpSection
