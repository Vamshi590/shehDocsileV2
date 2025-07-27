import React, { useState, useEffect } from 'react'

interface Optical {
  id: string
  type: 'frame' | 'lens'
  brand: string
  model: string
  size: string
  power?: string // Optional for lenses
  quantity: number
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface OpticalDispenseModalProps {
  optical: Optical
  isOpen: boolean
  onClose: () => void
  onDispense: (
    id: string,
    quantity: number,
    patientName: string,
    patientId?: string
  ) => Promise<void>
}

const OpticalDispenseModal: React.FC<OpticalDispenseModalProps> = ({
  optical,
  isOpen,
  onClose,
  onDispense
}) => {
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
  const [quantity, setQuantity] = useState(1)
  const [patientName, setPatientName] = useState(getUserName())
  const [patientId, setPatientId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')


  // Reset form when optical changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setPatientName(getUserName())
      setPatientId('')
      setError('')
    }
  }, [isOpen, optical])

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

    if (quantity > optical.quantity) {
      setError(`Only ${optical.quantity} units available`)
      return
    }

    if (!patientName.trim()) {
      setError('Patient name is required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await onDispense(optical.id, quantity, patientName, patientId || undefined)
      onClose()
    } catch (err) {
      console.error('Error dispensing optical item:', err)
      setError('Failed to dispense optical item')
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
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto z-10">
          <div className="bg-blue-500 px-4 py-3">
            <h3 className="text-lg font-medium text-white">Dispense Optical Item</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Item Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>{' '}
                  <span className="font-medium">{optical.type === 'frame' ? 'Frame' : 'Lens'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Brand:</span>{' '}
                  <span className="font-medium">{optical.brand}</span>
                </div>
                <div>
                  <span className="text-gray-500">Model:</span>{' '}
                  <span className="font-medium">{optical.model}</span>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>{' '}
                  <span className="font-medium">{optical.size}</span>
                </div>
                {optical.type === 'lens' && optical.power && (
                  <div>
                    <span className="text-gray-500">Power:</span>{' '}
                    <span className="font-medium">{optical.power}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Available:</span>{' '}
                  <span className="font-medium">{optical.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>{' '}
                  <span className="font-medium">₹{optical.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity to Dispense
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  max={optical.quantity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Dispensed By
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Dispense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OpticalDispenseModal
