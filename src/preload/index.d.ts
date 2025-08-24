import { ElectronAPI } from '@electron-toolkit/preload'

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

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  reason?: string
  date: string
  createdAt: string
  updatedAt?: string
}

interface ExpenseResponse {
  success: boolean
  data: Expense[] | Expense | { id: string } | null
  error: string | null
  statusCode: number
}

interface API {
  // Authentication
  login: (username: string, password: string) => Promise<boolean>

  // Patient Management
  getPatients: () => Promise<Patient[]>
  addPatient: (patient: Patient) => Promise<Patient>
  updatePatient: (id: string, patient: Patient) => Promise<Patient>
  deletePatient: (id: string) => Promise<boolean>
  getPatientById: (patientId: string) => Promise<Patient | null>
  getTodaysPatients: () => Promise<Patient[]>
  searchPatients: (searchTerm: string) => Promise<Patient[]>

  // Dropdown Options Management
  addDropdownOption: (
    fieldName: string,
    newValue: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>
  getDropdownOptions: (
    fieldName: string
  ) => Promise<{ success: boolean; options?: string[]; error?: string }>
  getLatestPatientId: () => Promise<number>

  // Expenses Management
  getExpenses: () => Promise<ExpenseResponse>
  getExpensesByDateRange: (startDate: string, endDate: string) => Promise<ExpenseResponse>
  getExpensesByCategory: (category: string) => Promise<ExpenseResponse>
  addExpense: (expenseData: {
    title: string
    amount: string | number
    category: string
    reason?: string
    date: string
  }) => Promise<ExpenseResponse>
  updateExpense: (
    id: string,
    expenseData: {
      title: string
      amount: string | number
      category: string
      reason?: string
      date: string
    }
  ) => Promise<ExpenseResponse>
  deleteExpense: (id: string) => Promise<ExpenseResponse>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
