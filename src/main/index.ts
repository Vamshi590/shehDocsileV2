import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { promisify } from 'util'
import { exec } from 'child_process'
import bcrypt from 'bcryptjs'
// No longer using electron-store
import XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { toZonedTime } from 'date-fns-tz'

// Define interfaces for better type safety
interface StaffMember {
  id: string
  username: string
  passwordHash?: string
  fullName?: string
  position?: string
  salary?: number
  permissions?: Record<string, boolean>
  isAdmin?: boolean
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}
// Define Lab interface
interface Lab {
  id: string
  [key: string]: unknown
}

// Get the AppData path for storing user data
const appDataPath = join(app.getPath('appData'), 'ShehData')

// Create the directory if it doesn't exist
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true })
}

// Path to the staff users file
const staffFilePath = join(appDataPath, 'staff.xlsx')

// Path to the patients Excel file
const patientsFilePath = join(appDataPath, 'patients.xlsx')

// Path to the prescriptions and receipts Excel file
const prescriptionsFilePath = join(appDataPath, 'prescriptions_and_receipts.xlsx')

// Path to the operations Excel file
const operationsFilePath = join(appDataPath, 'operations.xlsx')

// Path to the medicines Excel file
const medicinesFilePath = join(appDataPath, 'medicines.xlsx')

// Path to the opticals Excel file
const opticalsFilePath = join(appDataPath, 'opticals.xlsx')

// Note: opticalDispenseFilePath is defined later in the file

// Path to the settings JSON file
const settingsFilePath = join(appDataPath, 'settings.json')

// Path to the labs Excel file
const labsFilePath = join(appDataPath, 'labs.xlsx')

if (!fs.existsSync(labsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Labs')
  XLSX.writeFile(workbook, labsFilePath)
  console.log('Created new labs file')
}

// Create settings file if it doesn't exist
if (!fs.existsSync(settingsFilePath)) {
  fs.writeFileSync(
    settingsFilePath,
    JSON.stringify({
      // Default settings here
      theme: 'light',
      language: 'en'
    }),
    'utf8'
  )
}

// Helper functions to read/write settings
const getSettings = (): Record<string, unknown> => {
  try {
    return JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'))
  } catch (error) {
    console.error('Error reading settings:', error)
    return {}
  }
}

const setSetting = (key: string, value: unknown): void => {
  try {
    const settings = getSettings()
    settings[key] = value
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings), 'utf8')
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error)
  }
}

// Helper function to hide a file
const hideFile = async (path: string): Promise<void> => {
  if (process.platform === 'win32') {
    const execPromise = promisify(exec)
    await execPromise(`attrib +h "${path}"`)
  }
}

