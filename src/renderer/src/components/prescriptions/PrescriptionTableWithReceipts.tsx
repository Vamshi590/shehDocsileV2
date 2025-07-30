import React, { useState, useRef, useEffect } from 'react'
// No need for jsPDF, using pdf-lib for both WhatsApp and print functions
import html2canvas from 'html2canvas'
import ReceiptViewer from '../reports/ReceiptViewer'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'
import { toast } from 'sonner'
// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Operation type for operation receipts
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  procedure?: string
  findings?: string
  dateOfAdmit?: string
  dateOfDischarge?: string
  dateOfOperation?: string
  operationDate?: string
  billingItems?: Array<{ description: string; amount: number }>
  totalAmount?: number
  advancePaid?: number
  discount?: number
  amountReceived?: number
  balance?: number
  [key: string]: unknown
}

interface PrescriptionTableWithReceiptsProps {
  prescriptions: Prescription[]
  onEditPrescription?: (prescription: Prescription) => void
  onDeletePrescription?: (id: string) => void
}

const PrescriptionTableWithReceipts: React.FC<PrescriptionTableWithReceiptsProps> = ({
  prescriptions,
  onEditPrescription,
  onDeletePrescription
}) => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<string | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [isReportMode, setIsReportMode] = useState<boolean>(false)
  const [reportReceiptTypes, setReportReceiptTypes] = useState<string[]>([])
  const [showReportOptions, setShowReportOptions] = useState<boolean>(false)
  const [selectedReportTypes, setSelectedReportTypes] = useState<{ [key: string]: boolean }>({
    cash: false,
    prescription: true,
    readingsandfindings: true,
    readings: false,
    clinical: false
  })
  // State for managing receipt viewing and operations

  // Reset selection if current selection is no longer in filtered list
  useEffect(() => {
    if (selectedPrescription && !prescriptions.some((p) => p.id === selectedPrescription.id)) {
      setSelectedPrescription(null)
      setSelectedReceiptType(null)
      setIsReportMode(false)
      setReportReceiptTypes([])
      setShowReportOptions(false)
    }
  }, [prescriptions, selectedPrescription])

  // Handle row click to select a prescription
  const handleRowClick = (prescription: Prescription): void => {
    if (selectedPrescription?.id === prescription.id) {
      // If clicking the same prescription, deselect it
      handleCloseReceipt()
    } else {
      setSelectedPrescription(prescription)
      setSelectedReceiptType(null) // Reset receipt type when selecting a new prescription
      setIsReportMode(false)
      setReportReceiptTypes([])
      setShowReportOptions(false)
    }
  }

  // Handle closing the receipt viewer
  const handleCloseReceipt = (): void => {
    setSelectedPrescription(null)
    setSelectedReceiptType(null)
    setIsReportMode(false)
    setReportReceiptTypes([])
    setShowReportOptions(false)
  }

  // Handle receipt type selection
  const handleSelectReceiptType = (type: string, operationData?: Operation): void => {
    // Exit report mode if we're selecting a specific receipt type
    if (isReportMode) {
      setIsReportMode(false)
    }

    setSelectedReceiptType(type)
    if (operationData) {
      setSelectedOperation(operationData)
    }
  }

  // Toggle report options dropdown
  const toggleReportOptions = (): void => {
    if (!selectedPrescription) {
      toast.error('Please select a prescription first')
      return
    }
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
    if (!selectedPrescription) {
      toast.error('Please select a prescription first')
      return
    }

    // Get selected receipt types from checkboxes
    const receiptTypesToCheck = Object.entries(selectedReportTypes)
      .filter(([, isSelected]) => isSelected)
      .map(([type]) => type)

    if (receiptTypesToCheck.length === 0) {
      toast.error('Please select at least one receipt type')
      return
    }

    // Set report mode and store selected receipt types
    setIsReportMode(true)
    setReportReceiptTypes(receiptTypesToCheck)
    setShowReportOptions(false) // Hide dropdown after generating
  }

  // Create a ref for the receipt content
  const receiptRef = useRef<HTMLDivElement>(null)

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    if (!selectedPrescription) {
      toast.error('Please select a prescription first')
      return
    }

    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      if (isReportMode) {
        // In report mode, capture all receipt elements directly from the DOM
        // since they're all rendered at once in the scrollable view
        for (let i = 0; i < reportReceiptTypes.length; i++) {
          const receiptType = reportReceiptTypes[i]

          // Find the specific receipt element by its ID
          const receiptEl = document.getElementById(`receipt-${receiptType}`) as HTMLElement | null

          if (receiptEl) {
            // Clone and clean oklch colors
            const clone = receiptEl.cloneNode(true) as HTMLElement
            stripOKLCH(clone)
            clone.style.width = '794px'
            clone.style.height = '1123px'
            clone.style.backgroundColor = '#ffffff'
            document.body.appendChild(clone)

            const canvas = await html2canvas(clone, {
              scale: 2,
              backgroundColor: '#ffffff',
              useCORS: true
            })
            document.body.removeChild(clone)
            const imgData = canvas.toDataURL('image/png')

            // Add a new page for each receipt type
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
            const pngImage = await pdfDoc.embedPng(imgData)

            // Scale the image so it always fits inside the page while preserving aspect ratio
            const imgWidth = pngImage.width
            const imgHeight = pngImage.height
            const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight)
            const drawWidth = imgWidth * scale
            const drawHeight = imgHeight * scale
            const x = (PAGE_WIDTH - drawWidth) / 2
            const y = (PAGE_HEIGHT - drawHeight) / 2

            page.drawImage(pngImage, {
              x,
              y,
              width: drawWidth,
              height: drawHeight
            })
          }
        }
      } else {
        // Single receipt mode - original behavior
        const receiptEl =
          (receiptRef.current?.querySelector('[id^="receipt-"]') as HTMLElement | null) ||
          (receiptRef.current as HTMLElement | null)

        if (!receiptEl) {
          toast.error('Receipt element not found')
          return
        }

        // Clone and clean oklch colors
        const clone = receiptEl.cloneNode(true) as HTMLElement
        stripOKLCH(clone)
        clone.style.width = '794px'
        clone.style.height = '1123px'
        clone.style.backgroundColor = '#ffffff'
        document.body.appendChild(clone)

        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(clone)
        const imgData = canvas.toDataURL('image/png')

        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const pngImage = await pdfDoc.embedPng(imgData)

        // Scale the image so it always fits inside the page while preserving aspect ratio
        const imgWidth = pngImage.width
        const imgHeight = pngImage.height
        const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight)
        const drawWidth = imgWidth * scale
        const drawHeight = imgHeight * scale
        const x = (PAGE_WIDTH - drawWidth) / 2
        const y = (PAGE_HEIGHT - drawHeight) / 2

        page.drawImage(pngImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        })
      }

      // Save the PDF and open it
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
    if (!selectedPrescription) {
      toast.error('Please select a prescription first')
      return
    }
    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      // Extract patient name directly from the prescription data for filename
      let patientName = ''
      if (selectedPrescription?.patientName) {
        patientName = String(selectedPrescription.patientName).replace(/\s+/g, '_')
      } else {
        patientName = 'Receipt' // Last resort fallback
      }

      const dateStr = new Date().toISOString().slice(0, 19)
      let fileName = ''
      let pdfBytes: Uint8Array

      if (isReportMode) {
        // In report mode, capture all receipt elements directly from the DOM
        // since they're all rendered at once in the scrollable view
        for (let i = 0; i < reportReceiptTypes.length; i++) {
          const receiptType = reportReceiptTypes[i]

          // Find the specific receipt element by its ID
          const receiptEl = document.getElementById(`receipt-${receiptType}`) as HTMLElement | null

          if (receiptEl) {
            // Clone and clean oklch colors
            const clone = receiptEl.cloneNode(true) as HTMLElement
            stripOKLCH(clone)
            clone.style.width = '794px'
            clone.style.height = '1123px'
            clone.style.backgroundColor = '#ffffff'
            document.body.appendChild(clone)

            const canvas = await html2canvas(clone, {
              scale: 2,
              backgroundColor: '#ffffff',
              useCORS: true
            })
            document.body.removeChild(clone)
            const imgData = canvas.toDataURL('image/png')

            // Add a new page for each receipt type
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
            const pngImage = await pdfDoc.embedPng(imgData)

            // Scale the image so it always fits inside the page while preserving aspect ratio
            const imgWidth = pngImage.width
            const imgHeight = pngImage.height
            const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight)
            const drawWidth = imgWidth * scale
            const drawHeight = imgHeight * scale
            const x = (PAGE_WIDTH - drawWidth) / 2
            const y = (PAGE_HEIGHT - drawHeight) / 2

            page.drawImage(pngImage, {
              x,
              y,
              width: drawWidth,
              height: drawHeight
            })
          }
        }

        fileName = `${patientName}_Full_Report_${dateStr}.pdf`
        pdfBytes = await pdfDoc.save()
      } else {
        // Single receipt mode - original behavior
        if (!selectedReceiptType) {
          toast.error('Please select a receipt type first')
          return
        }

        const receiptEl =
          (receiptRef.current?.querySelector('[id^="receipt-"]') as HTMLElement | null) ||
          (receiptRef.current as HTMLElement | null)

        if (!receiptEl) {
          toast.error('Receipt element not found')
          return
        }

        // Clone and clean oklch colors
        const clone = receiptEl.cloneNode(true) as HTMLElement
        stripOKLCH(clone)
        clone.style.width = '794px'
        clone.style.height = '1123px'
        clone.style.backgroundColor = '#ffffff'
        document.body.appendChild(clone)

        const canvas = await html2canvas(clone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(clone)
        const imgData = canvas.toDataURL('image/png')

        const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const pngImage = await pdfDoc.embedPng(imgData)

        // Scale the image so it always fits inside the page while preserving aspect ratio
        const imgWidth = pngImage.width
        const imgHeight = pngImage.height
        const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight)
        const drawWidth = imgWidth * scale
        const drawHeight = imgHeight * scale
        const x = (PAGE_WIDTH - drawWidth) / 2
        const y = (PAGE_HEIGHT - drawHeight) / 2

        page.drawImage(pngImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        })

        fileName = `${patientName}_${selectedReceiptType}_${dateStr}.pdf`
        pdfBytes = await pdfDoc.save()
      }

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
      let patientPhone = String(
        selectedPrescription?.['PHONE NUMBER'] || selectedPrescription?.phone || ''
      ).replace(/\D/g, '')

      // Ensure phone number is properly formatted for WhatsApp Web
      // Remove any leading zeros
      patientPhone = patientPhone.replace(/^0+/, '')

      // Add country code only if it doesn't already have one
      if (!patientPhone.startsWith('91')) {
        patientPhone = `91${patientPhone}`
      }

      // Validate phone number length (should be 12 digits including country code for India)
      if (patientPhone.length !== 12) {
        console.warn('Phone number may be invalid:', patientPhone)
      }
      if (!patientPhone || patientPhone.length < 10) {
        toast.error('Invalid phone number. Please make sure the patient has a valid phone number.')
        return
      }
      // Create appropriate message based on receipt type
      let whatsAppMessage = ''

      switch (selectedReceiptType) {
        case 'cash':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, thank you for your payment at Sri Harsha Eye Hospital. Your receipt is attached.`
          break
        case 'prescription':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here is your prescription from Sri Harsha Eye Hospital. Please follow the instructions carefully.`
          break
        case 'readings':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here are your eye examination results from Sri Harsha Eye Hospital.`
          break
        case 'operation':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here is your operation receipt from Sri Harsha Eye Hospital.`
          break
        case 'clinical':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here are your clinical findings from Sri Harsha Eye Hospital.`
          break
        default:
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here is your receipt from Sri Harsha Eye Hospital.`
      }

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsAppMessage)

      // Open WhatsApp Web with chat to patient number and pre-filled message
      // Using wa.me URL format which is the official WhatsApp link format
      // This format works better with international numbers
      window.open(`https://wa.me/${patientPhone}?text=${encodedMessage}`, '_blank')
    } catch (err) {
      console.error('Failed to create/send PDF:', err)
      toast.error('Failed to share via WhatsApp')
    }
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No prescriptions found</p>
      </div>
    )
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

  return (
    <div id="main-content" className="space-y-4">
      {/* Receipt Options - Only show when a prescription is selected */}
      {selectedPrescription && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Receipt Options for {String(selectedPrescription['PATIENT NAME'])}
          </h3>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                onClick={() => handleSelectReceiptType('cash')}
              >
                Cash Receipt
              </button>
              <button
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                onClick={() => handleSelectReceiptType('prescription')}
              >
                Prescription Receipt
              </button>
              <button
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                onClick={() => handleSelectReceiptType('readingsandfindings')}
              >
                Readings & Findings
              </button>
              <button
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                onClick={() => handleSelectReceiptType('readings')}
              >
                Readings
              </button>
              <button
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                onClick={() => handleSelectReceiptType('clinical')}
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
                          checked={selectedReportTypes.separatereadings}
                          onChange={() => handleReportTypeChange('readings')}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span>Separate Readings</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedReportTypes.separatefindings}
                          onChange={() => handleReportTypeChange('clinical')}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span>Separate Findings</span>
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

            <div className="flex space-x-2 mb-4">
              {onEditPrescription && (
                <button
                  onClick={() => onEditPrescription(selectedPrescription)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                  title="Edit Prescription"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              )}
              {currentUser.isAdmin && onDeletePrescription && (
                <button
                  onClick={() => {
                    const patientName = selectedPrescription['PATIENT NAME'] || 'this patient'
                    const confirmMessage = `Are you sure you want to delete the prescription for ${patientName}?\n\nThis will permanently delete all prescription data, readings, and financial information.`

                    if (window.confirm(confirmMessage)) {
                      onDeletePrescription(selectedPrescription.id as string)
                      handleCloseReceipt()
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center"
                  title="Delete Prescription"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Receipt Viewer */}
          {(selectedReceiptType || isReportMode) && (
            <div
              id="receipt-container"
              className="mt-4 border border-gray-200 bg-gray-50 rounded-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-200">
                <h4 className="font-medium text-gray-700">
                  {isReportMode ? 'Full Report' : 'Receipt Preview'}
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCloseReceipt}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                    title="Close Receipt"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Close
                  </button>
                </div>
              </div>

              <div id="receipt-content" className="overflow-y-auto max-h-[70vh]">
                <div ref={receiptRef}>
                  {isReportMode
                    ? // No need to restore a specific receipt type in the new scrollable view
                      // as all receipt types are displayed simultaneously
                      reportReceiptTypes.map((receiptType) => (
                        <div key={receiptType} className="mb-4" id={`receipt-${receiptType}`}>
                          <ReceiptViewer
                            report={selectedPrescription}
                            receiptType={receiptType}
                            selectedOperation={selectedOperation || undefined}
                          />
                        </div>
                      ))
                    : // In single receipt mode, render just the selected receipt type
                      selectedReceiptType && (
                        <ReceiptViewer
                          report={selectedPrescription}
                          receiptType={selectedReceiptType}
                          selectedOperation={selectedOperation || undefined}
                        />
                      )}
                </div>
              </div>

              {/* Print and WhatsApp buttons */}
              <div className="flex justify-between p-3 bg-gray-50 border-t border-gray-200">
                <div></div> {/* Empty div to maintain flex spacing */}
                <div className="flex">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-3 flex items-center"
                    onClick={handlePrint}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                    onClick={sendWhatsAppMessage}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    Share via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prescription Table */}
      <div
        className="overflow-x-auto border border-gray-200 rounded-lg"
        style={{
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f9fafb'
        }}
      >
        <style>
          {`
          /* Custom scrollbar for WebKit browsers (Chrome, Safari) */
          div::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #f9fafb;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #cbd5e0;
            border-radius: 6px;
          }
          `}
        </style>
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sno
              </th>
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
                Patient ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Paid For
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Referred By
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                DOB
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Age
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Gender
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Phone Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Doctor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount Received
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount Due
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription, index) => (
              <tr
                key={prescription.id as string}
                className={`hover:bg-gray-50 cursor-pointer ${selectedPrescription?.id === prescription.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(prescription)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescriptions?.length - index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.DATE as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['PATIENT ID'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['PATIENT NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['PAID FOR'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['REFFERED BY'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.DOB as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.AGE as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.GENDER as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['PHONE NUMBER'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['DOCTOR NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['TOTAL AMOUNT'] !== undefined &&
                  prescription['TOTAL AMOUNT'] !== null
                    ? `₹${prescription['TOTAL AMOUNT']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['AMOUNT RECEIVED'] !== undefined &&
                  prescription['AMOUNT RECEIVED'] !== null
                    ? `₹${prescription['AMOUNT RECEIVED']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['AMOUNT DUE'] !== undefined && prescription['AMOUNT DUE'] !== null
                    ? `₹${prescription['AMOUNT DUE']}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PrescriptionTableWithReceipts
