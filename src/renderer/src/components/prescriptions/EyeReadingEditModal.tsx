import React from 'react'
import ReadingForm from './ReadingForm'
import { Patient } from './ReceiptForm'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

interface EyeReadingEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eyeReading: Prescription) => Promise<void>
  eyeReading: Prescription
}

const EyeReadingEditModal: React.FC<EyeReadingEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eyeReading
}) => {
  if (!isOpen) return null

  // Convert eyeReading to patient format for ReadingForm
  const selectedPatient: Patient = {
    id: eyeReading.id, // Required field from Patient interface
    date: String(eyeReading.DATE || new Date().toISOString().split('T')[0]), // Required field
    patientId: String(eyeReading['PATIENT ID'] || ''),
    name: String(eyeReading['PATIENT NAME'] || ''),
    guardian: String(eyeReading['GUARDIAN NAME'] || ''),
    dob: String(eyeReading.DOB || ''),
    age: String(eyeReading.AGE || '0'),
    gender: String(eyeReading.GENDER || ''),
    phone: String(eyeReading['PHONE NUMBER'] || ''),
    address: String(eyeReading.ADDRESS || '')
  }

  const handleSubmit = async (updatedEyeReading: Record<string, unknown>): Promise<void> => {
    // Ensure we keep the original ID
    const eyeReadingWithId = {
      ...updatedEyeReading,
      id: eyeReading.id
    } as Prescription

    await onSave(eyeReadingWithId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center backdrop-blur-sm justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  Edit Eye Reading
                </h3>
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                  <ReadingForm
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    selectedPatient={selectedPatient}
                    initialData={eyeReading}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EyeReadingEditModal
