import React, { useState, useMemo } from 'react'
import ReceiptOptions from './ReceiptOptions'
import ReceiptViewer from './ReceiptViewer'

// Define the Operation interface
interface Operation {
  id: string
  patientId: string
  patientName: string
  dateOfAdmit?: string
  timeOfAdmit?: string
  dateOfOperation?: string
  timeOfOperation?: string
  dateOfDischarge?: string
  timeOfDischarge?: string
  operationDetails?: string
  operationProcedure?: string
  provisionDiagnosis?: string
  operatedBy?: string
  [key: string]: unknown
}

// Define the Prescription type
type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  date?: string
  receiptId?: string
  amount?: string | number
  paymentMethod?: string
  diagnosis?: string
  prescription?: string
  medicine?: string
  rightEye?: string
  leftEye?: string
  eyeNotes?: string
  advice?: string
  [key: string]: unknown
}

interface ReportDisplayProps {
  reports: Prescription[]
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ reports }) => {
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<string>('')
  const [selectedOperation, setSelectedOperation] = useState<Operation | undefined>(undefined)
  // We'll store the active report for future dynamic receipt type detection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setActiveReport = (_report: Prescription | null): void => {
    // This will be used in future implementation
    // Currently storing the report for future enhancement
  }

  // Toggle report expansion
  const toggleReport = (reportId: string, report: Prescription): void => {
    if (expandedReport === reportId) {
      setExpandedReport(null)
      setSelectedReceiptType('')
      setSelectedOperation(undefined)
      setActiveReport(null)
    } else {
      setExpandedReport(reportId)
      setActiveReport(report)
    }
  }

  // Format date string
  const formatDate = (dateString: unknown): string => {
    if (!dateString || typeof dateString !== 'string') return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error: unknown) {
      console.error('Error formatting date:', error)
      return String(dateString)
    }
  }

  // Group reports by patient ID
  const groupReportsByPatient = (reports: Prescription[]): Record<string, Prescription[]> => {
    return reports.reduce(
      (acc, report) => {
        const patientId = String(report['PATIENT ID'] || report.patientId || 'unknown')
        if (!acc[patientId]) {
          acc[patientId] = []
        }
        acc[patientId].push(report)
        return acc
      },
      {} as Record<string, Prescription[]>
    )
  }

  const groupedReports = useMemo(() => {
    return groupReportsByPatient(reports)
  }, [reports])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Found Reports ({reports.length})</h2>

      {Object.entries(groupedReports).map(([patientId, patientReports]) => {
        // Get patient details from the first report
        const firstReport = patientReports[0]
        const patientName = String(firstReport['PATIENT NAME'] || 'Unknown')
        const guardianName = String(firstReport['GUARDIAN NAME'] || 'N/A')
        const phoneNumber = String(firstReport['PHONE NUMBER'] || 'N/A')
        const age = String(firstReport.AGE || 'N/A')
        const gender = String(firstReport.GENDER || 'N/A')
        const address = String(firstReport.ADDRESS || 'N/A')

        return (
          <div
            key={patientId}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Patient Header */}
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <h3 className="text-lg font-medium text-gray-800">
                Patient: {patientName} (ID: {patientId})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Guardian:</span> {guardianName}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {phoneNumber}
                </div>
                <div>
                  <span className="font-medium">Age/Gender:</span> {age} / {gender}
                </div>
                <div className="md:col-span-3">
                  <span className="font-medium">Address:</span> {address}
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="divide-y divide-gray-100">
              {patientReports.map((report) => {
                const reportId = String(report.id)
                const reportDate = formatDate(report.DATE)
                const isExpanded = expandedReport === reportId

                return (
                  <div key={reportId} className="p-0">
                    {/* Report Header - Always visible */}
                    <div
                      onClick={() => toggleReport(reportId, report)}
                      className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Report from {reportDate}</span>
                        <span className="text-xs text-gray-500">
                          ID: {reportId.substring(0, 8)}...
                        </span>
                      </div>
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Report Details - Visible when expanded */}
                    {isExpanded && (
                      <div className="p-4 pt-0 bg-gray-50 border-t border-gray-100">
                        {/* Receipt Options */}
                        <ReceiptOptions
                          reportId={reportId}
                          reportType={selectedReceiptType}
                          patientName={patientName}
                          patientPhone={phoneNumber}
                          patientId={patientId}
                          onSelectReceiptType={(type, operationData) => {
                            setSelectedReceiptType(type)
                            setSelectedOperation(operationData)
                          }}
                        />

                        {/* Receipt Viewer */}
                        {selectedReceiptType ? (
                          <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                            <ReceiptViewer
                              report={report}
                              receiptType={selectedReceiptType}
                              selectedOperation={selectedOperation}
                            />
                          </div>
                        ) : (
                          <div className="max-h-96 overflow-y-auto p-4 bg-white rounded-md border border-gray-200 mt-4">
                            {/* Receipt Information */}
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-700 mb-2">
                                Receipt Information
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-medium">Date:</span> {reportDate}
                                </div>
                                <div>
                                  <span className="font-medium">Receipt ID:</span>{' '}
                                  {reportId.substring(0, 8)}...
                                </div>
                                {report.AMOUNT !== undefined && report.AMOUNT !== null && (
                                  <div>
                                    <span className="font-medium">Amount:</span> ₹
                                    {String(report.AMOUNT)}
                                  </div>
                                )}
                                {report.PAYMENT_METHOD !== undefined &&
                                  report.PAYMENT_METHOD !== null && (
                                    <div>
                                      <span className="font-medium">Payment Method:</span>{' '}
                                      {String(report.PAYMENT_METHOD)}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Prescription Information */}
                            {((report.PRESCRIPTION !== undefined && report.PRESCRIPTION !== null) ||
                              (report.MEDICINE !== undefined && report.MEDICINE !== null) ||
                              (report.DIAGNOSIS !== undefined && report.DIAGNOSIS !== null)) && (
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-700 mb-2">
                                  Prescription Details
                                </h5>
                                <div className="space-y-2 text-sm">
                                  {report.DIAGNOSIS !== undefined && report.DIAGNOSIS !== null && (
                                    <div>
                                      <span className="font-medium">Diagnosis:</span>{' '}
                                      {String(report.DIAGNOSIS)}
                                    </div>
                                  )}

                                  {report.PRESCRIPTION !== undefined &&
                                    report.PRESCRIPTION !== null && (
                                      <div>
                                        <span className="font-medium">Prescription:</span>
                                        <div className="whitespace-pre-wrap pl-4 mt-1">
                                          {String(report.PRESCRIPTION)}
                                        </div>
                                      </div>
                                    )}

                                  {report.MEDICINE !== undefined && report.MEDICINE !== null && (
                                    <div>
                                      <span className="font-medium">Medicine:</span>
                                      <div className="whitespace-pre-wrap pl-4 mt-1">
                                        {String(report.MEDICINE)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Eye Reading Information */}
                            {((report.RIGHT_EYE !== undefined && report.RIGHT_EYE !== null) ||
                              (report.LEFT_EYE !== undefined && report.LEFT_EYE !== null) ||
                              (report.READING_NOTES !== undefined &&
                                report.READING_NOTES !== null)) && (
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-700 mb-2">Eye Reading</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {report.RIGHT_EYE !== undefined && report.RIGHT_EYE !== null && (
                                    <div>
                                      <span className="font-medium">Right Eye:</span>
                                      <div className="whitespace-pre-wrap pl-4 mt-1">
                                        {String(report.RIGHT_EYE)}
                                      </div>
                                    </div>
                                  )}
                                  {report.LEFT_EYE !== undefined && report.LEFT_EYE !== null && (
                                    <div>
                                      <span className="font-medium">Left Eye:</span>
                                      <div className="whitespace-pre-wrap pl-4 mt-1">
                                        {String(report.LEFT_EYE)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {report.READING_NOTES !== undefined &&
                                  report.READING_NOTES !== null && (
                                    <div className="mt-2">
                                      <span className="font-medium">Notes:</span>
                                      <div className="whitespace-pre-wrap pl-4 mt-1">
                                        {String(report.READING_NOTES)}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}

                            {/* Advice */}
                            {report.ADVICE !== undefined && report.ADVICE !== null && (
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-700 mb-2">Advice</h5>
                                <div className="whitespace-pre-wrap text-sm pl-4">
                                  {String(report.ADVICE)}
                                </div>
                              </div>
                            )}

                            {/* Other Fields */}
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">
                                Additional Information
                              </h5>
                              <div className="space-y-2 text-sm">
                                {Object.entries(report).map(([key, value]) => {
                                  // Skip already displayed fields and internal fields
                                  const skipFields = [
                                    'id',
                                    'PATIENT ID',
                                    'PATIENT NAME',
                                    'GUARDIAN NAME',
                                    'PHONE NUMBER',
                                    'AGE',
                                    'GENDER',
                                    'ADDRESS',
                                    'DATE',
                                    'AMOUNT',
                                    'PAYMENT_METHOD',
                                    'PRESCRIPTION',
                                    'MEDICINE',
                                    'DIAGNOSIS',
                                    'RIGHT_EYE',
                                    'LEFT_EYE',
                                    'READING_NOTES',
                                    'ADVICE',
                                    'TYPE',
                                    'patientId'
                                  ]

                                  if (
                                    skipFields.includes(key) ||
                                    value === null ||
                                    value === undefined ||
                                    value === ''
                                  ) {
                                    return null
                                  }

                                  return (
                                    <div key={key}>
                                      <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {reports.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No reports found. Try a different search.</p>
        </div>
      )}
    </div>
  )
}

export default ReportDisplay
