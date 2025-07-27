export interface Patient {
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
  status?: string
  doctorName?: string
  department?: string
  referredBy?: string
  createdBy?: string
}

export interface Prescription {
  id: string
  [key: string]: unknown
}

export interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  assistants?: string
  anesthesia?: string
  anesthesiologist?: string
  preOpDiagnosis: string
  postOpDiagnosis?: string
  procedure: string
  findings?: string
  complications?: string
  implants?: string
  specimens?: string
  estimatedBloodLoss?: string
  fluids?: string
  postOpPlan?: string
  followUpDate?: string
  notes?: string
  // Additional fields for the operations table
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
  reviewOn?: string
  prescriptionData?: string
}

interface API {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>

  // Prescription methods
  getPrescriptions: () => Promise<Prescription[]>
  getTodaysPrescriptions: () => Promise<Prescription[]>
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
  updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
  deletePrescription: (id: string) => Promise<void>
  searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>

  // Patient methods
  getPatients: () => Promise<Patient[]>
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>
  updatePatient: (id: string, patient: Patient) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
  searchPatients: (searchTerm: string) => Promise<Patient[]>

  // Operation methods
  getPatientOperations: (patientId: string) => Promise<Operation[]>
  saveOperation: (operation: Omit<Operation, 'id'>) => Promise<Operation>
  updateOperation: (id: string, operation: Operation) => Promise<Operation>
  deleteOperation: (id: string) => Promise<void>

  // Dropdown Options methods
  addDropdownOption: (
    fieldName: string,
    newValue: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>
  getDropdownOptions: (
    fieldName: string
  ) => Promise<{ success: boolean; options?: string[]; error?: string }>

  // PDF Management
  openPdfInWindow: (pdfBuffer: Uint8Array) => Promise<{ success: boolean; error?: string }>
  getLatestPatientId: () => Promise<number>
}

declare global {
  interface Window {
    api: API
    electron: {
      ipcRenderer: {
        on: (channel: string, listener: (...args: unknown[]) => void) => void
        once: (channel: string, listener: (...args: unknown[]) => void) => void
        send: (channel: string, ...args: unknown[]) => void
      }
    }
  }
}

export {}