// Initialize staff file if it doesn't exist
if (!fs.existsSync(staffFilePath)) {
  const workbook = XLSX.utils.book_new()

  // Create default admin user
  const defaultAdmin = {
    id: uuidv4(),
    username: 'srilathach',
    passwordHash: bcrypt.hashSync('9573076861', 10),
    fullName: 'Srilatha Ch',
    position: 'Admin',
    salary: 0,
    permissions: {
      patients: true,
      prescriptions: true,
      medicines: true,
      opticals: true,
      receipts: true,
      analytics: true,
      staff: true,
      operations: true,
      reports: true,
      duesFollowUp: true,
      data: true
    },
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const worksheet = XLSX.utils.json_to_sheet([defaultAdmin])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff')
  XLSX.writeFile(workbook, staffFilePath)
}

// Initialize patients Excel file if it doesn't exist
if (!fs.existsSync(patientsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients')
  XLSX.writeFile(workbook, patientsFilePath)
}

// Initialize prescriptions and receipts Excel file if it doesn't exist
if (!fs.existsSync(prescriptionsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Prescriptions')
  XLSX.writeFile(workbook, prescriptionsFilePath)
}

// Initialize operations Excel file if it doesn't exist
if (!fs.existsSync(operationsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Operations')
  XLSX.writeFile(workbook, operationsFilePath)
}

// Initialize medicines Excel file if it doesn't exist
if (!fs.existsSync(medicinesFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines')
  XLSX.writeFile(workbook, medicinesFilePath)
}

// Initialize opticals Excel file if it doesn't exist
if (!fs.existsSync(opticalsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Opticals')
  XLSX.writeFile(workbook, opticalsFilePath)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Sri Harsha Eye Hospital',
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Authentication and Staff Management
// Hard-coded default admin credentials (bypass Excel file)
const HARDCODED_ADMIN_USERNAME = 'srilathach'
const HARDCODED_ADMIN_PASSWORD_HASH = bcrypt.hashSync('9573076861', 10)
const HARDCODED_ADMIN_USER: StaffMember = {
  id: 'hardcoded-admin',
  username: HARDCODED_ADMIN_USERNAME,
  passwordHash: HARDCODED_ADMIN_PASSWORD_HASH,
  fullName: 'Srilatha Ch',
  position: 'Admin',
  salary: 0,
  permissions: {
    patients: true,
    prescriptions: true,
    medicines: true,
    opticals: true,
    receipts: true,
    analytics: true,
    staff: true,
    operations: true,
    reports: true,
    duesFollowUp: true,
    data: true
  },
  isAdmin: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Login handler
ipcMain.handle('login', async (_, username: string, password: string) => {
  try {
    // Check if credentials match hard-coded admin first
    if (username.trim().toLowerCase() === HARDCODED_ADMIN_USERNAME.toLowerCase()) {
      const isPasswordValid = bcrypt.compareSync(password.trim(), HARDCODED_ADMIN_PASSWORD_HASH)
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid username or password' }
      }
      setSetting('currentUser', { username: HARDCODED_ADMIN_USERNAME, id: HARDCODED_ADMIN_USER.id })
      const { passwordHash: _ph, ...userWithoutPassword } = HARDCODED_ADMIN_USER // eslint-disable-line @typescript-eslint/no-unused-vars
      return { success: true, user: userWithoutPassword }
    }

    // Try to get staff from Supabase first, fallback to Excel
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase.from('staff').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseStaff && supabaseStaff.length > 0) {
        staff = supabaseStaff as StaffMember[]
        console.log('Staff data fetched from Supabase for login')
      } else {
        throw new Error('No staff data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting staff from Supabase for login:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return { success: false, error: 'Staff database not found' }
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      console.log('Falling back to Excel for staff login data')
    }

    // Find user by username
    const normalizedUsername = username.trim().toLowerCase()
    const user = staff.find((s) => (s.username || '').toLowerCase() === normalizedUsername)

    if (!user) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password.trim(), user.passwordHash || '')

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Return user without password hash (exclude passwordHash from the returned object)
    const { passwordHash, ...userWithoutPassword } = user // eslint-disable-line @typescript-eslint/no-unused-vars
    // Store the logged-in user information
    setSetting('currentUser', { username: user.username, id: user.id })
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
})

// Get staff list
ipcMain.handle('getStaffList', async () => {
  try {
    // Try to get staff from Supabase first, fallback to Excel
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase
        .from('staff')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseStaff && supabaseStaff.length > 0) {
        staff = supabaseStaff as StaffMember[]
        console.log('Staff list fetched from Supabase')
      } else {
        throw new Error('No staff data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting staff list from Supabase:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      console.log('Falling back to Excel for staff list')
    }

    // Reconstruct permissions from flat columns and return staff list without password hashes
    return staff.map((user) => {
      const {
        patients = false,
        prescriptions = false,
        medicines = false,
        opticals = false,
        receipts = false,
        analytics = false,
        staff: staffPerm = false,
        operations = false,
        reports = false,
        duesFollowUp = false,
        data = false,
        ...rest
      } = user as unknown as Record<string, unknown>

      const reconstructedPermissions: StaffMember['permissions'] = {
        patients: Boolean(patients),
        prescriptions: Boolean(prescriptions),
        medicines: Boolean(medicines),
        opticals: Boolean(opticals),
        receipts: Boolean(receipts),
        analytics: Boolean(analytics),
        staff: Boolean(staffPerm),
        operations: Boolean(operations),
        reports: Boolean(reports),
        duesFollowUp: Boolean(duesFollowUp),
        data: Boolean(data)
      }

      return { ...(rest as object), permissions: reconstructedPermissions } as StaffMember
    })
  } catch (error) {
    console.error('Error getting staff list:', error)
    throw error
  }
})

// Add new staff member
ipcMain.handle('addStaff', async (_, staffData: Partial<StaffMember>) => {
  try {
    // Generate ID if not provided
    const staffWithId: StaffMember = {
      ...(staffData as object),
      id: staffData.id || uuidv4(),
      username: staffData.username || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Hash the password if provided
    if (staffWithId.passwordHash) {
      staffWithId.passwordHash = bcrypt.hashSync(staffWithId.passwordHash, 10)
    }

    // Flatten permissions object into individual columns for Supabase storage
    if (staffWithId.permissions) {
      const permissions = staffWithId.permissions
      staffWithId.patients = permissions.patients || false
      staffWithId.prescriptions = permissions.prescriptions || false
      staffWithId.medicines = permissions.medicines || false
      staffWithId.opticals = permissions.opticals || false
      staffWithId.receipts = permissions.receipts || false
      staffWithId.analytics = permissions.analytics || false
      staffWithId.staff = permissions.staff || false
      staffWithId.operations = permissions.operations || false
      staffWithId.reports = permissions.reports || false
      staffWithId.duesFollowUp = permissions.duesFollowUp || false
      staffWithId.data = permissions.data || false
    }

    // Try to add to Supabase first, fallback to Excel
    try {
      const { data, error } = await supabase.from('staff').insert([staffWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member added to Supabase:', data)

      // Also add to Excel for backup
      try {
        let staff: StaffMember[] = []
        if (fs.existsSync(staffFilePath)) {
          const workbook = XLSX.readFile(staffFilePath)
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
        }

        // Flatten permissions into separate columns for Excel storage
        const { permissions, ...restStaff } = staffWithId
        const staffToSave = {
          ...restStaff,
          ...permissions
        } as unknown as StaffMember

        // Add new staff member
        staff.push(staffToSave)

        // Write back to file
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(staff)
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff')
        XLSX.writeFile(workbook, staffFilePath)
        console.log('Staff member also added to Excel backup')
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      // Return the new staff member without password hash
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...staffWithoutPassword } = data[0] || staffWithId
      return staffWithoutPassword
    } catch (supabaseError) {
      console.error('Error adding staff to Supabase:', supabaseError)

      // Fallback to Excel only
      let staff: StaffMember[] = []
      if (fs.existsSync(staffFilePath)) {
        const workbook = XLSX.readFile(staffFilePath)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      }

      // Flatten permissions into separate columns for Excel storage
      const { permissions, ...restStaff } = staffWithId
      const staffToSave = {
        ...restStaff,
        ...permissions
      } as unknown as StaffMember

      // Add new staff member
      staff.push(staffToSave)

      // Write back to file
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(staff)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff')
      XLSX.writeFile(workbook, staffFilePath)
      console.log('Staff member added to Excel only (Supabase failed)')
    }

    // Return the new staff member without password hash
    const { passwordHash, ...staffWithoutPassword } = staffWithId // eslint-disable-line @typescript-eslint/no-unused-vars
    return staffWithoutPassword
  } catch (error) {
    console.error('Error adding staff:', error)
    throw error
  }
})

// Update staff member
ipcMain.handle('updateStaff', async (_, id: string, staffData: Partial<StaffMember>) => {
  try {
    // Prepare updated staff data
    const updatedData = {
      ...staffData,
      updatedAt: new Date().toISOString()
    } as Partial<StaffMember>

    // Hash the password if it was updated
    if (staffData.passwordHash) {
      updatedData.passwordHash = bcrypt.hashSync(staffData.passwordHash, 10)
    }

    // Flatten permissions object into individual columns if permissions are being updated
    if (staffData.permissions) {
      const permissions = staffData.permissions
      updatedData.patients = permissions.patients || false
      updatedData.prescriptions = permissions.prescriptions || false
      updatedData.medicines = permissions.medicines || false
      updatedData.opticals = permissions.opticals || false
      updatedData.receipts = permissions.receipts || false
      updatedData.analytics = permissions.analytics || false
      updatedData.staff = permissions.staff || false
      updatedData.operations = permissions.operations || false
      updatedData.reports = permissions.reports || false
      updatedData.duesFollowUp = permissions.duesFollowUp || false
      updatedData.data = permissions.data || false
    }

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase.from('staff').update(updatedData).eq('id', id).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member updated in Supabase:', data)

      // Also update in Excel for backup
      try {
        if (!fs.existsSync(staffFilePath)) {
          // Return Supabase data if Excel file doesn't exist
          const { passwordHash, ...staffWithoutPassword } = data[0] || updatedData // eslint-disable-line @typescript-eslint/no-unused-vars
          return staffWithoutPassword
        }

        const workbook = XLSX.readFile(staffFilePath)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

        const staffIndex = staff.findIndex((s) => s.id === id)
        if (staffIndex !== -1) {
          staff[staffIndex] = { ...staff[staffIndex], ...updatedData } as StaffMember

          const newWorkbook = XLSX.utils.book_new()
          const newWorksheet = XLSX.utils.json_to_sheet(staff)
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
          XLSX.writeFile(newWorkbook, staffFilePath)
          console.log('Staff member also updated in Excel backup')
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      // Return the updated staff member without password hash
      const { passwordHash, ...staffWithoutPassword } = data[0] || updatedData // eslint-disable-line @typescript-eslint/no-unused-vars
      return staffWithoutPassword
    } catch (supabaseError) {
      console.error('Error updating staff in Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

      const staffIndex = staff.findIndex((s) => s.id === id)
      if (staffIndex === -1) {
        throw new Error('Staff member not found')
      }

      const updatedStaff = {
        ...(staff[staffIndex] as object),
        ...updatedData
      } as StaffMember

      staff[staffIndex] = updatedStaff

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(staff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff member updated in Excel only (Supabase failed)')

      // Return the updated staff member without password hash
      const { passwordHash, ...staffWithoutPassword } = updatedStaff // eslint-disable-line @typescript-eslint/no-unused-vars
      return staffWithoutPassword
    }
  } catch (error) {
    console.error('Error updating staff:', error)
    throw error
  }
})

// Delete staff member
ipcMain.handle('deleteStaff', async (_, id: string) => {
  try {
    // First check admin constraint by getting all staff
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase.from('staff').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      staff = supabaseStaff || []
    } catch (supabaseError) {
      console.error('Error getting staff from Supabase for delete check:', supabaseError)

      // Fallback to Excel for admin check
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
    }

    // Filter out the staff member to delete
    const updatedStaff = staff.filter((s) => s.id !== id)

    // Check if the staff member being deleted is an admin
    const staffToDelete = staff.find((s) => s.id === id)
    if (!staffToDelete) {
      throw new Error('Staff member not found')
    }

    // Only perform the admin check if we're deleting an admin
    const isAdmin = Boolean(staffToDelete.isAdmin) || Boolean(staffToDelete.permissions?.staff)

    if (isAdmin) {
      // Make sure we're not deleting the last admin
      const remainingAdmins = updatedStaff.filter(
        (s) => Boolean(s.isAdmin) || Boolean(s.permissions?.staff)
      )
      if (remainingAdmins.length === 0) {
        throw new Error('Cannot delete the last administrator')
      }
    }

    // Try to delete from Supabase first
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member deleted from Supabase')

      // Also delete from Excel for backup
      try {
        if (fs.existsSync(staffFilePath)) {
          const workbook = XLSX.readFile(staffFilePath)
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const excelStaff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
          const updatedExcelStaff = excelStaff.filter((s) => s.id !== id)

          const newWorkbook = XLSX.utils.book_new()
          const newWorksheet = XLSX.utils.json_to_sheet(updatedExcelStaff)
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
          XLSX.writeFile(newWorkbook, staffFilePath)
          console.log('Staff member also deleted from Excel backup')
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      return { success: true }
    } catch (supabaseError) {
      console.error('Error deleting staff from Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const excelStaff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      const updatedExcelStaff = excelStaff.filter((s) => s.id !== id)

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(updatedExcelStaff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff member deleted from Excel only (Supabase failed)')

      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting staff:', error)
    throw error
  }
})

// Reset staff password
ipcMain.handle('resetStaffPassword', async (_, id: string) => {
  try {
    // Generate a random password
    const newPassword = crypto.randomBytes(4).toString('hex')
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    const updatedAt = new Date().toISOString()

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('staff')
        .update({
          passwordHash: hashedPassword,
          updatedAt: updatedAt
        })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('Staff member not found')
      }

      console.log('Staff password reset in Supabase')

      // Also update in Excel for backup
      try {
        if (fs.existsSync(staffFilePath)) {
          const workbook = XLSX.readFile(staffFilePath)
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

          const staffIndex = staff.findIndex((s) => s.id === id)
          if (staffIndex !== -1) {
            staff[staffIndex] = {
              ...staff[staffIndex],
              passwordHash: hashedPassword,
              updatedAt: updatedAt
            }

            const newWorkbook = XLSX.utils.book_new()
            const newWorksheet = XLSX.utils.json_to_sheet(staff)
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
            XLSX.writeFile(newWorkbook, staffFilePath)
            console.log('Staff password also reset in Excel backup')
          }
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      return newPassword
    } catch (supabaseError) {
      console.error('Error resetting password in Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

      const staffIndex = staff.findIndex((s) => s.id === id)
      if (staffIndex === -1) {
        throw new Error('Staff member not found')
      }

      staff[staffIndex] = {
        ...staff[staffIndex],
        passwordHash: hashedPassword,
        updatedAt: updatedAt
      }

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(staff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff password reset in Excel only (Supabase failed)')

      return newPassword
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
})

// Check if user has permission for a module
ipcMain.handle('checkPermission', async (_, userId: string, module: string) => {
  try {
    let user: StaffMember | null = null

    // Try to get user from Supabase first
    try {
      const { data, error } = await supabase.from('staff').select('*').eq('id', userId).single()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      user = data
    } catch (supabaseError) {
      console.error('Error getting user from Supabase for permission check:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return { hasAccess: false, module }
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      user = staff.find((s) => s.id === userId) || null
    }

    if (!user) {
      return { hasAccess: false, module }
    }

    // Check if user is admin or has specific permission
    const hasAccess = user.isAdmin || (user.permissions && user.permissions[module])

    return { hasAccess, module }
  } catch (error) {
    console.error('Permission check error:', error)
    return { hasAccess: false, module }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for authentication and patient management

// Authentication handler is already defined above

// Import Supabase client
import { supabase } from './supabaseClient'

// Get today's patients
ipcMain.handle('getTodaysPatients', async () => {
  try {
    // Get current date in Indian timezone
    const indianTime = toZonedTime(new Date(), 'Asia/Kolkata')

    // Create start of day timestamp (00:00:00) in Indian timezone
    const startOfDay = new Date(indianTime)
    startOfDay.setHours(0, 0, 0, 0)

    // Create end of day timestamp (23:59:59.999) in Indian timezone
    const endOfDay = new Date(indianTime)
    endOfDay.setHours(23, 59, 59, 999)

    // Convert to ISO strings for Supabase query
    const startTimestamp = startOfDay.toISOString()
    const endTimestamp = endOfDay.toISOString()

    console.log(`Fetching patients between ${startTimestamp} and ${endTimestamp}`)

    // Since the date field may include time information, we need to use LIKE query
    // to match records where the date part starts with today's date
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .gte('created_at', startTimestamp)
      .lte('created_at', endTimestamp)
      .order('patientId', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log("Today's patients fetched from Supabase successfully")
    return { success: true, data: patients || [], message: "Today's patients fetched successfully" }
  } catch (error) {
    console.error("Error getting today's patients from Supabase:", error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch today's patients: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get all patients
ipcMain.handle('getPatients', async () => {
  try {
    // Fetch all patients from Supabase
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Patients fetched from Supabase successfully')
    return { success: true, data: patients || [], message: 'Patients fetched successfully' }
  } catch (error) {
    console.error('Error getting patients from Supabase:', error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch patients: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get patient by ID
ipcMain.handle('getPatientById', async (_, patientId) => {
  try {
    if (!patientId) {
      return { success: false, data: null, message: 'Patient ID is required' }
    }

    console.log(`Searching for patient with ID: ${patientId}`)

    // First try to find by patientId field
    let { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patientId', patientId)
      .maybeSingle()

    // If not found or error, try by 'PATIENT ID' field (legacy format)
    if ((!patient || error) && patientId) {
      const { data: legacyPatient, error: legacyError } = await supabase
        .from('patients')
        .select('*')
        .eq('PATIENT ID', patientId)
        .maybeSingle()

      if (!legacyError && legacyPatient) {
        patient = legacyPatient
        error = null
      }
    }

    // If still not found, try by 'id' field
    if ((!patient || error) && patientId) {
      const { data: idPatient, error: idError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle()

      if (!idError && idPatient) {
        patient = idPatient
        error = null
      }
    }

    if (error) {
      console.error(`Supabase error searching for patient: ${error.message}`)
      return {
        success: false,
        data: null,
        message: `Database error: ${error.message}`
      }
    }

    if (!patient) {
      return {
        success: false,
        data: null,
        message: `No patient found with ID: ${patientId}`
      }
    }

    console.log('Patient found:', patient)
    return {
      success: true,
      data: patient,
      message: 'Patient found successfully'
    }
  } catch (error) {
    console.error('Error getting patient by ID:', error)
    return {
      success: false,
      data: null,
      message: `Failed to fetch patient: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get latest patient ID number (more efficient than fetching all patients)
ipcMain.handle('getLatestPatientId', async () => {
  try {
    // First try Supabase - just get the count
    const { data, error } = await supabase.from('patients').select('patientId')

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }
    // Filter and convert to integers
    const patientIds = data
      .map((p) => p.patientId)
      .filter((id) => /^\d+$/.test(id)) // only numeric strings
      .map((id) => parseInt(id, 10)) // convert to int

    if (patientIds.length === 0) {
      console.log('No valid patient IDs found.')
      return
    }
    const maxId = Math.max(...patientIds)
    console.log('Max Patient ID:', maxId)
    return { success: true, data: maxId || 0, message: 'Latest patient ID fetched successfully' }
  } catch (error) {
    console.error('Error getting latest patient ID from Supabase:', error)
    return {
      success: false,
      data: 0,
      message: `Failed to fetch latest patient ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('getLatestInPatientId', async () => {
  try {
    // First try Supabase - just get the count
    const { data, error } = await supabase.from('inpatients').select('id')

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }
    if (data.length === 0) {
      console.log('No valid patient IDs found.')
      return
    }
    const maxId = Math.max(...data.map((item) => item.id))
    console.log('Max Patient ID:', maxId)
    return { success: true, data: maxId || 0, message: 'Latest patient ID fetched successfully' }
  } catch (error) {
    console.error('Error getting latest patient ID from Supabase:', error)
    return {
      success: false,
      data: 0,
      message: `Failed to fetch latest patient ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Add a new patient
ipcMain.handle('addPatient', async (_, patient) => {
  try {
    // Validate required patient data
    if (!patient || !patient.patientId || !patient.name) {
      return { success: false, data: null, message: 'Missing required patient information' }
    }

    // Generate a unique ID for the patient
    const patientWithId = { ...patient, id: uuidv4() }

    // Add the patient to Supabase
    const { data, error } = await supabase.from('patients').insert([patientWithId]).select()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error('Patient was not added to the database')
    }

    console.log('Patient added to Supabase:', data)
    return { success: true, data: patientWithId, message: 'Patient added successfully' }
  } catch (error) {
    console.error('Error adding patient:', error)
    return {
      success: false,
      data: null,
      message: `Failed to add patient: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get all operations

// In-Patient Management
ipcMain.handle('getInPatients', async () => {
  try {
    const { data, error } = await supabase
      .from('inpatients')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching in-patients:', error)
      return { success: false, message: 'Failed to fetch in-patients', error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getInPatients:', error)
    return { success: false, message: 'An error occurred while fetching in-patients', error }
  }
})

ipcMain.handle('getLatestinPatientId', async () => {
  try {
    const { data, error } = await supabase
      .from('inpatients')
      .select('patientId')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    const latestId = data && data.length > 0 ? data[0].patientId : null
    return { success: true, data: { latestId } }
  } catch (error) {
    console.error('Error fetching latest patient ID:', error)
    return {
      success: false,
      message: `Failed to fetch latest patient ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('addInPatient', async (_, inpatientData) => {
  try {
    const { data, error } = await supabase
      .from('inpatients')
      .insert([
        {
          ...inpatientData,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return { success: true, data: data?.[0] || null }
  } catch (error) {
    console.error('Error adding in-patient:', error)
    return {
      success: false,
      message: `Failed to add in-patient record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('updateInPatient', async (_, id, inpatientData) => {
  try {
    console.log('updateInPatient id:', id)
    console.log('updateInPatient inpatientData:', inpatientData)

    // Validate parameters
    if (!id) {
      throw new Error('Missing required parameter: id')
    }

    // Log the validated parameters
    console.log('Processing update for inpatient ID:', id)

    const { data, error } = await supabase
      .from('inpatients')
      .update({
        operationDetails: id.inpatientData.operationDetails,
        operationProcedure: id.inpatientData.operationProcedure,
        provisionDiagnosis: id.inpatientData.provisionDiagnosis,
        prescriptions: id.inpatientData.prescriptions,
        updated_at: new Date().toISOString()
      })
      .eq('id', id.id)
      .select()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return { success: true, data: data?.[0] || null }
  } catch (error) {
    console.error('Error updating in-patient:', error)
    return {
      success: false,
      message: `Failed to update in-patient record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('deleteInPatient', async (_, id) => {
  try {
    const { error } = await supabase.from('inpatients').delete().eq('id', id)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting in-patient:', error)
    return {
      success: false,
      message: `Failed to delete in-patient record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('getInPatientById', async (_, id) => {
  try {
    const { data, error } = await supabase.from('inpatients').select('*').eq('id', id).single()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching in-patient by ID:', error)
    return {
      success: false,
      message: `Failed to fetch in-patient record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

ipcMain.handle('getOperations', async () => {
  try {
    // Fetch all operations from Supabase
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .order('dateOfOperation', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log(`Fetched ${operations?.length || 0} operations from Supabase`)
    return { success: true, data: operations || [], message: 'Operations fetched successfully' }
  } catch (error) {
    console.error('Error getting operations from Supabase:', error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch operations: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get operations for a specific patient
ipcMain.handle('getPatientOperations', async (_, patientId: string) => {
  try {
    if (!patientId) {
      return { success: false, data: [], message: 'Patient ID is required' }
    }

    console.log(`Fetching operations for patient ID: ${patientId}`)

    // Fetch operations for the specific patient from Supabase
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .eq('patientId', patientId)
      .order('dateOfOperation', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log(`Fetched ${operations?.length || 0} operations for patient ${patientId}`)
    return {
      success: true,
      data: operations || [],
      message: `Operations for patient ${patientId} fetched successfully`
    }
  } catch (error) {
    console.error(`Error getting operations for patient ${patientId}:`, error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch operations for patient: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Update an existing patient
ipcMain.handle('updatePatient', async (_, id, updatedPatient) => {
  try {
    // Validate input parameters
    if (!id) {
      return { success: false, data: null, message: 'Patient ID is required for update' }
    }

    if (!updatedPatient) {
      return { success: false, data: null, message: 'Updated patient data is required' }
    }

    // Update patient in Supabase
    const { data, error } = await supabase
      .from('patients')
      .update(updatedPatient)
      .eq('id', id)
      .select()

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`Patient with ID ${id} not found or not updated`)
    }

    console.log('Patient updated in Supabase:', data)
    return { success: true, data: data[0], message: 'Patient updated successfully' }
  } catch (error) {
    console.error('Error updating patient:', error)
    return {
      success: false,
      data: null,
      message: `Failed to update patient: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Delete a patient
ipcMain.handle('deletePatient', async (_, id) => {
  try {
    // Validate input parameter
    if (!id) {
      return { success: false, message: 'Patient ID is required for deletion' }
    }

    // Check if patient exists before deletion
    const { data: existingPatient, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is the error code when no rows returned
      throw new Error(`Error checking patient existence: ${checkError.message}`)
    }

    if (!existingPatient) {
      return { success: false, message: `Patient with ID ${id} not found` }
    }

    // Delete patient from Supabase
    const { error } = await supabase.from('patients').delete().eq('id', id)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Patient deleted from Supabase successfully')
    return { success: true, message: 'Patient deleted successfully' }
  } catch (error) {
    console.error('Error deleting patient from Supabase:', error)
    return {
      success: false,
      message: `Failed to delete patient: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get all prescriptions and receipts
ipcMain.handle('getPrescriptions', async () => {
  try {
    // Fetch all prescriptions from Supabase
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('DATE', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Prescriptions fetched from Supabase successfully')
    return prescriptions || []
  } catch (error) {
    console.error('Error getting prescriptions from Supabase:', error)
    return false
  }
})

//get latest prescription id
ipcMain.handle('getLatestPrescriptionId', async () => {
  try {
    // Get latest prescription id from Supabase
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Latest prescription id fetched from Supabase successfully')
    // Check if prescriptions array exists and has items before accessing index 0
    if (prescriptions && prescriptions.length > 0) {
      return prescriptions[0].id || 0
    } else {
      // No prescriptions found, return 0 as default
      return 0
    }
  } catch (error) {
    console.error('Error getting latest prescription id from Supabase:', error)
    return 0
  }
})

// Get prescriptions by patient ID
ipcMain.handle('getPrescriptionsByPatientId', async (_, patientId) => {
  try {
    // Fetch prescriptions for the specific patient from Supabase
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('PATIENT ID', patientId)
      .order('DATE', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log(`Prescriptions for patient ${patientId} fetched successfully`)
    return {
      success: true,
      data: prescriptions || [],
      message:
        prescriptions && prescriptions.length > 0
          ? `Found ${prescriptions.length} prescriptions for patient`
          : 'No prescriptions found for this patient'
    }
  } catch (error) {
    console.error(`Error getting prescriptions for patient ${patientId}:`, error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch prescriptions: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get today's prescriptions
ipcMain.handle('getTodaysPrescriptions', async () => {
  try {
    // First try Supabase - just get the count
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('DATE', today)
      .order('CREATED AT', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Prescriptions fetched from Supabase successfully')
    return prescriptions || []
  } catch (error) {
    console.error('Error getting latest prescription ID from Supabase:', error)
    return []
  }
})

// Get prescriptions by specific date
ipcMain.handle('getPrescriptionsByDate', async (_, date: string) => {
  try {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD')
    }

    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('DATE', date)
      .order('CREATED AT', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log(`Prescriptions for date ${date} fetched from Supabase successfully`)
    return prescriptions || []
  } catch (error) {
    console.error(`Error getting prescriptions for date ${date}:`, error)
    return []
  }
})

// Add a new prescription and receipt
ipcMain.handle('addPrescription', async (_, prescription) => {
  try {
    // Generate a unique ID for the prescription
    const prescriptionWithId = { ...prescription, id: uuidv4() }

    // Also get the highest Sno from Supabase
    let highestSnoFromSupabase = ''
    try {
      // Get only the Sno values from the database to minimize data transfer
      const { data, error } = await supabase.from('prescriptions').select('Sno')

      console.log('Data from Supabase:', data?.length, 'records found')

      if (!error && data && data.length > 0) {
        // Find the highest numeric Sno by parsing all values
        // This handles any number of records and ensures we get the true highest value

        const SnoIds = data
          .map((p) => p.Sno)
          .filter((id) => /^\d+$/.test(id)) // only numeric strings
          .map((id) => parseInt(id, 10)) // convert to int

        if (SnoIds.length === 0) {
          console.log('No valid Sno IDs found.')
          return
        }
        const maxId = Math.max(...SnoIds)
        console.log('Max Sno ID:', maxId)

        highestSnoFromSupabase = maxId.toString()
        console.log('Highest numeric Sno found:', highestSnoFromSupabase)
      } else {
        console.log('No prescription records found in Supabase or error occurred')
      }
    } catch (supabaseError) {
      console.error('Error getting highest Sno from Supabase:', supabaseError)
      // Continue with local calculation if Supabase fails
    }

    // Add the new prescription with Sno
    let nextSno = 1 // Default to 1 if no previous prescriptions
    let ReceiptNo = ''

    if (highestSnoFromSupabase) {
      const parsedSno = parseInt(highestSnoFromSupabase)
      // Check if parsedSno is a valid number
      if (!isNaN(parsedSno)) {
        nextSno = parsedSno + 1
        ReceiptNo = `R${nextSno.toString().padStart(4, '0')}`
        console.log('Next Sno:', nextSno)
      }
    }

    const prescriptionWithSno = {
      ...prescriptionWithId,
      Sno: nextSno.toString(), // Convert to string to maintain consistency in storage
      'RECEIPT NO': ReceiptNo
    }

    // Add to Supabase
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescriptionWithSno])
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription added to Supabase:', data)
      return {
        success: true,
        data: data[0] || prescriptionWithSno,
        message: 'Prescription added successfully'
      }
    } catch (supabaseError) {
      console.error('Error adding prescription to Supabase:', supabaseError)
      // Continue with local file update even if Supabase fails
      return { success: false, data: null, message: 'Failed to add prescription to Supabase' }
    }
  } catch (error) {
    console.error('Error adding prescription:', error)
    throw error
  }
})

// Update an existing prescription and receipt
ipcMain.handle('updatePrescription', async (_, id, updatedPrescription) => {
  try {
    // Update in Supabase first
    try {
      // Create a clean copy of data without the ID field to prevent primary key conflicts
      const prescriptionDataWithoutId = { ...updatedPrescription }
      delete prescriptionDataWithoutId.id

      const { data, error } = await supabase
        .from('prescriptions')
        .update(prescriptionDataWithoutId)
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription updated in Supabase:', data)

      return {
        success: true,
        data: data[0] || updatedPrescription,
        message: 'Prescription updated successfully'
      }
    } catch (supabaseError) {
      console.error('Error updating prescription in Supabase:', supabaseError)
      // Fall back to Excel-only update if Supabase fails
      return { success: false, data: null, message: 'Failed to update prescription in Supabase' }
    }
  } catch (error) {
    console.error('Error updating prescription:', error)
    throw error
  }
})

// Delete a prescription and receipt
ipcMain.handle('deletePrescription', async (_, id) => {
  try {
    // Delete from Supabase first
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription deleted from Supabase successfully')
      return { success: true, data: null, message: 'Prescription deleted successfully' }
    } catch (supabaseError) {
      console.error('Error deleting prescription from Supabase:', supabaseError)
      // Continue with local file update even if Supabase fails
      return { success: false, data: null, message: 'Failed to delete prescription from Supabase' }
    }
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return { success: false, data: null, message: 'Failed to delete prescription' }
  }
})
// Search prescriptions by patient ID, name, or phone number
ipcMain.handle('searchPrescriptions', async (_, searchTerm) => {
  try {
    // If no search term, return all prescriptions
    if (!searchTerm || searchTerm.trim() === '') {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('All prescriptions fetched from Supabase for search')
      return data || []
    }

    // Search in Supabase using ilike for case-insensitive search
    const searchTermLower = `%${searchTerm.toLowerCase()}%`

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .or(
          `patientId.ilike.${searchTermLower},` +
            `name.ilike.${searchTermLower},` +
            `phone.ilike.${searchTermLower},` +
            `guardian.ilike.${searchTermLower}`
        )
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescriptions search results fetched from Supabase')
      return data || []
    } catch (supabaseError) {
      console.error('Error searching prescriptions in Supabase:', supabaseError)
      // Fall back to local Excel search if Supabase fails
      return []
    }
  } catch (error) {
    console.error('Error searching prescriptions:', error)
    return []
  }
})

// Search patients by ID, name, or phone number
ipcMain.handle('searchPatients', async (_, searchTerm) => {
  // If search term is empty, return all patients
  if (!searchTerm || searchTerm.trim() === '') {
    try {
      // Get all patients from Supabase
      const { data: patients, error } = await supabase.from('patients').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      return patients || []
    } catch (supabaseError) {
      console.error('Error getting patients from Supabase:', supabaseError)
      // Fall back to Excel
    }
  }

  // Search in Supabase using ilike for case-insensitive search
  const searchTermLower = `%${searchTerm.toLowerCase()}%`

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(
        `patientId.ilike.${searchTermLower},` +
          `name.ilike.${searchTermLower},` +
          `phone.ilike.${searchTermLower}`
      )

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return data || []
  } catch (supabaseError) {
    console.error('Error searching patients in Supabase:', supabaseError)
    // Fall back to local Excel search if Supabase fails
    return []
  }
})

// Add a new operation
ipcMain.handle('addOperation', async (_, operation) => {
  try {
    // Generate a unique ID for the operation and bill number if not provided
    const operationWithId = { ...operation, id: uuidv4() }

    // Generate bill number if not provided
    if (!operationWithId.billNumber) {
      try {
        // Get the count of existing operations to generate bill number
        const { count } = await supabase.from('operations').select('id', { count: 'exact' })

        // Generate bill number in format 'O' followed by 4 digits
        const nextNumber = (count || 0) + 1
        operationWithId.billNumber = `O${String(nextNumber).padStart(4, '0')}`
        console.log('Generated bill number:', operationWithId.billNumber)
      } catch (error) {
        console.error('Error generating bill number:', error)
        // Fallback to a timestamp-based bill number if count fails
        const timestamp = new Date().getTime() % 10000
        operationWithId.billNumber = `O${String(timestamp).padStart(4, '0')}`
      }
    }

    // Insert operation into Supabase
    try {
      const { data, error } = await supabase.from('operations').insert([operationWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation added to Supabase:', data)

      // Return standardized response format
      return {
        success: true,
        data: data[0],
        message: 'Operation added successfully'
      }
    } catch (supabaseError) {
      console.error('Error adding operation to Supabase:', supabaseError)
      // Return standardized error response
      return {
        success: false,
        data: null,
        message: `Failed to add operation: ${supabaseError instanceof Error ? supabaseError.message : 'Database error'}`
      }
    }
  } catch (error) {
    console.error('Error adding operation:', error)
    // Return standardized error response for any other errors
    return {
      success: false,
      data: null,
      message: `Error adding operation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Update an existing operation
ipcMain.handle('updateOperation', async (_, id, updatedOperation) => {
  try {
    // Ensure we don't overwrite the bill number or createdBy fields
    const operationToUpdate = { ...updatedOperation }

    // If billNumber is empty, we should preserve the existing one
    if (!operationToUpdate.billNumber) {
      try {
        const { data: existingOperation, error: fetchError } = await supabase
          .from('operations')
          .select('billNumber, createdBy')
          .eq('id', id)
          .single()

        if (!fetchError && existingOperation) {
          // Preserve the existing bill number
          if (existingOperation.billNumber) {
            operationToUpdate.billNumber = existingOperation.billNumber
          }

          // Preserve the createdBy field
          if (existingOperation.createdBy) {
            operationToUpdate.createdBy = existingOperation.createdBy
          }
        }
      } catch (error) {
        console.error('Error fetching existing operation data:', error)
      }
    }

    // Update operation in Supabase first
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ ...operationToUpdate })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation updated in Supabase:', data)

      // Return standardized response format
      return {
        success: true,
        data: data[0],
        message: 'Operation updated successfully'
      }
    } catch (supabaseError) {
      console.error('Error updating operation in Supabase:', supabaseError)
      // Return standardized error response
      return {
        success: false,
        data: null,
        message: `Failed to update operation: ${supabaseError instanceof Error ? supabaseError.message : 'Database error'}`
      }
    }
  } catch (error) {
    console.error('Error updating operation:', error)
    // Return standardized error response for any other errors
    return {
      success: false,
      data: null,
      message: `Error updating operation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Delete an operation
ipcMain.handle('deleteOperation', async (_, id) => {
  try {
    // Delete from Supabase first
    try {
      const { error } = await supabase.from('operations').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation deleted from Supabase')
      // Return standardized response format
      return {
        success: true,
        data: { id },
        message: 'Operation deleted successfully'
      }
    } catch (supabaseError) {
      console.error('Error deleting operation from Supabase:', supabaseError)
      // Return standardized error response
      return {
        success: false,
        data: null,
        message: `Failed to delete operation: ${supabaseError instanceof Error ? supabaseError.message : 'Database error'}`
      }
    }
  } catch (error) {
    console.error('Error deleting operation:', error)
    // Return standardized error response for any other errors
    return {
      success: false,
      data: null,
      message: `Error deleting operation: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// ==================== MEDICINES MANAGEMENT ====================

// Get all medicines
ipcMain.handle('getMedicines', async () => {
  try {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return {
          success: false,
          data: [],
          message: `Failed to fetch medicines: ${error.message}`
        }
      }

      console.log('All medicines fetched from Supabase')
      return {
        success: true,
        data: data || [],
        message: `Successfully fetched ${data?.length || 0} medicines`
      }
    } catch (supabaseError) {
      console.error('Error getting medicines from Supabase:', supabaseError)
      return {
        success: false,
        data: [],
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error getting medicines:', error)
    return {
      success: false,
      data: [],
      message: `Failed to fetch medicines: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Search medicines by name
ipcMain.handle('searchMedicines', async (_, searchTerm) => {
  try {
    // Try to search in Supabase first
    try {
      // If no search term, get all medicines
      if (!searchTerm || searchTerm.trim() === '') {
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          return {
            success: false,
            data: [],
            message: `Failed to fetch medicines: ${error.message}`
          }
        }

        console.log('All medicines fetched from Supabase')
        return {
          success: true,
          data: data || [],
          message: `Successfully fetched ${data?.length || 0} medicines`
        }
      } else {
        // If there's a search term, use ilike for case-insensitive search
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .order('name', { ascending: true })

        if (error) {
          return {
            success: false,
            data: [],
            message: `Failed to search for medicines: ${error.message}`
          }
        }

        console.log(`Medicines search results for "${searchTerm}" fetched from Supabase`)
        return {
          success: true,
          data: data || [],
          message: `Found ${data?.length || 0} medicines matching "${searchTerm}"`
        }
      }
    } catch (supabaseError) {
      console.error('Error searching medicines from Supabase:', supabaseError)
      return {
        success: false,
        data: [],
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    return {
      success: false,
      data: [],
      message: `Failed to search medicines: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Add a new medicine
ipcMain.handle('addMedicine', async (_, medicine) => {
  try {
    // Generate a unique ID for the medicine
    const medicineWithId = { ...medicine, id: uuidv4() }

    // Try to add to Supabase first
    try {
      const { data, error } = await supabase.from('medicines').insert([medicineWithId]).select()

      if (error) {
        return {
          success: false,
          data: null,
          message: `Failed to add medicine: ${error.message}`
        }
      }

      console.log('Medicine added to Supabase successfully')
      return {
        success: true,
        data: data[0] || medicineWithId,
        message: 'Medicine added successfully'
      }
    } catch (supabaseError) {
      console.error('Error adding medicine to Supabase:', supabaseError)
      return {
        success: false,
        data: null,
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error adding medicine:', error)
    return {
      success: false,
      data: null,
      message: `Failed to add medicine: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Update an existing medicine
ipcMain.handle('updateMedicine', async (_, id, updatedMedicine) => {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        message: 'Medicine ID is required'
      }
    }

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({ ...updatedMedicine })
        .eq('id', id)
        .select()

      if (error) {
        return {
          success: false,
          data: null,
          message: `Failed to update medicine: ${error.message}`
        }
      }

      console.log('Medicine updated in Supabase')
      return {
        success: true,
        data: data[0] || { ...updatedMedicine, id },
        message: 'Medicine updated successfully'
      }
    } catch (supabaseError) {
      console.error('Error updating medicine in Supabase:', supabaseError)
      return {
        success: false,
        data: null,
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error updating medicine:', error)
    return {
      success: false,
      data: null,
      message: `Failed to update medicine: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Delete a medicine
ipcMain.handle('deleteMedicine', async (_, id) => {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        message: 'Medicine ID is required'
      }
    }

    // Delete from Supabase first
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id)

      if (error) {
        return {
          success: false,
          data: null,
          message: `Failed to delete medicine: ${error.message}`
        }
      }

      console.log('Medicine deleted from Supabase')

      return {
        success: true,
        data: { id },
        message: 'Medicine deleted successfully'
      }
    } catch (supabaseError) {
      console.error('Error deleting medicine from Supabase:', supabaseError)
      return {
        success: false,
        data: null,
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return {
      success: false,
      data: null,
      message: `Failed to delete medicine: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Update medicine status
ipcMain.handle('updateMedicineStatus', async (_, id, status) => {
  try {
    if (!id) {
      return {
        success: false,
        data: null,
        message: 'Medicine ID is required'
      }
    }

    if (!status) {
      return {
        success: false,
        data: null,
        message: 'Status is required'
      }
    }

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({ status })
        .eq('id', id)
        .select()

      if (error) {
        return {
          success: false,
          data: null,
          message: `Failed to update medicine status: ${error.message}`
        }
      }

      console.log('Medicine status updated in Supabase')
      return {
        success: true,
        data: data[0] || { id, status },
        message: `Medicine status updated to ${status} successfully`
      }
    } catch (supabaseError) {
      console.error('Error updating medicine status in Supabase:', supabaseError)
      return {
        success: false,
        data: null,
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error updating medicine status:', error)
    return {
      success: false,
      data: null,
      message: `Failed to update medicine status: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get medicines by status
ipcMain.handle('getMedicinesByStatus', async (_, status) => {
  try {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('status', status)
        .order('name', { ascending: true })

      if (error) {
        return {
          success: false,
          data: [],
          message: `Failed to fetch medicines: ${error.message}`
        }
      }

      console.log(`Medicines with status '${status}' fetched from Supabase`)
      return {
        success: true,
        data: data || [],
        message: `Successfully fetched ${data?.length || 0} medicines with status '${status}'`
      }
    } catch (supabaseError) {
      console.error('Error getting medicines by status from Supabase:', supabaseError)
      return {
        success: false,
        data: [],
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error getting medicines by status:', error)
    return {
      success: false,
      data: [],
      message: `Failed to get medicines: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get medicine dispense records with pagination
ipcMain.handle('getMedicineDispenseRecords', async (_, page = 1, pageSize = 10) => {
  try {
    // Try to get from Supabase first
    try {
      // Calculate offset based on page and pageSize
      const offset = (page - 1) * pageSize

      // Get total count first
      const { count, error: countError } = await supabase
        .from('medicine_dispense_records')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        return {
          success: false,
          data: [],
          totalCount: 0,
          page: page,
          pageSize: pageSize,
          message: `Failed to count medicine dispense records: ${countError.message}`
        }
      }

      // Get paginated data
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .order('dispensedDate', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (error) {
        return {
          success: false,
          data: [],
          totalCount: 0,
          page: page,
          pageSize: pageSize,
          message: `Failed to fetch medicine dispense records: ${error.message}`
        }
      }

      console.log(`Medicine dispense records fetched from Supabase (page ${page})`)
      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        page: page,
        pageSize: pageSize,
        message: `Successfully fetched ${data?.length || 0} medicine dispense records`
      }
    } catch (supabaseError) {
      console.error('Error getting medicine dispense records from Supabase:', supabaseError)
      return {
        success: false,
        data: [],
        totalCount: 0,
        page: page,
        pageSize: pageSize,
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error getting medicine dispense records:', error)
    return {
      success: false,
      data: [],
      totalCount: 0,
      page: page,
      pageSize: pageSize,
      message: `Failed to fetch medicine dispense records: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// ==================== OPTICALS MANAGEMENT ====================

// Add a new optical item
ipcMain.handle('addOpticalItem', async (_, item) => {
  try {
    // Generate a unique ID for the optical item
    const itemWithId = { ...item, id: uuidv4() }

    // Try to add to Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').insert([itemWithId]).select()

        if (error) {
          console.error('Error adding optical item to Supabase:', error)
        } else if (data && data.length > 0) {
          // Successfully added to Supabase, still add to Excel as backup
          console.log('Successfully added optical item to Supabase')
          return data[0] || itemWithId
        }
      } catch (supabaseError) {
        console.error('Error adding optical item to Supabase:', supabaseError)
        return false
      }
    }
    return itemWithId
  } catch (error) {
    console.error('Error adding optical item:', error)
    throw error
  }
})

// Update an existing optical item
ipcMain.handle('updateOpticalItem', async (_, id, updatedItem) => {
  try {
    const itemWithId = { ...updatedItem, id }

    // Try to update in Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('opticals')
          .update(itemWithId)
          .eq('id', id)
          .select()

        if (error) {
          console.error('Error updating optical item in Supabase:', error)
        } else if (data && data.length > 0) {
          console.log('Successfully updated optical item in Supabase')
        }
      } catch (supabaseError) {
        console.error('Error updating optical item in Supabase:', supabaseError)
        return false
      }
    }
    return itemWithId
  } catch (error) {
    console.error('Error updating optical item:', error)
    throw error
  }
})

// Delete an optical item
ipcMain.handle('deleteOpticalItem', async (_, id) => {
  try {
    // Try to delete from Supabase first
    if (supabase) {
      try {
        const { error } = await supabase.from('opticals').delete().eq('id', id)

        if (error) {
          console.error('Error deleting optical item from Supabase:', error)
        } else {
          console.log('Successfully deleted optical item from Supabase')
        }
      } catch (supabaseError) {
        console.error('Error deleting optical item from Supabase:', supabaseError)
        return false
      }
    }
    return false
  } catch (error) {
    console.error('Error deleting optical item:', error)
    return false
  }
})
// Update optical item status
ipcMain.handle('updateOpticalItemStatus', async (_, id, status) => {
  try {
    // Try to update status in Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('opticals')
          .update({ status })
          .eq('id', id)
          .select()

        if (error) {
          console.error('Error updating optical item status in Supabase:', error)
        } else if (data && data.length > 0) {
          console.log('Successfully updated optical item status in Supabase')
        }
      } catch (supabaseError) {
        console.error('Error updating optical item status in Supabase:', supabaseError)
        return false
      }
    }
    return false
  } catch (error) {
    console.error('Error updating optical item status:', error)
    return false
  }
})

// Get all optical items
ipcMain.handle('getOpticalItems', async () => {
  try {
    // Try to get data from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').select('*')

        if (error) {
          console.error('Error getting all optical items from Supabase:', error)
          return {
            success: false,
            message: `Failed to get optical items. ${error.message}`
          }
        } else if (data && data.length > 0) {
          return {
            success: true,
            data,
            message: `Found ${data.length} optical items`
          }
        } else {
          return {
            success: true,
            data: [],
            message: 'No optical items found'
          }
        }
      } catch (supabaseError) {
        console.error('Error getting all optical items from Supabase:', supabaseError)
        return {
          success: false,
          message: `Failed to get optical items. ${(supabaseError as Error)?.message || 'Database error'}`
        }
      }
    }

    // Return empty result if Supabase is not available
    return {
      success: true,
      data: [],
      message: 'No optical items found (Supabase unavailable)'
    }
  } catch (error: unknown) {
    console.error('Error getting all optical items:', error)
    return {
      success: false,
      message: `Failed to get optical items. ${(error as Error)?.message || 'Unknown error'}`
    }
  }
})

// Get optical items by status
ipcMain.handle('getOpticalItemsByStatus', async (_, status, type) => {
  try {
    // Try to get data from Supabase first
    if (supabase) {
      try {
        let query = supabase.from('opticals').select('*').eq('status', status)

        // Further filter by type if provided
        if (type) {
          query = query.eq('type', type)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error getting optical items by status from Supabase:', error)
          return {
            success: false,
            message: `Failed to get optical items with status: ${status}. ${error.message}`
          }
        } else if (data && data.length > 0) {
          return {
            success: true,
            data,
            message: `Found ${data.length} optical items with status: ${status}`
          }
        } else {
          return {
            success: true,
            data: [],
            message: `No optical items found with status: ${status}`
          }
        }
      } catch (supabaseError) {
        console.error('Error getting optical items by status from Supabase:', supabaseError)
        return {
          success: false,
          message: `Failed to get optical items with status: ${status}. ${(supabaseError as Error)?.message || 'Database error'}`
        }
      }
    }

    // Return empty result if Supabase is not available
    return {
      success: true,
      data: [],
      message: `No optical items found with status: ${status} (Supabase unavailable)`
    }
  } catch (error: unknown) {
    console.error('Error getting optical items by status:', error)
    return {
      success: false,
      message: `Failed to get optical items with status: ${status}. ${(error as Error)?.message || 'Unknown error'}`
    }
  }
})

// Get optical items by type
ipcMain.handle('getOpticalItemsByType', async (_, type) => {
  try {
    // Try to get data from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').select('*').eq('type', type)

        if (error) {
          console.error('Error getting optical items by type from Supabase:', error)
          return {
            success: false,
            message: `Failed to get optical items of type: ${type}. ${(error as Error)?.message || 'Database error'}`
          }
        } else if (data && data.length > 0) {
          return {
            success: true,
            data,
            message: `Found ${data.length} optical items of type: ${type}`
          }
        } else {
          return {
            success: true,
            data: [],
            message: `No optical items found of type: ${type}`
          }
        }
      } catch (supabaseError) {
        console.error('Error getting optical items by type from Supabase:', supabaseError)
        return {
          success: false,
          message: `Failed to get optical items of type: ${type}. ${(supabaseError as Error)?.message || 'Database error'}`
        }
      }
    }

    // Return empty result if Supabase is not available
    return {
      success: true,
      data: [],
      message: `No optical items found of type: ${type} (Supabase unavailable)`
    }
  } catch (error) {
    console.error('Error getting optical items by type:', error)
    return {
      success: false,
      message: `Failed to get optical items of type: ${type}. ${(error as Error)?.message || 'Unknown error'}`
    }
  }
})

// Search optical items by term
ipcMain.handle('searchOpticalItems', async (_, searchTerm) => {
  try {
    // Try to search data from Supabase first
    if (supabase) {
      try {
        // Convert search term to lowercase for case-insensitive search
        const term = searchTerm.toLowerCase()

        // Search in multiple columns using ilike (case-insensitive LIKE)
        const { data, error } = await supabase
          .from('opticals')
          .select('*')
          .or(
            `brand.ilike.%${term}%,model.ilike.%${term}%,type.ilike.%${term}%,size.ilike.%${term}%,id.ilike.%${term}%`
          )

        if (error) {
          console.error('Error searching optical items in Supabase:', error)
          return {
            success: false,
            message: `Failed to search optical items. ${error.message}`
          }
        } else if (data && data.length > 0) {
          return {
            success: true,
            data,
            message: `Found ${data.length} optical items matching "${searchTerm}"`
          }
        } else {
          return {
            success: true,
            data: [],
            message: `No optical items found matching "${searchTerm}"`
          }
        }
      } catch (supabaseError) {
        console.error('Error searching optical items in Supabase:', supabaseError)
        return {
          success: false,
          message: `Failed to search optical items. ${(supabaseError as Error)?.message || 'Database error'}`
        }
      }
    }

    // Return empty result if Supabase is not available
    return {
      success: true,
      data: [],
      message: `No optical items found matching "${searchTerm}" (Supabase unavailable)`
    }
  } catch (error: unknown) {
    console.error('Error searching optical items:', error)
    return {
      success: false,
      message: `Failed to search optical items. ${(error as Error)?.message || 'Unknown error'}`
    }
  }
})

// Get optical items by status and type
ipcMain.handle('getOpticalItemsByStatusAndType', async (_, status, type) => {
  try {
    // Try to get data from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('opticals')
          .select('*')
          .eq('status', status)
          .eq('type', type)

        if (error) {
          console.error('Error getting optical items by status and type from Supabase:', error)
          return {
            success: false,
            message: `Failed to get optical items with status: ${status} and type: ${type}. ${error.message}`
          }
        } else if (data && data.length > 0) {
          return {
            success: true,
            data,
            message: `Found ${data.length} optical items with status: ${status} and type: ${type}`
          }
        } else {
          return {
            success: true,
            data: [],
            message: `No optical items found with status: ${status} and type: ${type}`
          }
        }
      } catch (supabaseError) {
        console.error(
          'Error getting optical items by status and type from Supabase:',
          supabaseError
        )
        return {
          success: false,
          message: `Failed to get optical items with status: ${status} and type: ${type}. ${(supabaseError as Error)?.message || 'Database error'}`
        }
      }
    }

    // Return empty result if Supabase is not available
    return {
      success: true,
      data: [],
      message: `No optical items found with status: ${status} and type: ${type} (Supabase unavailable)`
    }
  } catch (error: unknown) {
    console.error('Error getting optical items by status and type:', error)
    return {
      success: false,
      message: `Failed to get optical items with status: ${status} and type: ${type}. ${(error as Error)?.message || 'Unknown error'}`
    }
  }
})

// ==================== MEDICINE DISPENSING ====================

// Dispense medicine
ipcMain.handle(
  'dispenseMedicine',
  async (_, id, quantity, dispensedBy, patientId, patientName, price, totalAmount) => {
    try {
      let medicine
      // Try to update in Supabase first
      try {
        // First get the medicine from Supabase
        const { data: medicineData, error: fetchError } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)

        if (fetchError) {
          return {
            success: false,
            data: null,
            message: `Supabase fetch error: ${fetchError.message}`
          }
        }

        if (!medicineData || medicineData.length === 0) {
          return {
            success: false,
            data: null,
            message: `Medicine with ID ${id} not found in database`
          }
        }

        medicine = medicineData[0]

        // Check if there's enough quantity
        if (medicine.quantity < quantity) {
          return {
            success: false,
            data: medicine,
            message: `Not enough medicine in stock. Available: ${medicine.quantity}, Requested: ${quantity}`
          }
        }

        // Update the medicine quantity in Supabase
        const updatedQuantity = medicine.quantity - quantity
        const updatedStatus = updatedQuantity === 0 ? 'out_of_stock' : medicine.status

        const { data: updatedMedicine, error: updateError } = await supabase
          .from('medicines')
          .update({
            quantity: updatedQuantity,
            status: updatedStatus
          })
          .eq('id', id)
          .select()

        if (updateError) {
          return {
            success: false,
            data: null,
            message: `Failed to update medicine quantity: ${updateError.message}`
          }
        }

        console.log('Medicine quantity updated in Supabase')

        // Create a dispense record in Supabase
        const dispenseRecord = {
          id: uuidv4(),
          medicineId: id,
          medicineName: medicine.name,
          batchNumber: medicine.batchNumber,
          quantity: quantity,
          price: price,
          totalAmount: totalAmount,
          dispensedDate: new Date().toISOString(),
          patientName: patientName,
          dispensedBy: dispensedBy,
          patientId: patientId || '',
          expiryDate: medicine.expiryDate || null
        }

        const { error: dispenseError } = await supabase
          .from('medicine_dispense_records')
          .insert([dispenseRecord])

        if (dispenseError) {
          // Even if the dispense record fails, we've already updated the medicine quantity
          // So we return success but with a warning message
          return {
            success: true,
            data: updatedMedicine[0] || medicine,
            message: `Medicine dispensed successfully, but failed to create dispense record: ${dispenseError.message}`
          }
        }

        console.log('Medicine dispense record added to Supabase')

        return {
          success: true,
          data: updatedMedicine[0] || medicine,
          message: `Successfully dispensed ${quantity} units of ${medicine.name}`
        }
      } catch (supabaseError) {
        console.error('Error updating medicine in Supabase:', supabaseError)
        return {
          success: false,
          data: null,
          message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
        }
      }
    } catch (error) {
      console.error('Error dispensing medicine:', error)
      return {
        success: false,
        data: null,
        message: `Failed to dispense medicine: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
)

// Get medicine dispense records by patient ID
ipcMain.handle('getMedicineDispenseRecordsByPatient', async (_, patientId) => {
  try {
    if (!patientId) {
      return {
        success: false,
        data: [],
        message: 'Patient ID is required'
      }
    }

    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .eq('patientId', patientId)
        .order('dispensedDate', { ascending: false })

      if (error) {
        return {
          success: false,
          data: [],
          message: `Failed to fetch dispense records: ${error.message}`
        }
      }

      console.log(`Medicine dispense records for patient ${patientId} fetched from Supabase`)
      return {
        success: true,
        data: data || [],
        message: `Successfully fetched ${data?.length || 0} medicine dispense records for patient`
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records by patient from Supabase:',
        supabaseError
      )
      return {
        success: false,
        data: [],
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error getting medicine dispense records by patient:', error)
    return {
      success: false,
      data: [],
      message: `Failed to get medicine dispense records: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// Get medicine dispense records by medicine ID
ipcMain.handle('getMedicineDispenseRecordsByMedicine', async (_, medicineId) => {
  try {
    if (!medicineId) {
      return {
        success: false,
        data: [],
        message: 'Medicine ID is required'
      }
    }

    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .eq('medicineId', medicineId)
        .order('dispensedDate', { ascending: false })

      if (error) {
        return {
          success: false,
          data: [],
          message: `Failed to fetch dispense records: ${error.message}`
        }
      }

      console.log(`Medicine dispense records for medicine ${medicineId} fetched from Supabase`)
      return {
        success: true,
        data: data || [],
        message: `Successfully fetched ${data?.length || 0} dispense records for this medicine`
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records by medicine from Supabase:',
        supabaseError
      )
      return {
        success: false,
        data: [],
        message: `Database error: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`
      }
    }
  } catch (error) {
    console.error('Error getting medicine dispense records by medicine:', error)
    return {
      success: false,
      data: [],
      message: `Failed to get medicine dispense records: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
})

// ==================== OPTICAL DISPENSING ====================

// Path to the optical dispensing records Excel file
const opticalDispenseFilePath = join(appDataPath, 'optical_dispense_records.xlsx')

// Initialize optical dispensing records Excel file if it doesn't exist
if (!fs.existsSync(opticalDispenseFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OpticalDispenseRecords')
  XLSX.writeFile(workbook, opticalDispenseFilePath)
  hideFile(opticalDispenseFilePath)
}

// Dispense optical item
ipcMain.handle('dispenseOptical', async (_, id, quantity, patientName, patientId, dispensedBy) => {
  try {
    let supabaseOpticalItem: Record<string, unknown> | null = null
    // Try to update in Supabase first
    if (supabase) {
      try {
        // First get the current item to check quantity
        const { data: opticalData, error: getError } = await supabase
          .from('opticals')
          .select('*')
          .eq('id', id)
          .single()

        if (getError) {
          console.error('Error getting optical item from Supabase:', getError)
        } else if (opticalData) {
          supabaseOpticalItem = opticalData as Record<string, unknown>

          // Check if the item is available
          if (supabaseOpticalItem && supabaseOpticalItem.status !== 'available') {
            throw new Error('Optical item is not available')
          }

          // Check if there's enough quantity
          if (supabaseOpticalItem && (supabaseOpticalItem.quantity as number) < quantity) {
            throw new Error(`Only ${supabaseOpticalItem.quantity} units available`)
          }

          // Calculate new quantity
          const newQuantity = supabaseOpticalItem
            ? (supabaseOpticalItem.quantity as number) - quantity
            : 0

          // Determine if status needs to be updated
          const newStatus =
            newQuantity <= 0 ? 'out_of_stock' : (supabaseOpticalItem?.status as string)

          // Update the item in Supabase
          const { data: updateData, error: updateError } = await supabase
            .from('opticals')
            .update({ quantity: newQuantity, status: newStatus })
            .eq('id', id)
            .select()

          if (updateError) {
            console.error('Error updating optical item in Supabase:', updateError)
          } else if (updateData && updateData.length > 0) {
            console.log('Successfully updated optical item in Supabase')

            // Create dispense record in Supabase
            if (supabaseOpticalItem) {
              const dispenseRecord = {
                id: uuidv4(),
                opticalId: id,
                opticalType: supabaseOpticalItem.type as string,
                brand: supabaseOpticalItem.brand as string,
                model: (supabaseOpticalItem.model as string) || '',
                quantity: quantity,
                price: (supabaseOpticalItem.price as number) || 0,
                patientName: patientName,
                patientId: patientId || '',
                dispensedBy: dispensedBy || '',
                dispensedAt: new Date().toISOString()
              }

              const { error: dispenseError } = await supabase
                .from('optical_dispense_records')
                .insert(dispenseRecord)

              if (dispenseError) {
                console.error('Error creating dispense record in Supabase:', dispenseError)
              } else {
                console.log('Successfully created dispense record in Supabase')
              }
            }
          }
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
        return false
      }
      return false
    }

    return false
  } catch (error) {
    console.error('Error dispensing optical item:', error)
    return false
  }
})

// Get optical dispense records with pagination
ipcMain.handle('getOpticalDispenseRecords', async (_, page = 1, pageSize = 10) => {
  try {
    let data: Record<string, unknown>[] = []
    let totalCount = 0

    // Try to get records from Supabase first
    if (supabase) {
      try {
        // Get total count first
        const { count, error: countError } = await supabase
          .from('optical_dispense_records')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          console.error('Error getting optical dispense records count from Supabase:', countError)
        } else if (count !== null) {
          totalCount = count

          // Now get paginated data
          const { data: supabaseData, error: dataError } = await supabase
            .from('optical_dispense_records')
            .select('*')
            .order('dispensedAt', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1)

          if (dataError) {
            console.error('Error getting optical dispense records from Supabase:', dataError)
          } else if (supabaseData) {
            data = supabaseData as Record<string, unknown>[]

            // Return early with Supabase data
            return {
              data,
              totalCount,
              page,
              pageSize
            }
          }
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
        return false
      }
      return false
    }

    return false
  } catch (error) {
    console.error('Error getting optical dispense records:', error)
    return false
  }
})

// Get optical dispense records by patient ID
ipcMain.handle('getOpticalDispenseRecordsByPatient', async (_, patientId) => {
  try {
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('patientId', patientId)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error('Error getting optical dispense records by patient from Supabase:', error)
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
        return false
      }
      return false
    }
    return false
  } catch (error) {
    console.error('Error getting optical dispense records by patient:', error)
    return false
  }
})

// Get optical dispense records by type
ipcMain.handle('getOpticalDispenseRecordsByType', async (_, type) => {
  try {
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('opticalType', type)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error('Error getting optical dispense records by type from Supabase:', error)
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
        return false
      }
    }
    return false
  } catch (error) {
    console.error('Error getting optical dispense records by type:', error)
    return false
  }
})

// Get optical dispense records by optical ID
ipcMain.handle('getOpticalDispenseRecordsByOptical', async (_, opticalId) => {
  try {
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('opticalId', opticalId)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error(
            'Error getting optical dispense records by optical ID from Supabase:',
            error
          )
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }
    return false
  } catch (error) {
    console.error('Error getting optical dispense records by optical ID:', error)
    return false
  }
})
// ==================== ANALYTICS MODULE ====================

// Define interfaces for analytics data
interface ConditionStat {
  name: string
  count: number
  quantity?: number
}

interface PeakHourStat {
  hour: number
  count: number
}

interface TimeSeriesData {
  labels: string[]
  patients: number[]
  revenue: number[]
  medicines: number[]
  opticals: number[]
  labs: number[]
  vlabs: number[]
}

interface AnalyticsData {
  patientStats: {
    total: number
    new: number
    returning: number
    gender: { male: number; female: number; other: number }
    ageGroups: { [key: string]: number }
    conditions: ConditionStat[]
  }
  revenueStats: {
    total: number
    consultations: number
    medicines: number
    opticals: number
    operations: number
    labs: number
    vlabs: number
    pending: number
  }
  medicineStats: {
    totalDispensed: number
    topMedicines: ConditionStat[]
    outOfStock: number
    lowStock: number
    revenue: number
  }
  opticalStats: {
    totalDispensed: number
    frames: number
    lenses: number
    revenue: number
    topBrands: ConditionStat[]
  }
  eyeConditionStats: {
    conditions: ConditionStat[]
    treatmentSuccess: number
  }
  patientTreatmentStats: {
    completedTreatments: number
    ongoingTreatments: number
    followUps: number
    peakHours: PeakHourStat[]
  }
  timeSeriesData: TimeSeriesData
}

// Helper function to generate analytics data
async function generateAnalyticsData(
  startDate: string | Date,
  endDate: string | Date
): Promise<AnalyticsData | null> {
  try {
    const start = startDate instanceof Date ? startDate : new Date(startDate)
    const end = endDate instanceof Date ? endDate : new Date(endDate)

    // Initialize analytics data structure to match OverviewDashboard component expectations
    const analyticsData = {
      patientStats: {
        total: 0,
        new: 0,
        returning: 0,
        gender: { male: 0, female: 0, other: 0 },
        ageGroups: { 'under 18': 0, '18 to 30': 0, '31 to 45': 0, '46 to 60': 0, 'above 60': 0 },
        conditions: [] as ConditionStat[],
        // Required by OverviewDashboard
        followUp: 0,
        average: 0,
        change: 0,
        averageChange: 0
      },
      revenueStats: {
        total: 0,
        consultations: 0,
        medicines: 0,
        opticals: 0,
        operations: 0,
        labs: 0,
        vlabs: 0,
        pending: 0,
        // Required by OverviewDashboard
        change: 0
      },
      medicineStats: {
        totalDispensed: 0,
        topMedicines: [] as ConditionStat[],
        outOfStock: 0,
        lowStock: 0, // Keep as number to match existing interface
        revenue: 0,
        // Required by OverviewDashboard
        dispensed: 0,
        topItems: [] as Array<{
          name: string
          quantity: number
          revenue: number
          percentage: number
        }>
      },
      opticalStats: {
        totalDispensed: 0,
        frames: 0,
        lenses: 0,
        revenue: 0,
        topBrands: [] as ConditionStat[],
        // Required by OverviewDashboard
        sold: 0,
        topItems: [] as Array<{
          name: string
          quantity: number
          revenue: number
          percentage: number
          type: string
        }>
      },
      eyeConditionStats: {
        conditions: [] as Array<{ name: string; count: number }>,
        treatmentSuccess: 0
      },
      patientTreatmentStats: {
        completedTreatments: 0,
        ongoingTreatments: 0,
        followUps: 0,
        peakHours: [] as PeakHourStat[],
        // Required by OverviewDashboard
        labels: [] as string[],
        inflow: [] as number[],
        treatments: [] as number[],
        operations: 0
      },
      // Required by OverviewDashboard
      receiptStats: {
        total: 0,
        change: 0,
        prescriptions: 0,
        pending: 0,
        completed: 0
      },
      timeSeriesData: {
        labels: [] as string[],
        patients: [] as number[],
        revenue: [] as number[],
        medicines: [] as number[],
        opticals: [] as number[]
      } as TimeSeriesData
    }

    // Get patients data - try Supabase first, fallback to Excel
    let patients: Array<{
      id: string
      date: string
      gender: string
      dob: string
      name: string
      patientId: string
      age: number
      [key: string]: unknown
    }> = []

    try {
      // Try to get patients from Supabase first
      const { data: supabasePatients, error } = await supabase
        .from('patients')
        .select('*')
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabasePatients && supabasePatients.length > 0) {
        patients = supabasePatients as Array<{
          id: string
          date: string
          gender: string
          dob: string
          name: string
          patientId: string
          age: number
          [key: string]: unknown
        }>
        console.log('Patients data fetched from Supabase for analytics')
      } else {
        throw new Error('No patients data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting patients from Supabase for analytics:', supabaseError)
    }

    if (patients.length > 0) {
      // Filter patients by date range (for Excel fallback)
      const filteredPatients = patients

      // Calculate patient statistics
      analyticsData.patientStats.total = filteredPatients.length

      // Count new vs returning patients (simplified logic - could be enhanced)
      const patientVisitCounts = new Map<string, number>()
      filteredPatients.forEach((patient) => {
        const count = patientVisitCounts.get(patient.id) || 0
        patientVisitCounts.set(patient.id, count + 1)
      })

      analyticsData.patientStats.new = Array.from(patientVisitCounts.values()).filter(
        (count) => count === 1
      ).length
      analyticsData.patientStats.returning =
        analyticsData.patientStats.total - analyticsData.patientStats.new

      // Calculate followUp, average, and change metrics required by OverviewDashboard
      analyticsData.patientStats.followUp = Math.round(analyticsData.patientStats.returning / 100) // Estimate 70% of returning patients are follow-ups

      // Calculate average patients per day
      const daysDifference = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      )
      analyticsData.patientStats.average = Math.round(
        analyticsData.patientStats.total / daysDifference
      )

      // Calculate change metrics (simulated for now - would need historical data)
      analyticsData.patientStats.change = Math.round(analyticsData.patientStats.total * 0.1) // Assume 10% growth
      analyticsData.patientStats.averageChange = Math.round(
        analyticsData.patientStats.average * 0.05
      ) // Assume 5% growth in average

      // Gender distribution
      filteredPatients.forEach((patient) => {
        if (patient.gender) {
          const gender = patient.gender.toString().toLowerCase()
          if (gender === 'male') analyticsData.patientStats.gender.male++
          else if (gender === 'female') analyticsData.patientStats.gender.female++
          else analyticsData.patientStats.gender.other++
        }
      })

      // Age groups
      filteredPatients.forEach((patient) => {
        if (patient.dob) {
          const birthDate = new Date(patient.dob)
          const age = new Date().getFullYear() - birthDate.getFullYear()

          if (age < 18) analyticsData.patientStats.ageGroups['under 18']++
          else if (age <= 30) analyticsData.patientStats.ageGroups['18 to 30']++
          else if (age <= 45) analyticsData.patientStats.ageGroups['31 to 45']++
          else if (age <= 60) analyticsData.patientStats.ageGroups['46 to 60']++
          else analyticsData.patientStats.ageGroups['above 60']++
        }
      })
    }

    // Get prescriptions data for revenue and conditions - try Supabase first, fallback to Excel
    let prescriptions: Array<{
      DATE: string
      'RECEIPT NO': string
      'PATIENT ID': string
      'PATIENT NAME': string
      'AMOUNT RECEIVED': number
      'PAID FOR': string
      'TOTAL AMOUNT': number
      'AMOUNT DUE': number
      'PRESENT COMPLAIN': string
      [key: string]: unknown
    }> = []

    try {
      // Try to get prescriptions from Supabase first
      const { data: supabasePrescriptions, error } = await supabase
        .from('prescriptions')
        .select('*')
        .gte('DATE', start.toISOString().split('T')[0])
        .lte('DATE', end.toISOString().split('T')[0])
        .order('DATE', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabasePrescriptions && supabasePrescriptions.length > 0) {
        prescriptions = supabasePrescriptions as Array<{
          DATE: string
          'RECEIPT NO': string
          'PATIENT ID': string
          'PATIENT NAME': string
          'AMOUNT RECEIVED': number
          'PAID FOR': string
          'TOTAL AMOUNT': number
          'AMOUNT DUE': number
          'PRESENT COMPLAIN': string
          [key: string]: unknown
        }>
        console.log('Prescriptions data fetched from Supabase for analytics')
      } else {
        throw new Error('No prescriptions data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting prescriptions from Supabase for analytics:', supabaseError)
    }

    if (prescriptions.length > 0) {
      // Filter prescriptions by date range (for Excel fallback)
      const filteredPrescriptions = prescriptions

      analyticsData.receiptStats.total = filteredPrescriptions.length
      analyticsData.receiptStats.completed = filteredPrescriptions.filter((prescription) => {
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        return dueamount === 0
      }).length
      analyticsData.receiptStats.pending = filteredPrescriptions.filter((prescription) => {
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        return dueamount > 0
      }).length
      analyticsData.receiptStats.prescriptions = filteredPrescriptions.length
      analyticsData.receiptStats.change =
        analyticsData.receiptStats.completed - analyticsData.receiptStats.pending

      // Calculate revenue statistics
      filteredPrescriptions.forEach((prescription) => {
        const amount = Number(prescription['AMOUNT RECEIVED']) || 0
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        analyticsData.revenueStats.total += amount
        if (prescription['AMOUNT RECEIVED'] > 0) {
          analyticsData.revenueStats.consultations += amount
        }

        // Check payment status for pending amount
        if (dueamount > 0) {
          analyticsData.revenueStats.pending += dueamount
        }

        // Collect eye conditions
        if (prescription['PRESENT COMPLAIN']) {
          const diagnosis = prescription['PRESENT COMPLAIN'].toString()
          const existingCondition = analyticsData.patientStats.conditions.find(
            (c) => c.name === diagnosis
          )

          if (existingCondition) {
            existingCondition.count++
          } else {
            analyticsData.patientStats.conditions.push({ name: diagnosis, count: 1 })
          }

          // Also add to eye condition stats
          const existingEyeCondition = analyticsData.eyeConditionStats.conditions.find(
            (c) => c.name === diagnosis
          )
          if (existingEyeCondition) {
            existingEyeCondition.count++
          } else {
            analyticsData.eyeConditionStats.conditions.push({ name: diagnosis, count: 1 })
          }
        }

        if (prescription['PAID FOR']) {
          const paidFor = prescription['PAID FOR'].toString()
          if (
            paidFor === 'REVIEW OP CONSULTATION' ||
            paidFor === 'REVIEW OP WITHIN 15 DAYS' ||
            paidFor === 'ROP REVIEW CONSULTATION'
          ) {
            analyticsData.patientTreatmentStats.followUps++
            analyticsData.patientStats.followUp++
          }
        }
      })

      // Sort conditions by count
      analyticsData.patientStats.conditions.sort((a, b) => b.count - a.count)
      analyticsData.eyeConditionStats.conditions.sort((a, b) => b.count - a.count)

      // Limit to top 5 conditions
      analyticsData.patientStats.conditions = analyticsData.patientStats.conditions.slice(0, 5)
      analyticsData.eyeConditionStats.conditions = analyticsData.eyeConditionStats.conditions.slice(
        0,
        5
      )
    }

    // Get medicine dispense records - try Supabase first, fallback to Excel
    let dispenseRecords: Array<{
      dispensedDate: string
      medicineName: string
      quantity: number
      [key: string]: unknown
    }> = []
    let medicineRecords: Array<{ name: string; price: number; [key: string]: unknown }> = []

    try {
      // Try to get medicine dispense records from Supabase first
      // Create start and end dates with time set to beginning and end of day
      const startDate = new Date(start)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999)

      const { data: supabaseDispenseRecords, error: dispenseError } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .gte('dispensedDate', startDate.toISOString())
        .lte('dispensedDate', endDate.toISOString())
        .order('dispensedDate', { ascending: false })

      if (dispenseError) {
        throw new Error(`Supabase dispense error: ${dispenseError.message}`)
      }

      console.log(supabaseDispenseRecords)

      // Get medicine records from Supabase
      const { data: supabaseMedicineRecords, error: medicineError } = await supabase
        .from('medicines')
        .select('name, price')

      if (medicineError) {
        throw new Error(`Supabase medicine error: ${medicineError.message}`)
      }

      if (supabaseDispenseRecords && supabaseDispenseRecords.length > 0) {
        dispenseRecords = supabaseDispenseRecords as Array<{
          dispensedDate: string
          medicineName: string
          quantity: number
          [key: string]: unknown
        }>
        medicineRecords = (supabaseMedicineRecords || []) as Array<{
          name: string
          price: number
          [key: string]: unknown
        }>
        console.log('Medicine dispense records fetched from Supabase for analytics')
      } else {
        throw new Error('No medicine dispense records from Supabase')
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records from Supabase for analytics:',
        supabaseError
      )
    }

    if (dispenseRecords.length > 0) {
      // Format dates to DD/MM/YYYY
      const formattedRecords = dispenseRecords.map((record) => ({
        ...record,
        dispensedDate: new Date(record.dispensedDate).toISOString().split('T')[0] // For format: DD/MM/YYYY
      }))

      // Filter records by date range
      const filteredRecords = formattedRecords.filter((record) => {
        const recordDate = new Date(record.dispensedDate)
        return recordDate >= start && recordDate <= end
      })

      // Calculate medicine statistics
      analyticsData.medicineStats.totalDispensed = filteredRecords.reduce(
        (total, record) => total + (Number(record.quantity) || 0),
        0
      )

      //calculate revenue from medicines
      filteredRecords.forEach((record) => {
        const medicine = medicineRecords.find((m) => m.name === record.medicineName)
        if (medicine) {
          analyticsData.medicineStats.revenue += medicine.price * Number(record.quantity)
          analyticsData.revenueStats.medicines += medicine.price * Number(record.quantity)
          analyticsData.revenueStats.total += medicine.price * Number(record.quantity)
        }
      })

      // Get top medicines
      const medicineMap = new Map<string, number>()
      filteredRecords.forEach((record) => {
        if (record.medicineName) {
          const name = record.medicineName.toString()
          const count = medicineMap.get(name) || 0
          medicineMap.set(name, count + (Number(record.quantity) || 0))
        }
      })

      analyticsData.medicineStats.topMedicines = Array.from(medicineMap.entries())
        .map(([name, count]) => ({
          name,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get current medicine stock status
      if (fs.existsSync(medicinesFilePath)) {
        // Field names from Excel: name, quantity, expiryDate, batchNumber, price, status, id
        const medicineWorkbook = XLSX.readFile(medicinesFilePath)
        const medicineSheetName = medicineWorkbook.SheetNames[0]
        const medicineWorksheet = medicineWorkbook.Sheets[medicineSheetName]
        const medicines: Array<{
          name: string
          quantity: number
          expiryDate: string
          batchNumber: string
          price: number
          status: string
          id: string
          [key: string]: unknown
        }> = XLSX.utils.sheet_to_json(medicineWorksheet)

        // Update medicine stats based on Excel data
        analyticsData.medicineStats.outOfStock = medicines.filter(
          (m) => m.status === 'out_of_stock'
        ).length
        analyticsData.medicineStats.lowStock = medicines.filter(
          (m) => m.quantity && Number(m.quantity) < 10 && m.status !== 'out_of_stock'
        ).length

        // Update dispensed count for OverviewDashboard
        analyticsData.medicineStats.dispensed = analyticsData.medicineStats.totalDispensed

        // Create topItems for OverviewDashboard
        analyticsData.medicineStats.topItems = analyticsData.medicineStats.topMedicines.map(
          (medicine) => ({
            name: medicine.name,
            quantity: medicine.quantity || 0,
            revenue: Math.round(
              (medicine.quantity || 0) *
                (medicines.find((m) => m.name === medicine.name)?.price || 100)
            ),
            percentage: Math.round(
              ((medicine.quantity || 0) / (analyticsData.medicineStats.totalDispensed || 1)) * 100
            )
          })
        )
      }
    }

    // Get optical dispense records - try Supabase first, fallback to Excel
    let opticalDispenseRecords: Array<{
      dispensedAt: string
      opticalType: string
      brand: string
      quantity: number
      price: number
      [key: string]: unknown
    }> = []

    try {
      // Try to get optical dispense records from Supabase first
      // Create start and end dates with time set to beginning and end of day
      const startDate = new Date(start)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999)

      const { data: supabaseOpticalRecords, error } = await supabase
        .from('optical_dispense_records')
        .select('*')
        .gte('dispensedAt', startDate.toISOString())
        .lte('dispensedAt', endDate.toISOString())
        .order('dispensedAt', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseOpticalRecords && supabaseOpticalRecords.length > 0) {
        opticalDispenseRecords = supabaseOpticalRecords as Array<{
          dispensedAt: string
          opticalType: string
          brand: string
          quantity: number
          price: number
          [key: string]: unknown
        }>
        console.log('Optical dispense records fetched from Supabase for analytics')
      } else {
        throw new Error('No optical dispense records from Supabase')
      }
    } catch (supabaseError) {
      console.error(
        'Error getting optical dispense records from Supabase for analytics:',
        supabaseError
      )
    }

    if (opticalDispenseRecords.length > 0) {
      //formated records
      const formattedRecords = opticalDispenseRecords.map((record) => ({
        ...record,
        dispensedAt: new Date(record.dispensedAt).toISOString().split('T')[0]
      }))

      // Filter records by date range
      const filteredRecords = formattedRecords.filter((record) => {
        const recordDate = new Date(record.dispensedAt)
        return recordDate >= start && recordDate <= end
      })

      // Calculate optical statistics
      analyticsData.opticalStats.totalDispensed = filteredRecords.reduce(
        (total, record) => total + (Number(record.quantity) || 0),
        0
      )
      analyticsData.opticalStats.sold = analyticsData.opticalStats.totalDispensed

      // Count frames vs lenses
      filteredRecords.forEach((record) => {
        if (record.opticalType === 'frame') {
          analyticsData.opticalStats.frames += Number(record.quantity) || 0
        } else if (record.opticalType === 'lens') {
          analyticsData.opticalStats.lenses += Number(record.quantity) || 0
        }
      })

      // Calculate revenue from opticals
      analyticsData.revenueStats.opticals = filteredRecords.reduce(
        (total, record) => total + (Number(record.price) || 0) * (Number(record.quantity) || 0),
        0
      )
      analyticsData.opticalStats.revenue = analyticsData.revenueStats.opticals
      analyticsData.revenueStats.total += analyticsData.revenueStats.opticals

      // Get top brands
      const brandMap = new Map<string, number>()
      filteredRecords.forEach((record) => {
        if (record.brand) {
          const brand = record.brand.toString()
          const count = brandMap.get(brand) || 0
          brandMap.set(brand, count + (Number(record.quantity) || 0))
        }
      })

      // Create top brands for optical stats
      analyticsData.opticalStats.topBrands = Array.from(brandMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }

    // Get operations data - try Supabase first, fallback to Excel
    let operations: Array<{
      patientId: string
      patientName: string
      dateOfAdmit: string
      timeOfAdmit: string
      dateOfOperation: string
      timeOfOperation: string
      dateOfDischarge: string
      timeOfDischarge: string
      operationDetails: string
      operationProcedure: string
      provisionDiagnosis: string
      reviewOn: string
      operatedBy: string
      totalAmount: number
      id: string
      [key: string]: unknown
    }> = []

    try {
      // Try to get operations from Supabase first
      const { data: supabaseOperations, error } = await supabase
        .from('operations')
        .select('*')
        .gte('dateOfAdmit', start.toISOString().split('T')[0])
        .lte('dateOfAdmit', end.toISOString().split('T')[0])
        .order('dateOfAdmit', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseOperations && supabaseOperations.length > 0) {
        operations = supabaseOperations as Array<{
          patientId: string
          patientName: string
          dateOfAdmit: string
          timeOfAdmit: string
          dateOfOperation: string
          timeOfOperation: string
          dateOfDischarge: string
          timeOfDischarge: string
          operationDetails: string
          operationProcedure: string
          provisionDiagnosis: string
          reviewOn: string
          operatedBy: string
          totalAmount: number
          id: string
          [key: string]: unknown
        }>
        console.log('Operations data fetched from Supabase for analytics')
      } else {
        throw new Error('No operations data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting operations from Supabase for analytics:', supabaseError)
    }

    if (operations.length > 0) {
      // Filter operations by date range
      const filteredOperations = operations.filter((operation) => {
        if (!operation.dateOfAdmit) return false
        const operationDate = new Date(operation.dateOfAdmit.toString())
        return operationDate >= start && operationDate <= end
      })
      const today = new Date().toLocaleDateString()
      // Calculate revenue from operations (estimated)
      analyticsData.revenueStats.operations = filteredOperations.reduce(
        (total, operation) => total + (Number(operation.totalAmount) || 0),
        0
      )
      analyticsData.revenueStats.total += analyticsData.revenueStats.operations
      // Calculate treatment statistics
      analyticsData.patientTreatmentStats.completedTreatments = filteredOperations.length
      analyticsData.patientTreatmentStats.ongoingTreatments = Math.round(
        filteredOperations.filter((operations) => !operations.dateOfDischarge).length
      )
      analyticsData.patientTreatmentStats.followUps = Math.round(
        filteredOperations.filter((operations) => operations.reviewOn > today).length
      )

      // Calculate peak hours (simulated data)
      const hourCounts = new Array(24).fill(0)
      filteredOperations.forEach(() => {
        // Simulate peak hours - more operations between 9 AM and 5 PM
        const hour = Math.floor(Math.random() * 8) + 9
        hourCounts[hour]++
      })

      analyticsData.patientTreatmentStats.peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate treatment success rate (simulated)
      analyticsData.eyeConditionStats.treatmentSuccess = Math.round(90 + Math.random() * 10) // 90-100%
    }

    // Get lab records - try Supabase first, fallback to Excel
    let labRecords: Array<{
      DATE: string
      'RECEIPT NO': string
      'PATIENT ID': string
      'PATIENT NAME': string
      'AMOUNT RECEIVED': number
      'TOTAL AMOUNT': number
      'AMOUNT DUE': number
      'LAB TYPE': string
      [key: string]: unknown
    }> = []

    try {
      // Try to get lab records from Supabase first
      const { data: supabaseLabRecords, error } = await supabase
        .from('labs')
        .select('*')
        .gte('DATE', start.toISOString().split('T')[0])
        .lte('DATE', end.toISOString().split('T')[0])
        .order('DATE', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseLabRecords && supabaseLabRecords.length > 0) {
        labRecords = supabaseLabRecords as Array<{
          DATE: string
          'RECEIPT NO': string
          'PATIENT ID': string
          'PATIENT NAME': string
          'AMOUNT RECEIVED': number
          'TOTAL AMOUNT': number
          'AMOUNT DUE': number
          'LAB TYPE': string
          [key: string]: unknown
        }>
        console.log('Lab records fetched from Supabase for analytics')
      } else {
        throw new Error('No lab records from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting lab records from Supabase for analytics:', supabaseError)
    }

    if (labRecords.length > 0) {
      // Filter lab records by date range
      const filteredLabRecords = labRecords.filter((record) => {
        if (!record.DATE) return false
        const recordDate = new Date(record.DATE.toString())
        return recordDate >= start && recordDate <= end
      })
      // Calculate revenue from labs
      filteredLabRecords.forEach((record) => {
        const amount = Number(record['AMOUNT RECEIVED']) || 0
        const labType = (record['type'] || '').toString().toLowerCase()
        const vamount = Number(record['VAMOUNT RECEIVED']) || 0

        // Add to total revenue
        analyticsData.revenueStats.total += amount

        // Categorize by lab type
        if (labType === 'vannela') {
          analyticsData.revenueStats.vlabs += vamount
        } else {
          // Default to regular lab if not specified or any other type
          analyticsData.revenueStats.labs += amount
        }
      })
    }
    // Generate time series data from actual records
    const timeSeriesData: TimeSeriesData = {
      labels: [],
      patients: [],
      revenue: [],
      medicines: [],
      opticals: [],
      labs: [],
      vlabs: []
    }

    // Generate dates between start and end
    const dateArray: Date[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Prepare data maps for each date
    const patientCountByDate = new Map<string, number>()
    const revenueByDate = new Map<string, number>()
    const medicineDispenseByDate = new Map<string, number>()
    const opticalSalesByDate = new Map<string, number>()
    const labRevenueByDate = new Map<string, number>()
    const vlabRevenueByDate = new Map<string, number>()

    // Initialize maps with zero values for all dates
    dateArray.forEach((date) => {
      const dateString = date.toISOString().split('T')[0]
      patientCountByDate.set(dateString, 0)
      revenueByDate.set(dateString, 0)
      medicineDispenseByDate.set(dateString, 0)
      opticalSalesByDate.set(dateString, 0)
      labRevenueByDate.set(dateString, 0)
      vlabRevenueByDate.set(dateString, 0)
    })

    // Calculate patient counts by date using already fetched data
    patients.forEach((patient) => {
      if (patient.date) {
        const patientDate = new Date(patient.date)
        if (patientDate >= start && patientDate <= end) {
          const dateString = patientDate.toISOString().split('T')[0]
          const currentCount = patientCountByDate.get(dateString) || 0
          patientCountByDate.set(dateString, currentCount + 1)
        }
      }
    })

    // Calculate revenue by date from prescriptions using already fetched data
    prescriptions.forEach((prescription) => {
      if (prescription.DATE) {
        const prescriptionDate = new Date(prescription.DATE.toString())
        if (prescriptionDate >= start && prescriptionDate <= end) {
          const dateString = prescriptionDate.toISOString().split('T')[0]
          const amount = Number(prescription['AMOUNT RECEIVED']) || 0
          const currentRevenue = revenueByDate.get(dateString) || 0
          revenueByDate.set(dateString, currentRevenue + amount)
        }
      }
    })

    // Calculate medicine dispense by date using already fetched data
    dispenseRecords.forEach((record) => {
      if (record.dispensedDate) {
        const recordDate = new Date(record.dispensedDate)
        if (recordDate >= start && recordDate <= end) {
          const dateString = recordDate.toISOString().split('T')[0]
          // Update medicine dispense count
          const quantity = Number(record.quantity) || 0
          const currentDispense = medicineDispenseByDate.get(dateString) || 0
          medicineDispenseByDate.set(dateString, currentDispense + quantity)
          // Update revenue from medicine sales
          const medicineName = record.medicineName?.toString()
          const medicine = medicineName
            ? medicineRecords.find((m) => m.name === medicineName)
            : null
          if (medicine) {
            const medicineRevenue = (medicine.price || 0) * quantity
            const currentRevenue = revenueByDate.get(dateString) || 0
            revenueByDate.set(dateString, currentRevenue + medicineRevenue)
          }
        }
      }
    })

    // Calculate optical sales by date using already fetched data
    opticalDispenseRecords.forEach((record) => {
      if (record.dispensedAt) {
        const recordDate = new Date(record.dispensedAt)
        if (recordDate >= start && recordDate <= end) {
          const dateString = recordDate.toISOString().split('T')[0]
          // Update optical sales count
          const quantity = Number(record.quantity) || 0
          const currentSales = opticalSalesByDate.get(dateString) || 0
          opticalSalesByDate.set(dateString, currentSales + quantity)
          // Update revenue from optical sales
          const price = Number(record.price) || 0
          const opticalRevenue = price * quantity
          const currentRevenue = revenueByDate.get(dateString) || 0
          revenueByDate.set(dateString, currentRevenue + opticalRevenue)
        }
      }
    })

    // Add operations revenue to the revenue by date using already fetched data
    operations.forEach((operation) => {
      if (operation.dateOfAdmit) {
        const operationDate = new Date(operation.dateOfAdmit.toString())
        if (operationDate >= start && operationDate <= end) {
          const dateString = operationDate.toISOString().split('T')[0]
          const amount = Number(operation.totalAmount) || 0
          const currentRevenue = revenueByDate.get(dateString) || 0
          revenueByDate.set(dateString, currentRevenue + amount)
        }
      }
    })

    // Add lab revenue to the revenue by date using already fetched data
    labRecords.forEach((record) => {
      if (record.DATE) {
        const labDate = new Date(record.DATE.toString())
        if (labDate >= start && labDate <= end) {
          const dateString = labDate.toISOString().split('T')[0]
          const amount = Number(record['AMOUNT RECEIVED']) || 0
          const labType = (record['LAB TYPE'] || '').toString().toLowerCase()

          // Update total revenue
          const currentRevenue = revenueByDate.get(dateString) || 0
          revenueByDate.set(dateString, currentRevenue + amount)

          // Update lab-specific revenue by type
          if (labType === 'vlab') {
            const currentVlabRevenue = vlabRevenueByDate.get(dateString) || 0
            vlabRevenueByDate.set(dateString, currentVlabRevenue + amount)
          } else {
            const currentLabRevenue = labRevenueByDate.get(dateString) || 0
            labRevenueByDate.set(dateString, currentLabRevenue + amount)
          }
        }
      }
    })

    // Populate time series data from the maps
    dateArray.forEach((date) => {
      const dateString = date.toISOString().split('T')[0]
      timeSeriesData.labels.push(dateString)
      timeSeriesData.patients.push(patientCountByDate.get(dateString) || 0)
      timeSeriesData.revenue.push(revenueByDate.get(dateString) || 0)
      timeSeriesData.medicines.push(medicineDispenseByDate.get(dateString) || 0)
      timeSeriesData.opticals.push(opticalSalesByDate.get(dateString) || 0)
      timeSeriesData.labs.push(labRevenueByDate.get(dateString) || 0)
      timeSeriesData.vlabs.push(vlabRevenueByDate.get(dateString) || 0)
    })

    // Assign time series data to analytics data
    analyticsData.timeSeriesData = timeSeriesData

    return analyticsData
  } catch (error) {
    console.error('Error generating analytics data:', error)
    return null
  }
}

// Get analytics data for the dashboard
ipcMain.handle('getAnalyticsData', async (_, startDate, endDate) => {
  return await generateAnalyticsData(startDate, endDate)
})

ipcMain.handle(
  'exportAnalyticsData',
  async (_, section, startDate, endDate, _timeFilter, format) => {
    try {
      // Get analytics data by directly calling the generateAnalyticsData function
      const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0]
      const defaultEndDate = new Date().toISOString().split('T')[0]

      const analyticsData = await generateAnalyticsData(
        startDate || defaultStartDate,
        endDate || defaultEndDate
      )

      if (!analyticsData) {
        throw new Error('Failed to get analytics data')
      }

      // Create export directory if it doesn't exist
      const exportPath = join(app.getPath('documents'), 'ShehExports')
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true })
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `analytics_${section}_${timestamp}`

      // Export based on format
      if (format === 'excel') {
        const workbook = XLSX.utils.book_new()

        // Create worksheet based on section
        let worksheet
        switch (section) {
          case 'overview':
            worksheet = XLSX.utils.json_to_sheet([
              { metric: 'Total Patients', value: analyticsData.patientStats.total },
              { metric: 'New Patients', value: analyticsData.patientStats.new },
              { metric: 'Returning Patients', value: analyticsData.patientStats.returning },
              { metric: 'Total Revenue', value: analyticsData.revenueStats.total },
              { metric: 'Pending Revenue', value: analyticsData.revenueStats.pending },
              { metric: 'Medicines Dispensed', value: analyticsData.medicineStats.totalDispensed },
              { metric: 'Opticals Dispensed', value: analyticsData.opticalStats.totalDispensed },
              {
                metric: 'Completed Treatments',
                value: analyticsData.patientTreatmentStats.completedTreatments
              },
              {
                metric: 'Ongoing Treatments',
                value: analyticsData.patientTreatmentStats.ongoingTreatments
              },
              { metric: 'Follow-ups', value: analyticsData.patientTreatmentStats.followUps }
            ])
            break

          case 'trends': {
            // Use time series data directly (no need to parse)
            const { timeSeriesData } = analyticsData
            const trendsData = timeSeriesData.labels.map((date, i) => ({
              date,
              patients: timeSeriesData.patients[i],
              revenue: timeSeriesData.revenue[i],
              medicines: timeSeriesData.medicines[i],
              opticals: timeSeriesData.opticals[i]
            }))
            worksheet = XLSX.utils.json_to_sheet(trendsData)
            break
          }

          case 'suggestions':
            worksheet = XLSX.utils.json_to_sheet([
              {
                suggestion: 'Top Eye Condition',
                value: analyticsData.eyeConditionStats.conditions[0]?.name || 'N/A'
              },
              {
                suggestion: 'Treatment Success Rate',
                value: `${analyticsData.eyeConditionStats.treatmentSuccess}%`
              },
              {
                suggestion: 'Top Medicine',
                value: analyticsData.medicineStats.topMedicines[0]?.name || 'N/A'
              },
              {
                suggestion: 'Medicines Out of Stock',
                value: analyticsData.medicineStats.outOfStock
              },
              { suggestion: 'Low Stock Medicines', value: analyticsData.medicineStats.lowStock },
              {
                suggestion: 'Top Optical Brand',
                value: analyticsData.opticalStats.topBrands[0]?.name || 'N/A'
              },
              {
                suggestion: 'Peak Hour',
                value: `${analyticsData.patientTreatmentStats.peakHours[0]?.hour || 'N/A'}:00`
              }
            ])
            break

          default:
            worksheet = XLSX.utils.json_to_sheet([{ error: 'Invalid section' }])
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics')
        XLSX.writeFile(workbook, join(exportPath, `${filename}.xlsx`))

        return { success: true, path: join(exportPath, `${filename}.xlsx`) }
      } else if (format === 'csv') {
        // Create CSV content based on section
        let csvContent = ''

        switch (section) {
          case 'overview':
            csvContent =
              'Metric,Value\n' +
              `Total Patients,${analyticsData.patientStats.total}\n` +
              `New Patients,${analyticsData.patientStats.new}\n` +
              `Returning Patients,${analyticsData.patientStats.returning}\n` +
              `Total Revenue,${analyticsData.revenueStats.total}\n` +
              `Pending Revenue,${analyticsData.revenueStats.pending}\n` +
              `Medicines Dispensed,${analyticsData.medicineStats.totalDispensed}\n` +
              `Opticals Dispensed,${analyticsData.opticalStats.totalDispensed}\n` +
              `Completed Treatments,${analyticsData.patientTreatmentStats.completedTreatments}\n` +
              `Ongoing Treatments,${analyticsData.patientTreatmentStats.ongoingTreatments}\n` +
              `Follow-ups,${analyticsData.patientTreatmentStats.followUps}`
            break

          case 'trends': {
            // Use time series data directly (no need to parse)
            const { timeSeriesData } = analyticsData
            csvContent =
              'Date,Patients,Revenue,Medicines,Opticals\n' +
              timeSeriesData.labels
                .map(
                  (date, i) =>
                    `${date},${timeSeriesData.patients[i]},${timeSeriesData.revenue[i]},${timeSeriesData.medicines[i]},${timeSeriesData.opticals[i]}`
                )
                .join('\n')
            break
          }

          case 'suggestions':
            csvContent =
              'Suggestion,Value\n' +
              `Top Eye Condition,${analyticsData.eyeConditionStats.conditions[0]?.name || 'N/A'}\n` +
              `Treatment Success Rate,${analyticsData.eyeConditionStats.treatmentSuccess}%\n` +
              `Top Medicine,${analyticsData.medicineStats.topMedicines[0]?.name || 'N/A'}\n` +
              `Medicines Out of Stock,${analyticsData.medicineStats.outOfStock}\n` +
              `Low Stock Medicines,${analyticsData.medicineStats.lowStock}\n` +
              `Top Optical Brand,${analyticsData.opticalStats.topBrands[0]?.name || 'N/A'}\n` +
              `Peak Hour,${analyticsData.patientTreatmentStats.peakHours[0]?.hour || 'N/A'}:00`
            break

          default:
            csvContent = 'error,Invalid section'
        }

        fs.writeFileSync(join(exportPath, `${filename}.csv`), csvContent, 'utf8')
        return { success: true, path: join(exportPath, `${filename}.csv`) }
      } else if (format === 'pdf') {
        // For PDF, we'll just return a message since PDF generation would require additional libraries
        return {
          success: false,
          message: 'PDF export requires additional setup. Please use Excel or CSV format.'
        }
      } else {
        throw new Error('Invalid export format')
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
)

// Dropdown Options Management with Supabase
// Table: dropdown_options (columns: id, field_name, option_value, created_at)
// Add new option to dropdown
ipcMain.handle('addDropdownOption', async (_, fieldName: string, newValue: string) => {
  try {
    if (!newValue || !newValue.trim()) {
      return { success: false, error: 'Value cannot be empty' }
    }

    const trimmedValue = newValue.trim()

    // Validate field name
    const validFields = [
      'doctorName',
      'department',
      'referredBy',
      'medicineOptions',
      'presentComplainOptions',
      'previousHistoryOptions',
      'othersOptions',
      'others1Options',
      'operationDetailsOptions',
      'operationProcedureOptions',
      'provisionDiagnosisOptions'
    ]
    if (!validFields.includes(fieldName)) {
      return { success: false, error: 'Invalid field name' }
    }

    try {
      // First, check if the value already exists in Supabase (case-insensitive)
      const { data: existingOptions, error: checkError } = await supabase
        .from('dropdown_options')
        .select('option_value')
        .eq('field_name', fieldName)
        .ilike('option_value', trimmedValue)
        .limit(1)

      if (checkError) {
        console.warn('Supabase check failed, falling back to file system:', checkError.message)
      }

      if (existingOptions && existingOptions.length > 0) {
        return { success: true, message: 'Value already exists' }
      }

      // Add new option to Supabase
      const { error: insertError } = await supabase.from('dropdown_options').insert({
        field_name: fieldName,
        option_value: trimmedValue
      })

      if (insertError) {
        console.warn('Supabase insert failed, falling back to file system:', insertError.message)
      }

      console.log(`Added '${trimmedValue}' to ${fieldName} options in Supabase`)
      return { success: true, message: 'Option added successfully' }
    } catch (supabaseError) {
      console.warn('Supabase operation failed, falling back to file system:', supabaseError)
    }
    return { success: false, error: 'Failed to add option' }
  } catch (error) {
    console.error('Error adding dropdown option:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// Get current dropdown options
ipcMain.handle('getDropdownOptions', async (_, fieldName: string) => {
  try {
    // Validate field name
    const validFields = [
      'doctorName',
      'department',
      'referredBy',
      'medicineOptions',
      'presentComplainOptions',
      'previousHistoryOptions',
      'othersOptions',
      'others1Options',
      'operationDetailsOptions',
      'operationProcedureOptions',
      'provisionDiagnosisOptions',
      'labTestOptions'
    ]
    if (!validFields.includes(fieldName)) {
      return { success: false, error: 'Invalid field name' }
    }

    try {
      // Try to get options from Supabase first
      const { data: options, error } = await supabase
        .from('dropdown_options')
        .select('option_value')
        .eq('field_name', fieldName)
        .order('option_value', { ascending: true })

      if (error) {
        console.warn('Supabase fetch failed, falling back to file system:', error.message)
      }

      const values = options?.map((item) => item.option_value) || []

      // If no options in Supabase, fall back to file system
      if (values.length === 0) {
        console.log(`No options found in Supabase for ${fieldName}, falling back to file system`)
      }

      return { success: true, options: values }
    } catch (supabaseError) {
      console.warn('Supabase operation failed, falling back to file system:', supabaseError)
    }
    return { success: false, error: 'Failed to get options' }
  } catch (error) {
    console.error('Error getting dropdown options:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// Open PDF in a new BrowserWindow
ipcMain.handle('openPdfInWindow', async (_, pdfBuffer: Uint8Array) => {
  try {
    // Create a temporary file path
    const tempDir = path.join(os.tmpdir(), 'sheh-docsile-pdf')

    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Generate a unique filename
    const tempFile = path.join(tempDir, `receipt-${Date.now()}.pdf`)

    // Write the PDF buffer to the temporary file
    fs.writeFileSync(tempFile, Buffer.from(pdfBuffer))

    // Create a new browser window
    const pdfWindow = new BrowserWindow({
      width: 800,
      height: 1000,
      title: 'Prescription Receipt',
      autoHideMenuBar: true
    })

    // Load the PDF file
    await pdfWindow.loadURL(`file://${tempFile}`)

    // Clean up the file when the window is closed
    pdfWindow.on('closed', () => {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      } catch (error) {
        console.error('Error deleting temporary PDF file:', error)
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error opening PDF in window:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})

// Get all labs
ipcMain.handle('getLabs', async () => {
  try {
    const { data: labs, error } = await supabase
      .from('labs')
      .select('*')
      .order('DATE', { ascending: false })

    if (!error && labs) {
      console.log('Labs fetched from Supabase successfully')
      return {
        success: true,
        data: labs,
        error: null,
        statusCode: 200
      }
    }
    return {
      success: false,
      data: [],
      error: error?.message || 'Failed to fetch labs',
      statusCode: 400
    }
  } catch (error) {
    console.error('Error getting labs:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})

// Get today's labs
ipcMain.handle('getTodaysLabs', async () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().split('T')[0]

    const { data: labs, error } = await supabase.from('labs').select('*').eq('DATE', todayDate)

    if (!error && labs) {
      console.log("Today's labs fetched from Supabase successfully")
      return {
        success: true,
        data: labs,
        error: null,
        statusCode: 200
      }
    } else {
      console.log("Today's labs fetched from Supabase failed", error)
      return {
        success: false,
        data: [],
        error: error?.message || "Failed to fetch today's labs",
        statusCode: 400
      }
    }
  } catch (error) {
    console.error("Error getting today's labs:", error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})
// Add a new lab
ipcMain.handle('addLab', async (_, labData: Omit<Lab, 'id'>) => {
  try {
    // Generate a unique ID for the new lab
    const newLab = {
      id: uuidv4(),
      ...labData
    }

    const { data, error } = await supabase.from('labs').insert(newLab).select()

    if (!error && data) {
      console.log('Lab added to Supabase successfully')
      return {
        success: true,
        data: data[0],
        error: null,
        statusCode: 201
      }
    } else {
      console.log('Lab added to Supabase failed', error)
      return {
        success: false,
        data: null,
        error: error?.message || 'Failed to add lab',
        statusCode: 400
      }
    }
  } catch (error) {
    console.error('Error adding lab:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})

// Update an existing lab
ipcMain.handle('updateLab', async (_, labData: Lab) => {
  try {
    const { id } = labData

    const { data, error } = await supabase.from('labs').update(labData).eq('id', id).select()

    if (!error && data) {
      console.log('Lab updated in Supabase successfully')
      return {
        success: true,
        data: data[0],
        error: null,
        statusCode: 200
      }
    } else {
      console.log('Lab updated in Supabase failed', error)
      return {
        success: false,
        data: null,
        error: error?.message || 'Failed to update lab',
        statusCode: 400
      }
    }
  } catch (error) {
    console.error('Error updating lab:', error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})
// Delete a lab
ipcMain.handle('deleteLab', async (_, id: string) => {
  try {
    // Try to delete lab from Supabase first
    const { error } = await supabase.from('labs').delete().eq('id', id)

    if (!error) {
      console.log('Lab deleted from Supabase successfully')
      return {
        success: true,
        data: true,
        error: null,
        statusCode: 200
      }
    } else {
      console.log('Lab deleted from Supabase failed', error)
      return {
        success: false,
        data: false,
        error: error?.message || 'Failed to delete lab',
        statusCode: 400
      }
    }
  } catch (error) {
    console.error('Error deleting lab:', error)
    return {
      success: false,
      data: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})

// Search labs by patient ID
ipcMain.handle('searchLabs', async (_, patientId: string) => {
  try {
    const { data: labs, error } = await supabase
      .from('labs')
      .select('*')
      .eq('PATIENT ID', patientId)
      .order('DATE', { ascending: false })

    if (!error && labs) {
      console.log('Labs searched in Supabase successfully')
      return {
        success: true,
        data: labs,
        error: null,
        statusCode: 200
      }
    } else {
      console.log('Labs searched in Supabase failed', error)
      return {
        success: false,
        data: [],
        error: error?.message || 'Failed to search labs',
        statusCode: 400
      }
    }
  } catch (error) {
    console.error('Error searching labs:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500
    }
  }
})
