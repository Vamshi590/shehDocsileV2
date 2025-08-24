import React, { useRef, useState } from 'react'
import ReportSearch from '../components/reports/ReportSearch'
import ReportDisplay from '../components/reports/ReportDisplay'
import InPatientReceiptViewer from '../components/reports/InPatientReceiptViewer'
import { toast, Toaster } from 'sonner'
import { InPatient } from '../pages/InPatients'
import ReceiptViewer from '@renderer/components/reports/ReceiptViewer'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'

// Import Operation type from ReceiptViewer
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
  billNumber?: string
  [key: string]: unknown
}
// Define the Prescription type (same as in Prescriptions.tsx)
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Patient type (same as in Prescriptions.tsx)
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

// Define the Lab type to match with other components
type Lab = {
  id: string
  [key: string]: unknown
}

// Define the ReportData type to hold all report types
type ReportData = {
  reports: Prescription[]
  inpatients: InPatient[]
  labs: Lab[]
}

// Extend the window API interface for TypeScript
// Extend the existing window API interface
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
      getPrescriptionsById: (id: string) => Promise<Prescription[]>
      getLatestPrescriptionId: () => Promise<number>
      getPrescriptionsByPatientId: (patientId: string) => Promise<Prescription[]>
      getDropdownOptions: (fieldName: string) => Promise<string[]>
      deleteDropdownOption: (fieldName: string, value: string) => Promise<void>
      addDropdownOption: (fieldName: string, value: string) => Promise<void>
      openPdfInWindow: (pdfBuffer: Uint8Array) => Promise<{ success: boolean; error?: string }>
      getLatestPatientId: () => Promise<number>
      getLabs: () => Promise<Lab[]>
      addLab: (lab: Omit<Lab, 'id'>) => Promise<Lab>
      updateLab: (lab: Lab) => Promise<Lab>
      deleteLab: (id: string) => Promise<boolean>
      searchLabs: (patientId: string) => Promise<Lab[]>
      getTodaysLabs: () => Promise<Lab[]>
      getPrescriptionsByDate: (date: string) => Promise<Prescription[]>
      getdues: () => Promise<Prescription[]>
      updateDue: (
        id: string,
        type?: string,
        updatedAmount?: number,
        receivedAmount?: number
      ) => Promise<Prescription>
      getReports: (id: string) => Promise<{
        success: boolean
        data: ReportData
        error: string | null
        statusCode: number
      }>
    }
  }
}

