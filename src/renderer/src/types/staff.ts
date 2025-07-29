export interface StaffUser {
  id: string
  username: string
  passwordHash?: string // Only used during creation/update
  fullName: string
  position: string
  salary: number
  phone?: string
  email?: string

  patients: boolean
  prescriptions: boolean
  medicines: boolean
  opticals: boolean
  receipts: boolean
  analytics: boolean
  staff: boolean // Only admins should have this set to true
  operations: boolean
  reports: boolean
  duesFollowUp: boolean
  data: boolean
  certificates: boolean
  labs: boolean
  permissions?: {
    patients?: boolean
    prescriptions?: boolean
    medicines?: boolean
    opticals?: boolean
    receipts?: boolean
    analytics?: boolean
    labs?: boolean
    staff?: boolean // Only admins should have this set to true
    operations?: boolean
    reports?: boolean
    duesFollowUp?: boolean
    data?: boolean
    certificates?: boolean
  }
  isAdmin: boolean // Quick check for admin status
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  success: boolean
  user?: Omit<StaffUser, 'passwordHash'> // Never return password hash to frontend
  error?: string
}

export interface PermissionCheck {
  hasAccess: boolean
  module: string
}
