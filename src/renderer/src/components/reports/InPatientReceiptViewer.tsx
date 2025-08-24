import React from 'react'
import { InPatient, PackageInclusion } from '../../pages/InPatients'
import InPatientCashReceipt from '../reciepts/InPatientCashReceipt'
import InPatientDischargeSummary from '../reciepts/InPatientDischargeSummary'

interface InPatientReceiptViewerProps {
  inpatient: InPatient
  receiptType: 'cash' | 'discharge'
}

const InPatientReceiptViewer: React.FC<InPatientReceiptViewerProps> = ({
  inpatient,
  receiptType
}) => {
  // Format the patient data for the receipts
  const patientData = {
    receiptNo: String(inpatient.id || '').substring(0, 8),
    billNumber: String(inpatient.id || '').substring(0, 8),
    patientId: String(inpatient.patientId || ''),
    date: String(inpatient.date || new Date().toISOString().split('T')[0]),
    patientName: String(inpatient.name || ''),
    gender: String(inpatient.gender || ''),
    guardianName: String(inpatient.guardianName || ''),
    age: String(inpatient.age || ''),
    address: String(inpatient.address || ''),
    mobile: String(inpatient.phone || ''),
    referredBy: String(inpatient.referredBy || ''),
    doctorName: String(inpatient.doctorNames[0] || 'Dr. CH. SRILATHA'),
    doctorNames: String(inpatient.doctorNames || ''),
    onDutyDoctor: String(inpatient.onDutyDoctor || ''),
    department: String(inpatient.department || 'OPHTHALMOLOGY'),
    admissionDate: String(inpatient.admissionDate || ''),
    dateOfDischarge: String(''),
    dateOfOperation: String(inpatient.operationDate || ''),
    followUpDate: String(inpatient.followUpDate || '')
  }

  console.log('patientData', patientData)
  console.log('inpatient', inpatient)
  // Format payment data
  const paymentData = {
    totalAmount: Number(inpatient.packageAmount || 0),
    discountPercent:
      Number(
        Number((inpatient.discount || 0) * 100) / Number(inpatient.packageAmount || 0)
      ).toFixed(2) || 0,
    discountAmount: Number(inpatient.discount || 0),
    amountReceived: Number(inpatient.totalReceivedAmount || 0),
    balance: Number(inpatient.balanceAmount || 0)
  }

  // Format billing items from package inclusions
  const billingItems = formatBillingItems(inpatient.packageInclusions || [])

  // Format prescription data if available
  const prescriptionData = formatPrescriptionData(inpatient.prescriptions || [])

  // Helper function to format billing items from package inclusions
  function formatBillingItems(
    packageInclusions: PackageInclusion[]
  ): { particulars: string; amount: number }[] {
    const items: { particulars: string; amount: number }[] = []

    // Add each package inclusion as a billing item
    packageInclusions.forEach((inclusion) => {
      items.push({
        particulars: inclusion.name,
        amount: inclusion.amount
      })

      // Add sub-items if they exist
      if (inclusion.subItems && inclusion.subItems.length > 0) {
        inclusion.subItems.forEach((subItem) => {
          items.push({
            particulars: `  - ${subItem.itemName} (${subItem.quantity} x ₹${subItem.rate})`,
            amount: subItem.amount
          })
        })
      }
    })

    return items
  }

  // Helper function to format prescription data
  function formatPrescriptionData(
    prescriptions: Array<Record<string, unknown>>
  ): { medicine: string; times: string; days: string }[] {
    if (!prescriptions || prescriptions.length === 0) {
      return []
    }

    return prescriptions.map((prescription, index) => ({
      medicine: String(
        prescription[`PRESCRIPTION${index + 1}`] || prescription.medicine || prescription.name || ''
      ),
      times: String(
        prescription[`TIMING${index + 1}`] || prescription.times || prescription.timing || '1-0-1'
      ),
      days: String(prescription[`DAYS${index + 1}`] || prescription.days || '7')
    }))
  }

  // Render the appropriate receipt based on the type
  const renderReceipt = (): React.ReactElement => {
    switch (receiptType) {
      case 'cash':
        return (
          <div id={`cash-receipt-${inpatient.id}`}>
            <InPatientCashReceipt
              patientData={patientData}
              diagnosis={inpatient.provisionDiagnosis || ''}
              operationProcedure={inpatient.operationProcedure || ''}
              billNumber={patientData.billNumber}
              operationDetails={inpatient.operationDetails || ''}
              billingItems={billingItems}
              billingData={{
                totalAmount: Number(paymentData.totalAmount),
                advancePaid: Number(paymentData.amountReceived),
                discountPercent: Number(paymentData.discountPercent),
                discountAmount: Number(paymentData.discountAmount),
                amountReceived: Number(paymentData.amountReceived),
                balance: Number(paymentData.balance)
              }}
              authorizedSignatory={''}
            />
          </div>
        )
      case 'discharge':
        return (
          <div id={`discharge-summary-${inpatient.id}`}>
            <InPatientDischargeSummary
              patientData={patientData}
              admissionDate={patientData.admissionDate}
              dateOfDischarge={patientData.dateOfDischarge || inpatient.dischargeDate}
              operationDate={patientData.dateOfOperation || inpatient.operationDate}
              dischargePrescriptionData={prescriptionData}
              provisionDiagnosis={
                inpatient.provisionDiagnosis || inpatient.provisionDiagnosis || ''
              }
              operationProcedure={
                inpatient.operationProcedure || inpatient.operationProcedure || ''
              }
              billNumber={patientData.billNumber}
              operationDetails={inpatient.operationDetails || inpatient.operationDetails || ''}
              authorizedSignatory={''}
            />
          </div>
        )
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

export default InPatientReceiptViewer
