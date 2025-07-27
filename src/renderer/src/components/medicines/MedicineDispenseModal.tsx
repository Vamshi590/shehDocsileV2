import React, { useState, useEffect } from 'react'

interface Medicine {
  id: string
  name: string
  quantity: number
  expiryDate: string
  batchNumber: string
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface MedicineDispenseModalProps {
  medicine: Medicine
  isOpen: boolean
  onClose: () => void
  onDispense: (medicineData: {
    id: string
    quantity: number
    name?: string
    price?: number
    patientId?: string
    dispensedBy?: string
  }) => Promise<void>
}

const MedicineDispenseModal: React.FC<MedicineDispenseModalProps> = ({
  medicine,
  isOpen,
  onClose,
  onDispense
}) => {
  const [quantity, setQuantity] = useState(1)
  const getUserName = (): string => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (!stored) return ''
      const parsed = JSON.parse(stored)
      return parsed?.fullName ?? ''
    } catch {
      return ''
    }
  }
  const [dispensedBy, setDispensedBy] = useState<string>(getUserName())
  const [patientId, setPatientId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset form when medicine changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setDispensedBy(getUserName())
      setPatientId('')
      setError('')
    }
  }, [isOpen, medicine])
  // Close on escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Validation
    if (quantity <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (quantity > medicine.quantity) {
      setError(`Only ${medicine.quantity} units available`)
      return
    }

    // Patient name is now optional

    try {
      setIsSubmitting(true)
      setError('')
      await onDispense({
        id: medicine.id,
        quantity,
        name: medicine.name,
        price: medicine.price,
        patientId: patientId || undefined,
        dispensedBy: dispensedBy
      })
      onClose()
    } catch (err) {
      console.error('Error dispensing medicine:', err)
      setError('Failed to dispense medicine')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 transition-opacity bg-opacity-30 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      ></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal panel */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg mx-auto">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Dispense Medicine</h3>
                <div className="mt-2">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      You are dispensing{' '}
                      <span className="font-medium text-gray-700">{medicine.name}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Batch: {medicine.batchNumber} | Available: {medicine.quantity} units
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity to Dispense
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max={medicine.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="patientName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Dispensed By
                      </label>
                      <input
                        type="text"
                        id="patientName"
                        name="patientName"
                        value={dispensedBy}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                      />
                    </div>
                    {error && (
                      <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? 'Dispensing...' : 'Dispense Medicine'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicineDispenseModal
