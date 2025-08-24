import React, { useState } from 'react'

// Define common interface for follow-up items
export interface FollowUpItem {
  id: string
  patientId?: string
  patientName?: string
  doctorName?: string
  followUpDate?: string
  notes?: string
  type?: string
  [key: string]: unknown
}

// Define Prescription type
export interface Prescription extends FollowUpItem {
  type: 'prescription'
}

// Define Operation/Inpatient type
export interface Operation extends FollowUpItem {
  type: 'inpatient'
  date?: string
  operationType?: string
  operatedBy?: string
  assistants?: string
  preOpDiagnosis?: string
  postOpDiagnosis?: string
  procedure?: string
  findings?: string
  complications?: string
  doctorNames?: string[]
  reviewOn?: string
}

interface FollowUpSectionProps {
  prescriptions?: FollowUpItem[]
  loading: boolean
}

const FollowUpSection: React.FC<FollowUpSectionProps> = ({ prescriptions = [], loading }) => {
  const [searchTerm, setSearchTerm] = useState('')

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

  // Use the filtered prescriptions directly as they already have the type field
  const combinedFollowUps = filteredPrescriptions

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
      (operation.notes as string) ||
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
  const getPhoneNumber = (item: FollowUpItem): string => {
    const isOp = item.type === 'inpatient'
    if (isOp) {
      const patient = prescriptions.find((p) => p.patientId === item.patientId)
      return String(patient?.phone || patient?.['PHONE NUMBER'] || '')
    }
    return String(item['PHONE NUMBER'] || item.phone || '')
  }

  const handleWhatsappClick = (item: FollowUpItem): void => {
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
  // Add type field to items if missing
  const processedFollowUps = combinedFollowUps.map((item) => {
    if (!item.type) {
      // If no type is specified, default to prescription
      return { ...item, type: 'prescription' }
    }
    return item
  })
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{`Follow-Up / Review ${combinedFollowUps.length}`}</h2>
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
      ) : processedFollowUps.length === 0 ? (
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
                {processedFollowUps.map((item) => {
                  const isOp = item.type === 'inpatient'
                  const reviewDate = isOp
                    ? (item as Operation)['reviewOn'] || item['followUpDate'] || ''
                    : item['FOLLOW UP DATE'] || '-'
                  const doctorName = isOp
                    ? String((item as Operation).doctorNames?.[0] || item.doctorName) || 'N/A'
                    : String(item.doctorName || item['DOCTOR NAME'] || 'N/A')
                  const phone = isOp
                    ? String((item as Operation).phone || item.phone) || 'N/A'
                    : String(item.phone || item['PHONE NUMBER'] || 'N/A')
                  const followUpReason = isOp
                    ? getFollowUpReason(item as Operation)
                    : getPrescriptionReason(item as Prescription)
                  const patientName = isOp
                    ? String(item.name || 'N/A')
                    : String(item.patientName || item['PATIENT NAME'] || 'N/A')
                  const patientId = isOp
                    ? String(item.patientId || 'N/A')
                    : String(item.patientId || item['PATIENT ID'] || 'N/A')
                  return item.id ? (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.type === 'prescription' ? 'Prescription' : 'Inpatient'}
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
                          <div>{phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {reviewDate as React.ReactNode}
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
                  ) : null
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
