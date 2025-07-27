import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { saveAs } from 'file-saver'
import ReceiptViewer from '../reports/ReceiptViewer'
import { toast } from 'sonner'

// Define Prescription interface to match the expected structure
interface Prescription {
  id: string
  patientId?: string // Make patientId optional to match actual data structure
  date?: string
  patientName?: string
  doctorName?: string
  [key: string]: unknown // Use unknown instead of any for better type safety
}

// Discharge type should match Operation type structure for compatibility with ReceiptViewer
type Discharge = Operation
// Operation type – keep flexible with index signature so extra props don\'t break TS
export interface Operation {
  id: string
  patientId: string
  patientName: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
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
  totalAmount?: number
  reviewOn?: string
  prescriptionData?: string
  [key: string]: unknown
}

interface OperationTableWithReceiptsProps {
  operations: Operation[]
  onEditOperation?: (operation: Operation) => void
  onDeleteOperation?: (id: string) => void
}

const OperationTableWithReceipts: React.FC<OperationTableWithReceiptsProps> = ({
  operations,
  onEditOperation,
  onDeleteOperation
}) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [relatedPrescription, setRelatedPrescription] = useState<Prescription | null>(null)
  const [relatedDischarge, setRelatedDischarge] = useState<Discharge | null>(null)

  const handleEditOperation = async (operation: Operation): Promise<void> => {
    setSelectedOperation(operation)
    onEditOperation && (await onEditOperation(operation))
  }

  // Refs for both receipts
  const operationReceiptRef = useRef<HTMLDivElement>(null)
  const prescriptionReceiptRef = useRef<HTMLDivElement>(null)
  // ===== Handlers =====
  const handleRowClick = (operation: Operation): void => {
    if (selectedOperation?.id === operation.id) {
      setSelectedOperation(null)
    } else {
      setSelectedOperation(operation)
    }
  }

  // Effect to fetch related prescription when operation is selected
  useEffect(() => {
    if (!selectedOperation) {
      setRelatedPrescription(null)
      return
    }

    // If operation has prescription data, use it directly
    if (selectedOperation.prescriptionData) {
      try {
        // Parse the JSON string to get the prescription object
        const parsedPrescription = JSON.parse(selectedOperation.prescriptionData as string)
        setRelatedPrescription(parsedPrescription)
        // Set discharge data as a copy of the operation with parsed prescription data
        // Use the parsed prescription data array instead of the raw JSON string
        setRelatedDischarge({
          ...selectedOperation,
          prescriptionData: parsedPrescription // Use parsed array instead of raw string
        })
      } catch (error) {
        console.error('Error parsing prescription data:', error)
        setRelatedPrescription(null)
        setRelatedDischarge(null)
      }
    } else {
      setRelatedPrescription(null)
      setRelatedDischarge(null)
    }
  }, [selectedOperation])

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
    if (!selectedOperation) {
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

      // If prescription exists, add it as second page
      if (prescriptionReceiptRef.current && relatedPrescription) {
        const prescriptionClone = prescriptionReceiptRef.current.cloneNode(true) as HTMLElement
        stripOKLCH(prescriptionClone)
        prescriptionClone.style.width = '794px'
        prescriptionClone.style.height = '1123px'
        prescriptionClone.style.backgroundColor = '#ffffff'
        document.body.appendChild(prescriptionClone)

        const prescriptionCanvas = await html2canvas(prescriptionClone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(prescriptionClone)
        const prescriptionImgData = prescriptionCanvas.toDataURL('image/png')

        const prescriptionPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const prescriptionPngImage = await pdfDoc.embedPng(prescriptionImgData)

        const prescriptionImgWidth = prescriptionPngImage.width
        const prescriptionImgHeight = prescriptionPngImage.height
        const prescriptionScale = Math.min(
          PAGE_WIDTH / prescriptionImgWidth,
          PAGE_HEIGHT / prescriptionImgHeight
        )
        const prescriptionDrawWidth = prescriptionImgWidth * prescriptionScale
        const prescriptionDrawHeight = prescriptionImgHeight * prescriptionScale
        const prescriptionX = (PAGE_WIDTH - prescriptionDrawWidth) / 2
        const prescriptionY = (PAGE_HEIGHT - prescriptionDrawHeight) / 2

        prescriptionPage.drawImage(prescriptionPngImage, {
          x: prescriptionX,
          y: prescriptionY,
          width: prescriptionDrawWidth,
          height: prescriptionDrawHeight
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

      // If prescription exists, add it as second page
      if (prescriptionReceiptRef.current && relatedPrescription) {
        const prescriptionClone = prescriptionReceiptRef.current.cloneNode(true) as HTMLElement
        stripOKLCH(prescriptionClone)
        prescriptionClone.style.width = '794px'
        prescriptionClone.style.height = '1123px'
        prescriptionClone.style.backgroundColor = '#ffffff'
        document.body.appendChild(prescriptionClone)

        const prescriptionCanvas = await html2canvas(prescriptionClone, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true
        })
        document.body.removeChild(prescriptionClone)
        const prescriptionImgData = prescriptionCanvas.toDataURL('image/png')

        const prescriptionPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
        const prescriptionPngImage = await pdfDoc.embedPng(prescriptionImgData)

        const prescriptionImgWidth = prescriptionPngImage.width
        const prescriptionImgHeight = prescriptionPngImage.height
        const prescriptionScale = Math.min(
          PAGE_WIDTH / prescriptionImgWidth,
          PAGE_HEIGHT / prescriptionImgHeight
        )
        const prescriptionDrawWidth = prescriptionImgWidth * prescriptionScale
        const prescriptionDrawHeight = prescriptionImgHeight * prescriptionScale
        const prescriptionX = (PAGE_WIDTH - prescriptionDrawWidth) / 2
        const prescriptionY = (PAGE_HEIGHT - prescriptionDrawHeight) / 2

        prescriptionPage.drawImage(prescriptionPngImage, {
          x: prescriptionX,
          y: prescriptionY,
          width: prescriptionDrawWidth,
          height: prescriptionDrawHeight
        })
      }

      const pdfBytes = await pdfDoc.save()

      // Save locally so the user can attach it in WhatsApp
      // Build filename as patientNAME_date.pdf  (e.g., John_Doe_2025-07-16.pdf)
      const dateStr = new Date().toISOString().slice(0, 19)

      // Extract patient name directly from the operation data
      let patientName = ''
      if (selectedOperation?.patientName) {
        patientName = String(selectedOperation.patientName).trim().replace(/\s+/g, '_')
      } else if (selectedOperation?.['PATIENT NAME']) {
        patientName = String(selectedOperation['PATIENT NAME']).trim().replace(/\s+/g, '_')
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
        selectedOperation?.['PHONE NUMBER'] || selectedOperation?.phone || ''
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

  // Alias for the WhatsApp function to maintain compatibility with existing code
  const handleWhatsAppShare = sendWhatsAppMessage

  return (
    <div>
      {/* Operations Table */}
      <div
        className="overflow-x-auto mb-6"
        style={{
          overflowX: 'auto',
          /* Custom scrollbar styling */
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Patient Id
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Patient Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Admit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Operation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Discharge
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Procedure
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Operation Details
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Provision Diagnosis
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Admit
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Operation
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Discharge
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Review On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Operated By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.map((operation) => (
              <tr
                key={operation.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedOperation?.id === operation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleRowClick(operation)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.patientId || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.patientName || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfAdmit || '-'}
                </td>{' '}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfOperation || '-'}
                </td>{' '}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfDischarge || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operationProcedure && operation.operationProcedure.length > 30
                    ? `${operation.operationProcedure.substring(0, 30)}...`
                    : operation.operationProcedure || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operationDetails && operation.operationDetails.length > 30
                    ? `${operation.operationDetails.substring(0, 30)}...`
                    : operation.operationDetails || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.provisionDiagnosis && operation.provisionDiagnosis.length > 30
                    ? `${operation.provisionDiagnosis.substring(0, 30)}...`
                    : operation.provisionDiagnosis || '-'}
                </td>{' '}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfAdmit || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfOperation || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfDischarge || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.reviewOn || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operatedBy || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditOperation(operation)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800 mr-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOperation(operation)
                      // open receipt selection implicitly
                    }}
                  >
                    Receipt
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this operation?')) {
                        onDeleteOperation && onDeleteOperation(operation.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Viewers + Actions */}
      {selectedOperation && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          {/* Operation Receipt */}
          <div ref={operationReceiptRef}>
            <ReceiptViewer
              report={selectedOperation}
              receiptType="operation"
              selectedOperation={selectedOperation}
            />
          </div>

          {/* Discharge Receipt (if available) */}
          {relatedDischarge ? (
            <div className="mt-8" ref={prescriptionReceiptRef}>
              <ReceiptViewer report={relatedDischarge} receiptType="discharge" />
            </div>
          ) : (
            <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500 text-center">
                No related prescription found for this operation
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              onClick={handlePrint}
            >
              Print {relatedPrescription ? 'Both Receipts' : 'Receipt'}
            </button>
            <button
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
              onClick={handleWhatsAppShare}
            >
              WhatsApp {relatedPrescription ? 'Both Receipts' : 'Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationTableWithReceipts
