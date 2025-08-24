import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import { InPatient } from '../../pages/InPatients'
import InPatientReceiptViewer from './InPatientReceiptViewer'

// Using InPatient interface imported from InPatients.tsx

// Interface for Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  operationName: string
  date: string
}

// Define props interface
interface ReceiptOptionsProps {
  patientName: string
  patientPhone: string
  onSelectReceiptType: (type: string, data?: Operation | InPatient) => void
  onGenerateReport?: (types: string[]) => void
  patientId?: string
  reportId: string
  reportType: string
}

const ReceiptOptions: React.FC<ReceiptOptionsProps> = ({
  patientName,
  patientPhone,
  onSelectReceiptType,
  onGenerateReport
}) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showInpatientsModal, setShowInpatientsModal] = useState(false)
  const [showReportOptions, setShowReportOptions] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(patientPhone || '')
  const [message, setMessage] = useState(`Receipt for ${patientName}`)
  const [inpatients, setInpatients] = useState<InPatient[]>([])
  const [searchOpid, setSearchOpid] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedInpatient, setSelectedInpatient] = useState<InPatient | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<'cash' | 'discharge'>('cash')
  const [isReportMode, setIsReportMode] = useState<boolean>(false)
  const [reportReceiptTypes, setReportReceiptTypes] = useState<string[]>([])
  const [selectedReportTypes, setSelectedReportTypes] = useState<{ [key: string]: boolean }>({
    cash: false,
    prescription: true,
    readingsandfindings: true,
    readings: false,
    clinical: false,
    operation: false
  })

  // Fetch inpatients from API
  const fetchInpatients = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Fetch all inpatients
      const response = await api.getInPatients()

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success &&
        'data' in response
      ) {
        const inpatientsData = response.data as InPatient[]
        setInpatients(inpatientsData)

        if (inpatientsData.length === 0) {
          setError('No inpatients found')
        }
      } else {
        setError('Failed to load inpatients data')
      }
    } catch (err) {
      console.error('Error loading inpatients:', err)
      setError('Failed to load inpatients')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setInpatients])

  // Load inpatients when inpatients modal is opened
  useEffect(() => {
    if (showInpatientsModal) {
      fetchInpatients()
    }
  }, [showInpatientsModal, fetchInpatients])

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
    // Convert selected report types object to array of selected types
    const selectedTypes = Object.entries(selectedReportTypes)
      .filter(([, isSelected]) => isSelected)
      .map(([type]) => type)

    if (selectedTypes.length === 0) {
      toast.error('Please select at least one receipt type')
      return
    }

    // Close the dropdown
    setShowReportOptions(false)

    // Set report mode and report receipt types
    setIsReportMode(true)
    setReportReceiptTypes(selectedTypes)

    // If there's a callback for handling report generation, call it
    if (onGenerateReport) {
      onGenerateReport(selectedTypes)
    } else {
      // If no callback, use the first selected type as fallback
      onSelectReceiptType(selectedTypes[0])
    }

    // Log for debugging
    console.log('Generating report with types:', selectedTypes)

    toast.success(`Generating report with ${selectedTypes.length} receipt types`)
  }

  // Handle inpatient selection
  const handleSelectInpatient = (inpatient: InPatient): void => {
    // Close the modal
    setShowInpatientsModal(false)
    // Set the selected inpatient
    setSelectedInpatient(inpatient)
    setSelectedReceiptType('cash') // Default to cash receipt
    // Call the onSelectReceiptType function with the selected inpatient
    if (onSelectReceiptType) {
      onSelectReceiptType('inpatient', inpatient)
    }
  }

  // Handle search for inpatients by OPID
  const handleSearch = (): void => {
    // If search is empty, show all inpatients
    if (!searchOpid.trim()) {
      fetchInpatients()
      return
    }

    // Filter inpatients by OPID
    const filtered = inpatients.filter((inpatient) =>
      inpatient.opid?.toLowerCase().includes(searchOpid.toLowerCase())
    )

    setInpatients(filtered)
  }

  // Handle print button click with proper preview - used by the print functionality
  const handlePrint = async (): Promise<void> => {
    try {
      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      if (isReportMode && reportReceiptTypes.length > 0) {
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
            const pngImage = await pdfDoc.embedPng(imgData)

            // Add a new page for each receipt type
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

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
          }
        }
      } else {
        // Single receipt mode - original behavior
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
      }

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
      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      if (isReportMode && reportReceiptTypes.length > 0) {
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
            const pngImage = await pdfDoc.embedPng(imgData)

            // Add a new page for each receipt type
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

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
          }
        }
      } else {
        // Single receipt mode - original behavior
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
      }

      const pdfBytes = await pdfDoc.save()

      // Build filename as patientNAME_date.pdf  (e.g., John_Doe_2025-07-16.pdf)
      const dateStr = new Date().toISOString().slice(0, 19)
      // Get patient name from receipt element or use default
      let patientNameValue = patientName || 'Receipt'

      // Try to get patient name from DOM if available
      const firstReceiptEl = document.querySelector('[id^="receipt-"]') as HTMLElement | null
      if (firstReceiptEl) {
        const nameNode = firstReceiptEl.querySelector('[data-patient-name]') as HTMLElement | null
        if (nameNode?.textContent) {
          patientNameValue = nameNode.textContent.trim()
        }
      }
      patientNameValue = patientNameValue.replace(/\s+/g, '_')
      // For report mode, use 'report' as the type, otherwise use the current receipt type
      const fileType = isReportMode
        ? 'report'
        : document.querySelector('[id^="receipt-"]')?.id.split('-')[1] || 'receipt'
      const fileName = `${patientNameValue}_${fileType}_${dateStr}.pdf`

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

  console.log(selectedInpatient)

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
          onClick={() => setShowInpatientsModal(true)}
        >
          Inpatients
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

      {/* Display selected inpatient receipt if available */}
      {selectedInpatient && (
        <div className="mt-6 border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Inpatient Receipt</h3>
            <div className="flex space-x-2 items-center">
              <button
                onClick={() => setSelectedInpatient(null)}
                className="text-gray-500 hover:text-gray-700 mr-2"
                aria-label="Close receipt viewer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button
                onClick={() => setSelectedReceiptType('cash')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${selectedReceiptType === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Cash Receipt
              </button>
              <button
                onClick={() => setSelectedReceiptType('discharge')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${selectedReceiptType === 'discharge' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Discharge Summary
              </button>
            </div>
          </div>
          <div
            className="overflow-auto max-h-[600px]"
            id={`receipt-inpatient-${selectedReceiptType}`}
          >
            <InPatientReceiptViewer
              inpatient={{
                ...selectedInpatient,
                // Ensure required fields have default values if missing
                doctorNames: selectedInpatient.doctorNames || ['Dr. CH. SRILATHA'],
                operationDate: selectedInpatient.operationDate || '',
                operationDetails: selectedInpatient.operationDetails || '',
                operationName: selectedInpatient.operationName || '',
                operationProcedure: selectedInpatient.operationProcedure || '',
                packageInclusions: selectedInpatient.packageInclusions || [],
                prescriptions: selectedInpatient.prescriptions || [],
                packageAmount: selectedInpatient.packageAmount || 0,
                discount: selectedInpatient.discount || 0,
                totalReceivedAmount: selectedInpatient.totalReceivedAmount || 0,
                balanceAmount: selectedInpatient.balanceAmount || 0,
                dischargeDate:
                  selectedInpatient.dischargeDate || new Date().toISOString().split('T')[0]
              }}
              receiptType={selectedReceiptType}
            />
          </div>
        </div>
      )}

      {/* Inpatients Search Modal */}
      {showInpatientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Search Inpatients</h3>
            {/* Search input for OPID */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by OPID"
                  className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={searchOpid}
                  onChange={(e) => setSearchOpid(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : inpatients.length === 0 ? (
              <div className="text-gray-500 py-4">No inpatients found. Try searching by OPID.</div>
            ) : (
              <div className="overflow-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        OPID
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
                        Admission Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Operation
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
                    {inpatients.map((inpatient) => (
                      <tr key={inpatient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inpatient.opid || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inpatient.name}</div>
                          <div className="text-sm text-gray-500">ID: {inpatient.patientId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inpatient.admissionDate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inpatient.operationName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleSelectInpatient(inpatient)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                onClick={() => setShowInpatientsModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add print button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Print Receipt
        </button>
      </div>
    </div>
  )
}

export default ReceiptOptions
