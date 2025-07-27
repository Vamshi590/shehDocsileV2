export interface ReceiptItem {
  particulars: string
  qty: number
  rate: number
  amount: number
}

export interface PatientInfo {
  billNumber: string
  patientId: string
  patientName: string
  guardianName: string
  address: string
  date: string
  gender: string
  age: number
  mobile: string
  dept: string
  doctorName: string
}

export interface BusinessInfo {
  name: string
  address: string
  dlNo: string
  gstin: string
  phone1: string
  phone2: string
}

export interface ReceiptTotals {
  totalAmount: number
  advancePaid: number
  amtReceived: number
  discount: number
  balance: number
}

export interface ReceiptData {
  businessInfo: BusinessInfo
  patientInfo: PatientInfo
  items: ReceiptItem[]
  totals: ReceiptTotals
}
