import React, { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import html2canvas from 'html2canvas'

// Import certificate components from receipts folder
import EmergencyCertificate from '../reciepts/EmergencyCertificate'
import CertificateForm from './CertificateForm'
import EssentialAndGenuineCERT from '../reciepts/EssentialAndGenuineCERT'
import NonClaimEHScert from '../reciepts/NonClaimEHScert'
import { Toaster, toast } from 'sonner';


// Import interfaces from CertificateForm
import type { CertificateFormData } from './CertificateForm'

// Certificate types
const CERTIFICATE_TYPES = {
  EMERGENCY: 'emergency',
  ESSENTIALITY: 'essentiality',
  NON_CLAIM: 'nonClaim'
}

const CertificateGenerator: React.FC = () => {
  const [selectedCertificateType, setSelectedCertificateType] = useState<string | null>(null)
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
  const [showPreview, setShowPreview] = useState(false)

  // Handle certificate type selection
  const handleSelectCertificateType = (type: string): void => {
    setSelectedCertificateType(type)
    setShowPreview(false)
    // Reset form data when changing certificate type with proper initialization
    setFormData({
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
  }

  // Handle form data changes
  const handleFormDataChange = (data: CertificateFormData): void => {
    setFormData(data)
  }

  // Handle preview button click
  const handleShowPreview = (): void => {
    setShowPreview(true)
  }

  // Handle print button click
  const handlePrint = async (): Promise<void> => {
    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      // Find the certificate element
      const certificateEl = document.getElementById('certificate-preview') as HTMLElement | null

      if (certificateEl) {
        // Clone and clean oklch colors
        const clone = certificateEl.cloneNode(true) as HTMLElement
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

        // Add a new page
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

        // Draw the image on the page
        page.drawImage(pngImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        })

        // Save the PDF and open it in a native window
        const pdfBytes = await pdfDoc.save()

        // Use Electron's IPC to open the PDF in a native window
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const result = (await api.openPdfInWindow(pdfBytes)) as { success: boolean; error?: string }

        if (!result.success) {
          console.error('Failed to open PDF in window:', result.error)
          
          toast.error('Failed to open PDF preview. Please try again.')
        }
      }
    } catch (err) {
      console.error('Failed to create PDF:', err)
      toast.error('Failed to generate PDF preview. Please try again.')
    }
  }

  // Function to strip OKLCH colors for better PDF rendering
  const stripOKLCH = (element: HTMLElement): void => {
    const allElements = element.querySelectorAll('*')
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el)
        const color = style.color
        const backgroundColor = style.backgroundColor
        const borderColor = style.borderColor

        if (color.includes('oklch')) {
          el.style.color = 'rgb(0, 0, 0)'
        }
        if (backgroundColor.includes('oklch')) {
          el.style.backgroundColor = 'rgb(255, 255, 255)'
        }
        if (borderColor.includes('oklch')) {
          el.style.borderColor = 'rgb(0, 0, 0)'
        }
      }
    })
  }

  // Render the selected certificate
  const renderCertificate = (): React.ReactNode => {
    switch (selectedCertificateType) {
      case CERTIFICATE_TYPES.EMERGENCY:
        return (
          <EmergencyCertificate
            patientData={formData.patientData || {}}
            admissionData={formData.admissionData || {}}
          />
        )
      case CERTIFICATE_TYPES.ESSENTIALITY:
        return (
          <EssentialAndGenuineCERT
            patientData={formData.patientData || {}}
            treatmentData={formData.treatmentData || {}}
            billingItems={formData.billingItems || []}
            billingData={formData.billingData || {}}
            authorizedSignatory={formData.authorizedSignatory || ''}
          />
        )
      case CERTIFICATE_TYPES.NON_CLAIM:
        return (
          <NonClaimEHScert
            patientData={formData.patientData || {}}
            treatmentData={formData.treatmentData || {}}
            authorizedSignatory={formData.authorizedSignatory || ''}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50">
   <header className="">
        <div className="max-w-7xl mx-auto py-4 sm:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Certificate Generator</h1>
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
<Toaster />
      {/* Certificate Type Selection */}
      <div className="bg-white p-4 max-w-7xl mx-auto mt-4 px-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Certificate Type</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCertificateType === CERTIFICATE_TYPES.EMERGENCY
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            onClick={() => handleSelectCertificateType(CERTIFICATE_TYPES.EMERGENCY)}
          >
            Emergency Admission Certificate
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCertificateType === CERTIFICATE_TYPES.ESSENTIALITY
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            onClick={() => handleSelectCertificateType(CERTIFICATE_TYPES.ESSENTIALITY)}
          >
            Essentiality & Genuineness Certificate
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCertificateType === CERTIFICATE_TYPES.NON_CLAIM
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            onClick={() => handleSelectCertificateType(CERTIFICATE_TYPES.NON_CLAIM)}
          >
            Non-Claim EHS Certificate
          </button>
        </div>
      </div>

      {/* Form and Preview Section */}
      {selectedCertificateType && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Certificate Information</h2>
            <CertificateForm
              certificateType={selectedCertificateType}
              onFormDataChange={handleFormDataChange}
              onShowPreview={handleShowPreview}
            />
          </div>

          {/* Preview Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Certificate Preview</h2>
              {showPreview && (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
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
                  Print Certificate
                </button>
              )}
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-y-auto origin-top-left">
                {showPreview && <div id="certificate-preview">{renderCertificate()}</div>}
                {!showPreview && (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Please select a certificate type and fill in the form to generate a preview.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificateGenerator
