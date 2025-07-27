import React, { useState, useEffect, useCallback, useRef } from 'react'
import MedicineForm from '../components/medicines/MedicineForm'
import MedicineTable from '../components/medicines/MedicineTable'
import MedicineEditModal from '../components/medicines/MedicineEditModal'
import MedicineDispenseHistory from '../components/medicines/MedicineDispenseHistory'
import MedicalReceipt from '../components/reciepts/MedicalReceipt'
import MedicalNon from '../components/reciepts/MedicalNon'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { toast, Toaster } from 'sonner'

// Define API interface for type safety
interface API {
  getPatientById: (patientId: string) => Promise<{
    success: boolean
    data: Record<string, unknown>
    message: string
  }>
  updateMedicine: (
    id: string,
    medicine: Record<string, unknown>
  ) => Promise<{
    success: boolean
    data: Record<string, unknown>
    message: string
  }>
  deleteMedicine: (id: string) => Promise<{
    success: boolean
    data: Record<string, unknown> | null
    message: string
  }>
  addMedicine: (medicine: Record<string, unknown>) => Promise<{
    success: boolean
    data: Record<string, unknown>
    message: string
  }>
  updateMedicineStatus: (
    id: string,
    status: string
  ) => Promise<{
    success: boolean
    data: Record<string, unknown>
    message: string
  }>
  searchMedicines: (searchTerm: string) => Promise<{
    success: boolean
    data: Record<string, unknown>[]
    message: string
  }>
  getMedicines: () => Promise<{
    success: boolean
    data: Record<string, unknown>[]
    message: string
  }>
  getMedicinesByStatus: (status: string) => Promise<{
    success: boolean
    data: Record<string, unknown>[]
    message: string
  }>
  getMedicineDispenseRecords: (
    page: number,
    pageSize: number
  ) => Promise<{
    success: boolean
    data: Record<string, unknown>[]
    totalCount: number
    page: number
    pageSize: number
    message: string
  }>
  dispenseMedicine: (
    id: string,
    quantity: number,
    dispensedBy: string,
    patientId: string,
    patientName: string,
    price: number,
    totalAmount: number
  ) => Promise<{
    success: boolean
    data: Record<string, unknown>
    message: string
  }>
  // Add other API methods as needed
}

interface Medicine {
  id: string
  name: string
  quantity: number
  expiryDate: string
  batchNumber: string
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface MedicineDispenseRecord {
  id: string
  medicineId: string
  medicineName: string
  batchNumber: string
  quantity: number
  price: number
  totalAmount: number
  dispensedDate: string
  patientName: string
  patientId?: string
  dispensedBy: string
}

// Function to strip OKLCH colors from elements (needed for PDF generation)
const stripOKLCH = (el: HTMLElement): void => {
  // Process the element itself
  const styles = window.getComputedStyle(el)
  ;['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
    const val = styles.getPropertyValue(prop)
    if (val && val.includes('oklch')) {
      el.style.setProperty(prop, '#000')
    }
  })

  // Process all child elements recursively
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i] as HTMLElement
    stripOKLCH(child)
  }
}

const Medicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>(
    'available'
  )
  const medicalReceiptRef = useRef<HTMLDivElement>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Dispensing related state
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing-history'>('inventory')
  const [dispenseRecords, setDispenseRecords] = useState<MedicineDispenseRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [doctorName, setDoctorName] = useState('')

  // Dispense form state
  const [showDispenseForm, setShowDispenseForm] = useState(false)
  const [showDispenseDropdown, setShowDispenseDropdown] = useState(false)
  const [dispenseType, setDispenseType] = useState<'existing' | 'general'>('existing')
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [dispensedBy, setDispensedBy] = useState('')
  const [selectedMedicines, setSelectedMedicines] = useState<
    {
      id: string
      name: string
      quantity: number
      price: number
      batchNumber?: string
      expiryDate?: string
    }[]
  >([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [patient, setPatient] = useState({})

  // Function to calculate total amount
  const calculateTotalAmount = useCallback((): void => {
    const total = selectedMedicines.reduce((sum, medicine) => {
      return sum + medicine.price * medicine.quantity
    }, 0)
    setTotalAmount(total)
  }, [selectedMedicines])

  // Remove this duplicate definition as filteredMedicines is defined below

  // Load medicines on component mount
  useEffect(() => {
    const fetchMedicines = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as unknown as API
        // Load only available medicines by default
        const response = await api.getMedicinesByStatus('available')
        console.log('Initial medicines load response:', response)
        if (response && response.success && response.data) {
          setMedicines(response.data as unknown as Medicine[])
          setError('')
        } else {
          setError(response?.message || 'Failed to load medicines')
          toast.error(response?.message || 'Failed to load medicines')
        }
      } catch (err) {
        console.error('Error loading medicines:', err)
        setError(
          `Failed to load medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
        toast.error(
          `Error loading medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [])

  // Function to fetch medicine dispensing records with pagination
  const fetchDispenseRecords = useCallback(
    async (page = currentPage) => {
      try {
        setLoadingRecords(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as unknown as API
        const response = await api.getMedicineDispenseRecords(page, pageSize)
        console.log('Medicine dispense records response:', response)

        if (response && response.success && Array.isArray(response.data)) {
          // Validate and sanitize each record object before updating state
          const validRecords = response.data
            .filter((record) => record && typeof record === 'object')
            .map((record) => {
              // Ensure all required fields exist with proper types
              return {
                id: record.id || '',
                medicineId: record.medicineId || '',
                medicineName: record.medicineName || '',
                batchNumber: record.batchNumber || '',
                quantity: typeof record.quantity === 'number' ? record.quantity : 0,
                price: typeof record.price === 'number' ? record.price : 0,
                totalAmount: typeof record.totalAmount === 'number' ? record.totalAmount : 0,
                dispensedDate: record.dispensedDate || new Date().toISOString(),
                patientName: record.patientName || '',
                patientId: record.patientId || '',
                dispensedBy: record.dispensedBy || ''
              } as MedicineDispenseRecord
            })

          setDispenseRecords(validRecords)
          setTotalCount(response.totalCount || validRecords.length)

          // Only update current page if it's different to avoid unnecessary re-renders
          if (page !== currentPage) {
            setCurrentPage(page)
          }
          setRecordsError('')

          if (validRecords.length === 0) {
            toast.info('No medicine dispense records found')
          }
        } else {
          // Handle error or empty response
          setDispenseRecords([])
          setTotalCount(0)
          setRecordsError(response?.message || 'Failed to load dispensing records')
          toast.error(response?.message || 'Failed to load dispensing records')
        }
      } catch (err) {
        console.error('Error loading dispensing records:', err)
        setDispenseRecords([])
        setRecordsError(
          `Failed to load dispensing records: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
        toast.error(
          `Error loading dispensing records: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoadingRecords(false)
      }
    },
    // Include currentPage in dependencies
    [pageSize, currentPage]
  )

  // Load dispensing records when activeTab changes to dispensing-history
  useEffect(() => {
    if (activeTab === 'dispensing-history') {
      fetchDispenseRecords()
    }
  }, [activeTab, fetchDispenseRecords])

  // Recalculate total amount whenever selectedMedicines changes
  useEffect(() => {
    calculateTotalAmount()
  }, [calculateTotalAmount])

  // Function to handle adding a new medicine
  const handleAddMedicine = async (medicine: Omit<Medicine, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Call the API with standardized response format
      const response = await api.addMedicine(medicine as Record<string, unknown>)
      console.log('Medicine add response:', response)

      if (response && response.success && response.data) {
        // Add the new medicine to the state with the returned data
        const newMedicine = response.data as unknown as Medicine
        setMedicines([...medicines, newMedicine])
        setShowAddForm(false)
        setError('')
        // Show success toast with custom message if provided
        toast.success(response.message || 'Medicine added successfully')
      } else {
        // Show error toast with the error message from the response
        setError(response?.message || 'Failed to add medicine')
        toast.error(response?.message || 'Failed to add medicine')
      }
    } catch (err) {
      console.error('Error adding medicine:', err)
      setError(`Failed to add medicine: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error(`Error adding medicine: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating a medicine
  const handleUpdateMedicine = async (
    id: string,
    medicine: Omit<Medicine, 'id'>
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Call the API with standardized response format
      const response = await api.updateMedicine(id, { ...medicine, id } as Record<string, unknown>)
      console.log('Medicine update response:', response)

      if (response && response.success && response.data) {
        // Update medicine in the state with the returned data
        // Use proper type assertion with unknown intermediate step
        const updatedMedicine = response.data as unknown as Medicine
        setMedicines(medicines.map((m) => (m.id === id ? updatedMedicine : m)))
        setIsModalOpen(false)
        setEditingMedicine(null)
        setError('')
        // Show success toast with custom message if provided
        toast.success(response.message || 'Medicine updated successfully')
      } else {
        // Show error toast with the error message from the response
        setError(response?.message || 'Failed to update medicine')
        toast.error(response?.message || 'Failed to update medicine')
      }
    } catch (err) {
      console.error('Error updating medicine:', err)
      setError(`Failed to update medicine: ${err instanceof Error ? err.message : 'Unknown error'}`)
      toast.error(
        `Error updating medicine: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }
  console.log(dispenseType)

  // Function to handle deleting a medicine
  const handleDeleteMedicine = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as unknown as API

        // Call the API with standardized response format
        const response = await api.deleteMedicine(id)
        console.log('Medicine delete response:', response)
        if (response && response.success) {
          // Remove the medicine from the state
          setMedicines(medicines.filter((medicine) => medicine.id !== id))
          setError('')
          // Show success toast with custom message if provided
          toast.success(response.message || 'Medicine deleted successfully')
        } else {
          // Show error toast with the error message from the response
          setError(response?.message || 'Failed to delete medicine')
          toast.error(response?.message || 'Failed to delete medicine')
        }
      } catch (err) {
        console.error('Error deleting medicine:', err)
        setError(
          `Failed to delete medicine: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
        toast.error(
          `Error deleting medicine: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      } finally {
        setLoading(false)
      }
    }
  }

  // Function to handle updating medicine status
  const handleUpdateStatus = async (
    id: string,
    status: 'available' | 'completed' | 'out_of_stock'
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Call the API with standardized response format
      const response = await api.updateMedicineStatus(id, status)
      console.log('Medicine status update response:', response)

      if (response && response.success && response.data) {
        // Update medicine in the state with the returned data
        const updatedMedicine = response.data as unknown as Medicine
        setMedicines(medicines.map((m) => (m.id === id ? updatedMedicine : m)))
        setError('')
        // Show success toast with custom message if provided
        toast.success(response.message || `Medicine status updated to ${status.replace('_', ' ')}`)
      } else {
        // Show error toast with the error message from the response
        setError(response?.message || 'Failed to update medicine status')
        toast.error(response?.message || 'Failed to update medicine status')
      }
    } catch (err) {
      console.error('Error updating medicine status:', err)
      setError(
        `Failed to update medicine status: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      toast.error(
        `Error updating medicine status: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to handle search
  const handleSearch = async (): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Call the API with standardized response format
      const response = await api.searchMedicines(searchTerm)
      console.log('Medicine search response:', response)

      if (response && response.success && Array.isArray(response.data)) {
        // Validate and sanitize each medicine object before updating state
        const validMedicines = response.data
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            // Ensure all required fields exist with proper types
            return {
              id: item.id || '',
              name: item.name || '',
              quantity: typeof item.quantity === 'number' ? item.quantity : 0,
              expiryDate: item.expiryDate || '',
              batchNumber: item.batchNumber || '',
              price: typeof item.price === 'number' ? item.price : 0,
              status: item.status || 'available'
            } as Medicine
          })

        // Update medicines list with validated search results
        setMedicines(validMedicines)
        setError('')

        // Show success toast with custom message if provided
        if (validMedicines.length === 0) {
          toast.info(response.message || 'No medicines found matching your search')
        } else {
          toast.success(response.message || `Found ${validMedicines.length} medicines`)
        }
      } else {
        // Show error toast with the error message from the response
        setError(response?.message || 'Failed to search medicines')
        toast.error(response?.message || 'Failed to search medicines')
        // Set empty array to avoid errors with invalid data
        setMedicines([])
      }
    } catch (err) {
      console.error('Error searching medicines:', err)
      setError(
        `Failed to search medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      toast.error(
        `Error searching medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      // Set empty array to avoid errors with invalid data
      setMedicines([])
    } finally {
      setLoading(false)
    }
  }

  // Function to filter medicines by status
  const handleFilterByStatus = async (
    status: 'all' | 'available' | 'out_of_stock'
  ): Promise<void> => {
    try {
      setLoading(true)
      setStatusFilter(status)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Call the appropriate API based on status with standardized response format
      let response
      if (status === 'all') {
        response = await api.getMedicines()
      } else {
        response = await api.getMedicinesByStatus(status)
      }
      console.log(`Medicine filter response (${status}):`, response)

      if (response && response.success && Array.isArray(response.data)) {
        // Validate and sanitize each medicine object before updating state
        const validMedicines = response.data
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            id: item.id || '',
            name: item.name || '',
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            expiryDate: item.expiryDate || '',
            batchNumber: item.batchNumber || '',
            price: typeof item.price === 'number' ? item.price : 0,
            status: item.status || 'available'
          })) as Medicine[]

        setMedicines(validMedicines)
        setError('')

        // Show success toast with custom message if provided
        if (validMedicines.length === 0) {
          toast.info(response.message || `No medicines found with status: ${status}`)
        } else {
          toast.success(
            response.message ||
              `Found ${validMedicines.length} medicines with status: ${status === 'all' ? 'any' : status}`
          )
        }
      } else {
        // Show error toast with the error message from the response
        setMedicines([])
        setError(response?.message || 'Failed to filter medicines')
        toast.error(response?.message || 'Failed to filter medicines')
      }
    } catch (err) {
      console.error('Error filtering medicines:', err)
      setMedicines([])
      setError(
        `Failed to filter medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      toast.error(
        `Error filtering medicines: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (medicine: Medicine): void => {
    setEditingMedicine(medicine)
    setIsModalOpen(true)
  }

  // Function to handle dispensing medicine
  const handleDispenseMedicine = async (medicineData: {
    id: string
    quantity: number
    patientId?: string
    dispensedBy?: string
    name?: string
    price?: number
    totalAmount?: number
  }): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Calculate total amount
      const price = medicineData.price || 0
      // Use provided totalAmount if available, otherwise calculate it
      const totalAmount = medicineData.totalAmount || price * medicineData.quantity

      // Call the API with standardized response format
      const response = await api.dispenseMedicine(
        medicineData.id,
        medicineData.quantity,
        medicineData.dispensedBy || '',
        medicineData.patientId || '',
        medicineData.name || '', // Patient name
        price,
        totalAmount
      )
      console.log('Medicine dispense response:', response)

      if (response && response.success && response.data) {
        // Update medicine in state with the returned data
        const updatedMedicine = response.data as unknown as Medicine
        setMedicines(medicines.map((m) => (m.id === medicineData.id ? updatedMedicine : m)))

        // Refresh dispensing records
        fetchDispenseRecords()

        setError('')
        // Show success toast with custom message if provided
        setShowDispenseForm(false)
        toast.success(response.message || 'Medicine dispensed successfully')
      } else {
        // Show error toast with the error message from the response
        setError(response?.message || 'Failed to dispense medicine')
        toast.error(response?.message || 'Failed to dispense medicine')
      }
    } catch (err) {
      console.error('Error dispensing medicine:', err)
      setError(
        `Failed to dispense medicine: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      toast.error(
        `Error dispensing medicine: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to handle patient search by ID
  const handlePatientSearch = async (): Promise<void> => {
    if (!patientId.trim()) return

    try {
      setLoadingPatient(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as unknown as API

      // Check if getPatientById method is available
      if (!api.getPatientById) {
        console.error('getPatientById method is not available')
        toast.error('Patient search functionality is not available')
        return
      }

      // Call the API with standardized response format
      const response = await api.getPatientById(patientId)
      console.log('Patient search response:', response)

      if (response && response.success && response.data) {
        // Set patient data from successful response
        const patient = response.data
        setPatientName(String(patient.name || patient.NAME || ''))
        setPatient(patient)
        toast.success('Patient found')
      } else {
        // Handle case where patient is not found or response is invalid
        setPatientName('')
        setPatient({} as Record<string, unknown>)
        toast.error(response?.message || 'Patient not found')
      }
    } catch (err) {
      console.error('Error searching for patient:', err)
      toast.error(
        `Failed to search for patient: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      setPatientName('')
      setPatient({} as Record<string, unknown>)
    } finally {
      setLoadingPatient(false)
    }
  }

  // Function to add medicine to dispense list
  const addMedicineToDispense = (medicine: Medicine, quantity: number): void => {
    if (quantity <= 0) return

    // Check if medicine is already in the list
    const existingIndex = selectedMedicines.findIndex((m) => m.id === medicine.id)

    if (existingIndex >= 0) {
      // Update quantity if medicine already exists in the list
      const updatedMedicines = [...selectedMedicines]
      updatedMedicines[existingIndex].quantity = quantity
      setSelectedMedicines(updatedMedicines)
    } else {
      // Add new medicine to the list
      setSelectedMedicines([
        ...selectedMedicines,
        {
          id: medicine.id,
          name: medicine.name,
          quantity,
          price: medicine.price,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate
        }
      ])
    }

    // Update the available quantity in the medicines list
    setMedicines(
      medicines.map((m) => {
        if (m.id === medicine.id) {
          // Calculate the new quantity
          const newQuantity = m.quantity - quantity
          // Return updated medicine with reduced quantity
          return {
            ...m,
            quantity: newQuantity,
            // If quantity becomes 0, update status to out_of_stock
            status: newQuantity <= 0 ? 'out_of_stock' : m.status
          }
        }
        return m
      })
    )

    // Update total amount
    calculateTotalAmount()
  }

  // Function to remove medicine from dispense list
  const removeMedicineFromDispense = (id: string): void => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.id !== id))
    calculateTotalAmount()
  }

  // Function to toggle dispense dropdown
  const toggleDispenseDropdown = (): void => {
    setShowDispenseDropdown(!showDispenseDropdown)

    // Close the form if dropdown is closed
    if (showDispenseForm && !showDispenseDropdown) {
      setShowDispenseForm(false)
    }
  }

  // Function to handle dispense type selection
  const handleDispenseTypeSelect = (type: 'existing' | 'general'): void => {
    setDispenseType(type)
    setShowDispenseDropdown(false)

    // Reset form fields
    setPatientId('')
    setPatientName('')
    setSelectedMedicines([])
    setTotalAmount(0)

    try {
      const currentUserStr = localStorage.getItem('currentUser')
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr)
        setDispensedBy(currentUser.fullName || '')
      }
    } catch (err) {
      console.error('Error loading current user:', err)
    }

    // Show the form
    setShowDispenseForm(true)
  }

  // Function to handle clicks outside the dropdown
  const handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    if (!target.closest('.dispense-dropdown-container')) {
      setShowDispenseDropdown(false)
    }
  }

  // Add event listener for clicks outside the dropdown
  useEffect(() => {
    if (showDispenseDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDispenseDropdown])

  // Function to handle save dispense
  const handleSaveDispense = async (shouldPrint = false): Promise<void> => {
    try {
      if (selectedMedicines.length === 0) {
        toast.error('Please add at least one medicine to dispense')
        return
      }

      if (dispenseType === 'existing' && !patientId) {
        toast.error('Please search and select a patient first')
        return
      }

      if (dispenseType === 'general' && !patientName) {
        toast.error('Please enter a customer name')
        return
      }

      // Dispense each medicine
      for (const medicine of selectedMedicines) {
        // Calculate the total amount for this specific medicine
        const medicinePrice = medicine.price || 0
        const medicineTotalAmount = medicinePrice * medicine.quantity

        await handleDispenseMedicine({
          id: medicine.id,
          quantity: medicine.quantity,
          patientId: dispenseType === 'existing' ? patientId : undefined,
          dispensedBy: dispensedBy || 'Staff',
          name: dispenseType === 'existing' ? patientName : patientName || 'General Customer',
          price: medicine.price,
          totalAmount: medicineTotalAmount // Pass the calculated total amount
        })
      }

      // Reset the form
      setSelectedMedicines([])
      setTotalAmount(0)
      setPatientId('')
      setPatientName('')
      setDispensedBy('')
      setPatient({})

      // If shouldPrint is true, print the receipt
      if (shouldPrint) {
        await handlePrintReceipt()
      } else {
        // Otherwise just close the form
        setShowDispenseForm(false)
      }

      // Show success toast for the entire transaction
      toast.success('Medicines dispensed successfully')
    } catch (error) {
      console.error('Error saving dispense:', error)
      toast.error('Error dispensing medicines')
    }
  }

  // Function to handle print receipt
  const handlePrintReceipt = async (): Promise<void> => {
    try {
      // Check if we have the necessary data based on dispense type
      if (dispenseType === 'existing' && !patientId) {
        toast.error('Please enter patient ID for existing patient')
        return
      }

      if (dispenseType === 'general' && !patientName) {
        toast.error('Please enter customer name')
        return
      }

      if (selectedMedicines.length === 0) {
        toast.error('Please add medicines to dispense')
        return
      }
      const receiptEl = medicalReceiptRef.current
      if (!receiptEl) {
        toast.error('Receipt element not found')
        return
      }

      // Create a container with proper centering and alignment
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.display = 'flex'
      container.style.justifyContent = 'center'
      container.style.alignItems = 'center'
      container.style.backgroundColor = '#ffffff'
      container.style.padding = '0'
      container.style.margin = '0'
      container.style.overflow = 'hidden'
      container.style.zIndex = '-9999' // Hide from view

      // Clone and clean oklch colors
      const clone = receiptEl.cloneNode(true) as HTMLElement
      stripOKLCH(clone)

      // Set exact A4 dimensions and center content
      clone.style.width = '794px' // A4 width in pixels
      clone.style.height = '1123px' // A4 height in pixels
      clone.style.backgroundColor = '#ffffff'
      clone.style.margin = '0 auto' // Center horizontally
      clone.style.position = 'relative' // Ensure proper positioning
      clone.style.transform = 'none' // Remove any transforms that might cause tilting

      // Add the clone to the container
      container.appendChild(clone)
      document.body.appendChild(container)

      // Use html2canvas with improved settings
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 0,
        removeContainer: false // We'll handle removal ourselves
      })

      // Clean up the DOM
      document.body.removeChild(container)

      const imgData = canvas.toDataURL('image/png')

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      const pngImage = await pdfDoc.embedPng(imgData)

      // Calculate dimensions to perfectly center the image
      const imgWidth = pngImage.width
      const imgHeight = pngImage.height
      const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight) * 0.98 // 98% of max size for small margin
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale

      // Precisely center the image on the page
      const x = (PAGE_WIDTH - drawWidth) / 2
      const y = (PAGE_HEIGHT - drawHeight) / 2

      // Draw the image with exact positioning
      page.drawImage(pngImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      })

      const pdfBytes = await pdfDoc.save()

      // Use Electron's IPC to open the PDF in a native window
      const result = await window.api.openPdfInWindow(pdfBytes)

      if (!result.success) {
        console.error('Failed to open PDF in window:', result.error)
        toast.error('Failed to open PDF preview. Please try again.')
      }
    } catch (error) {
      console.error('Error generating PDF for preview:', error)
      toast.error('Failed to generate PDF preview. Please try again.')
    }
  }

  // Handle page change
  const handlePageChange = useCallback(
    (page: number): void => {
      fetchDispenseRecords(page)
    },
    [fetchDispenseRecords]
  )

  // Filter medicines based on search term and status filter
  const filteredMedicines = medicines.filter((medicine) => {
    // Skip invalid medicine objects
    if (!medicine || typeof medicine !== 'object') {
      return false
    }

    // First apply status filter
    if (statusFilter !== 'all' && medicine.status !== statusFilter) {
      return false
    }

    // Then apply search term filter if present
    if (searchTerm && searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase()
      const nameMatch =
        medicine.name && typeof medicine.name === 'string'
          ? medicine.name.toLowerCase().includes(searchTermLower)
          : false
      const batchMatch =
        medicine.batchNumber && typeof medicine.batchNumber === 'string'
          ? medicine.batchNumber.toLowerCase().includes(searchTermLower)
          : false

      return nameMatch || batchMatch
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Medicines Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex cursor-pointer border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 cursor-pointer border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'dispensing-history' ? 'text-blue-600 border-b-2 cursor-pointer border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
                onClick={() => setActiveTab('dispensing-history')}
              >
                Dispensing History
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{showAddForm ? 'Hide Form' : 'Add Medicine'}</span>
            </button>
            <button
              onClick={() => (window.location.hash = '/dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10 flex-grow w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Add New Medicine
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <MedicineForm onSubmit={handleAddMedicine} />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {activeTab === 'inventory' ? (
            // Inventory Tab Content
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Medicine Inventory
                </h2>
                <div className="text-sm text-gray-500">
                  {!loading && medicines.length > 0 && (
                    <span>
                      {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} found
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterByStatus('all')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'all'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterByStatus('available')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'available'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleFilterByStatus('out_of_stock')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'out_of_stock'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  {/* Dispense Button with Dropdown */}
                  <div className="ml-2 relative dispense-dropdown-container">
                    <button
                      onClick={toggleDispenseDropdown}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                      </svg>
                      Dispense
                    </button>
                    {/* Dropdown Menu */}
                    {showDispenseDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                        <button
                          onClick={() => handleDispenseTypeSelect('general')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          General Customer
                        </button>
                        <button
                          onClick={() => handleDispenseTypeSelect('existing')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Existing Patient
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispense Form */}
              {showDispenseForm && (
                <div className="mt-4 mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dispense Medicines</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Conditional fields based on dispense type */}
                    {dispenseType === 'existing' ? (
                      <>
                        {/* Patient ID - Only for existing patients */}
                        <div>
                          <label
                            htmlFor="patientId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Patient ID *
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              id="patientId"
                              value={patientId}
                              onChange={(e) => setPatientId(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                              placeholder="Enter patient ID"
                            />
                            <button
                              onClick={handlePatientSearch}
                              disabled={loadingPatient}
                              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                            >
                              {loadingPatient ? (
                                <svg
                                  className="animate-spin h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
                                'Search'
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Patient Name - Read-only for existing patients */}
                        <div>
                          <label
                            htmlFor="patientName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Patient Name *
                          </label>
                          <input
                            type="text"
                            id="patientName"
                            value={patientName}
                            readOnly
                            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            placeholder="Auto-filled after patient search"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Customer Name - Editable for general customers */}
                        <div>
                          <label
                            htmlFor="patientName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            id="patientName"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            placeholder="Enter customer name"
                          />
                        </div>

                        {/* Doctor Name - For general customers */}
                        <div>
                          <label
                            htmlFor="doctorName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Doctor Name
                          </label>
                          <input
                            type="text"
                            id="doctorName"
                            value={doctorName || ''}
                            onChange={(e) => {
                              setDoctorName(e.target.value)
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            placeholder="Enter doctor name (optional)"
                          />
                        </div>
                      </>
                    )}

                    {/* Dispensed By - For both types */}
                    <div>
                      <label
                        htmlFor="dispensedBy"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Dispensed By
                      </label>
                      <input
                        type="text"
                        id="dispensedBy"
                        value={dispensedBy}
                        onChange={(e) => setDispensedBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        placeholder="Enter dispenser name"
                      />
                    </div>
                  </div>

                  {/* Selected Medicines */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Selected Medicines</h4>
                    {selectedMedicines.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Quantity
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedMedicines.map((medicine) => (
                              <tr key={medicine.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {medicine.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {medicine.quantity}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  ₹{medicine.price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  ₹{(medicine.price * medicine.quantity).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => removeMedicineFromDispense(medicine.id)}
                                    className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td
                                colSpan={3}
                                className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900"
                              >
                                Total Amount:
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                ₹{totalAmount.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No medicines selected. Add medicines from the table below.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDispenseForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                      onClick={() => handleSaveDispense(false)}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleSaveDispense(true)}
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                      Save & Print
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-3 text-gray-500">Loading medicines...</p>
                  </div>
                </div>
              )}
              {!loading && filteredMedicines.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-2">No medicines found</p>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? 'Try a different search term or clear the filter'
                      : 'Click the "Add Medicine" button to create your first medicine record'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Medicine
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="overflow-x-auto">
                    <MedicineTable
                      medicines={filteredMedicines}
                      onEdit={openEditModal}
                      onDelete={handleDeleteMedicine}
                      onUpdateStatus={handleUpdateStatus}
                      onAddToDispense={addMedicineToDispense}
                      showDispenseControls={showDispenseForm}
                    />
                  </div>
                )
              )}
            </>
          ) : (
            // Dispensing History Tab Content
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Medicine Dispensing History
                </h2>
                <div className="text-sm text-gray-500">
                  {!loadingRecords && dispenseRecords.length > 0 && (
                    <span>
                      {dispenseRecords.length} {dispenseRecords.length === 1 ? 'record' : 'records'}{' '}
                      found
                    </span>
                  )}
                </div>
              </div>

              {loadingRecords && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-3 text-gray-500">Loading dispensing records...</p>
                  </div>
                </div>
              )}
              {!loadingRecords && recordsError && (
                <div className="text-red-500 text-center py-10">{recordsError}</div>
              )}
              {!loadingRecords && !recordsError && dispenseRecords.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-2">No dispensing records found</p>
                  <p className="text-gray-500 mb-6">
                    Switch to the Inventory tab and dispense medicines to create dispensing records
                  </p>
                </div>
              ) : (
                !loadingRecords &&
                !recordsError && (
                  <div className="overflow-x-auto">
                    <MedicineDispenseHistory
                      records={dispenseRecords}
                      loading={loadingRecords}
                      error={recordsError}
                      onPageChange={handlePageChange}
                      totalCount={totalCount}
                      currentPage={currentPage}
                      pageSize={pageSize}
                    />
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>

      {isModalOpen && editingMedicine && (
        <MedicineEditModal
          medicine={editingMedicine}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMedicine(null)
          }}
          onSave={handleUpdateMedicine}
        />
      )}

      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
      {/* Hidden Receipt component for PDF generation */}
      <div style={{ display: 'none' }}>
        <div id="receipt-container" ref={medicalReceiptRef}>
          {dispenseType === 'existing' ? (
            <MedicalReceipt
              data={{
                businessInfo: {
                  name: 'SRI MEHER MEDICALS',
                  address:
                    '# 6-6-650/1, Ambedkarnagar, Subhashnagar Road, Beside Honda Show Room, KARIMNAGAR-505001',
                  dlNo: 'TS/KNR/2021/7329',
                  gstin: '36AENPC8304C3ZS',
                  phone1: '+91 94943 62719',
                  phone2: ''
                },
                patientInfo: {
                  billNumber: `MED-${new Date().getTime().toString().slice(-6)}`,
                  patientId: patientId || '',
                  patientName: patientName || '',
                  guardianName: patient['guardian'] || '',
                  address: patient['address'] || '',
                  date: new Date().toLocaleDateString(),
                  gender: patient['gender'] || '',
                  age: patient['age'] || 0,
                  mobile: patient['phone'] || '',
                  dept: patient['department'] || '',
                  doctorName: patient['doctorName'] || ''
                },
                items: selectedMedicines.map((med) => ({
                  particulars: med.name,
                  qty: med.quantity,
                  rate: med.price,
                  batchNumber: med.batchNumber,
                  expiryDate: med.expiryDate,
                  amount: med.price * med.quantity
                })),
                totals: {
                  totalAmount: totalAmount,
                  advancePaid: 0,
                  amtReceived: totalAmount,
                  discount: 0,
                  balance: 0
                }
              }}
            />
          ) : (
            <MedicalNon
              data={{
                businessInfo: {
                  name: 'SRI MEHER MEDICALS',
                  address:
                    '# 6-6-650/1, Ambedkarnagar, Subhashnagar Road, Beside Honda Show Room, KARIMNAGAR-505001',
                  dlNo: 'TS/KNR/2021/7329',
                  gstin: '36AENPC8304C3ZS',
                  phone1: '+91 94943 62719',
                  phone2: ''
                },
                billNumber: `MED-${new Date().getTime().toString().slice(-6)}`,
                patientName: patientName || '',
                date: new Date().toLocaleDateString(),
                doctorName: doctorName || '',
                items: selectedMedicines.map((med) => ({
                  particulars: med.name,
                  qty: med.quantity,
                  rate: med.price,
                  batchNumber: med.batchNumber,
                  expiryDate: med.expiryDate,
                  amount: med.price * med.quantity
                })),
                totalAmount: totalAmount
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Medicines
