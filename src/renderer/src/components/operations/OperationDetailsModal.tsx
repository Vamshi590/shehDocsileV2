import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { toast } from 'sonner'
import { InPatient } from '../../pages/InPatients'
import { Prescription } from '../../pages/Prescriptions'
import EditableCombobox from '../common/EditableCombobox'
import { timingOptions, medicineOptions } from '@renderer/utils/dropdownOptions'

type OperationDetailsFormData = {
  operationName: string
  operationDate: string
  operationDetails: string
  operationProcedure: string
  provisionDiagnosis: string
  followUpDate: string
}

interface OperationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedInPatient: InPatient | null
  operationDetails: OperationDetailsFormData
  onOperationDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSave: () => Promise<void>
  prescriptions: Prescription[]
}

const OperationDetailsModal: React.FC<OperationDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedInPatient,
  operationDetails,
  onOperationDetailsChange,
  onSave
}) => {
  const [showDischargePrescription, setShowDischargePrescription] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [visiblePrescriptions, setVisiblePrescriptions] = useState(1)
  const [medicineOptionss] = useState<string[]>(medicineOptions)

  console.log(operationDetails)

  // Reset form data when modal opens/closes or when selected patient changes
  useEffect(() => {
    if (isOpen && selectedInPatient) {
      // Load existing prescriptions if available
      if (selectedInPatient.prescriptions && selectedInPatient.prescriptions.length > 0) {
        const existingPrescriptions = selectedInPatient.prescriptions
        const newFormData: Record<string, unknown> = {}
        let maxIndex = 0

        // Process each prescription object
        existingPrescriptions.forEach((prescription) => {
          // Extract prescription data from each object
          Object.entries(prescription).forEach(([key, value]) => {
            // Extract index from keys like PRESCRIPTION1, DAYS1, TIMING1
            const match = key.match(/([A-Z]+)(\d+)/)
            if (match) {
              const [, fieldType, indexStr] = match
              const index = parseInt(indexStr, 10)
              maxIndex = Math.max(maxIndex, index)

              // Convert to our form data format with spaces
              newFormData[`${fieldType} ${index}`] = value
            }
          })
        })

        // Set the form data and visible prescriptions count
        setFormData(newFormData)
        setVisiblePrescriptions(Math.min(10, Math.max(1, maxIndex)))

        // Automatically show the prescription form when prescriptions exist
        setShowDischargePrescription(true)
      } else {
        // No existing prescriptions, reset the form
        setFormData({})
        setVisiblePrescriptions(1)
      }
    }
  }, [isOpen, selectedInPatient])

  // Helper function to convert prescription form data to array format
  const formatPrescriptionsAsArray = (
    prescriptionData: Record<string, unknown>
  ): Array<Record<string, unknown>> => {
    const prescriptions: Array<Record<string, unknown>> = []

    // Count how many prescriptions are in the data
    let prescriptionCount = 0
    for (let i = 1; i <= 10; i++) {
      if (prescriptionData[`PRESCRIPTION ${i}`]) {
        prescriptionCount++
      }
    }

    // Format each prescription as an object in the array
    for (let i = 1; i <= prescriptionCount; i++) {
      const medicine = prescriptionData[`PRESCRIPTION ${i}`] as string
      const days = prescriptionData[`DAYS ${i}`] as string
      const timing = prescriptionData[`TIMING ${i}`] as string

      if (medicine) {
        // Create a single object with PRESCRIPTION, DAYS, and TIMING keys
        const prescriptionObj: Record<string, string> = {}
        prescriptionObj[`PRESCRIPTION${i}`] = medicine
        prescriptionObj[`DAYS${i}`] = days || ''
        prescriptionObj[`TIMING${i}`] = timing || ''
        prescriptions.push(prescriptionObj)
      }
    }

    return prescriptions
  }

  // Helper function to format prescription data for display in operation details
  const formatPrescriptionForOperationDetails = (
    prescriptionData: Record<string, unknown>
  ): string => {
    let formattedText = ''

    // Count how many prescriptions are in the data
    let prescriptionCount = 0
    for (let i = 1; i <= 10; i++) {
      if (prescriptionData[`PRESCRIPTION ${i}`]) {
        prescriptionCount++
      }
    }

    // Format each prescription
    for (let i = 1; i <= prescriptionCount; i++) {
      const medicine = prescriptionData[`PRESCRIPTION ${i}`] as string
      const days = prescriptionData[`DAYS ${i}`] as string
      const timing = prescriptionData[`TIMING ${i}`] as string

      if (medicine) {
        formattedText += `${i}. ${medicine}`
        if (days) formattedText += ` - ${days} days`
        if (timing) formattedText += ` (${timing})`
        formattedText += '\n'
      }
    }

    return formattedText
  }

  // Handle form field changes
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle removing a prescription
  const handleRemovePrescription = (index: number): void => {
    // Shift all prescriptions after the removed one up by one
    const updatedFormData = { ...formData }
    for (let i = index + 1; i < visiblePrescriptions; i++) {
      updatedFormData[`PRESCRIPTION ${i}`] = formData[`PRESCRIPTION ${i + 1}`]
      updatedFormData[`DAYS ${i}`] = formData[`DAYS ${i + 1}`]
      updatedFormData[`TIMING ${i}`] = formData[`TIMING ${i + 1}`]
    }

    // Remove the last prescription data
    delete updatedFormData[`PRESCRIPTION ${visiblePrescriptions}`]
    delete updatedFormData[`DAYS ${visiblePrescriptions}`]
    delete updatedFormData[`TIMING ${visiblePrescriptions}`]

    setFormData(updatedFormData)
    setVisiblePrescriptions((prev) => Math.max(1, prev - 1))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log('Prescription form submitted with data:', formData)
    // We'll process this data in the onSave function
  }

  // Modified onSave function to include prescription data
  const handleSave = async (): Promise<void> => {
    try {
      console.log('Saving operation details with prescriptions')
      if (!selectedInPatient) return

      // Check if we have prescription data to include
      let updatedOperationDetails = operationDetails.operationDetails
      let prescriptionsArray: Array<Record<string, unknown>> = []

      if (
        showDischargePrescription &&
        Object.keys(formData).some((key) => key.startsWith('PRESCRIPTION'))
      ) {
        // Format prescription data for display in operation details
        const prescriptionDetails = formatPrescriptionForOperationDetails(formData)

        // Format prescriptions as array of objects for database storage
        prescriptionsArray = formatPrescriptionsAsArray(formData)

        // Add prescription details to operation details
        const currentDate = new Date().toLocaleString()
        updatedOperationDetails = `${operationDetails.operationDetails || ''}\n\n--- DISCHARGE PRESCRIPTION (${currentDate}) ---\n${prescriptionDetails}`

        // Update the operation details in the local state
        const operationDetailsEvent = {
          target: {
            id: 'operationDetails',
            value: updatedOperationDetails
          }
        } as React.ChangeEvent<HTMLTextAreaElement>

        onOperationDetailsChange(operationDetailsEvent)
      }

      // Call the original onSave function to save everything
      await onSave()

      // If we have prescriptions and they've been modified, update them separately
      if (prescriptionsArray.length > 0 && showDischargePrescription) {
        // Instead of merging, replace the existing prescriptions with the new ones
        // This prevents duplication when editing

        // Update prescriptions in the database
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        await api.updateInPatient(selectedInPatient.id, {
          prescriptions: prescriptionsArray
        })

        toast.success('Prescription updated successfully')
      }

      // Reset prescription form
      setFormData({})
      setVisiblePrescriptions(1)
      setShowDischargePrescription(false)
    } catch (error) {
      console.error('Error saving operation details with prescriptions:', error)
      toast.error('An error occurred while saving')
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl transform overflow-y-auto max-h-[90vh] rounded-lg bg-white p-6 shadow-xl transition-all">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {selectedInPatient &&
            (selectedInPatient.operationName || selectedInPatient.operationDetails)
              ? 'Edit Operation'
              : 'Add Operation Details'}
          </Dialog.Title>
          {selectedInPatient && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Patient: {selectedInPatient.name}</p>
              <p className="text-sm text-gray-500">ID: {selectedInPatient.patientId}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex space-x-4 w-full">
              <div className="w-1/2">
                <label
                  htmlFor="operationName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Operation Name
                </label>
                <input
                  type="text"
                  id="operationName"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter operation name"
                  value={operationDetails.operationName}
                  onChange={onOperationDetailsChange}
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="operationDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Operation Date
                </label>
                <input
                  type="date"
                  id="operationDate"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={operationDetails.operationDate.split('T')[0]}
                  onChange={onOperationDetailsChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="operationDetails"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Operation Details
              </label>
              <textarea
                id="operationDetails"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter detailed information about the operation"
                value={operationDetails.operationDetails}
                onChange={onOperationDetailsChange}
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="operationProcedure"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Operation Procedure
              </label>
              <textarea
                id="operationProcedure"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the operation procedure in detail"
                value={operationDetails.operationProcedure}
                onChange={onOperationDetailsChange}
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="provisionDiagnosis"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Provision Diagnosis
              </label>
              <textarea
                id="provisionDiagnosis"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter provision diagnosis information"
                value={operationDetails.provisionDiagnosis}
                onChange={onOperationDetailsChange}
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="followUpDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Follow-up Date
              </label>
              <input
                type="date"
                id="followUpDate"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={operationDetails.followUpDate || ''}
                onChange={onOperationDetailsChange}
              />
            </div>

            {/* Render Discharge Prescription Form when showDischargePrescription is true */}
            {showDischargePrescription && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Discharge Prescription</h3>
                <form
                  id="discharge-prescription-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Prescription Section */}
                  <div className="border border-gray-200 p-4 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>

                    {/* Dynamic Prescription Fields */}
                    {Array.from({ length: visiblePrescriptions }).map((_, index) => (
                      <div
                        key={`prescription-${index + 1}`}
                        className="mb-4 p-3 border border-gray-200 bg-blue-50 rounded-md"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Prescription {index + 1}</h4>
                          {visiblePrescriptions > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePrescription(index)}
                              className="text-gray-500 hover:text-red-500 focus:outline-none"
                              title="Remove prescription"
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
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Prescription */}
                          <div>
                            <label
                              htmlFor={`PRESCRIPTION${index + 1}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Prescription {index + 1}
                            </label>
                            <EditableCombobox
                              id={`PRESCRIPTION ${index + 1}`}
                              name={`PRESCRIPTION ${index + 1}`}
                              value={(formData[`PRESCRIPTION ${index + 1}`] as string) || ''}
                              options={medicineOptionss}
                              onChange={handleChange}
                              placeholder="Select or type medicine name, dosage..."
                              className="bg-white"
                            />
                          </div>

                          {/* Days */}
                          <div>
                            <label
                              htmlFor={`DAYS ${index + 1}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Days {index + 1}
                            </label>
                            <input
                              type="text"
                              name={`DAYS ${index + 1}`}
                              id={`DAYS ${index + 1}`}
                              value={(formData[`DAYS ${index + 1}`] as string) || ''}
                              onChange={handleChange}
                              className="block w-full border border-gray-300 bg-white rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          {/* Timing */}
                          <div>
                            <label
                              htmlFor={`TIMING ${index + 1}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              Timing {index + 1}
                            </label>
                            <EditableCombobox
                              id={`TIMING ${index + 1}`}
                              name={`TIMING ${index + 1}`}
                              options={timingOptions}
                              value={(formData[`TIMING ${index + 1}`] as string) || ''}
                              onChange={handleChange}
                              placeholder="Select or type timing..."
                              className="bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add More Prescription Button */}
                    {visiblePrescriptions < 10 && (
                      <button
                        type="button"
                        onClick={() => setVisiblePrescriptions((prev) => Math.min(prev + 1, 10))}
                        className="mt-2 flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-black"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add More Prescription
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            <div className="flex justify-between space-x-3 pt-4 border-t">
              <div className="">
                <button
                  type="button"
                  onClick={() => setShowDischargePrescription(!showDischargePrescription)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {showDischargePrescription ? 'Hide Prescription Form' : 'Add Prescription'}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default OperationDetailsModal
