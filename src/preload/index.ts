import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface StaffUser {
  id: string
  username: string
  fullName: string
  position: string
  salary: number
  phone?: string
  email?: string
  permissions: {
    patients: boolean
    prescriptions: boolean
    medicines: boolean
    opticals: boolean
    receipts: boolean
    analytics: boolean
    staff: boolean
    operations: boolean
    reports: boolean
    duesFollowUp: boolean
    data: boolean
  }
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

interface Patient {
  id: string
  date: string
  patientId: string
  name: string
  guardian: string
  dob: string
  age: number
  gender: string
  phone: string
  address: string
}

interface Prescription {
  id: string
  [key: string]: unknown
}

interface Lab {
  id: string
  [key: string]: unknown
}

interface Operation {
  id?: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  [key: string]: unknown
}

interface InPatient {
  id?: string
  date: string
  patientId: string
  name: string
  age: number
  gender: string
  phone: string
  address: string
  dateOfBirth?: string
  guardianName?: string
  operationName: string
  department: string
  doctorNames: string[]
  onDutyDoctor?: string
  referredBy?: string
  packageAmount: number
  packageInclusions?: string[]
  createdBy?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

interface Medicine {
  id?: string
  name: string
  quantity: number
  expiryDate: string
  batchNumber: string
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
  [key: string]: unknown
}

interface OpticalItem {
  id?: string
  type: 'frame' | 'lens'
  brand: string
  model?: string
  size?: string
  power?: string
  quantity: number
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
  [key: string]: unknown
}

// Custom APIs for renderer
const api = {
  // Authentication
  login: (username: string, password: string) => ipcRenderer.invoke('login', username, password),

  // Staff Management
  getStaffList: () => ipcRenderer.invoke('getStaffList'),
  addStaff: (staff: StaffUser & { passwordHash?: string }) => ipcRenderer.invoke('addStaff', staff),
  updateStaff: (id: string, staff: Partial<StaffUser> & { passwordHash?: string }) =>
    ipcRenderer.invoke('updateStaff', id, staff),
  deleteStaff: (id: string) => ipcRenderer.invoke('deleteStaff', id),
  resetStaffPassword: (id: string) => ipcRenderer.invoke('resetStaffPassword', id),
  checkPermission: (userId: string, module: string) =>
    ipcRenderer.invoke('checkPermission', userId, module),

  // Patient Management
  getPatients: () => ipcRenderer.invoke('getPatients'),
  getLatestPatientId: () => ipcRenderer.invoke('getLatestPatientId'),
  addPatient: (patient: Patient) => ipcRenderer.invoke('addPatient', patient),
  updatePatient: (id: string, patient: Patient) => ipcRenderer.invoke('updatePatient', id, patient),
  deletePatient: (id: string) => ipcRenderer.invoke('deletePatient', id),
  getTodaysPatients: () => ipcRenderer.invoke('getTodaysPatients'),
  getPatientById: (patientId: string) => ipcRenderer.invoke('getPatientById', patientId),

  // Prescriptions & Receipts Management
  getPrescriptions: () => ipcRenderer.invoke('getPrescriptions'),
  getPrescriptionsByPatientId: (patientId: string) =>
    ipcRenderer.invoke('getPrescriptionsByPatientId', patientId),
  addPrescription: (prescription: Prescription) =>
    ipcRenderer.invoke('addPrescription', prescription),
  updatePrescription: (id: string, prescription: Prescription) =>
    ipcRenderer.invoke('updatePrescription', id, prescription),
  deletePrescription: (id: string) => ipcRenderer.invoke('deletePrescription', id),
  searchPrescriptions: (searchTerm: string) =>
    ipcRenderer.invoke('searchPrescriptions', searchTerm),
  getTodaysPrescriptions: () => ipcRenderer.invoke('getTodaysPrescriptions'),
  getPrescriptionsByDate: (date: string) => ipcRenderer.invoke('getPrescriptionsByDate', date),
  getLatestPrescriptionId: () => ipcRenderer.invoke('getLatestPrescriptionId'),

  // Labs Management
  getLabs: () => ipcRenderer.invoke('getLabs'),
  addLab: (lab: Omit<Lab, 'id'>) => ipcRenderer.invoke('addLab', lab),
  updateLab: (lab: Lab) => ipcRenderer.invoke('updateLab', lab),
  deleteLab: (id: string) => ipcRenderer.invoke('deleteLab', id),
  searchLabs: (patientId: string) => ipcRenderer.invoke('searchLabs', patientId),
  getTodaysLabs: () => ipcRenderer.invoke('getTodaysLabs'),

  // Operations Management
  getOperations: () => ipcRenderer.invoke('getOperations'),
  getPatientOperations: (patientId: string) =>
    ipcRenderer.invoke('getPatientOperations', patientId),
  addOperation: (operation: Operation) => ipcRenderer.invoke('addOperation', operation),
  updateOperation: (id: string, operation: Operation) =>
    ipcRenderer.invoke('updateOperation', id, operation),

  // In-Patient Management
  getInPatients: () => ipcRenderer.invoke('getInPatients'),
  getInPatientById: (id: string) => ipcRenderer.invoke('getInPatientById', id),
  getLatestInPatientId: () => ipcRenderer.invoke('getLatestInPatientId'),
  addInPatient: (inpatient: InPatient) => ipcRenderer.invoke('addInPatient', inpatient),
  updateInPatient: (id: string, inpatient: InPatient) =>
    ipcRenderer.invoke('updateInPatient', { id, inpatientData: inpatient }),
  updateInPatientAll: (id: string, inpatient: InPatient) =>
    ipcRenderer.invoke('updateInPatientAll', { id, inpatientData: inpatient }),
  deleteInPatient: (id: string) => ipcRenderer.invoke('deleteInPatient', id),
  deleteOperation: (id: string) => ipcRenderer.invoke('deleteOperation', id),

  // Patient Search (used by multiple modules)
  searchPatients: (searchTerm: string) => ipcRenderer.invoke('searchPatients', searchTerm),

  // Medicines Management
  getMedicines: () => ipcRenderer.invoke('getMedicines'),
  searchMedicines: (searchTerm: string) => ipcRenderer.invoke('searchMedicines', searchTerm),
  addMedicine: (medicine: Medicine) => ipcRenderer.invoke('addMedicine', medicine),
  updateMedicine: (id: string, medicine: Medicine) =>
    ipcRenderer.invoke('updateMedicine', id, medicine),
  deleteMedicine: (id: string) => ipcRenderer.invoke('deleteMedicine', id),
  updateMedicineStatus: (id: string, status: 'available' | 'completed' | 'out_of_stock') =>
    ipcRenderer.invoke('updateMedicineStatus', id, status),
  getMedicinesByStatus: (status: 'available' | 'completed' | 'out_of_stock') =>
    ipcRenderer.invoke('getMedicinesByStatus', status),

  // Medicine Dispense Management
  getMedicineDispenseRecords: (page?: number, pageSize?: number) =>
    ipcRenderer.invoke('getMedicineDispenseRecords', page, pageSize),
  getMedicineDispenseRecordsByPatient: (patientId: string) =>
    ipcRenderer.invoke('getMedicineDispenseRecordsByPatient', patientId),
  getMedicineDispenseRecordsByMedicine: (medicineId: string) =>
    ipcRenderer.invoke('getMedicineDispenseRecordsByMedicine', medicineId),
  dispenseMedicine: (
    id: string,
    quantity: number,
    dispensedBy: string,
    patientId: string,
    patientName: string,
    price: number,
    totalAmount: number
  ) =>
    ipcRenderer.invoke(
      'dispenseMedicine',
      id,
      quantity,
      dispensedBy,
      patientId,
      patientName,
      price,
      totalAmount
    ),

  // Opticals Management
  getOpticalItems: () => ipcRenderer.invoke('getOpticalItems'),
  searchOpticalItems: (searchTerm: string, type?: 'frame' | 'lens') =>
    ipcRenderer.invoke('searchOpticalItems', searchTerm, type),
  addOpticalItem: (item: OpticalItem) => ipcRenderer.invoke('addOpticalItem', item),
  updateOpticalItem: (id: string, item: OpticalItem) =>
    ipcRenderer.invoke('updateOpticalItem', id, item),
  deleteOpticalItem: (id: string) => ipcRenderer.invoke('deleteOpticalItem', id),
  updateOpticalItemStatus: (id: string, status: 'available' | 'completed' | 'out_of_stock') =>
    ipcRenderer.invoke('updateOpticalItemStatus', id, status),
  getOpticalItemsByStatus: (
    status: 'available' | 'completed' | 'out_of_stock',
    type?: 'frame' | 'lens'
  ) => ipcRenderer.invoke('getOpticalItemsByStatus', status, type),
  getOpticalItemsByType: (type: 'frame' | 'lens') =>
    ipcRenderer.invoke('getOpticalItemsByType', type),
  getOpticalItemsByStatusAndType: (
    status: 'available' | 'completed' | 'out_of_stock',
    type?: 'frame' | 'lens'
  ) => ipcRenderer.invoke('getOpticalItemsByStatusAndType', status, type),
  // Optical Dispense Management
  getOpticalDispenseRecords: (page: number, pageSize: number) =>
    ipcRenderer.invoke('getOpticalDispenseRecords', page, pageSize),

  getOpticalDispenseRecordsByPatient: (patientId: string) =>
    ipcRenderer.invoke('getOpticalDispenseRecordsByPatient', patientId),

  getOpticalDispenseRecordsByOptical: (opticalId: string) =>
    ipcRenderer.invoke('getOpticalDispenseRecordsByOptical', opticalId),

  dispenseOptical: (
    id: string,
    quantity: number,
    patientName: string,
    patientId?: string,
    dispensedBy?: string
  ) => ipcRenderer.invoke('dispenseOptical', id, quantity, patientName, patientId, dispensedBy),

  // Analytics Management
  getAnalyticsData: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('getAnalyticsData', startDate, endDate),

  exportAnalyticsData: (
    section: string,
    startDate: string,
    endDate: string,
    timeFilter: string,
    format: string
  ) => ipcRenderer.invoke('exportAnalyticsData', section, startDate, endDate, timeFilter, format),

  // Dropdown Options Management
  addDropdownOption: (fieldName: string, newValue: string) =>
    ipcRenderer.invoke('addDropdownOption', fieldName, newValue),
  deleteDropdownOption: (fieldName: string, optionValue: string) =>
    ipcRenderer.invoke('deleteDropdownOption', fieldName, optionValue),
  getDropdownOptions: (fieldName: string) => ipcRenderer.invoke('getDropdownOptions', fieldName),

  // PDF Management
  openPdfInWindow: (pdfBuffer: Uint8Array) => ipcRenderer.invoke('openPdfInWindow', pdfBuffer)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
