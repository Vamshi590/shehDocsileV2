import React, { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import PatientTable from '../components/patients/PatientTable'
import PatientEditModal from '../components/patients/PatientEditModal'
import PatientForm from '../components/patients/PatientForm'
import ReceiptForm, { Patient as ReceiptPatient } from '../components/prescriptions/ReceiptForm'
import ReceiptViewer from '../components/reports/ReceiptViewer'
import { toast, Toaster } from 'sonner'

// Define types for API responses
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

// Define types for receipt viewer
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
  PATIENT_NAME?: string
  [key: string]: unknown
}

export interface Patient {
  id: string
  patientId: string
  name: string
  age: string | number // Allow both string and number for flexibility
  gender: string
  phone: string
  address: string
  date: string
  dob: string
  guardian: string
  status?: string
  doctorName?: string
  department?: string
  referredBy?: string
  createdBy?: string
  // Optional uppercase variants for ReceiptForm compatibility
  NAME?: string
  AGE?: string
  GENDER?: string
  PHONE?: string
  ADDRESS?: string
  DATE?: string
  DOB?: string
  GUARDIAN?: string
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [lastCreatedReceipt, setLastCreatedReceipt] = useState<Prescription | null>(null)

  // Ref for receipt element that will be used for printing
  const receiptRef = useRef<HTMLDivElement>(null)

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

  // Load today's patients on component mount
  useEffect(() => {
    const fetchTodaysPatients = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const response = (await api.getTodaysPatients()) as ApiResponse<Patient[]>
        console.log(response)

        if (response.success) {
          setPatients(response.data)
          // Optional success toast
          // toast.success(response.message)
        } else {
          console.error("Error loading today's patients:", response.message)
          toast.error(response.message)
        }
      } catch (err) {
        console.error("Error loading today's patients:", err)
        toast.error("Failed to load today's patients")
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysPatients()
  }, [])
  // Function to handle adding a patient (used via PatientForm component)
  // This function is passed to PatientForm component through props
  // ESLint shows it as unused because it's passed as a prop rather than called directly
  // @ts-ignore - used as prop
  const handleAddPatient = async (patient: Omit<Patient, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.addPatient(patient)) as ApiResponse<Patient>