const Reports: React.FC = () => {
  // We'll keep patients state even if not used directly in the UI
  // as it might be needed for future enhancements
  const [foundReports, setFoundReports] = useState<Prescription[]>([])
  const [foundInpatients, setFoundInpatients] = useState<InPatient[]>([])
  const [foundLabs, setFoundLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'id' | 'name' | 'phone'>('id')
  const [activeReportType, setActiveReportType] = useState<
    'prescriptions' | 'inpatients' | 'labs' | null
  >(null)
  const [availableReportTypes, setAvailableReportTypes] = useState<string[]>([])
  // Toast notifications state

  // Function to handle search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setFoundReports([])
      setFoundInpatients([])
      setFoundLabs([])
      setActiveReportType(null)
      setAvailableReportTypes([])

      if (!searchTerm.trim()) {
        setError('Please enter a search term')
        setLoading(false)
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue, 'by', searchType)

      // Only use the direct API call when searching by ID
      if (searchType === 'id') {
        try {
          // Call the getReports API with the patient ID
          const response = await window.api.getReports(searchValue)
          if (response.success) {
            console.log(response)
            const { reports, inpatients, labs } = response.data
            // Set the found data
            setFoundReports(reports || [])
            setFoundInpatients(inpatients || [])
            setFoundLabs(labs || [])
            // Determine available report types
            const types: string[] = []
            if (reports && reports.length > 0) types.push('prescriptions')
            if (inpatients && inpatients.length > 0) types.push('inpatients')
            if (labs && labs.length > 0) types.push('labs')
            setAvailableReportTypes(types)
            // Set the active report type to the first available one
            if (types.length > 0) {
              setActiveReportType(types[0] as 'prescriptions' | 'inpatients' | 'labs')
            }
            setError('')
            toast.success(`Found ${types.length} report types for patient ID: ${searchValue}`)
          } else {
            setError(response.error || 'No reports found')
          }
        } catch (err) {
          console.error('Error fetching reports:', err)
          setError('Failed to fetch reports')
        }
      }
    } catch (err) {
      console.error('Error searching reports:', err)
      setError('Failed to search reports')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle report type selection
  const handleReportTypeSelect = (type: 'prescriptions' | 'inpatients' | 'labs'): void => {
    setActiveReportType(type)
  }

  // State for receipt type selection
  const [selectedReceiptType, setSelectedReceiptType] = useState<{
    prescription: string
    inpatient: 'cash' | 'discharge'
    lab: 'lab' | 'vlab'
  }>({
    prescription: 'prescription',
    inpatient: 'cash',
    lab: 'lab'
  })

  // State to track which report is selected for viewing
  const [selectedReport, setSelectedReport] = useState<{
    prescription: string | null
    inpatient: string | null
    lab: Lab | null
  }>({
    prescription: null,
    inpatient: null,
    lab: null
  })

  // Function to handle receipt type selection
  const handleReceiptTypeChange = (
    reportType: 'prescription' | 'inpatient' | 'lab',
    receiptType: string
  ): void => {
    setSelectedReceiptType((prev) => ({
      ...prev,
      [reportType]: receiptType
    }))
  }

  // State to track which receipt type is selected for viewing
  const [selectedlabReceiptType, setSelectedlabReceiptType] = useState<string | null>(null)
  const [isReportMode, setIsReportMode] = useState<boolean>(false)
  const [reportReceiptTypes, setReportReceiptTypes] = useState<string[]>([])
  // Handle receipt type selection
  const handleSelectReceiptType = (type: string): void => {
    setSelectedlabReceiptType(type)
  }

  // Handle generating a report with all receipt types
  const handleGenerateReport = (): void => {
    if (!selectedReport.lab) {
      toast.error('Please select a lab record first')
      return
    }

    // Define the receipt types to check
    const receiptTypesToCheck = ['lab', 'vlab']

    // Set report mode and store all receipt types
    setIsReportMode(true)
    setReportReceiptTypes(receiptTypesToCheck)
  }

  // Create a ref for the receipt content
  const receiptRef = useRef<HTMLDivElement>(null)

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    if (!selectedReport.lab) {
      toast.error('Please select a lab record first')
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
    if (!selectedReport.lab) {
      toast.error('Please select a lab record first')
      return
    }
    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      // Extract patient name directly from the lab data for filename
      let patientName = ''
      if (selectedReport.lab?.['PATIENT NAME']) {
        patientName = String(selectedReport.lab['PATIENT NAME']).replace(/\s+/g, '_')
      } else {
        patientName = 'Lab_Receipt' // Last resort fallback
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
      let patientPhone = String(selectedReport.lab?.['PHONE NUMBER'] || '').replace(/\D/g, '')

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

      switch (selectedlabReceiptType) {
        case 'cash':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, thank you for your payment at Sri Harsha Eye Hospital. Your receipt is attached.`
          break
        case 'lab':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here are your lab test results from Sri Harsha Eye Hospital.`
          break
        case 'vlab':
          whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here are your Vannela Lab test results from Sri Harsha Eye Hospital.`
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

  // Function to render the appropriate report data based on active type
  const renderReportData = (): React.ReactNode => {
    if (!activeReportType) return null

    switch (activeReportType) {
      case 'prescriptions':
        return foundReports.length > 0 ? (
          <div>
            <ReportDisplay reports={foundReports} />
          </div>
        ) : (
          <div className="text-center my-4 text-gray-500">No prescription reports found.</div>
        )
      case 'inpatients':
        return foundInpatients.length > 0 ? (
          <div>
            {/* List of inpatients */}
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Available Inpatient Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foundInpatients.map((inpatient, index) => (
                  <div
                    key={inpatient.id || index}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setSelectedReport((prevState) => ({
                        ...prevState,
                        inpatient: inpatient.id
                      }))
                    }
                  >
                    <div className="font-medium">{inpatient.name || 'Unknown Patient'}</div>
                    <div className="text-sm text-gray-500">
                      IP No: {inpatient.patientId || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Date: {inpatient.date || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      Doctor: {inpatient.doctorNames[0] || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {foundInpatients.length > 0 && selectedReport.inpatient && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Select Receipt Type</h3>
                <div className="flex gap-3">
                  <button
                    className={`px-3 py-1 rounded ${selectedReceiptType.inpatient === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => handleReceiptTypeChange('inpatient', 'cash')}
                  >
                    Cash Receipt
                  </button>
                  <button
                    className={`px-3 py-1 rounded ${selectedReceiptType.inpatient === 'discharge' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => handleReceiptTypeChange('inpatient', 'discharge')}
                  >
                    Discharge Receipt
                  </button>
                </div>
              </div>
            )}

            {/* Selected inpatient receipt viewer */}
            {selectedReport.inpatient && (
              <div className="mt-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Inpatient Receipt</h3>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() =>
                      setSelectedReport((prevState) => ({
                        ...prevState,
                        inpatient: null
                      }))
                    }
                  >
                    Back to list
                  </button>
                </div>
                <InPatientReceiptViewer
                  inpatient={
                    foundInpatients.find((p) => p.id === selectedReport.inpatient) ||
                    foundInpatients[0]
                  }
                  receiptType={selectedReceiptType.inpatient}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center my-4 text-gray-500">No inpatient reports found.</div>
        )
      case 'labs':
        return foundLabs.length > 0 ? (
          <div>
            {/* List of labs */}
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Available Lab Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foundLabs.map((lab, index) => (
                  <div
                    key={lab.id || index}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${selectedReport.lab?.id === lab.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' : ''}`}
                    onClick={() =>
                      setSelectedReport((prevState) => ({
                        ...prevState,
                        lab: lab
                      }))
                    }
                  >
                    <div className="font-medium">
                      {String(lab['PATIENT NAME'] || 'Unknown Patient')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Bill No: {String(lab.BILLNO || 'N/A')}
                    </div>
                    <div className="text-sm text-gray-500">Date: {String(lab.DATE || 'N/A')}</div>
                    <div className="text-sm text-gray-500">
                      Doctor: {String(lab['DOCTOR NAME'] || 'N/A')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedReport.lab && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Receipt Options for {String(selectedReport.lab['PATIENT NAME'])}
                </h3>

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectReceiptType('lab')
                      }}
                    >
                      Lab Receipt
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectReceiptType('vlab')
                      }}
                    >
                      VLab Receipt
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGenerateReport()
                      }}
                    >
                      All Receipts
                    </button>
                  </div>
                  <button
                    className="text-sm text-red-600 font-bold hover:text-red-800"
                    onClick={() =>
                      setSelectedReport((prevState) => ({
                        ...prevState,
                        lab: null
                      }))
                    }
                  >
                    Close
                  </button>
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
                    </div>

                    <div id="receipt-content" className="overflow-y-auto max-h-[70vh]">
                      <div ref={receiptRef}>
                        {isReportMode
                          ? reportReceiptTypes.map((receiptType) => (
                              <div key={receiptType} className="mb-4" id={`receipt-${receiptType}`}>
                                <ReceiptViewer
                                  report={selectedReport.lab as Prescription | Operation}
                                  receiptType={receiptType}
                                />
                              </div>
                            ))
                          : selectedlabReceiptType && (
                              <ReceiptViewer
                                report={selectedReport.lab as Prescription | Operation}
                                receiptType={selectedlabReceiptType}
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
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center my-4 text-gray-500">No lab reports found.</div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Patient Reports</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => (window.location.hash = '/dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Form */}
      <ReportSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        handleSearch={handleSearch}
        loading={loading}
      />

      {/* Error Message */}
      {error && <div className="text-red-500 text-center my-4">{error}</div>}

      {/* Report Type Selection */}
      {availableReportTypes.length > 0 && (
        <div className="mt-6 max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-3">Available Report Types</h2>
          <div className="flex flex-wrap gap-3">
            {availableReportTypes.includes('prescriptions') && (
              <button
                className={`px-4 py-2 rounded ${activeReportType === 'prescriptions' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => handleReportTypeSelect('prescriptions')}
              >
                Prescriptions
              </button>
            )}
            {availableReportTypes.includes('inpatients') && (
              <button
                className={`px-4 py-2 rounded ${activeReportType === 'inpatients' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => handleReportTypeSelect('inpatients')}
              >
                Inpatients
              </button>
            )}
            {availableReportTypes.includes('labs') && (
              <button
                className={`px-4 py-2 rounded ${activeReportType === 'labs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                onClick={() => handleReportTypeSelect('labs')}
              >
                Lab Reports
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reports Display */}
      {activeReportType && (
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {activeReportType.charAt(0).toUpperCase() + activeReportType.slice(1)} Reports
          </h2>
          {renderReportData()}
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && availableReportTypes.length === 0 && searchTerm && (
        <div className="text-center my-8 text-gray-500">
          No reports found for the search criteria.
        </div>
      )}

      {/* Initial Instructions */}
      {!loading && !searchTerm && (
        <div className="text-center my-8 text-gray-500">
          Enter a patient ID, name, or phone number to search for reports.
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Toast Container */}
      <Toaster />
    </div>
  )
}

export default Reports
