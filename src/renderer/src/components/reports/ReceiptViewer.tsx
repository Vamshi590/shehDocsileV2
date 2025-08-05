import React from 'react'
import CashReceipt from '../reciepts/Reciept'
import PrescriptionReceipt from '../reciepts/PrescriptionReciept'
import ReadingsReceipt from '../reciepts/ReadingsReciept'
import OperationReceipt from '../reciepts/OperationReciept'
import ClinicalFindingsReceipt from '../reciepts/ClinicalFindingsReciept'
import ReadingsandFindings from '../reciepts/ReadingsandFindings'
import LabReceipt from '../reciepts/LabReceipt'
import VennelaLabReceipt from '../reciepts/VennelaLabReceipt'
import DischargeSummary from '../reciepts/DischargeSummary'

// Define the Prescription type
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
  [key: string]: unknown
}

interface Operation {
  id: string
  patientId: string
  patientName: string
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
  billNumber?: string
  [key: string]: unknown
}

interface ReceiptViewerProps {
  report: Prescription | Operation
  receiptType: string
  selectedOperation?: Operation
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  report,
  receiptType,
  selectedOperation
}) => {
  // Format the patient data for the receipts
  console.log('report', report)
  const patientData = {
    receiptNo: String(report['RECEIPT NO'] || report.id || '').substring(0, 8),
    billNumber: String(report.receiptId || report.id || '').substring(0, 8),
    patientId: String(report.patientId || report['PATIENT ID'] || ''),
    date: String(report.date || report.DATE || new Date().toISOString().split('T')[0]),
    patientName: String(
      report.patientName || report['patientName'] || report['PATIENT NAME'] || ''
    ),
    gender: String(report.gender || report.GENDER || ''),
    guardianName: String(
      report.guardianName || report['guardian'] || report['GUARDIAN NAME'] || ''
    ),
    age: String(report.age || report.AGE || ''),
    address: String(report.address || report.ADDRESS || ''),
    mobile: String(report.phone || report['PHONE NUMBER'] || ''),
    referredBy: String(report.referredBy || report['REFFERED BY'] || report['referredBy'] || ''),
    doctorName: String(report.doctorName || report['DOCTOR NAME'] || 'Dr. CH. SRILATHA'),
    department: String(report.department || report.DEPARTMENT || 'OPHTHALMOLOGY')
  }

  const paymentData = {
    paidFor: String(report.paidFor || report['PAID FOR'] || ''),
    mode: String(report.PAYMENT_METHOD || report['MODE'] || ''),
    totalAmount: Number(report.AMOUNT || report['TOTAL AMOUNT'] || 0),
    advancePaid: Number(report.advancePaid || report['ADVANCE PAID'] || 0),
    discountPercent: Number(report.discountPercent || report['DISCOUNT PERCENT'] || 0),
    discountAmount: Number(report.discountAmount || report['DISCOUNT AMOUNT'] || 0),
    amountReceived: Number(
      report.amountReceived || report['AMOUNT RECEIVED'] || report.AMOUNT || report.amount || 0
    ),
    amountDue: Number(report.amountDue || report['AMOUNT DUE'] || 0)
  }

  // Format prescription data
  type MedicineData = { medicine: string; times: string; days: string }
  const prescriptionData: MedicineData[] = []

  // Check for prescriptions from 1 to 10 and add them if they exist
  for (let i = 1; i <= 10; i++) {
    const prescriptionKey = `PRESCRIPTION ${i}`
    const timesKey = `TIMING ${i}`
    const daysKey = `DAYS ${i}`

    // If any of the prescription data exists for this index, add it
    if (report[prescriptionKey] || report[timesKey] || report[daysKey]) {
      prescriptionData.push({
        medicine: String(report[prescriptionKey] || ''),
        times: String(report[timesKey] || '1-0-1'),
        days: String(report[daysKey] || '7')
      })
    }
  }
  // Format vitals data
  const vitalsData = {
    temperature: String(report.temperature || report['TEMPARATURE'] || ''),
    pulseRate: String(report.pulseRate || report['P.R.'] || ''),
    spo2: String(report.spo2 || report['SPO2'] || '')
  }

  // Format medical history data
  const medicalHistoryData = {
    presentComplaint: String(report.presentComplaint || report['PRESENT COMPLAIN'] || ''),
    previousHistory: String(report.previousHistory || report['PREVIOUS HISTORY'] || ''),
    others: String(report.others || report.OTHERS || '')
  }

  // Format eye readings data
  const eyeReadingsData = {
    rightEye: {
      sph: String(report.rightEyeSph || report.RIGHT_EYE_SPH || ''),
      cyl: String(report.rightEyeCyl || report.RIGHT_EYE_CYL || ''),
      axis: String(report.rightEyeAxis || report.RIGHT_EYE_AXIS || ''),
      va: String(report.rightEyeVa || report.RIGHT_EYE_VA || ''),
      vacPh: String(report.rightEyeVacPh || report.RIGHT_EYE_VAC_PH || '')
    },
    leftEye: {
      sph: String(report.leftEyeSph || report.LEFT_EYE_SPH || ''),
      cyl: String(report.leftEyeCyl || report.LEFT_EYE_CYL || ''),
      axis: String(report.leftEyeAxis || report.LEFT_EYE_AXIS || ''),
      va: String(report.leftEyeVa || report.LEFT_EYE_VA || ''),
      vacPh: String(report.leftEyeVacPh || report.LEFT_EYE_VAC_PH || '')
    },
    notes: String(report.eyeReadingsNotes || report.EYE_READINGS_NOTES || '')
  }

  // Collect all advice entries
  const adviceData: string[] = []

  // Check for advices from 1 to 10 and add them if they exist
  for (let i = 1; i <= 10; i++) {
    const adviceKey = `ADVICE ${i}`
    if (report[adviceKey]) {
      adviceData.push(String(report[adviceKey] || ''))
    }
  }

  // If no numbered advices were found, check for legacy format
  if (adviceData.length === 0 && (report.advice || report.ADVICE)) {
    adviceData.push(String(report.advice || report.ADVICE || ''))
  }

  // Format operation data - prioritize selectedOperation if available
  const operationData = {
    operationType: String(
      selectedOperation?.operationDetails || report.operationType || report['OPERATION_TYPE'] || ''
    ),
    operationDate: String(
      selectedOperation?.dateOfOperation || report.operationDate || report['OPERATION_DATE'] || ''
    ),
    anesthesia: String(report.anesthesia || report.ANESTHESIA || ''),
    surgeon: String(selectedOperation?.operatedBy || report.surgeon || report.SURGEON || ''),
    assistant: String(report.assistant || report.ASSISTANT || ''),
    findings: String(
      selectedOperation?.provisionDiagnosis || report.findings || report.FINDINGS || ''
    ),
    procedure: String(
      selectedOperation?.operationProcedure || report.procedure || report.PROCEDURE || ''
    ),
    complications: String(report.complications || report.COMPLICATIONS || ''),
    dateOfAdmit: String(
      selectedOperation?.dateOfAdmit || report.dateOfAdmit || report['DATE_OF_ADMIT'] || ''
    ),
    dateOfDischarge: String(
      selectedOperation?.dateOfDischarge ||
        report.dateOfDischarge ||
        report['DATE_OF_DISCHARGE'] ||
        ''
    ),
    dateOfOperation: String(
      selectedOperation?.dateOfOperation ||
        report.dateOfOperation ||
        report['DATE_OF_OPERATION'] ||
        ''
    ),
    billNumber: String(
      selectedOperation?.billNumber || report.billNumber || report.BILL_NUMBER || ''
    )
  }

  // Helper function to parse prescription data from JSON
  const parsePrescriptionDataFromJson = (
    jsonString: string
  ): { medicine: string; times: string; days: string }[] => {
    try {
      // Handle empty or invalid input
      if (!jsonString || typeof jsonString !== 'string') {
        console.log('Invalid prescription data input:', jsonString)
        return []
      }

      // Try to parse the JSON string
      let parsed
      try {
        parsed = JSON.parse(jsonString)
        console.log('Successfully parsed prescription data:', parsed)
      } catch (parseError) {
        console.error('Error parsing JSON string:', parseError)
        return []
      }

      let result: { medicine: string; times: string; days: string }[] = []

      // Check if parsed data is an array
      if (Array.isArray(parsed)) {
        // Use the array directly
        result = parsed.map((item) => ({
          medicine: String(item.medicine || ''),
          times: String(item.times || '1-0-1'),
          days: String(item.days || '7')
        }))
      } else if (parsed && typeof parsed === 'object') {
        // Check if the object has a prescriptionData field that's an array
        if (parsed.prescriptionData && Array.isArray(parsed.prescriptionData)) {
          result = parsed.prescriptionData.map((item) => ({
            medicine: String(item.medicine || ''),
            times: String(item.times || '1-0-1'),
            days: String(item.days || '7')
          }))
        } else {
          // Handle object format with numbered fields (e.g., PRESCRIPTION 1, TIMING 1)
          for (let i = 1; i <= 10; i++) {
            // Check for different key formats with case insensitivity
            const medicineKey = Object.keys(parsed).find(
              (key) =>
                key.toUpperCase() === `PRESCRIPTION${i}` ||
                key.toUpperCase() === `PRESCRIPTION ${i}` ||
                key.toUpperCase() === `MEDICINE${i}` ||
                key.toUpperCase() === `MEDICINE ${i}`
            )

            const timesKey = Object.keys(parsed).find(
              (key) =>
                key.toUpperCase() === `TIMING${i}` ||
                key.toUpperCase() === `TIMING ${i}` ||
                key.toUpperCase() === `TIMES${i}` ||
                key.toUpperCase() === `TIMES ${i}`
            )

            const daysKey = Object.keys(parsed).find(
              (key) =>
                key.toUpperCase() === `DAYS${i}` ||
                key.toUpperCase() === `DAYS ${i}` ||
                key.toUpperCase() === `DURATION${i}` ||
                key.toUpperCase() === `DURATION ${i}`
            )

            const medicineValue = medicineKey ? parsed[medicineKey] : null
            const timesValue = timesKey ? parsed[timesKey] : null
            const daysValue = daysKey ? parsed[daysKey] : null

            if (medicineValue || timesValue || daysValue) {
              result.push({
                medicine: String(medicineValue || ''),
                times: String(timesValue || '1-0-1'),
                days: String(daysValue || '7')
              })
            }
          }
        }
      }

      console.log('Final parsed prescription data:', result)
      return result
    } catch (error) {
      console.error('Error in parsePrescriptionDataFromJson:', error)
      return []
    }
  }
  const dischargeData = {
    operationDetails: String(report.operationDetails || report.OPERATION_DETAILS || ''),
    operationProcedure: String(report.operationProcedure || report.OPERATION_PROCEDURE || ''),
    diagnosis: String(report.provisionDiagnosis || report.PROVISION_DIAGNOSIS || ''),
    billNumber: String(report.billNumber || report.BILL_NUMBER || ''),
    dateOfAdmit: String(report.dateOfAdmit || report.DATE_OF_ADMIT || ''),
    dateOfDischarge: String(report.dateOfDischarge || report.DATE_OF_DISCHARGE || ''),
    dateOfOperation: String(report.dateOfOperation || report.DATE_OF_OPERATION || '')
  }

  // Format billing items for operation receipt
  const billingItems: { particulars: string; amount: number; days?: number }[] = []
  // If we have a selected operation, use its part/amount fields
  if (selectedOperation) {
    for (let i = 1; i <= 10; i++) {
      const partKey = `part${i}`
      const amountKey = `amount${i}`
      const daysKey = `days${i}`

      if (selectedOperation[partKey] && selectedOperation[amountKey]) {
        // Check if days field exists and has a value
        const days = selectedOperation[daysKey] ? Number(selectedOperation[daysKey]) : undefined

        billingItems.push({
          particulars: String(selectedOperation[partKey] || ''),
          amount: Number(selectedOperation[amountKey] || 0),
          days: days && days > 0 ? days : undefined
        })
      }
    }
  } else {
    // Fall back to report data if no selected operation
    for (let i = 1; i <= 10; i++) {
      const particularKey = `BILLING_ITEM_${i}`
      const amountKey = `BILLING_AMOUNT_${i}`
      const daysKey = `BILLING_DAYS_${i}`

      if (report[particularKey] && report[amountKey]) {
        // Check for days field in various formats
        const days = report[daysKey] || report[`DAYS_${i}`] || report[`days${i}`]

        billingItems.push({
          particulars: String(report[particularKey] || ''),
          amount: Number(report[amountKey] || 0),
          days: days ? Number(days) : undefined
        })
      }
    }
  }

  const operationBillingData = {
    totalAmount: Number(
      selectedOperation?.totalAmount ||
        selectedOperation?.['totalAmount'] ||
        report.totalAmount ||
        report['totalAmount'] ||
        report['TOTAL AMOUNT'] ||
        0
    ),
    advancePaid: Number(
      selectedOperation?.advancePaid ||
        selectedOperation?.['ADVANCE PAID'] ||
        report.advancePaid ||
        report['ADVANCE PAID'] ||
        0
    ),
    discountPercent: Number(
      selectedOperation?.discountPercent ||
        selectedOperation?.['DISCOUNT_PERCENT'] ||
        report.discountPercent ||
        report['DISCOUNT_PERCENT'] ||
        0
    ),
    discountAmount: Number(
      selectedOperation?.discountAmount ||
        selectedOperation?.['DISCOUNT_AMOUNT'] ||
        report.discountAmount ||
        report['DISCOUNT_AMOUNT'] ||
        0
    ),
    amountReceived: Number(
      selectedOperation?.amountReceived ||
        selectedOperation?.['AMOUNT_RECEIVED'] ||
        report.amountReceived ||
        report['AMOUNT_RECEIVED'] ||
        0
    ),
    balance: Number(
      selectedOperation?.balance ||
        selectedOperation?.['BALANCE'] ||
        report.balance ||
        report['BALANCE'] ||
        0
    )
  }

  const arReadingData = {
    rightEye: {
      sph: String(report['AR-RE-SPH'] || ''),
      cyl: String(report['AR-RE-CYL'] || ''),
      axis: String(report['AR-RE-AXIS'] || ''),
      va: String(report['AR-RE-VA'] || ''),
      vacPh: String(report['AR-RE-VAC.P.H'] || '')
    },
    leftEye: {
      sph: String(report['AR-LE-SPH'] || ''),
      cyl: String(report['AR-LE-CYL'] || ''),
      axis: String(report['AR-LE-AXIS'] || ''),
      va: String(report['AR-LE-VA'] || ''),
      vacPh: String(report['AR-LE-VAC.P.H'] || '')
    }
  }

  const previousGlassPrescription = {
    dist: {
      rightEye: {
        sph: String(report['PGP-RE-D-SPH'] || ''),
        cyl: String(report['PGP-RE-D-CYL'] || ''),
        axis: String(report['PGP-RE-D-AXIS'] || ''),
        va: String(report['PGP-RE-D-VA'] || ''),
        vacPh: String(report['PGP-RE-D-VAC.P.H'] || '')
      },
      leftEye: {
        sph: String(report['PGP-LE-D-SPH'] || ''),
        cyl: String(report['PGP-LE-D-CYL'] || ''),
        axis: String(report['PGP-LE-D-AXIS'] || ''),
        va: String(report['PGP-LE-D-BCVA'] || ''),
        vacPh: String(report['PGP-LE-D-VAC.P.H'] || '')
      }
    },
    near: {
      rightEye: {
        sph: String(report['PGP-RE-N-SPH'] || ''),
        cyl: String(report['PGP-RE-N-CYL'] || ''),
        axis: String(report['PGP-RE-N-AXIS'] || ''),
        va: String(report['PGP-RE-N-VA'] || '')
      },
      leftEye: {
        sph: String(report['PGP-LE-N-SPH'] || ''),
        cyl: String(report['PGP-LE-N-CYL'] || ''),
        axis: String(report['PGP-LE-N-AXIS'] || ''),
        va: String(report['PGP-LE-N-BCVA'] || '')
      }
    }
  }

  const subjectiveRefraction = {
    dist: {
      rightEye: {
        sph: String(report['SR-RE-D-SPH'] || ''),
        cyl: String(report['SR-RE-D-CYL'] || ''),
        axis: String(report['SR-RE-D-AXIS'] || ''),
        va: String(report['SR-RE-D-VA'] || ''),
        vacPh: String(report['SR-RE-D-VAC.P.H'] || '')
      },
      leftEye: {
        sph: String(report['SR-LE-D-SPH'] || ''),
        cyl: String(report['SR-LE-D-CYL'] || ''),
        axis: String(report['SR-LE-D-AXIS'] || ''),
        va: String(report['SR-LE-D-BCVA'] || ''),
        vacPh: String(report['SR-LE-D-VAC.P.H'] || '')
      }
    },
    near: {
      rightEye: {
        sph: String(report['SR-RE-N-SPH'] || ''),
        cyl: String(report['SR-RE-N-CYL'] || ''),
        axis: String(report['SR-RE-N-AXIS'] || ''),
        va: String(report['SR-RE-N-VA'] || '')
      },
      leftEye: {
        sph: String(report['SR-LE-N-SPH'] || ''),
        cyl: String(report['SR-LE-N-CYL'] || ''),
        axis: String(report['SR-LE-N-AXIS'] || ''),
        va: String(report['SR-LE-N-BCVA'] || '')
      }
    }
  }

  // Render the appropriate receipt based on the type
  const renderReceipt = (): React.ReactElement => {
    // Process lab test data from the report for lab receipts
    const labTestData: { test: string; amount: string | number }[] = []

    // Extract lab tests from report (LAB TEST 1 to LAB TEST 10)
    if (receiptType === 'lab') {
      for (let i = 1; i <= 10; i++) {
        const testKey = `LAB TEST ${i}`
        const amountKey = `AMOUNT ${i}`

        if (report[testKey] && report[amountKey]) {
          labTestData.push({
            test: String(report[testKey] || ''),
            amount: Number(report[amountKey] || 0)
          })
        }
      }
    }

    // Create financial data object for lab receipts
    const labFinancialData = {
      totalAmount: Number(report['TOTAL AMOUNT'] || 0),
      discountPercentage: Number(report['DISCOUNT PERCENTAGE'] || 0),
      amountReceived: Number(report['AMOUNT RECEIVED'] || 0),
      amountDue: Number(report['AMOUNT DUE'] || 0)
    }
    switch (receiptType) {
      case 'cash':
        return (
          <div id={`receipt-${report.id}`}>
            <CashReceipt
              patientData={patientData}
              paymentData={paymentData}
              authorizedSignatory={String(report.authorizedSignatory || report.doctorName || '')}
            />
          </div>
        )
      case 'prescription':
        return (
          <div id={`receipt-${report.id}`}>
            <PrescriptionReceipt
              patientData={patientData}
              vitalsData={vitalsData}
              medicalHistoryData={medicalHistoryData}
              prescriptionData={prescriptionData}
              advise={adviceData.length > 0 ? adviceData : ''}
              specialInstructions={String(
                report.specialInstructions || report['SPECIAL_INSTRUCTIONS'] || ''
              )}
              reviewDate={String(report.reviewDate || report['FOLLOW UP DATE'] || '')}
              notes={String(report.notes || report['NOTES'] || '')}
            />
          </div>
        )
      case 'readings':
        return (
          <div id={`receipt-${report.id}`}>
            <ReadingsReceipt
              patientData={patientData}
              arReadingData={arReadingData}
              pd={String(report.PD || report.PD || '')}
              previousGlassPrescription={previousGlassPrescription}
              subjectiveRefraction={subjectiveRefraction}
              sighttype={String(report.sighttype || report.SIGHTTYPE || '')}
              lensType={String(report.lensType || report.LENS_TYPE || '')}
              advise={eyeReadingsData.notes}
            />
          </div>
        )
      case 'operation':
        return (
          <div id={`receipt-${report.id}`}>
            <OperationReceipt
              patientData={{
                ...patientData,
                dateOfAdmit: operationData.dateOfAdmit,
                dateOfDischarge: operationData.dateOfDischarge,
                dateOfOperation: operationData.dateOfOperation
              }}
              operationDetails={operationData.operationType}
              operationProcedure={operationData.procedure}
              diagnosis={operationData.findings}
              billNumber={operationData.billNumber}
              billingItems={billingItems}
              billingData={operationBillingData}
              authorizedSignatory={operationData.surgeon}
            />
          </div>
        )
      case 'clinical':
        return (
          <div id={`receipt-${report.id}`}>
            <ClinicalFindingsReceipt
              data={{
                leftEye: {
                  lids: String(report['CF-LE-LIDS'] || ''),
                  conjunctiva: String(report['CF-LE-CONJUCTIVA'] || ''),
                  cornea: String(report['CF-LE-CORNEA'] || ''),
                  ac: String(report['CF-LE-A.C.'] || ''),
                  iris: String(report['CF-LE-IRIS'] || ''),
                  pupil: String(report['CF-LE-PUPIL'] || ''),
                  lens: String(report['CF-LE-LENS'] || ''),
                  fundus: String(report['CF-LE-FUNDUS'] || ''),
                  opticDisk: String(report['CF-LE-OPTICALDISK'] || ''),
                  macula: String(report['CF-LE-MACULA'] || ''),
                  vessels: String(report['CF-LE-VESSELS'] || ''),
                  retinoscopy: String(report['CF-LE-RETINOSCOPY'] || ''),
                  tension: String(report['CF-LE-TENSION'] || ''),
                  peripheralRetina: String(report['CF-LE-PERIPHERALRETINA'] || ''),
                  retino1: String(report['CF-LE-RETINO 1'] || ''),
                  retino2: String(report['CF-LE-RETINO 2'] || ''),
                  retino3: String(report['CF-LE-RETINO 3'] || ''),
                  retino4: String(report['CF-LE-RETINO 4'] || '')
                },
                rightEye: {
                  lids: String(report['CF-RE-LIDS'] || ''),
                  conjunctiva: String(report['CF-RE-CONJUCTIVA'] || ''),
                  cornea: String(report['CF-RE-CORNEA'] || ''),
                  ac: String(report['CF-RE-A.C.'] || ''),
                  iris: String(report['CF-RE-IRIS'] || ''),
                  pupil: String(report['CF-RE-PUPIL'] || ''),
                  lens: String(report['CF-RE-LENS'] || ''),
                  fundus: String(report['CF-RE-FUNDUS'] || ''),
                  opticDisk: String(report['CF-RE-OPTICALDISK'] || ''),
                  macula: String(report['CF-RE-MACULA'] || ''),
                  vessels: String(report['CF-RE-VESSELS'] || ''),
                  retinoscopy: String(report['CF-RE-RETINOSCOPY'] || ''),
                  tension: String(report['CF-RE-TENSION'] || ''),
                  peripheralRetina: String(report['CF-RE-PERIPHERALRETINA'] || ''),
                  retino1: String(report['CF-RE-RETINO 1'] || ''),
                  retino2: String(report['CF-RE-RETINO 2'] || ''),
                  retino3: String(report['CF-RE-RETINO 3'] || ''),
                  retino4: String(report['CF-RE-RETINO 4'] || '')
                },
                advised: String(report['CF-ADVICE'] || ''),
                reviewDate: String(report['CF-REVIEW-DATE'] || '')
              }}
            />
          </div>
        )
      case 'readingsandfindings':
        return (
          <div id={`receipt-${report.id}`}>
            <ReadingsandFindings
              patientData={patientData}
              arReadingData={arReadingData}
              previousGlassPrescription={previousGlassPrescription}
              subjectiveRefraction={subjectiveRefraction}
              pd={String(report.PD || report.PD || '')}
              sighttype={String(report.sighttype || report.SIGHTTYPE || '')}
              lensType={String(report.lensType || report.LENS_TYPE || '')}
              clinicalFindings={{
                leftEye: {
                  lids: String(report['CF-LE-LIDS'] || ''),
                  conjunctiva: String(report['CF-LE-CONJUCTIVA'] || ''),
                  cornea: String(report['CF-LE-CORNEA'] || ''),
                  ac: String(report['CF-LE-A.C.'] || ''),
                  iris: String(report['CF-LE-IRIS'] || ''),
                  pupil: String(report['CF-LE-PUPIL'] || ''),
                  lens: String(report['CF-LE-LENS'] || ''),
                  fundus: String(report['CF-LE-FUNDUS'] || ''),
                  opticDisk: String(report['CF-LE-OPTICALDISK'] || ''),
                  macula: String(report['CF-LE-MACULA'] || ''),
                  vessels: String(report['CF-LE-VESSELS'] || ''),
                  retinoscopy: String(report['CF-LE-RETINOSCOPY'] || ''),
                  tension: String(report['CF-LE-TENSION'] || ''),
                  peripheralRetina: String(report['CF-LE-PERIPHERALRETINA'] || ''),
                  retino1: String(report['CF-LE-RETINO 1'] || ''),
                  retino2: String(report['CF-LE-RETINO 2'] || ''),
                  retino3: String(report['CF-LE-RETINO 3'] || ''),
                  retino4: String(report['CF-LE-RETINO 4'] || '')
                },
                rightEye: {
                  lids: String(report['CF-RE-LIDS'] || ''),
                  conjunctiva: String(report['CF-RE-CONJUCTIVA'] || ''),
                  cornea: String(report['CF-RE-CORNEA'] || ''),
                  ac: String(report['CF-RE-A.C.'] || ''),
                  iris: String(report['CF-RE-IRIS'] || ''),
                  pupil: String(report['CF-RE-PUPIL'] || ''),
                  lens: String(report['CF-RE-LENS'] || ''),
                  fundus: String(report['CF-RE-FUNDUS'] || ''),
                  opticDisk: String(report['CF-RE-OPTICALDISK'] || ''),
                  macula: String(report['CF-RE-MACULA'] || ''),
                  vessels: String(report['CF-RE-VESSELS'] || ''),
                  retinoscopy: String(report['CF-RE-RETINOSCOPY'] || ''),
                  tension: String(report['CF-RE-TENSION'] || ''),
                  peripheralRetina: String(report['CF-RE-PERIPHERALRETINA'] || ''),
                  retino1: String(report['CF-RE-RETINO 1'] || ''),
                  retino2: String(report['CF-RE-RETINO 2'] || ''),
                  retino3: String(report['CF-RE-RETINO 3'] || ''),
                  retino4: String(report['CF-RE-RETINO 4'] || '')
                }
              }}
            />
          </div>
        )
      case 'lab':
        return (
          <div id={`receipt-${report.id}`}>
            <LabReceipt
              patientData={patientData}
              labTestData={labTestData}
              financialData={labFinancialData}
              remarks={String(report['REMARKS'] || '')}
              reportReadyDate={String(report['REPORT READY DATE'] || '')}
            />
          </div>
        )
      case 'vlab':
        return (
          <div id={`receipt-${report.id}`}>
            <VennelaLabReceipt
              billNumber={String(report.receiptId || report.id || '').substring(0, 8)}
              date={String(report.date || report.DATE || new Date().toISOString().split('T')[0])}
              patientName={String(report.patientName || report['PATIENT NAME'] || '')}
              doctorName={String(report.doctorName || report['DOCTOR NAME'] || '')}
              labData={report}
              discountPercentage={Number(report['VDISCOUNT PERCENT'] || 0)}
              amountReceived={Number(report['VAMOUNT RECEIVED'] || 0)}
              amountDue={Number(report['VAMOUNT DUE'] || 0)}
              totalAmount={Number(report['VTOTAL AMOUNT'] || 0)}
            />
          </div>
        )
      case 'discharge': {
        // Debug the report object to see all available data
        console.log('DISCHARGE REPORT FULL OBJECT:', report)
        console.log('DISCHARGE REPORT prescriptionData:', report.prescriptionData)
        console.log('DISCHARGE REPORT prescriptionData type:', typeof report.prescriptionData)

        // Check if there's prescription data in other fields
        if (report.data) {
          console.log('DISCHARGE REPORT data field:', report.data)
          try {
            if (typeof report.data === 'string') {
              const parsedData = JSON.parse(report.data)
              console.log('DISCHARGE REPORT parsed data field:', parsedData)
              if (parsedData.prescriptionData) {
                console.log('DISCHARGE REPORT data.prescriptionData:', parsedData.prescriptionData)
              }
            }
          } catch (error) {
            console.error('Error parsing report.data:', error)
          }
        }

        // Debug the report object to see what prescription data is available
        console.log('Report object:', report)
        console.log('Report prescriptionData:', report.prescriptionData)
        console.log('Report data:', report.data)

        // Check for legacy prescription fields
        const legacyFields = {}
        for (let i = 1; i <= 10; i++) {
          const medicineKey = `PRESCRIPTION ${i}`
          const timesKey = `TIMING ${i}`
          const daysKey = `DAYS ${i}`
          if (report[medicineKey] || report[timesKey] || report[daysKey]) {
            legacyFields[medicineKey] = report[medicineKey]
            legacyFields[timesKey] = report[timesKey]
            legacyFields[daysKey] = report[daysKey]
          }
        }
        console.log('Legacy prescription fields:', legacyFields)

        // Parse prescription data for discharge summary
        let dischargePrescriptionData: { medicine: string; times: string; days: string }[] = []

        // First try to get prescription data from report.prescriptionData
        if (report.prescriptionData) {
          if (typeof report.prescriptionData === 'string') {
            dischargePrescriptionData = parsePrescriptionDataFromJson(report.prescriptionData)
          } else if (
            typeof report.prescriptionData === 'object' &&
            report.prescriptionData !== null
          ) {
            // Handle case where prescriptionData is already an object with numbered fields
            const prescriptionObj = report.prescriptionData
            const tempPrescriptions: { medicine: string; times: string; days: string }[] = []

            for (let i = 1; i <= 10; i++) {
              const medicineKey = Object.keys(prescriptionObj).find(
                (key) =>
                  key.toUpperCase() === `PRESCRIPTION ${i}` ||
                  key.toUpperCase() === `PRESCRIPTION${i}` ||
                  key.toUpperCase() === `MEDICINE ${i}` ||
                  key.toUpperCase() === `MEDICINE${i}`
              )

              const timesKey = Object.keys(prescriptionObj).find(
                (key) =>
                  key.toUpperCase() === `TIMING ${i}` ||
                  key.toUpperCase() === `TIMING${i}` ||
                  key.toUpperCase() === `TIMES ${i}` ||
                  key.toUpperCase() === `TIMES${i}`
              )

              const daysKey = Object.keys(prescriptionObj).find(
                (key) =>
                  key.toUpperCase() === `DAYS ${i}` ||
                  key.toUpperCase() === `DAYS${i}` ||
                  key.toUpperCase() === `DURATION ${i}` ||
                  key.toUpperCase() === `DURATION${i}`
              )

              if (medicineKey || timesKey || daysKey) {
                tempPrescriptions.push({
                  medicine: String(medicineKey ? prescriptionObj[medicineKey] : ''),
                  times: String(timesKey ? prescriptionObj[timesKey] : '1-0-1'),
                  days: String(daysKey ? prescriptionObj[daysKey] : '7')
                })
              }
            }

            if (tempPrescriptions.length > 0) {
              dischargePrescriptionData = tempPrescriptions
              console.log('Parsed prescription data from object:', dischargePrescriptionData)
            }
          }
        }

        // If no prescription data found, try to get it from report.data
        if (
          dischargePrescriptionData.length === 0 &&
          report.data &&
          typeof report.data === 'string'
        ) {
          try {
            const parsedData = JSON.parse(report.data)
            if (parsedData.prescriptionData) {
              // If prescriptionData exists in the parsed data
              if (typeof parsedData.prescriptionData === 'string') {
                // If it's a string, parse it
                dischargePrescriptionData = parsePrescriptionDataFromJson(
                  parsedData.prescriptionData
                )
              } else if (Array.isArray(parsedData.prescriptionData)) {
                // If it's already an array, use it directly
                dischargePrescriptionData = parsedData.prescriptionData.map((item) => ({
                  medicine: String(item.medicine || ''),
                  times: String(item.times || '1-0-1'),
                  days: String(item.days || '7')
                }))
              }
            }
          } catch (error) {
            console.error('Error parsing report.data for prescriptions:', error)
          }
        }

        // If still no prescription data, check for legacy fields directly in the report object
        if (dischargePrescriptionData.length === 0) {
          const legacyPrescriptions: { medicine: string; times: string; days: string }[] = []
          for (let i = 1; i <= 10; i++) {
            const medicineKey = `PRESCRIPTION ${i}`
            const timesKey = `TIMING ${i}`
            const daysKey = `DAYS ${i}`

            if (report[medicineKey] || report[timesKey] || report[daysKey]) {
              legacyPrescriptions.push({
                medicine: String(report[medicineKey] || ''),
                times: String(report[timesKey] || '1-0-1'),
                days: String(report[daysKey] || '7')
              })
            }
          }

          if (legacyPrescriptions.length > 0) {
            dischargePrescriptionData = legacyPrescriptions
          }
        }

        // Debug the data being passed to DischargeSummary
        console.log(
          'Before rendering DischargeSummary - dischargePrescriptionData:',
          dischargePrescriptionData
        )

        // Log if no prescription data was found
        if (dischargePrescriptionData.length === 0) {
          console.log('No prescription data found in any format')
        }

        return (
          <div id={`receipt-${report.id}`}>
            <DischargeSummary
              patientData={patientData}
              dateOfAdmit={dischargeData.dateOfAdmit}
              dateOfDischarge={dischargeData.dateOfDischarge}
              dateOfOperation={dischargeData.dateOfOperation}
              dischargePrescriptionData={dischargePrescriptionData}
              diagnosis={dischargeData.diagnosis}
              operationProcedure={dischargeData.operationProcedure}
              billNumber={dischargeData.billNumber}
              operationDetails={dischargeData.operationDetails}
              authorizedSignatory={''}
            />
          </div>
        )
      }
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p>Please select a receipt type to view</p>
          </div>
        )
    }
  }

  return <div className="receipt-viewer">{renderReceipt()}</div>
}

export default ReceiptViewer
