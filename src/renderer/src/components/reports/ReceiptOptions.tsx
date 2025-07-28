import React, { useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'

// Define interfaces
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

interface API {
  getOperations?: () => Promise<Operation[]>
  getPatientOperations?: (patientId: string) => Promise<Operation[]>
}

// Define props interface
interface ReceiptOptionsProps {
  reportId: string
  reportType: string
  patientName: string
  patientPhone: string
  onSelectReceiptType: (type: string, operationData?: Operation) => void
  onGenerateReport?: (types: string[]) => void // New prop for handling multiple receipts
  patientId?: string
}

const ReceiptOptions: React.FC<ReceiptOptionsProps> = ({
  reportType,
  patientName,
  patientPhone,
  onSelectReceiptType,
  onGenerateReport,
  patientId
}) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showOperationsModal, setShowOperationsModal] = useState(false)
  const [showReportOptions, setShowReportOptions] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(patientPhone || '')
  const [message, setMessage] = useState(`Receipt for ${patientName}`)
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedReportTypes, setSelectedReportTypes] = useState<{ [key: string]: boolean }>({
    cash: false,
    prescription: true,
    readingsandfindings: true,
    readings: false,
    clinical: false,
    operation: false
  })

  // Define type for standardized API response
  interface StandardizedResponse<T> {
    success: boolean
    data?: T | null
    message?: string
  }

  // Fetch operations from API
  const fetchOperations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as API
      console.log('Fetching operations with patientId:', patientId)

      // Always fetch all operations first as a fallback
      let allOperations: Operation[] = []

      if (api.getOperations) {
        // Handle standardized response format
        const allOperationsResponse = await api.getOperations()
        console.log('All operations response:', allOperationsResponse)

        // Check if response has the standardized format
        if (allOperationsResponse && typeof allOperationsResponse === 'object') {
          if ('success' in allOperationsResponse && 'data' in allOperationsResponse) {
            // New standardized format
            if (allOperationsResponse.success && Array.isArray(allOperationsResponse.data)) {
              allOperations = allOperationsResponse.data
            } else {
              console.warn(
                'Operation response unsuccessful or data is not an array:',
                (allOperationsResponse as StandardizedResponse<Operation[]>).message ||
                  'No message provided'
              )
              allOperations = []
            }
          } else if (Array.isArray(allOperationsResponse)) {
            // Legacy format (direct array)
            allOperations = allOperationsResponse
          } else {
            console.warn('Unexpected operations response format:', allOperationsResponse)
            allOperations = []
          }
        } else {
          allOperations = []
        }

        console.log('All operations fetched:', allOperations.length)

        // Log the first operation to see its structure
        if (allOperations.length > 0) {
          console.log('Sample operation:', allOperations[0])
          console.log('Operation keys:', Object.keys(allOperations[0]))

          // Check if PATIENT ID field exists
          if (allOperations[0]['PATIENT ID']) {
            console.log('Found PATIENT ID field with value:', allOperations[0]['PATIENT ID'])
          }
        }
      }

      if (patientId && api.getPatientOperations) {
        // If patientId is available, fetch only that patient's operations
        try {
          const patientOperationsResponse = await api.getPatientOperations(patientId)
          console.log('Patient operations response:', patientOperationsResponse)

          let patientOperations: Operation[] = []

          // Check if response has the standardized format
          if (patientOperationsResponse && typeof patientOperationsResponse === 'object') {
            if ('success' in patientOperationsResponse && 'data' in patientOperationsResponse) {
              // New standardized format
              if (
                patientOperationsResponse.success &&
                Array.isArray(patientOperationsResponse.data)
              ) {
                patientOperations = patientOperationsResponse.data
              } else {
                console.warn(
                  'Patient operation response unsuccessful or data is not an array:',
                  (patientOperationsResponse as StandardizedResponse<Operation[]>).message ||
                    'No message provided'
                )
              }
            } else if (Array.isArray(patientOperationsResponse)) {
              // Legacy format (direct array)
              patientOperations = patientOperationsResponse
            } else {
              console.warn(
                'Unexpected patient operations response format:',
                patientOperationsResponse
              )
            }
          }

          console.log('Patient operations fetched:', patientOperations.length)

          if (patientOperations && patientOperations.length > 0) {
            setOperations(patientOperations)
          } else {
            // If no patient-specific operations found, filter all operations by patientId
            console.log('No patient operations found, filtering all operations')
            console.log('Looking for patientId:', patientId)

            // Try a more flexible approach to match patient IDs
            const filteredOperations = allOperations.filter((op) => {
              // First check specifically for the Excel format
              if (
                op['PATIENT ID'] &&
                String(op['PATIENT ID']).trim() === String(patientId).trim()
              ) {
                console.log('Exact match found on PATIENT ID field')
                return true
              }

              // Check all possible patient ID field names
              const opId = String(
                op.patientId ||
                  op['PATIENT ID'] ||
                  op['PATIENT_ID'] ||
                  op['patientID'] ||
                  op['patient_id'] ||
                  ''
              ).trim()
              const targetId = String(patientId || '').trim()

              // Check if either ID contains the other (for partial matches)
              const isMatch =
                opId === targetId || opId.includes(targetId) || targetId.includes(opId)

              console.log(
                `Comparing: op.patientId=${opId} with patientId=${targetId}, match: ${isMatch}`
              )
              return isMatch
            })
            console.log('Filtered operations by patientId:', filteredOperations.length)
            setOperations(filteredOperations)
          }
        } catch (patientErr) {
          console.error('Error fetching patient operations:', patientErr)
          // Fall back to filtering all operations
          const filteredOperations = allOperations.filter((op) => {
            // First check specifically for the Excel format
            if (op['PATIENT ID'] && String(op['PATIENT ID']).trim() === String(patientId).trim()) {
              console.log('Exact match found on PATIENT ID field in fallback')
              return true
            }

            // Check all possible patient ID field names
            const opId = String(
              op.patientId ||
                op['PATIENT ID'] ||
                op['PATIENT_ID'] ||
                op['patientID'] ||
                op['patient_id'] ||
                ''
            ).trim()
            const targetId = String(patientId || '').trim()

            // Check if either ID contains the other (for partial matches)
            return opId === targetId || opId.includes(targetId) || targetId.includes(opId)
          })
          console.log('Fallback filtered operations:', filteredOperations.length)
          setOperations(filteredOperations)
        }
      } else if (allOperations.length > 0) {
        setOperations(allOperations)
      } else {
        console.error('Operation API methods are not available')
        setError('Failed to load operations: API methods not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError('Failed to load operations')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  // Load operations when operations modal is opened
  useEffect(() => {
    if (showOperationsModal) {
      fetchOperations()
    }
  }, [showOperationsModal, fetchOperations])

  // Toggle report options dropdown
  const toggleReportOptions = (): void => {
    setShowReportOptions(!showReportOptions)
  }

  // Handle checkbox change for report options
  const handleReportTypeChange = (type: string): void => {
    setSelectedReportTypes((prev) => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Handle generating a report with selected receipt types
  const handleGenerateReport = (): void => {
    // Get selected receipt types from checkboxes
    const receiptTypesToCheck = Object.entries(selectedReportTypes)
      .filter(([, isSelected]) => isSelected)
      .map(([type]) => type)

    if (receiptTypesToCheck.length === 0) {
      toast.error('Please select at least one receipt type')
      return
    }

    // If onGenerateReport prop is provided, use it for multiple receipts
    if (onGenerateReport) {
      // Pass all selected receipt types to the parent component
      onGenerateReport(receiptTypesToCheck)
    } else {
      // Fallback to the old behavior if onGenerateReport is not provided
      // For each selected receipt type, trigger the appropriate receipt generation
      receiptTypesToCheck.forEach((type) => {
        if (type === 'operation' && operations.length > 0) {
          // For operation receipts, use the first operation in the list
          onSelectReceiptType(type, operations[0])
        } else {
          onSelectReceiptType(type)
        }
      })
    }

    setShowReportOptions(false) // Hide dropdown after generating
  }

  // Handle operation selection
  const handleOperationSelect = (operation: Operation): void => {
    onSelectReceiptType('operation', operation)
    setShowOperationsModal(false)
  }

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    try {
      const receiptEl = document.querySelector('[id^="receipt-"]') as HTMLElement | null
      if (!receiptEl) {
        toast.error('Receipt element not found')
        return
      }
      // Clone and clean oklch colors
      const clone = receiptEl.cloneNode(true) as HTMLElement
      stripOKLCH(clone)

      // Set exact A4 dimensions and center content
      clone.style.width = '794px' // A4 width in pixels
      clone.style.height = '1123px' // A4 height in pixels
      clone.style.backgroundColor = '#ffffff'
      clone.style.margin = '0 auto' // Center horizontally
      clone.style.position = 'relative' // Ensure proper positioning
      clone.style.transform = 'none' // Remove any transforms that might cause tilting

      // Create a container with proper centering and alignment
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.display = 'flex'
      container.style.justifyContent = 'center'
      container.style.alignItems = 'center'
      container.style.backgroundColor = '#ffffff'
      container.style.padding = '0'
      container.style.margin = '0'
      container.style.overflow = 'hidden'
      container.style.zIndex = '-9999' // Hide from view

      // Add the clone to the container
      container.appendChild(clone)
      document.body.appendChild(container)

      // Use html2canvas with improved settings
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: false // We'll handle removal ourselves
      })

      // Clean up the DOM
      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/png')

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      const pngImage = await pdfDoc.embedPng(imgData)

      // Calculate dimensions to perfectly center the image
      const imgWidth = pngImage.width
      const imgHeight = pngImage.height
      const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight) * 0.98 // 98% of max size for small margin
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale

      // Precisely center the image on the page
      const x = (PAGE_WIDTH - drawWidth) / 2
      const y = (PAGE_HEIGHT - drawHeight) / 2

      // Draw the image with exact positioning
      page.drawImage(pngImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      })

      const pdfBytes = await pdfDoc.save()

      // Use Electron's IPC to open the PDF in a native window
      const result = await window.api.openPdfInWindow(pdfBytes)

      if (!result.success) {
        console.error('Failed to open PDF in window:', result.error)
        toast.error('Failed to open PDF preview. Please try again.')
      }
    } catch (error) {
      console.error('Error generating PDF for preview:', error)
      toast.error('Failed to generate PDF preview. Please try again.')
    }
  }

  // Helper to strip unsupported oklch() colors -> fallback #000
  const stripOKLCH = (root: HTMLElement): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement
      const inline = el.getAttribute('style')
      if (inline && inline.includes('oklch')) {
        el.setAttribute('style', inline.replace(/oklch\([^)]*\)/g, '#000'))
      }
      const styles = window.getComputedStyle(el)
      ;['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
        const val = styles.getPropertyValue(prop)
        if (val && val.includes('oklch')) {
          el.style.setProperty(prop, '#000')
        }
      })
    }
  }

  const sendWhatsAppMessage = async (): Promise<void> => {
    try {
      const receiptEl = document.querySelector('[id^="receipt-"]') as HTMLElement | null
      if (!receiptEl) {
        toast.error('Receipt element not found')
        return
      }
      // Clone and clean oklch colors
      const clone = receiptEl.cloneNode(true) as HTMLElement
      stripOKLCH(clone)

      // Set exact A4 dimensions and center content
      clone.style.width = '794px' // A4 width in pixels
      clone.style.height = '1123px' // A4 height in pixels
      clone.style.backgroundColor = '#ffffff'
      clone.style.margin = '0 auto' // Center horizontally
      clone.style.position = 'relative' // Ensure proper positioning
      clone.style.transform = 'none' // Remove any transforms that might cause tilting

      // Create a container with proper centering and alignment
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.display = 'flex'
      container.style.justifyContent = 'center'
      container.style.alignItems = 'center'
      container.style.backgroundColor = '#ffffff'
      container.style.padding = '0'
      container.style.margin = '0'
      container.style.overflow = 'hidden'
      container.style.zIndex = '-9999' // Hide from view

      // Add the clone to the container
      container.appendChild(clone)
      document.body.appendChild(container)

      // Use html2canvas with improved settings
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: false // We'll handle removal ourselves
      })

      // Clean up the DOM
      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/png')

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      const pngImage = await pdfDoc.embedPng(imgData)

      // Calculate dimensions to perfectly center the image
      const imgWidth = pngImage.width
      const imgHeight = pngImage.height
      const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight) * 0.98 // 98% of max size for small margin
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale

      // Precisely center the image on the page
      const x = (PAGE_WIDTH - drawWidth) / 2
      const y = (PAGE_HEIGHT - drawHeight) / 2

      // Draw the image with exact positioning
      page.drawImage(pngImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      })

      const pdfBytes = await pdfDoc.save()

      // Build filename as patientNAME_date.pdf  (e.g., John_Doe_2025-07-16.pdf)
      const dateStr = new Date().toISOString().slice(0, 19)
      // Get patient name from receipt element or use default
      let patientNameValue = 'Receipt'
      const nameNode = receiptEl.querySelector('[data-patient-name]') as HTMLElement | null
      if (nameNode?.textContent) {
        patientNameValue = nameNode.textContent.trim()
      }
      patientNameValue = patientNameValue.replace(/\s+/g, '_')
      const fileName = `${patientNameValue}_${reportType}_${dateStr}.pdf`

      // Attempt silent save if Node fs API is available (Electron renderer with contextIsolation disabled)
      let savedSilently = false
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _require = (window as any).require
        if (typeof _require === 'function') {
          const fs = _require('fs') as typeof import('fs')
          const path = _require('path') as typeof import('path')
          const os = _require('os') as typeof import('os')
          // Save to Desktop instead of Downloads
          const dest = path.join(os.homedir(), 'Desktop', fileName)
          fs.writeFileSync(dest, Buffer.from(pdfBytes), { encoding: 'binary' })
          savedSilently = true
          console.log(`File saved to: ${dest}`)
        }
      } catch (err) {
        console.error('Failed to save file silently:', err)
      }

      if (!savedSilently) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        saveAs(blob, fileName)
      }

      // Small delay to ensure file is saved before opening WhatsApp
      await new Promise((resolve) => setTimeout(resolve, 4500))

      // Build patient phone
      let patientPhone = phoneNumber.replace(/\D/g, '')
      if (!patientPhone.startsWith('91')) {
        patientPhone = `91${patientPhone}`
      }

      // Create appropriate message based on receipt type
      const whatsAppMessage =
        message || `Dear ${patientNameValue.replace(/_/g, ' ')}, here is your receipt.`

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsAppMessage)

      // Open WhatsApp in system app with chat to patient number and pre-filled message
      window.open(`whatsapp://send?phone=${patientPhone}&text=${encodedMessage}`, '_blank')
    } catch (err) {
      console.error('Failed to create/send PDF:', err)
      toast.error('Failed to share via WhatsApp')
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          onClick={() => onSelectReceiptType('cash')}
        >
          Cash Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          onClick={() => onSelectReceiptType('prescription')}
        >
          Prescription Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          onClick={() => onSelectReceiptType('readingsandfindings')}
        >
          Readings & Findings
        </button>
        <button
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
          onClick={() => onSelectReceiptType('readings')}
        >
          Readings
        </button>
        <button
          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
          onClick={() => setShowOperationsModal(true)}
        >
          Operation Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
          onClick={() => onSelectReceiptType('clinical')}
        >
          Clinical Findings
        </button>
        <div className="relative">
          <button
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            onClick={toggleReportOptions}
          >
            Report
          </button>

          {showReportOptions && (
            <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md p-3 z-10 border border-gray-200 w-48">
              <h3 className="font-medium text-sm mb-2 text-gray-700">
                Select receipts to include:
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.cash}
                    onChange={() => handleReportTypeChange('cash')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Cash Receipt</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.prescription}
                    onChange={() => handleReportTypeChange('prescription')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Prescription Receipt</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.readingsandfindings}
                    onChange={() => handleReportTypeChange('readingsandfindings')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Readings & Findings</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.readings}
                    onChange={() => handleReportTypeChange('readings')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Readings</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.clinical}
                    onChange={() => handleReportTypeChange('clinical')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Clinical Findings</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.operation}
                    onChange={() => handleReportTypeChange('operation')}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span>Operation Receipt</span>
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleGenerateReport}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {reportType && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm0 0V9a2 2 0 012-2h6a2 2 0 012 2v9m-6 0a2 2 0 002 2h0a2 2 0 002-2"
              />
            </svg>
            Print
          </button>
          <button
            onClick={sendWhatsAppMessage}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
            </svg>
            WhatsApp
          </button>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">Send via WhatsApp</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., +919876543210"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={sendWhatsAppMessage}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operations Modal */}
      {showOperationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Select Operation for Receipt</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : operations.length === 0 ? (
              <div className="text-gray-500 py-4">No operations found</div>
            ) : (
              <div className="overflow-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Operation Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Surgeon
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {operations.map((operation) => (
                      <tr key={operation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.dateOfOperation || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {operation.patientName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {operation.patientId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.operationDetails || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.operatedBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOperationSelect(operation)}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md focus:outline-none"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowOperationsModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Preview Modal placeholder not needed due to new window approach */}
    </div>
  )
}

export default ReceiptOptions
