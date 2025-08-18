import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Define the LabTest type for categorizing lab tests
type LabTest = {
  name: string
  amount: string
  type: 'vennela' | 'lab'
}

// Patient type is no longer needed since we're working directly with prescriptions

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  'PATIENT ID': string
  'PATIENT NAME': string
  [key: string]: unknown
}

// Define props for the component
interface TodaysPrescriptionLabsProps {
  onCreateLab: (prescription: Prescription) => void
}

// Define the standardized response type
interface StandardizedResponse<T> {
  success: boolean
  data?: T
  message?: string
}

const TodaysPrescriptionLabs: React.FC<TodaysPrescriptionLabsProps> = ({ onCreateLab }) => {
  const [todaysPrescriptionLabs, setTodaysPrescriptionLabs] = useState<Prescription[]>([])
  const [isLoadingPrescriptionLabs, setIsLoadingPrescriptionLabs] = useState<boolean>(false)

  // Predefined lab tests with their types and amounts
  const predefinedLabTests: LabTest[] = [
    { name: 'IOP', amount: '400', type: 'vennela' },
    { name: 'SYRINGYING', amount: '400 (BE 800)', type: 'vennela' },
    { name: '2%XST', amount: '100', type: 'vennela' },
    { name: 'DLT BE I/O', amount: '400', type: 'vennela' },
    { name: 'BE CYCLOPENT', amount: '400', type: 'vennela' },
    { name: 'SCHIMERS TEST', amount: '150', type: 'vennela' },
    { name: 'FLOURESCIN STAIN', amount: '150', type: 'vennela' },
    { name: 'KERATOMETRIC', amount: '400', type: 'vennela' },
    { name: 'ANTERIOR PHOTOGRAPHY', amount: '500 (BE 1000)', type: 'vennela' },
    { name: 'A SCAN', amount: '500', type: 'vennela' },
    { name: 'GONIO', amount: '500', type: 'vennela' },
    { name: 'OFI', amount: '1000', type: 'vennela' },
    { name: 'BE OCT', amount: '3000 (ONE EYE 2500)', type: 'vennela' },
    { name: 'FIELDS', amount: '3500', type: 'vennela' },
    { name: 'FFA', amount: '2500', type: 'vennela' },
    { name: 'PANAROMA', amount: '1500 (BE 3000)', type: 'vennela' },
    { name: 'GLUCOMA EVALUTION', amount: '8900', type: 'vennela' },
    { name: 'CBP', amount: '250', type: 'lab' },
    { name: 'RBS', amount: '100', type: 'lab' },
    { name: 'FBS', amount: '100', type: 'lab' },
    { name: 'PLBS', amount: '100', type: 'lab' },
    { name: 'BT', amount: '50', type: 'lab' },
    { name: 'CT', amount: '50', type: 'lab' },
    { name: 'HIV', amount: '450', type: 'lab' },
    { name: 'HBsAg', amount: '500', type: 'lab' },
    { name: 'HBA1C', amount: '600', type: 'lab' },
    { name: 'HCV', amount: '300', type: 'lab' },
    { name: 'CUE', amount: '100', type: 'lab' },
    { name: 'URINE-MICRO', amount: '100', type: 'lab' },
    { name: 'ESR', amount: '100', type: 'lab' },
    { name: 'BLOOD UREA', amount: '300', type: 'lab' },
    { name: 'S.CREATININE', amount: '250', type: 'lab' },
    { name: 'S.BILIRUBIN', amount: '300', type: 'lab' },
    { name: 'LIPID PROFILE', amount: '600', type: 'lab' },
    { name: 'VRDL', amount: '400', type: 'lab' },
    { name: 'MANTOUX', amount: '800', type: 'lab' },
    { name: 'X-RAY-CHEST', amount: '350', type: 'lab' },
    { name: 'X-RAY-PNS', amount: '350', type: 'lab' },
    { name: 'ECG', amount: '300', type: 'lab' },
    { name: 'CORNEAL SMEAR', amount: '', type: 'lab' },
    { name: 'CULTURE & SENSITIVITY', amount: '1800', type: 'lab' },
    { name: 'CRP', amount: '500', type: 'lab' }
  ]

  // Load today's prescriptions with lab advice
  const loadTodaysPrescriptionLabs = async (): Promise<void> => {
    try {
      setIsLoadingPrescriptionLabs(true)

      if (!window.api || !window.api.getTodaysPrescriptions) {
        console.error('API method getTodaysPrescriptions not available')
        toast.error('API method not available')
        setIsLoadingPrescriptionLabs(false)
        return
      }

      const response = await window.api.getTodaysPrescriptions()

      // Handle standardized response format
      if (response && typeof response === 'object' && 'success' in response) {
        const standardizedResponse = response as StandardizedResponse<Prescription[]>
        if (standardizedResponse.success && standardizedResponse.data) {
          // Get all prescriptions with any advice fields
          const prescriptionsWithAdvice = standardizedResponse.data.filter((prescription) => {
            // Check if any ADVICE field exists and has content
            for (let i = 1; i <= 10; i++) {
              const adviceKey = `ADVICE ${i}` as keyof Prescription
              const advice = prescription[adviceKey] as string
              if (advice && typeof advice === 'string' && advice.trim() !== '') {
                return true
              }
            }
            return false
          })

          setTodaysPrescriptionLabs(prescriptionsWithAdvice)
        } else {
          console.error("Error fetching today's prescriptions:", standardizedResponse.message)
          toast.error(standardizedResponse.message || 'Failed to fetch prescriptions')
        }
      } else if (Array.isArray(response)) {
        // Get all prescriptions with any advice fields
        const prescriptionsWithAdvice = (response as Prescription[]).filter((prescription) => {
          // Check if any ADVICE field exists and has content
          for (let i = 1; i <= 10; i++) {
            const adviceKey = `ADVICE ${i}` as keyof Prescription
            const advice = prescription[adviceKey] as string
            if (advice && typeof advice === 'string' && advice.trim() !== '') {
              return true
            }
          }
          return false
        })

        setTodaysPrescriptionLabs(prescriptionsWithAdvice)
      } else {
        console.error("Invalid today's prescriptions data format:", response)
        toast.error('Invalid data format received')
      }
    } catch (error) {
      console.error("Error loading today's prescription labs:", error)
      toast.error('Failed to load prescription labs')
    } finally {
      setIsLoadingPrescriptionLabs(false)
    }
  }

  // Helper function to identify and categorize lab tests from prescription advice
  const identifyLabTests = (advice: string): LabTest[] => {
    // Skip advice containing "investigations" word
    if (advice.toLowerCase().includes('investigations')) {
      return []
    }

    const foundTests: LabTest[] = []
    let matchFound = false

    // Check each predefined test to see if it's mentioned in the advice
    predefinedLabTests.forEach((test) => {
      // Case insensitive search for the test name in the advice
      const testNameLower = test.name.toLowerCase()
      const adviceLower = advice.toLowerCase()

      // Check if the test name appears as a whole word or phrase in the advice
      if (adviceLower === testNameLower) {
        foundTests.push(test)
        matchFound = true
      }
    })

    // If no match found, create a default lab test with the advice as name
    if (!matchFound) {
      foundTests.push({
        name: advice,
        amount: '0',
        type: 'lab'
      })
    }

    return foundTests
  }

  // Helper function to extract and categorize lab tests from a prescription
  const extractCategorizedLabTests = (
    prescription: Prescription
  ): { vennelaTests: LabTest[]; labTests: LabTest[]; hasOnlyInvestigations: boolean } => {
    const allTests: LabTest[] = []
    const vennelaTests: LabTest[] = []
    const labTests: LabTest[] = []
    let adviceCount = 0
    let investigationAdviceCount = 0

    // Check each ADVICE field
    for (let i = 1; i <= 10; i++) {
      const adviceKey = `ADVICE ${i}` as keyof Prescription
      const advice = prescription[adviceKey] as string

      if (advice && advice.trim() !== '') {
        adviceCount++

        // Check if this advice contains investigation word
        if (advice.toLowerCase().includes('investigation')) {
          investigationAdviceCount++
          continue // Skip this advice
        }

        // Find any predefined tests mentioned in this advice
        const testsInAdvice = identifyLabTests(advice)
        allTests.push(...testsInAdvice)
      }
    }

    // Remove duplicates by name (keep the first occurrence)
    const uniqueTests = allTests.filter(
      (test, index, self) => index === self.findIndex((t) => t.name === test.name)
    )

    // Categorize tests by type
    uniqueTests.forEach((test) => {
      if (test.type === 'vennela') {
        vennelaTests.push(test)
      } else {
        labTests.push(test)
      }
    })

    // Check if all advice entries were investigation-related
    const hasOnlyInvestigations = adviceCount > 0 && adviceCount === investigationAdviceCount

    return { vennelaTests, labTests, hasOnlyInvestigations }
  }

  // Helper function to create a new lab from prescription advice
  const createLabFromPrescription = (prescription: Prescription): void => {
    // Call the parent component's handler to create a lab directly with the prescription
    onCreateLab(prescription)
  }

  // Load today's prescription labs on component mount
  useEffect(() => {
    loadTodaysPrescriptionLabs()
  }, [])

  // Refresh data when the refresh button is clicked
  const handleRefresh = (): void => {
    loadTodaysPrescriptionLabs()
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-8 bg-white p-4 rounded-lg border border-blue-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Prescription Labs</h2>
        <button
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          disabled={isLoadingPrescriptionLabs}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 ${isLoadingPrescriptionLabs ? 'animate-spin' : ''}`}
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
          {isLoadingPrescriptionLabs ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoadingPrescriptionLabs ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : todaysPrescriptionLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysPrescriptionLabs.map((prescription, index) => {
            const patientId = prescription['PATIENT ID'] as string
            const patientName = prescription['PATIENT NAME'] as string
            const { vennelaTests, labTests, hasOnlyInvestigations } =
              extractCategorizedLabTests(prescription)

            // Skip rendering this card if it only contains investigation advice and no actual lab tests
            if (hasOnlyInvestigations || (vennelaTests.length === 0 && labTests.length === 0)) {
              return null
            }

            return (
              <div
                key={`prescription-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow h-full flex flex-col relative"
              >
                {/* Card Header with Patient Info and Create Lab Button */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 flex justify-between items-center border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Patient ID: {patientId}</p>
                    <p className="font-semibold text-gray-800 truncate">{patientName}</p>
                  </div>
                  <button
                    onClick={() => createLabFromPrescription(prescription)}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Lab
                  </button>
                </div>

                {/* Card Body with Tests */}
                <div className="p-4 flex-grow">
                  {(() => {
                    return (
                      <>
                        {vennelaTests.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs uppercase tracking-wider font-bold text-blue-800 mb-2 border-b pb-1 border-blue-100">
                              Vennela Tests
                            </p>
                            <ul className="space-y-1.5">
                              {vennelaTests.map((test, index) => (
                                <li
                                  key={`vennela-${index}`}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-blue-700 font-medium">{test.name}</span>
                                  {test.amount && (
                                    <span className="text-gray-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full">
                                      ₹{test.amount}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {labTests.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-blue-800 mb-2 border-b pb-1 border-blue-100">
                              Lab Tests
                            </p>
                            <ul className="space-y-1.5">
                              {labTests.map((test, index) => (
                                <li
                                  key={`lab-${index}`}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-blue-700 font-medium">{test.name}</span>
                                  {test.amount && test.amount !== '0' && (
                                    <span className="text-gray-600 text-xs bg-blue-50 px-2 py-0.5 rounded-full">
                                      ₹{test.amount}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {vennelaTests.length === 0 && labTests.length === 0 && (
                          <div className="flex items-center justify-center h-24">
                            <p className="text-sm text-gray-500 italic">No lab tests found</p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No prescription labs found for today</p>
        </div>
      )}
    </div>
  )
}

export default TodaysPrescriptionLabs
