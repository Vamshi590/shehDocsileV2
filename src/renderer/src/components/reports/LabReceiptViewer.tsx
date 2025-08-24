import React from 'react'
import LabReceipt from '../reciepts/LabReceipt'
import VennelaLabReceipt from '../reciepts/VennelaLabReceipt'

// Define the Lab type
type Lab = {
  id: string
  [key: string]: unknown
}

interface LabReceiptViewerProps {
  lab: Lab
  receiptType: 'lab' | 'vlab'
}

const LabReceiptViewer: React.FC<LabReceiptViewerProps> = ({ lab, receiptType }) => {
  // Format patient data for lab receipt
  const patientData = {
    patientId: String(lab['PATIENT ID'] || ''),
    patientName: String(lab['PATIENT NAME'] || ''),
    gender: String(lab.GENDER || ''),
    age: String(lab.AGE || ''),
    address: String(lab.ADDRESS || ''),
    mobile: String(lab['PHONE NUMBER'] || ''),
    doctorName: String(lab['DOCTOR NAME'] || 'Dr. CH. SRILATHA'),
    department: 'Lab', // Required field for LabReceipt
    date: String(lab.DATE || new Date().toISOString().split('T')[0])
  }

  // Format payment data
  const paymentData = {
    totalAmount: Number(lab['TOTAL AMOUNT'] || 0),
    discountPercent: Number(lab['DISCOUNT PERCENTAGE'] || 0),
    discountAmount: Number(lab['DISCOUNT AMOUNT'] || 0),
    amountReceived: Number(lab['AMOUNT RECEIVED'] || 0),
    balance: Number(lab['AMOUNT DUE'] || 0),
    vTotalAmount: Number(lab['VTOTAL AMOUNT'] || 0),
    vDiscountPercent: Number(lab['VDISCOUNT PERCENTAGE'] || 0),
    vDiscountAmount: Number(lab['VDISCOUNT AMOUNT'] || 0),
    vAmountReceived: Number(lab['VAMOUNT RECEIVED'] || 0),
    vBalance: Number(lab['VAMOUNT DUE'] || 0)
  }

  // Format test results if available
  const testResults = formatTestResults(lab)

  // Helper function to format test results
  function formatTestResults(lab: Lab): Record<string, unknown> {
    const results: Record<string, unknown> = {}

    // Extract all test-related fields from the lab object
    Object.entries(lab).forEach(([key, value]) => {
      // Skip non-test fields and metadata fields
      const skipFields = [
        'id',
        'PATIENT ID',
        'PATIENT NAME',
        'GUARDIAN NAME',
        'PHONE NUMBER',
        'AGE',
        'GENDER',
        'ADDRESS',
        'DATE',
        'TOTAL AMOUNT',
        'DISCOUNT PERCENTAGE',
        'DISCOUNT AMOUNT',
        'AMOUNT RECEIVED',
        'AMOUNT DUE',
        'VTOTAL AMOUNT',
        'VDISCOUNT PERCENTAGE',
        'VDISCOUNT AMOUNT',
        'VAMOUNT RECEIVED',
        'VAMOUNT DUE',
        'DOCTOR NAME',
        'DOB',
        'type'
      ]

      if (!skipFields.includes(key) && value !== null && value !== undefined && value !== '') {
        results[key] = value
      }
    })

    return results
  }

  // Convert test results to LabTestItem array format required by LabReceipt
  const formatLabTestItems = (
    testResults: Record<string, unknown>
  ): { test: string; amount: string | number }[] => {
    const testItems: { test: string; amount: string | number }[] = []
    Object.entries(testResults).forEach(([key, value]) => {
      // Look for matching amount field
      const amountKey = key.replace('TEST', 'AMOUNT')
      const amount = lab[amountKey] || 0
      if (typeof value === 'string' && value.trim() !== '') {
        testItems.push({
          test: value,
          amount: Number(amount)
        })
      }
    })
    return testItems
  }

  const labTestItems = formatLabTestItems(testResults)

  // Render the appropriate receipt based on the type
  const renderReceipt = (): React.ReactElement => {
    switch (receiptType) {
      case 'lab':
        return (
          <div id={`lab-receipt-${lab.id}`}>
            <LabReceipt
              patientData={patientData}
              labTestData={labTestItems}
              financialData={{
                totalAmount: paymentData.totalAmount,
                discountPercentage: paymentData.discountPercent,
                amountReceived: paymentData.amountReceived,
                amountDue: paymentData.balance
              }}
            />
          </div>
        )
      case 'vlab':
        return (
          <div id={`vlab-receipt-${lab.id}`}>
            <VennelaLabReceipt
              billNumber={String(lab.BILLNO || '')}
              date={patientData.date}
              patientName={patientData.patientName}
              doctorName={patientData.doctorName}
              labData={testResults}
              discountPercentage={paymentData.discountPercent}
              amountReceived={paymentData.amountReceived}
              amountDue={paymentData.balance}
              totalAmount={paymentData.totalAmount}
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

export default LabReceiptViewer
