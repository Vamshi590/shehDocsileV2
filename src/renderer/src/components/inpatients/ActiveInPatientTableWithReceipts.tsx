import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import { InPatient } from '../../pages/InPatients'
import InPatientReceiptViewer from '../reports/InPatientReceiptViewer'
import InPatientEditModal from './InPatientEditModal'

// Define Discharge type to match InPatient structure for compatibility with ReceiptViewer
type Discharge = InPatient

interface ActiveInPatientTableWithReceiptsProps {
  inpatients: InPatient[]
  onDischargeInPatient?: (inpatient: InPatient) => void
  onUpdateInPatient?: (id: string, inpatient: Omit<InPatient, 'id'>) => Promise<void>
}

const ActiveInPatientTableWithReceipts: React.FC<ActiveInPatientTableWithReceiptsProps> = ({
  inpatients,
  onDischargeInPatient,
  onUpdateInPatient
}) => {
  const [selectedInPatient, setSelectedInPatient] = useState<InPatient | null>(null)
  const [relatedDischarge, setRelatedDischarge] = useState<Discharge | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)

  // Refs for both receipts
  const dischargeSummaryRef = useRef<HTMLDivElement>(null)

  // ===== Handlers =====
  const handleRowClick = (inpatient: InPatient): void => {
    if (selectedInPatient?.id === inpatient.id) {
      setSelectedInPatient(null)
      setSelectedReceiptType(null)
    } else {
      setSelectedInPatient(inpatient)
      setSelectedReceiptType(null)
    }
  }

  // Handle receipt type selection
  const handleSelectReceiptType = (type: string): void => {
    setSelectedReceiptType(type)
  }

  // Handle closing the receipt viewer
  const handleCloseReceipt = (): void => {
    setSelectedReceiptType(null)
  }

  // Handle edit button click
  const handleEditClick = (): void => {
    if (selectedInPatient) {
      setIsEditModalOpen(true)
    }
  }

  // Handle update from edit modal
  const handleUpdateInPatient = async (
    id: string,
    updatedInPatient: Omit<InPatient, 'id'>
  ): Promise<void> => {
    if (onUpdateInPatient) {
      await onUpdateInPatient(id, updatedInPatient)
      setIsEditModalOpen(false)
    }
  }

  // Effect to set discharge data when inpatient is selected
  useEffect(() => {
    if (!selectedInPatient) {
      setRelatedDischarge(null)
      return
    }

    // Set discharge data as a copy of the inpatient
    setRelatedDischarge({
      ...selectedInPatient,
      operationDate: selectedInPatient.operationDate || new Date().toISOString().split('T')[0],
      // Store operation time in operationDetails if needed
      operationDetails:
        selectedInPatient.operationDetails ||
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
    })
  }, [selectedInPatient])

  const operationReceiptRef = useRef<HTMLDivElement>(null)

  // Helper function to clean OKLCH colors
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

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    if (!selectedInPatient) {
      toast.error('Please select an operation first')
      return
    }
    try {
      const receiptEl = operationReceiptRef.current
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

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
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

      // If discharge summary exists, add it as second page
      if (dischargeSummaryRef.current && relatedDischarge) {
        const dischargeSummaryEl = dischargeSummaryRef.current
        const dischargeSummaryClone = dischargeSummaryEl.cloneNode(true) as HTMLElement
        stripOKLCH(dischargeSummaryClone)
        dischargeSummaryClone.style.width = '794px'
        dischargeSummaryClone.style.height = '1123px'
        dischargeSummaryClone.style.backgroundColor = '#ffffff'
        document.body.appendChild(dischargeSummaryClone)

        const dischargeSummaryCanvas = await html2canvas(dischargeSummaryClone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(dischargeSummaryClone)
        const dischargeSummaryImgData = dischargeSummaryCanvas.toDataURL('image/png')

        const dischargeSummaryPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const dischargeSummaryPngImage = await pdfDoc.embedPng(dischargeSummaryImgData)

        const dischargeSummaryImgWidth = dischargeSummaryPngImage.width
        const dischargeSummaryImgHeight = dischargeSummaryPngImage.height
        const dischargeSummaryScale = Math.min(
          PAGE_WIDTH / dischargeSummaryImgWidth,
          PAGE_HEIGHT / dischargeSummaryImgHeight
        )
        const dischargeSummaryDrawWidth = dischargeSummaryImgWidth * dischargeSummaryScale
        const dischargeSummaryDrawHeight = dischargeSummaryImgHeight * dischargeSummaryScale
        const dischargeSummaryX = (PAGE_WIDTH - dischargeSummaryDrawWidth) / 2
        const dischargeSummaryY = (PAGE_HEIGHT - dischargeSummaryDrawHeight) / 2

        dischargeSummaryPage.drawImage(dischargeSummaryPngImage, {
          x: dischargeSummaryX,
          y: dischargeSummaryY,
          width: dischargeSummaryDrawWidth,
          height: dischargeSummaryDrawHeight
        })
      }

      const pdfBytes = await pdfDoc.save()

      // Use Electron's IPC to open the PDF in a native window
      // This is the Electron-specific approach that works better than browser blob URLs
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

  const sendWhatsAppMessage = async (): Promise<void> => {
    try {
      const receiptEl = operationReceiptRef.current
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

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
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

      // If discharge summary exists, add it as second page
      if (dischargeSummaryRef.current && relatedDischarge) {
        const dischargeSummaryEl = dischargeSummaryRef.current
        const dischargeSummaryClone = dischargeSummaryEl.cloneNode(true) as HTMLElement
        stripOKLCH(dischargeSummaryClone)
        dischargeSummaryClone.style.width = '794px'
        dischargeSummaryClone.style.height = '1123px'
        dischargeSummaryClone.style.backgroundColor = '#ffffff'
        document.body.appendChild(dischargeSummaryClone)

        const dischargeSummaryCanvas = await html2canvas(dischargeSummaryClone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(dischargeSummaryClone)
        const dischargeSummaryImgData = dischargeSummaryCanvas.toDataURL('image/png')

        const dischargeSummaryPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const dischargeSummaryPngImage = await pdfDoc.embedPng(dischargeSummaryImgData)

        const dischargeSummaryImgWidth = dischargeSummaryPngImage.width
        const dischargeSummaryImgHeight = dischargeSummaryPngImage.height
        const dischargeSummaryScale = Math.min(
          PAGE_WIDTH / dischargeSummaryImgWidth,
          PAGE_HEIGHT / dischargeSummaryImgHeight
        )
        const dischargeSummaryDrawWidth = dischargeSummaryImgWidth * dischargeSummaryScale
        const dischargeSummaryDrawHeight = dischargeSummaryImgHeight * dischargeSummaryScale
        const dischargeSummaryX = (PAGE_WIDTH - dischargeSummaryDrawWidth) / 2
        const dischargeSummaryY = (PAGE_HEIGHT - dischargeSummaryDrawHeight) / 2

        dischargeSummaryPage.drawImage(dischargeSummaryPngImage, {
          x: dischargeSummaryX,
          y: dischargeSummaryY,
          width: dischargeSummaryDrawWidth,
          height: dischargeSummaryDrawHeight
        })
      }

      const pdfBytes = await pdfDoc.save()

      // Save locally so the user can attach it in WhatsApp
      // Build filename as patientNAME_date.pdf  (e.g., John_Doe_2025-07-16.pdf)
      const dateStr = new Date().toISOString().slice(0, 19)

      // Extract patient name directly from the operation data
      let patientName = ''
      if (selectedInPatient?.name) {
        patientName = String(selectedInPatient.name).trim().replace(/\s+/g, '_')
      } else if (selectedInPatient?.['PATIENT NAME']) {
        patientName = String(selectedInPatient['PATIENT NAME']).trim().replace(/\s+/g, '_')
      } else {
        // Try to find it in the DOM as fallback
        const patientNameDiv = receiptEl.querySelector(
          'div:has(> div.font-bold:contains("PATIENT NAME")) > div:last-child'
        ) as HTMLElement | null
        if (patientNameDiv?.textContent) {
          patientName = patientNameDiv.textContent.trim().replace(/\s+/g, '_')
        } else {
          patientName = 'Receipt' // Last resort fallback
        }
      }

      const fileName = `${patientName}_operation_${dateStr}.pdf`

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
        selectedInPatient?.['PHONE NUMBER'] || selectedInPatient?.phone || ''
      ).replace(/\D/g, '')
      patientPhone = `91${patientPhone}`

      // Create appropriate message for operation
      const whatsAppMessage = `Dear ${patientName.replace(/_/g, ' ')}, here is your operation receipt from Sri Harsha Eye Hospital.`

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(whatsAppMessage)

      // Open WhatsApp in system app with chat to patient number and pre-filled message
      window.open(`https://wa.me/${patientPhone}?text=${encodedMessage}`, '_blank')
    } catch (err) {
      console.error('Failed to create/send PDF:', err)
      toast.error('Failed to share via WhatsApp')
    }
  }

  // Handle discharge button click
  const handleDischarge = (inpatient: InPatient): void => {
    if (onDischargeInPatient) {
      // Mark the patient as discharged by setting the operation date
      const updatedInPatient = {
        ...inpatient,
        operationDate: new Date().toISOString().split('T')[0],
        operationDetails: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
      onDischargeInPatient(updatedInPatient)
    }
  }

  return (
    <div className="p-4">
      {/* Table Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Active In-Patients</h2>
        <p className="text-sm text-gray-500">
          Click on a row to view receipts and discharge summary
        </p>
      </div>

      {/* Receipt Options - Only show when an inpatient is selected */}
      {selectedInPatient && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Receipt Options for {selectedInPatient.name}
          </h3>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-3 py-1 text-sm ${selectedReceiptType === 'cash' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'} rounded-md hover:bg-blue-200 transition-colors`}
                onClick={() => handleSelectReceiptType('cash')}
              >
                Cash Receipt
              </button>
              <button
                className={`px-3 py-1 text-sm ${selectedReceiptType === 'discharge' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'} rounded-md hover:bg-green-200 transition-colors`}
                onClick={() => handleSelectReceiptType('discharge')}
              >
                Discharge Summary
              </button>
              <button
                className={`px-3 py-1 text-sm ${selectedReceiptType === 'both' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'} rounded-md hover:bg-purple-200 transition-colors`}
                onClick={() => handleSelectReceiptType('both')}
              >
                Both
              </button>
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                onClick={handleEditClick}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                title="Edit In-Patient"
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
            </div>
          </div>

          {/* Receipt Viewer */}
          {selectedReceiptType && (
            <div className="mt-4 border border-gray-200 bg-gray-50 rounded-md overflow-hidden">
              <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-200">
                <h4 className="font-medium text-gray-700">
                  {selectedReceiptType === 'both'
                    ? 'Cash Receipt & Discharge Summary'
                    : selectedReceiptType === 'cash'
                      ? 'Cash Receipt'
                      : 'Discharge Summary'}
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
                {selectedReceiptType === 'cash' || selectedReceiptType === 'both' ? (
                  <div ref={operationReceiptRef}>
                    <InPatientReceiptViewer inpatient={selectedInPatient} receiptType="cash" />
                  </div>
                ) : null}

                {(selectedReceiptType === 'discharge' || selectedReceiptType === 'both') &&
                relatedDischarge ? (
                  <div
                    className={selectedReceiptType === 'both' ? 'mt-8' : ''}
                    ref={dischargeSummaryRef}
                  >
                    <InPatientReceiptViewer inpatient={relatedDischarge} receiptType="discharge" />
                  </div>
                ) : null}
              </div>

              {/* Print and WhatsApp buttons */}
              <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-200">
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
      {/* In-Patients Table */}
      <div className="overflow-x-auto mb-6 border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age/Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guardian
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admit Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosis
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inpatients.map((inpatient) => (
              <tr
                key={inpatient.id}
                onClick={() => handleRowClick(inpatient)}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedInPatient?.id === inpatient.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.age}/{inpatient.gender}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.guardianName || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.phone || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.date || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.operationName && inpatient.operationName.length > 20
                    ? `${inpatient.operationName.substring(0, 20)}...`
                    : inpatient.operationName || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {inpatient.provisionDiagnosis && inpatient.provisionDiagnosis.length > 20
                    ? `${inpatient.provisionDiagnosis.substring(0, 20)}...`
                    : inpatient.provisionDiagnosis || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ₹
                  {inpatient.netAmount?.toFixed(2) || inpatient.packageAmount?.toFixed(2) || '0.00'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <span
                    className={
                      inpatient.balanceAmount && inpatient.balanceAmount > 0
                        ? 'text-red-600 font-semibold'
                        : 'text-green-600'
                    }
                  >
                    ₹{inpatient.balanceAmount?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedInPatient(inpatient)
                      setSelectedReceiptType('cash')
                    }}
                  >
                    Receipts
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDischarge(inpatient)
                    }}
                  >
                    Discharge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedInPatient && (
        <InPatientEditModal
          inpatient={selectedInPatient}
          onUpdate={handleUpdateInPatient}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}

export default ActiveInPatientTableWithReceipts