      // Strict check for success and valid data
      if (response.success === true && response.data) {
        const addedPatient = response.data
        setPatients([...patients, addedPatient])

        // Show success toast
        toast.success(response.message || 'Patient added successfully')

        // Set the selected patient for receipt creation and show receipt form
        setSelectedPatient(addedPatient)
        setShowReceiptForm(true)
      } else {
        // Show error toast with the message from the backend
        toast.error(response.message || 'Failed to add patient')
        // Close the form when there's an error
        setShowAddForm(false)
        setShowReceiptForm(false)
      }
    } catch (err) {
      console.error('Error adding patient:', err)
      toast.error('Failed to add patient')
      // Close the form when there's an error
      setShowAddForm(false)
      setShowReceiptForm(false)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle creating a receipt after patient creation (used internally)
  // This function is passed to PatientForm component as onCreateReceipt prop
  // ESLint shows it as unused because it's passed as a prop rather than called directly
  // @ts-ignore - used as prop
  const handleCreateReceipt = (patient: Patient): void => {
    setSelectedPatient(patient)
    setShowReceiptForm(true)
  }

  // Function to handle adding a receipt
  const handleAddReceipt = async (formData: Record<string, unknown>): Promise<void> => {
    try {
      setLoading(true)

      // Create a complete receipt object with all necessary fields
      const receiptData = {
        ...formData,
        TYPE: 'RECEIPT',
        DATE: formData.DATE || new Date().toISOString().split('T')[0],
        'PATIENT ID': selectedPatient?.patientId || formData.patientId || '',
        'PATIENT NAME': selectedPatient?.name || formData['PATIENT NAME'] || '',
        GENDER: selectedPatient?.gender || formData.GENDER || '',
        AGE: selectedPatient?.age || formData.AGE || '',
        'CREATED BY':
          JSON.parse(localStorage.getItem('currentUser') || '{}')?.fullName || 'Unknown User'
      }

      console.log('Adding receipt with data:', receiptData)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const result = await api.addPrescription(receiptData)
      console.log('Receipt creation result:', result)

      // Create a receipt object directly from the form data and API result
      const createdReceipt: Prescription = {
        id:
          typeof result === 'object' && result !== null
            ? ((result as Record<string, unknown>).id as string)
            : '',
        'PATIENT ID': String(selectedPatient?.patientId || formData.patientId || ''),
        'PATIENT NAME': String(selectedPatient?.name || formData['PATIENT NAME'] || ''),
        GENDER: String(selectedPatient?.gender || formData.GENDER || ''),
        AGE: String(selectedPatient?.age || formData.AGE || ''),
        TYPE: 'RECEIPT',
        DATE: String(formData.DATE || new Date().toISOString().split('T')[0]),
        'CREATED BY': String(
          JSON.parse(localStorage.getItem('currentUser') || '{}')?.fullName || 'Unknown User'
        ),
        ...formData
      }

      // Set the created receipt and show print options
      console.log('Setting last created receipt:', createdReceipt)
      setLastCreatedReceipt(createdReceipt)
      setShowPrintOptions(true)

      setShowReceiptForm(false)
      setShowAddForm(false)
      toast.success('Receipt added successfully')
    } catch (err) {
      console.error('Error adding receipt:', err)
      toast.error('Failed to add receipt')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle printing receipt
  const handlePrintReceipt = async (): Promise<void> => {
    if (!lastCreatedReceipt) {
      toast.error('No receipt to print')
      return
    }

    try {
      const receiptEl = receiptRef.current
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

      const pdfBytes = await pdfDoc.save()

      // Use Electron's IPC to open the PDF in a native window
      const result = await window.api.openPdfInWindow(pdfBytes)

      if (!result.success) {
        console.error('Failed to open PDF in window:', result.error)
        toast.error('Failed to open PDF preview')
      }
    } catch (error) {
      console.error('Error generating PDF for preview:', error)
      toast.error('Failed to generate PDF preview')
    } finally {
      setShowPrintOptions(false)
    }
  }

  // Function to handle updating a patient
  const handleUpdatePatient = async (id: string, patient: Omit<Patient, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.updatePatient(id, patient)) as ApiResponse<Patient>

      if (response.success) {
        // If the backend returns the updated patient, use that data
        // Otherwise, use the local data we sent
        const updatedPatient = response.data || { ...patient, id }
        setPatients(patients.map((p) => (p.id === id ? updatedPatient : p)))
        setShowEditModal(false)
        setSelectedPatient(null)
        // Show success toast
        toast.success(response.message || 'Patient updated successfully')
      } else {
        // Show error toast with the message from the backend
        toast.error(response.message || 'Failed to update patient')
      }
    } catch (err) {
      console.error('Error updating patient:', err)
      // Show error toast
      toast.error('Failed to update patient')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a patient
  const handleDeletePatient = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.deletePatient(id)) as ApiResponse<null>

      if (response.success) {
        setPatients(patients.filter((p) => p.id !== id))
        // Show success toast
        toast.success(response.message || 'Patient deleted successfully')
      } else {
        // Show error toast with the message from the backend
        toast.error(response.message || 'Failed to delete patient')
      }
    } catch (err) {
      console.error('Error deleting patient:', err)
      toast.error('Failed to delete patient')
    } finally {
      setLoading(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (patient: Patient): void => {
    setSelectedPatient(patient)
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Patient Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{showAddForm ? 'Hide Form' : 'Add Patient'}</span>
            </button>
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

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
        {/* Patient Add Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Add New Patient
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <PatientForm
              onSubmit={handleAddPatient}
              patientCount={patients.length}
              onCreateReceipt={handleCreateReceipt}
            />
          </div>
        )}
        {loading && <p className="text-center">Loading...</p>}
        {!loading && patients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No patients found</p>
            <p className="text-gray-500 mb-6">
              Click the &quot;Add Patient&quot; button to create your first patient record
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm inline-flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Patient
            </button>
          </div>
        ) : (
          !loading && (
            <div className="mt-4">
              <PatientTable
                patients={patients}
                onEdit={openEditModal}
                onDelete={handleDeletePatient}
              />
            </div>
          )
        )}
      </main>

      {showEditModal && selectedPatient && (
        <PatientEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          patient={{
            id: selectedPatient.id,
            patientId: selectedPatient.patientId,
            name: selectedPatient.name,
            age: Number(selectedPatient.age),
            gender: selectedPatient.gender,
            phone: selectedPatient.phone,
            address: selectedPatient.address,
            date: selectedPatient.date,
            dob: selectedPatient.dob,
            guardian: selectedPatient.guardian,
            status: selectedPatient.status,
            doctorName: selectedPatient.doctorName,
            department: selectedPatient.department,
            referredBy: selectedPatient.referredBy,
            createdBy: selectedPatient.createdBy
          }}
          onSave={handleUpdatePatient}
        />
      )}

      {showReceiptForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Receipt for {selectedPatient.name}</h2>
              <button
                onClick={() => setShowReceiptForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            </div>
            <ReceiptForm
              patients={patients.map((patient) => {
                // Convert Patient to ReceiptPatient with proper type handling
                const receiptPatient: ReceiptPatient = {
                  id: patient.id,
                  date: patient.date || new Date().toISOString().split('T')[0],
                  patientId: patient.patientId,
                  name: patient.name,
                  guardian: patient.guardian || '',
                  phone: patient.phone || '',
                  age: String(patient.age),
                  gender: patient.gender,
                  address: patient.address || '',
                  dob: patient.dob || '',
                  // Include uppercase variants for compatibility
                  GENDER: patient.gender,
                  AGE: String(patient.age),
                  ADDRESS: patient.address || '',
                  DOB: patient.dob || ''
                }
                return receiptPatient
              })}
              selectedPatient={
                selectedPatient
                  ? ({
                      id: selectedPatient.id,
                      date: selectedPatient.date || new Date().toISOString().split('T')[0],
                      patientId: selectedPatient.patientId,
                      name: selectedPatient.name,
                      guardian: selectedPatient.guardian || '',
                      phone: selectedPatient.phone || '',
                      age: String(selectedPatient.age),
                      gender: selectedPatient.gender,
                      address: selectedPatient.address || '',
                      dob: selectedPatient.dob || '',
                      // Include uppercase variants for compatibility
                      GENDER: selectedPatient.gender,
                      AGE: String(selectedPatient.age),
                      ADDRESS: selectedPatient.address || '',
                      DOB: selectedPatient.dob || ''
                    } as ReceiptPatient)
                  : null
              }
              initialData={{
                DATE: new Date().toISOString().split('T')[0],
                TYPE: 'RECEIPT'
              }}
              onSubmit={handleAddReceipt}
              onCancel={() => setShowReceiptForm(false)}
            />
          </div>
        </div>
      )}

      {/* Print Options Dialog */}
      {showPrintOptions && lastCreatedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Receipt Created Successfully</h2>
              <button
                onClick={() => setShowPrintOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Receipt has been successfully created for{' '}
                {lastCreatedReceipt?.PATIENT_NAME || selectedPatient?.name}.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Print Receipt
                </button>
                <button
                  onClick={() => setShowPrintOptions(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Hidden Receipt for printing */}
            <div className="hidden">
              <div ref={receiptRef}>
                <ReceiptViewer report={lastCreatedReceipt as Prescription} receiptType="cash" />
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  )
}

export default Patients
