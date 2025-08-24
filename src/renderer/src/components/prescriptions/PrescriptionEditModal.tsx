import React, { useState, useEffect } from 'react'
import ReceiptForm, { Patient as ReceiptFormPatient } from './ReceiptForm'
import CombinedForm from './CombinedForm'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

interface PrescriptionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (prescription: Prescription) => Promise<void>
  prescription: Prescription | null
  prescriptionCount: number
  // Optional function to refresh the prescription data
  onRefresh?: () => Promise<Prescription | null>
}

const PrescriptionEditModal: React.FC<PrescriptionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prescription,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'prescription' | 'receipt' | 'readings'>(
    'prescription'
  )

  // Create receipt data from prescription data
  const [receiptData, setReceiptData] = useState<Record<string, unknown>>({})
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Function to initialize receipt data from prescription
  const initializeReceiptData = (prescriptionData: Prescription): void => {
    setReceiptData({
      // Keep all original prescription data
      ...prescriptionData,
      // Ensure these specific receipt fields are included
      'RECEIPT NO': prescriptionData['RECEIPT NO'] || '',
      'PAID FOR': prescriptionData['PAID FOR'] || '',
      MODE: prescriptionData['MODE'] || 'Cash',
      'TOTAL AMOUNT': prescriptionData['TOTAL AMOUNT'] || '',
      'ADVANCE PAID': prescriptionData['ADVANCE PAID'] || '0',
      'AMOUNT RECEIVED': prescriptionData['AMOUNT RECEIVED'] || '',
      'DISCOUNT PERCENTAG': prescriptionData['DISCOUNT PERCENTAG'] || '0',
      'DISCOUNT AMOUNT': prescriptionData['DISCOUNT AMOUNT'] || '0',
      'AMOUNT DUE': prescriptionData['AMOUNT DUE'] || ''
    })
  }

  // Handle refreshing the prescription data
  const handleRefresh = async (): Promise<void> => {
    try {
      setRefreshing(true)

      // If onRefresh prop is provided and we have a prescription
      if (onRefresh && prescription) {
        const freshPrescription = await onRefresh()
        if (freshPrescription) {
          // Re-initialize receipt data with the fresh prescription data
          initializeReceiptData(freshPrescription)
        }
      } else {
        // Fallback to refreshing from API directly
        if (prescription?.id) {
          // Get the latest prescription data from the API
          const response = await window.api.getPrescriptionsById(prescription.id)
          if (response) {
            // Cast the response to the correct type
            const prescriptionData = response as unknown as { data: typeof prescription }
            // Re-initialize receipt data with the fresh prescription data
            initializeReceiptData(prescriptionData.data)
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing prescription data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (prescription) {
      // Initialize receipt data with prescription data
      initializeReceiptData(prescription)
    }
  }, [prescription])

  if (!isOpen || !prescription) return null

  const handleSubmit = async (updatedPrescription: Record<string, unknown>): Promise<void> => {
    // Ensure we keep the original ID
    const prescriptionWithId = {
      ...updatedPrescription,
      id: prescription?.id
    } as Prescription

    await onSave(prescriptionWithId)
    onClose()
  }

  // Convert prescription to patient format for receipt form
  const convertToReceiptFormPatient = (prescription: Prescription): ReceiptFormPatient => {
    return {
      id: prescription.id as string,
      patientId: (prescription['PATIENT ID'] as string) || '',
      name: (prescription['PATIENT NAME'] as string) || '',
      guardian: (prescription['GUARDIAN NAME'] as string) || '',
      phone: (prescription['PHONE NUMBER'] as string) || '',
      age: (prescription.AGE as string) || '',
      gender: (prescription.GENDER as string) || '',
      address: (prescription.ADDRESS as string) || '',
      dob: (prescription.DOB as string) || '',
      date: (prescription.DATE as string) || '',
      doctorName: (prescription['DOCTOR NAME'] as string) || '',
      department: (prescription.DEPARTMENT as string) || '',
      referredBy: (prescription['REFERRED BY'] as string) || ''
    }
  }

  const patient = convertToReceiptFormPatient(prescription)

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
                {/* Header with inline tab buttons and save button */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  {/* Tabs for switching between forms */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('prescription')}
                        className={`${
                          activeTab === 'prescription'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Prescription Form
                      </button>
                      <button
                        onClick={() => setActiveTab('receipt')}
                        className={`${
                          activeTab === 'receipt'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Cash Receipt Form
                      </button>
                    </nav>
                  </div>

                  <div>
                    <h1 className="text-lg font-bold">{`${prescription?.['PATIENT NAME']}/${prescription?.['AGE']}`}</h1>
                  </div>

                  {/* Save button aligned to the right */}
                  {activeTab === 'prescription' && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="ml-3 inline-flex justify-center cursor-pointer rounded-md shadow-sm px-4 py-2 text-base font-medium text-black border border-gray-300 sm:text-sm"
                      >
                        {refreshing ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <svg
                              className="-ml-1 mr-2 h-4 w-4 text-gray-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Refresh
                          </>
                        )}
                      </button>{' '}
                      <button
                        type="button"
                        onClick={() => {
                          // Trigger form submission via ref or other method
                          document
                            .querySelector('form')
                            ?.dispatchEvent(
                              new Event('submit', { cancelable: true, bubbles: true })
                            )
                        }}
                        className="ml-3 inline-flex justify-center cursor-pointer rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                  {/* Prescription Form Tab */}
                  {activeTab === 'prescription' && (
                    <CombinedForm
                      onSubmit={handleSubmit}
                      onCancel={onClose}
                      initialData={prescription}
                      selectedPatient={patient}
                      key={JSON.stringify(prescription)} // Add key to force re-render when prescription changes
                    />
                  )}

                  {/* Cash Receipt Form Tab */}
                  {activeTab === 'receipt' && (
                    <ReceiptForm
                      onSubmit={handleSubmit}
                      onCancel={onClose}
                      selectedPatient={patient}
                      patients={[patient]}
                      initialData={receiptData}
                      type="prescriptionedit"
                      key={JSON.stringify(receiptData)} // Add key to force re-render when receiptData changes
                    />
                  )}
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

export default PrescriptionEditModal
