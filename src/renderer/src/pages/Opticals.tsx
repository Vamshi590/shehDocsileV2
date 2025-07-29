import React, { useState, useEffect, useCallback, useRef } from 'react'
import OpticalForm from '../components/opticals/OpticalForm'
import OpticalTable from '../components/opticals/OpticalTable'
import OpticalEditModal from '../components/opticals/OpticalEditModal'
import OpticalDispenseHistory from '../components/opticals/OpticalDispenseHistory'
import OpticalReceipt from '../components/reciepts/OpticalReceipt'
import OpticalNon from '../components/reciepts/OpticalNon'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { toast, Toaster } from 'sonner'

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

interface Optical {
  id: string
  type: 'frame' | 'lens'
  brand: string
  model: string
  size: string
  power?: string // Optional for lenses
  quantity: number
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface OpticalDispenseRecord {
  id: string
  opticalId: string
  opticalType: 'frame' | 'lens'
  brand: string
  model: string
  quantity: number
  price: number
  patientName: string
  patientId?: string
  dispensedAt: string
  dispensedBy: string
}

const Opticals: React.FC = () => {
  const [opticals, setOpticals] = useState<Optical[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOptical, setEditingOptical] = useState<Optical | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>(
    'available'
  )
  const [typeFilter, setTypeFilter] = useState<'all' | 'frame' | 'lens'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Dispensing related state
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing-history'>('inventory')
  const opticalReceiptRef = useRef<HTMLDivElement>(null)
  const [dispenseRecords, setDispenseRecords] = useState<OpticalDispenseRecord[]>([]) // Used to track and display dispense history
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Dispense form state
  const [showDispenseForm, setShowDispenseForm] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [dispensedBy, setDispensedBy] = useState('')
  const [patient, setPatient] = useState({})
  // Dropdown menu state
  const [showDispenseDropdown, setShowDispenseDropdown] = useState(false)
  const [dispenseType, setDispenseType] = useState<'general' | 'existing'>('existing')
  const dropdownRef = useRef<HTMLDivElement>(null)
  interface SelectedOptical {
    id: string
    type: 'frame' | 'lens'
    brand: string
    model: string
    quantity: number
    price: number
    power?: string
    size?: string
  }
  const [selectedOpticals, setSelectedOpticals] = useState<SelectedOptical[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loadingPatient, setLoadingPatient] = useState(false)
  const [patientPrescriptions, setPatientPrescriptions] = useState<Record<string, unknown>[]>([])

  // Function to calculate total amount
  const calculateTotalAmount = useCallback((): void => {
    if (selectedOpticals.length === 0) {
      setTotalAmount(0)
      return
    }

    const total = selectedOpticals.reduce((sum, optical) => {
      return sum + optical.price * optical.quantity
    }, 0)

    // Ensure we're setting a valid number
    setTotalAmount(isNaN(total) ? 0 : total)
  }, [selectedOpticals])

  // Use effect to recalculate total amount whenever selectedOpticals changes
  useEffect(() => {
    calculateTotalAmount()
  }, [selectedOpticals, calculateTotalAmount])

  // Load opticals on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true)

        // Define the expected response type for better type safety
        interface OpticalResponse {
          success: boolean
          data?: Optical[] | null
          message?: string
        }

        // Use type assertion for API calls with more specific types
        const api = window.api as unknown as {
          getOpticalItemsByStatus: (status: string) => Promise<OpticalResponse>
        }

        try {
          // Load only available opticals by default
          const response = await api.getOpticalItemsByStatus('available')
          console.log('Initial opticals load response:', response)

          // Ensure response.data is always an array
          const responseData = Array.isArray(response.data) ? response.data : []

          if (response && response.success === true) {
            // Validate and sanitize each optical object before updating state
            const validOpticals = responseData
              .filter((item) => item && typeof item === 'object')
              .map((item) => ({
                id: item.id || '',
                type: item.type || 'frame',
                brand: item.brand || '',
                model: item.model || '',
                size: item.size || '',
                power: item.power,
                quantity:
                  typeof item.quantity === 'number'
                    ? item.quantity
                    : item.quantity
                      ? parseInt(String(item.quantity), 10) || 0
                      : 0,
                price: typeof item.price === 'number' ? item.price : 0,
                status: item.status || 'available'
              })) as Optical[]

            setOpticals(validOpticals)
            setError('')
          } else {
            // If response is invalid, set opticals to empty array
            setOpticals([])
            const errorMessage =
              response && typeof response.message === 'string'
                ? response.message
                : 'Failed to load opticals data'
            setError(errorMessage)
            console.warn('Invalid response when loading opticals:', response)
          }
        } catch (apiError) {
          console.error('API call error:', apiError)
          setOpticals([]) // Ensure opticals is always an array
          const errorMessage = apiError instanceof Error ? apiError.message : 'API call failed'
          setError(errorMessage)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setOpticals([]) // Ensure opticals is always an array
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Failed to load data: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to fetch optical dispense records with pagination
  const fetchDispenseRecords = useCallback(
    async (page = currentPage): Promise<void> => {
      try {
        setLoadingRecords(true)
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const response = await api.getOpticalDispenseRecords(page, pageSize)

        // The response now includes data, totalCount, page, and pageSize
        if (response && typeof response === 'object' && 'data' in response) {
          const { data, totalCount: total } = response as {
            data: OpticalDispenseRecord[]
            totalCount: number
            page: number
            pageSize: number
          }
          setDispenseRecords(data)
          setTotalCount(total)
          setCurrentPage(page)
          setRecordsError('')
        } else {
          // Fallback for unexpected response format
          setDispenseRecords(response as OpticalDispenseRecord[])
          setRecordsError('')
        }
      } catch (err) {
        console.error('Error fetching dispense records:', err)
        setRecordsError('Failed to load dispensing records')
      } finally {
        setLoadingRecords(false)
      }
    },
    [currentPage, pageSize]
  )

  // Function to handle page change in dispense history
  const handlePageChange = useCallback(
    (page: number) => {
      fetchDispenseRecords(page)
    },
    [fetchDispenseRecords]
  )

  // Load dispensing records when activeTab changes to dispensing-history
  useEffect(() => {
    if (activeTab === 'dispensing-history') {
      fetchDispenseRecords()
    }
  }, [activeTab, fetchDispenseRecords])

  // Function to handle adding a new optical
  const handleAddOptical = async (optical: Omit<Optical, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newOptical = await api.addOpticalItem(optical)
      if (newOptical) {
        setOpticals([...opticals, newOptical as Optical])
        setShowAddForm(false)
        setError('')
        // Show success toast
        toast.success('Optical item added successfully')
      } else {
        // Show error toast if operation failed
        toast.error('Failed to add optical item')
      }
    } catch (err) {
      console.error('Error adding optical:', err)
      setError('Failed to add optical')
      toast.error('Error adding optical item')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an optical
  const handleUpdateOptical = async (id: string, optical: Omit<Optical, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const updatedOptical = await api.updateOpticalItem(id, { ...optical, id })
      if (updatedOptical) {
        setOpticals(opticals.map((o) => (o.id === id ? (updatedOptical as Optical) : o)))
        setIsModalOpen(false)
        setEditingOptical(null)
        setError('')
        // Show success toast
        toast.success('Optical item updated successfully')
      } else {
        // Show error toast if operation failed
        toast.error('Failed to update optical item')
      }
    } catch (err) {
      console.error('Error updating optical:', err)
      setError('Failed to update optical')
      toast.error('Error updating optical item')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle search
  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      // If search term is empty, revert to filtered view
      return handleFilterByStatus(statusFilter)
    }

    try {
      setLoading(true)

      // Define the expected response type for better type safety
      interface OpticalResponse {
        success: boolean
        data?: Optical[] | null
        message?: string
      }

      // Use type assertion for API calls
      const api = window.api as unknown as {
        searchOpticalItems: (term: string) => Promise<OpticalResponse>
      }

      // Initialize response with safe defaults
      let response: OpticalResponse = { success: false, data: [] }

      try {
        // Search optical items with standardized response format
        response = await api.searchOpticalItems(searchTerm)
        console.log(`Optical search response for "${searchTerm}":`, response)
      } catch (apiError) {
        console.error('API call error:', apiError)
        response = {
          success: false,
          data: [],
          message: apiError instanceof Error ? apiError.message : 'Search API call failed'
        }
      }

      // Ensure response.data is always an array
      const responseData = Array.isArray(response.data) ? response.data : []

      if (response && response.success === true) {
        // Validate and sanitize each optical object before updating state
        const validOpticals = responseData
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            id: item.id || '',
            type: item.type || 'frame',
            brand: item.brand || '',
            model: item.model || '',
            size: item.size || '',
            power: item.power,
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            status: item.status || 'available'
          })) as Optical[]

        setOpticals(validOpticals)
        setError('')

        // Show success toast with custom message if provided
        if (validOpticals.length === 0) {
          toast.info(response.message || `No opticals found matching "${searchTerm}"`)
        } else {
          toast.success(
            response.message || `Found ${validOpticals.length} opticals matching "${searchTerm}"`
          )
        }
      } else {
        // Show error toast with the error message from the response
        setOpticals([])
        const errorMessage =
          response && typeof response.message === 'string'
            ? response.message
            : `No opticals found matching "${searchTerm}"`
        setError(errorMessage)
        toast.info(errorMessage) // Use info instead of error for no results
      }
    } catch (err) {
      console.error('Error searching opticals:', err)
      setOpticals([])
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to search opticals: ${errorMessage}`)
      toast.error(`Error searching opticals: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to filter opticals by status
  const handleFilterByStatus = async (
    status: 'all' | 'available' | 'out_of_stock'
  ): Promise<void> => {
    try {
      setLoading(true)
      setStatusFilter(status)

      // Define the expected response type for better type safety
      interface OpticalResponse {
        success: boolean
        data?: Optical[] | null
        message?: string
      }

      // Use type assertion for API calls
      const api = window.api as unknown as {
        getOpticalItems: () => Promise<OpticalResponse>
        getOpticalItemsByType: (type: string) => Promise<OpticalResponse>
        getOpticalItemsByStatus: (status: string) => Promise<OpticalResponse>
        getOpticalItemsByStatusAndType: (status: string, type: string) => Promise<OpticalResponse>
      }

      let response: OpticalResponse = { success: false, data: [] }
      try {
        if (status === 'all') {
          if (typeFilter === 'all') {
            response = await api.getOpticalItems()
          } else {
            response = await api.getOpticalItemsByType(typeFilter)
          }
        } else {
          if (typeFilter === 'all') {
            response = await api.getOpticalItemsByStatus(status)
          } else {
            response = await api.getOpticalItemsByStatusAndType(status, typeFilter)
          }
        }
      } catch (apiError) {
        console.error('API call error:', apiError)
        response = {
          success: false,
          data: [],
          message: apiError instanceof Error ? apiError.message : 'API call failed'
        }
      }

      console.log(`Optical filter response (${status}):`, response)

      // Ensure response.data is always an array
      const responseData = Array.isArray(response.data) ? response.data : []

      if (response && response.success === true) {
        // Validate and sanitize each optical object before updating state
        const validOpticals = responseData
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            id: item.id || '',
            type: item.type || 'frame',
            brand: item.brand || '',
            model: item.model || '',
            size: item.size || '',
            power: item.power,
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            status: item.status || 'available'
          })) as Optical[]

        setOpticals(validOpticals)
        setError('')

        // Show success toast with custom message if provided
        if (validOpticals.length === 0) {
          toast.info(response.message || `No opticals found with status: ${status}`)
        } else {
          toast.success(
            response.message ||
              `Found ${validOpticals.length} opticals with status: ${status === 'all' ? 'any' : status}`
          )
        }
      } else {
        // Show error toast with the error message from the response
        setOpticals([])
        const errorMessage =
          response && typeof response.message === 'string'
            ? response.message
            : 'Failed to filter opticals'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error('Error filtering opticals:', err)
      setOpticals([])
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to filter opticals: ${errorMessage}`)
      toast.error(`Error filtering opticals: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to filter opticals by type
  const handleFilterByType = async (type: 'all' | 'frame' | 'lens'): Promise<void> => {
    try {
      setLoading(true)
      setTypeFilter(type)

      // Define the expected response type for better type safety
      interface OpticalResponse {
        success: boolean
        data?: Optical[] | null
        message?: string
      }

      // Use type assertion for API calls
      const api = window.api as unknown as {
        getOpticalItems: () => Promise<OpticalResponse>
        getOpticalItemsByType: (type: string) => Promise<OpticalResponse>
        getOpticalItemsByStatus: (status: string) => Promise<OpticalResponse>
        getOpticalItemsByStatusAndType: (status: string, type: string) => Promise<OpticalResponse>
      }

      let response: OpticalResponse = { success: false, data: [] }
      try {
        if (type === 'all') {
          if (statusFilter === 'all') {
            response = await api.getOpticalItems()
          } else {
            response = await api.getOpticalItemsByStatus(statusFilter)
          }
        } else {
          if (statusFilter === 'all') {
            response = await api.getOpticalItemsByType(type)
          } else {
            response = await api.getOpticalItemsByStatusAndType(statusFilter, type)
          }
        }
      } catch (apiError) {
        console.error('API call error:', apiError)
        response = {
          success: false,
          data: [],
          message: apiError instanceof Error ? apiError.message : 'API call failed'
        }
      }

      console.log(`Optical type filter response (${type}):`, response)

      // Ensure response.data is always an array
      const responseData = Array.isArray(response.data) ? response.data : []

      if (response && response.success === true) {
        // Validate and sanitize each optical object before updating state
        const validOpticals = responseData
          .filter((item) => item && typeof item === 'object')
          .map((item) => ({
            id: item.id || '',
            type: item.type || 'frame',
            brand: item.brand || '',
            model: item.model || '',
            size: item.size || '',
            power: item.power,
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            price: typeof item.price === 'number' ? item.price : 0,
            status: item.status || 'available'
          })) as Optical[]

        setOpticals(validOpticals)
        setError('')

        // Show success toast with custom message if provided
        if (validOpticals.length === 0) {
          toast.info(response.message || `No opticals found with type: ${type}`)
        } else {
          toast.success(
            response.message ||
              `Found ${validOpticals.length} opticals with type: ${type === 'all' ? 'any' : type}`
          )
        }
      } else {
        // Show error toast with the error message from the response
        setOpticals([])
        const errorMessage =
          response && typeof response.message === 'string'
            ? response.message
            : 'Failed to filter opticals by type'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error('Error filtering opticals by type:', err)
      setOpticals([])
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to filter opticals by type: ${errorMessage}`)
      toast.error(`Error filtering opticals by type: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (optical: Optical): void => {
    setEditingOptical(optical)
    setIsModalOpen(true)
  }

  // Function to handle patient search by ID
  const handlePatientSearch = async (): Promise<void> => {
    if (!patientId.trim()) return

    try {
      setLoadingPatient(true)
      // Clear previous prescriptions
      setPatientPrescriptions([])

      // Define the expected response type for better type safety
      interface PatientResponse {
        success: boolean
        data?: {
          patientId: string
          name: string
          doctorName?: string
          department?: string
          gender?: string
          age?: string
          address?: string
          phone?: string
          guardian?: string
          [key: string]: unknown // Use unknown instead of any for better type safety
        } | null
        message?: string
      }

      // Use type assertion for API calls
      const api = window.api as unknown as {
        getPatientById: (id: string) => Promise<PatientResponse>
        getPrescriptionsByPatientId?: (id: string) => Promise<{
          success: boolean
          data?: Record<string, unknown>[]
          message?: string
        }>
      }

      // Get patient by ID with standardized response format
      const response = await api.getPatientById(patientId)
      console.log('Patient search response:', response)

      // Ensure response has the expected structure before accessing properties
      if (response && response.success === true && response.data) {
        // Extract patient data from standardized response
        const patientData = response.data
        setPatientName(patientData.name || '')
        setPatient(patientData)
        setError('') // Clear any previous errors
        toast.success(`Patient ${patientData.name} found`)

        // Try to fetch patient's prescriptions if the API method exists
        if (api.getPrescriptionsByPatientId) {
          try {
            const prescriptionsResponse = await api.getPrescriptionsByPatientId(patientId)
            console.log('Patient prescriptions response:', prescriptionsResponse)
            if (
              prescriptionsResponse &&
              prescriptionsResponse.success &&
              Array.isArray(prescriptionsResponse.data)
            ) {
              // Set the prescriptions
              setPatientPrescriptions(prescriptionsResponse.data)
            }
          } catch (prescErr) {
            console.error('Error fetching patient prescriptions:', prescErr)
            // Don't show error toast for prescriptions to avoid confusion
          }
        } else {
          // Fallback: Try to fetch all prescriptions and filter by patient ID
          try {
            // Check if window.api has getPrescriptions method
            if ('getPrescriptions' in window.api) {
              const allPrescriptions = await (
                window.api as unknown as { getPrescriptions: () => unknown[] }
              ).getPrescriptions()
              console.log('All prescriptions:', allPrescriptions)
              if (Array.isArray(allPrescriptions)) {
                // Filter prescriptions by patient ID
                const patientPrescriptions = allPrescriptions.filter((prescription: unknown) => {
                  const p = prescription as Record<string, unknown>
                  return p.patientId === patientId || p.PATIENT_ID === patientId
                })
                if (patientPrescriptions.length > 0) {
                  setPatientPrescriptions(patientPrescriptions as Record<string, unknown>[])
                }
              }
            }
          } catch (prescErr) {
            console.error('Error fetching all prescriptions:', prescErr)
            // Don't show error toast for prescriptions to avoid confusion
          }
        }
      } else {
        // Handle case where patient was not found or response is invalid
        setPatientName('')
        setPatient({})
        setPatientPrescriptions([])
        const errorMessage =
          response && typeof response.message === 'string' ? response.message : 'Patient not found'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (err) {
      console.error('Error searching for patient:', err)
      setPatientName('')
      setPatient({})
      setPatientPrescriptions([])
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to search for patient: ${errorMessage}`)
      toast.error(`Failed to search for patient: ${errorMessage}`)
    } finally {
      setLoadingPatient(false)
    }
  }

  // Function to add optical to dispense list
  const addOpticalToDispense = (optical: Optical, quantity: number): void => {
    // Check if the optical is already in the list
    const existingIndex = selectedOpticals.findIndex((item) => item.id === optical.id)

    if (existingIndex >= 0) {
      // Update quantity if already in the list
      const updatedOpticals = [...selectedOpticals]
      updatedOpticals[existingIndex].quantity += quantity
      setSelectedOpticals(updatedOpticals)
      setSearchTerm('')
    } else {
      // Add new optical to the list
      setSelectedOpticals([
        ...selectedOpticals,
        {
          id: optical.id,
          type: optical.type,
          brand: optical.brand,
          model: optical.model,
          quantity,
          price: optical.price,
          power: optical.power,
          size: optical.size
        }
      ])
      setSearchTerm('')
    }

    // Update the original optical's quantity in the main list
    const updatedOpticals = opticals.map((item) => {
      if (item.id === optical.id) {
        return {
          ...item,
          quantity: item.quantity - quantity
        }
      }
      return item
    })
    setOpticals(updatedOpticals)

    // Calculate total amount after adding optical
    calculateTotalAmount()
  }

  // Function to remove optical from dispense list
  const removeOpticalFromDispense = (id: string): void => {
    // Find the optical being removed to get its quantity
    const opticalToRemove = selectedOpticals.find((optical) => optical.id === id)
    if (opticalToRemove) {
      // Update the original optical's quantity in the main list by adding back the quantity
      console.log(opticals)
      const updatedOpticals = opticals.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + opticalToRemove.quantity
          }
        }
        return item
      })
      console.log('updatedOpticals', updatedOpticals)
      setOpticals(updatedOpticals)
    }

    // Remove the optical from the selected list
    setSelectedOpticals(selectedOpticals.filter((optical) => optical.id !== id))
  }

  // Function to toggle dispense dropdown menu
  const toggleDispenseDropdown = (): void => {
    setShowDispenseDropdown(!showDispenseDropdown)
  }

  // Function to handle clicking outside the dropdown to close it
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDispenseDropdown(false)
    }
  }, [])

  // Add event listener for clicking outside dropdown
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  // Function to select dispense type and open form
  const handleDispenseTypeSelect = (type: 'general' | 'existing'): void => {
    setDispenseType(type)
    setShowDispenseDropdown(false)

    // Reset form fields
    setPatientId('')
    setPatientName('')
    setSelectedOpticals([])
    setTotalAmount(0)

    // When opening the form, set the dispensed by value from localStorage
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (currentUser && currentUser.fullName) {
        setDispensedBy(currentUser.fullName)
      }
    } catch (err) {
      console.error('Error getting user from localStorage:', err)
    }

    setShowDispenseForm(true)
  }

  // Function to toggle dispense form (for closing only)
  const toggleDispenseForm = (): void => {
    if (showDispenseForm) {
      // Reset form when closing
      setPatientId('')
      setPatientName('')
      setDispensedBy('')
      setSelectedOpticals([])
      setTotalAmount(0)
    }
    setShowDispenseForm(!showDispenseForm)
  }

  // Function to handle print receipt
  const handlePrintReceipt = async (): Promise<void> => {
    try {
      // Check if we have the necessary data based on dispense type
      if (dispenseType === 'existing' && !patientId) {
        toast.error('Please enter patient ID for existing patient')
        return
      }

      if (selectedOpticals.length === 0) {
        toast.error('Please add opticals to dispense')
        return
      }

      if (dispenseType === 'general' && !patientName) {
        toast.error('Please enter customer name')
        return
      }
      const receiptEl = opticalReceiptRef.current
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

  // Function to handle save dispense
  const handleSaveDispense = async (shouldPrint = false): Promise<void> => {
    // Validate based on dispense type
    if (dispenseType === 'existing' && !patientId) {
      setError('Please enter a valid patient ID for existing patient')
      return
    }

    if (!patientName || selectedOpticals.length === 0) {
      setError('Please fill all required fields and add at least one optical item')
      return
    }

    // Always get the current user from localStorage to ensure dispensedBy is correct
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (currentUser && currentUser.fullName) {
        // Update the dispensedBy state with the current user's name
        setDispensedBy(currentUser.fullName)
      }
    } catch (err) {
      console.error('Error getting user from localStorage:', err)
    }

    try {
      setLoading(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Create dispense records for each optical item

      // Process each optical item individually using dispenseOptical
      for (const optical of selectedOpticals) {
        // Call dispenseOptical for each item with appropriate patient ID based on dispense type
        // For general customers, we don't use a patient ID
        const patientIdToUse = dispenseType === 'existing' ? patientId : ''
        await api.dispenseOptical(
          optical.id,
          optical.quantity,
          patientName,
          patientIdToUse,
          dispensedBy
        )
      }

      // If print is requested, handle printing after successful save
      if (shouldPrint) {
        await handlePrintReceipt()
      }

      // Refresh opticals list
      try {
        // Define the expected response type for better type safety
        interface OpticalResponse {
          success: boolean
          data?: Optical[] | null
          message?: string
        }

        const response = (await api.getOpticalItemsByStatus(statusFilter)) as OpticalResponse

        if (response && response.success === true && Array.isArray(response.data)) {
          // Validate and sanitize each optical object before updating state
          const validOpticals = response.data
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
              id: item.id || '',
              type: item.type || 'frame',
              brand: item.brand || '',
              model: item.model || '',
              size: item.size || '',
              power: item.power,
              quantity: typeof item.quantity === 'number' ? item.quantity : 0,
              price: typeof item.price === 'number' ? item.price : 0,
              status: item.status || 'available'
            })) as Optical[]

          setOpticals(validOpticals)
        } else {
          // If response is invalid, set opticals to empty array
          setOpticals([])
          console.warn('Invalid response when refreshing opticals:', response)
        }
      } catch (refreshError) {
        console.error('Error refreshing opticals:', refreshError)
        setOpticals([]) // Ensure opticals is always an array
        toast.error('Failed to refresh opticals list')
      }

      // Reset form
      setPatientId('')
      setPatientName('')
      setDispensedBy('')
      setSelectedOpticals([])
      setTotalAmount(0)
      setShowDispenseForm(false)

      setError('')
    } catch (err) {
      console.error('Error dispensing optical items:', err)
      setError('Failed to dispense optical items')
    } finally {
      setLoading(false)
    }
  }

  // Filter opticals based on search term and status filter
  const filteredOpticals = opticals.filter((optical) => {
    // First apply status filter if not 'all'
    if (statusFilter !== 'all' && optical.status !== statusFilter) {
      return false
    }

    // Then apply search term filter if present
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      const brandMatch =
        optical.brand && typeof optical.brand === 'string'
          ? optical.brand.toLowerCase().includes(searchTermLower)
          : false
      const modelMatch =
        optical.model && typeof optical.model === 'string'
          ? optical.model.toLowerCase().includes(searchTermLower)
          : false

      return brandMatch || modelMatch
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Opticals Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 cursor-pointer font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </button>
              <button
                className={`px-4 py-2 cursor-pointer font-medium ${activeTab === 'dispensing-history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
              <span>{showAddForm ? 'Hide Form' : 'Add Optical Item'}</span>
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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {activeTab === 'inventory' ? (
            // Inventory Tab Content
            <>
              {showAddForm && (
                <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Optical Item</h2>
                  <OpticalForm onSubmit={handleAddOptical} onCancel={() => setShowAddForm(false)} />
                </div>
              )}
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
                  Optical Inventory
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {!loading && opticals.length > 0 && (
                      <span>
                        {opticals.length} {opticals.length === 1 ? 'item' : 'items'} found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <div className="mr-4">
                    <span className="text-sm text-gray-600 mr-2">Status:</span>
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
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        statusFilter === 'available'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Available
                    </button>

                    <button
                      onClick={() => handleFilterByStatus('out_of_stock')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        statusFilter === 'out_of_stock'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <span className="text-sm text-gray-600 mr-2">Type:</span>
                    <button
                      onClick={() => handleFilterByType('all')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        typeFilter === 'all'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleFilterByType('frame')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        typeFilter === 'frame'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Frames
                    </button>
                    <button
                      onClick={() => handleFilterByType('lens')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        typeFilter === 'lens'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Lenses
                    </button>
                  </div>
                </div>

                <div className="flex w-full space-x-4 sm:w-auto mt-4 sm:mt-0">
                  <div className="relative" ref={dropdownRef}>
                    {showDispenseForm ? (
                      <button
                        onClick={toggleDispenseForm}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
                      >
                        Cancel Dispensing
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={toggleDispenseDropdown}
                          className="px-4 py-2 rounded-md text-sm font-medium bg-green-500 hover:bg-green-600 text-white flex items-center"
                        >
                          Dispense Opticals
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {showDispenseDropdown && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleDispenseTypeSelect('existing')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Existing Patient
                              </button>
                              <button
                                onClick={() => handleDispenseTypeSelect('general')}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                General Customer
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex w-full sm:w-auto border border-gray-300 rounded-md">
                    <input
                      type="text"
                      placeholder="Search opticals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 focus:outline-none flex-grow"
                    />
                    <button onClick={handleSearch} className="px-4 py-2 text-black rounded-r-md">
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
              {/* Dispensing Form */}
              {showDispenseForm && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-blue-100">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
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
                    Dispense Optical Items
                  </h3>

                  {/* Patient/Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {dispenseType === 'existing' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient ID
                          </label>
                          <div className="flex">
                            <input
                              type="text"
                              value={patientId}
                              onChange={(e) => setPatientId(e.target.value)}
                              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter patient ID"
                            />
                            <button
                              onClick={handlePatientSearch}
                              disabled={loadingPatient}
                              className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none"
                            >
                              {loadingPatient ? '...' : 'Search'}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Patient Name
                          </label>
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Patient name"
                            readOnly={loadingPatient}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter customer name"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dispensed By
                      </label>
                      <input
                        type="text"
                        value={dispensedBy}
                        onChange={(e) => setDispensedBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  {/* Patient Prescriptions - Display when available */}
                  {dispenseType === 'existing' && patientPrescriptions.length > 0 && (
                    <div className="mb-6">
                      <div className="p-4 rounded-md border border-blue-200">
                        <h3 className="text-lg font-medium text-blue-800 mb-2">
                          Latest Prescription
                        </h3>
                        {(() => {
                          // Get the latest prescription (first in the array)
                          const latestPrescription = patientPrescriptions[0] as Record<
                            string,
                            unknown
                          >

                          // Check if we have subjective refraction data
                          const hasSRData = [
                            'SR-RE-D-SPH',
                            'SR-RE-D-CYL',
                            'SR-RE-D-AXIS',
                            'SR-RE-D-VA',
                            'SR-LE-D-SPH',
                            'SR-LE-D-CYL',
                            'SR-LE-D-AXIS',
                            'SR-LE-D-BCVA',
                            'SR-RE-N-SPH',
                            'SR-RE-N-CYL',
                            'SR-RE-N-AXIS',
                            'SR-RE-N-VA',
                            'SR-LE-N-SPH',
                            'SR-LE-N-CYL',
                            'SR-LE-N-AXIS',
                            'SR-LE-N-BCVA'
                          ].some(
                            (key) =>
                              latestPrescription[key] || latestPrescription[key.toUpperCase()]
                          )

                          if (hasSRData) {
                            return (
                              <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 rounded-md p-2 divide-y divide-gray-200">
                                  <thead className="bg-blue-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider"></th>
                                      <th
                                        colSpan={4}
                                        className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider"
                                      >
                                        Distance
                                      </th>
                                      <th
                                        colSpan={4}
                                        className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider"
                                      >
                                        Near
                                      </th>
                                    </tr>
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        Eye
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        SPH
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        CYL
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        AXIS
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        VA/BCVA
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        SPH
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        CYL
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        AXIS
                                      </th>
                                      <th className="px-3 py-2 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        VA/BCVA
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Right Eye (RE) */}
                                    <tr>
                                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                        Right Eye
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-D-SPH'] ||
                                            latestPrescription['SR-RE-D-SPH'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-D-CYL'] ||
                                            latestPrescription['SR-RE-D-CYL'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-D-AXIS'] ||
                                            latestPrescription['SR-RE-D-AXIS'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-D-VA'] ||
                                            latestPrescription['SR-RE-D-VA'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-N-SPH'] ||
                                            latestPrescription['SR-RE-N-SPH'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-N-CYL'] ||
                                            latestPrescription['SR-RE-N-CYL'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-N-AXIS'] ||
                                            latestPrescription['SR-RE-N-AXIS'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-RE-N-VA'] ||
                                            latestPrescription['SR-RE-N-VA'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                    </tr>
                                    {/* Left Eye (LE) */}
                                    <tr>
                                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                        Left Eye
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-D-SPH'] ||
                                            latestPrescription['SR-LE-D-SPH'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-D-CYL'] ||
                                            latestPrescription['SR-LE-D-CYL'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-D-AXIS'] ||
                                            latestPrescription['SR-LE-D-AXIS'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-D-BCVA'] ||
                                            latestPrescription['SR-LE-D-BCVA'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-N-SPH'] ||
                                            latestPrescription['SR-LE-N-SPH'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-N-CYL'] ||
                                            latestPrescription['SR-LE-N-CYL'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-N-AXIS'] ||
                                            latestPrescription['SR-LE-N-AXIS'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm text-center text-gray-900">
                                        {String(
                                          latestPrescription['SR-LE-N-BCVA'] ||
                                            latestPrescription['SR-LE-N-BCVA'.toUpperCase()] ||
                                            ''
                                        )}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                {latestPrescription['PD'] ||
                                latestPrescription['PD'.toUpperCase()] ? (
                                  <div className="mt-2 text-sm text-gray-700 p-2">
                                    <span className="font-medium">PD:</span>{' '}
                                    {String(
                                      latestPrescription['PD'] ||
                                        latestPrescription['PD'.toUpperCase()] ||
                                        ''
                                    )}
                                  </div>
                                ) : null}
                                {latestPrescription['ADVISED FOR'] ||
                                latestPrescription['ADVISED FOR'.toUpperCase()] ? (
                                  <div className="mt-2 text-sm text-gray-700">
                                    <span className="font-medium">Advised For:</span>{' '}
                                    {String(
                                      latestPrescription['ADVISED FOR'] ||
                                        latestPrescription['ADVISED FOR'.toUpperCase()] ||
                                        ''
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            )
                          } else {
                            // Check for traditional prescription format
                            const prescriptionText = String(
                              latestPrescription.prescription ||
                                latestPrescription.PRESCRIPTION ||
                                ''
                            )

                            if (prescriptionText) {
                              return (
                                <div className="bg-blue-50 p-3 rounded">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {prescriptionText}
                                  </p>
                                </div>
                              )
                            } else {
                              return (
                                <p className="text-sm text-gray-500">
                                  No detailed prescription data available
                                </p>
                              )
                            }
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Selected Items for Dispensing */}
                  {selectedOpticals.length > 0 && (
                    <div className="mb-6 border border-gray-300 rounded-md p-2">
                      <h4 className="text-lg font-medium text-gray-700 mb-2 p-2">Selected Items</h4>
                      <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto border border-gray-300">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Model
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subtotal
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedOpticals.map((optical) => (
                              <tr key={optical.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {optical.type}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {optical.brand}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {optical.model}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {optical.quantity}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  ₹{optical.price}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  ₹{optical.price * optical.quantity}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap cursor-pointer text-sm text-gray-900">
                                  <button
                                    onClick={() => removeOpticalFromDispense(optical.id)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-lg font-medium p-2">
                          Total Amount: <span className="text-blue-600">₹{totalAmount}</span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleSaveDispense(false)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded-md hover:bg-blue-600 focus:outline-none"
                          >
                            {loading ? 'Processing...' : 'Save Dispense'}
                          </button>
                          <button
                            onClick={() => handleSaveDispense(true)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-500 text-white cursor-pointer rounded-md hover:bg-green-600 focus:outline-none"
                          >
                            {loading ? 'Processing...' : 'Save & Print'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                    <p className="mt-3 text-gray-500">Loading optical items...</p>
                  </div>
                </div>
              )}

              {!loading && filteredOpticals.length === 0 ? (
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
                  <p className="text-gray-600 text-lg mb-2">No optical items found</p>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try a different search term or clear the filters'
                      : 'Click the "Add Optical Item" button to create your first optical record'}
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
                    Add Optical Item
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="overflow-x-auto">
                    <OpticalTable
                      opticals={filteredOpticals}
                      onEdit={openEditModal}
                      onAddToDispense={addOpticalToDispense}
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
                  Optical Dispensing History
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

              <OpticalDispenseHistory
                records={dispenseRecords}
                loading={loadingRecords}
                error={recordsError}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </>
          )}
        </div>
      </main>

      {isModalOpen && editingOptical && (
        <OpticalEditModal
          optical={editingOptical}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingOptical(null)
          }}
          onSave={handleUpdateOptical}
        />
      )}

      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Hidden receipt for printing */}
      <div style={{ display: 'none' }}>
        <div ref={opticalReceiptRef}>
          {dispenseType === 'existing' ? (
            <OpticalReceipt
              data={{
                businessInfo: {
                  name: 'SRI MEHER OPTICALS',
                  address:
                    '# 6-6-650/1, Ambedkarnagar, Subhashnagar Road, Beside Honda Show Room, KARIMNAGAR-505001',
                  gstin: '36AENPC8304C3ZS',
                  phone1: '+91 94943 62719',
                  phone2: ''
                },
                patientInfo: {
                  billNumber: `OPT-${new Date().getTime().toString().slice(-6)}`,
                  patientId: patientId || '',
                  date: new Date().toLocaleDateString(),
                  patientName: patientName,
                  gender: patient['gender'] || '', // Not available in current context
                  age: patient['age'] || '', // Not available in current context
                  address: patient['address'] || '', // Not available in current context
                  mobile: patient['phone'] || '', // Not available in current context
                  doctorName: patient['doctorName'] || '',
                  guardianName: patient['guardian'] || '',
                  referredBy: patient['referredBy'] || '',
                  dept: patient['department'] || ''
                },
                items: selectedOpticals.map((optical) => ({
                  particulars: `${optical.brand} ${optical.model} (${optical.type})`,
                  power: optical.power || '', // Default empty as it may not be available
                  size: optical.size || '', // Default empty as it may not be available
                  qty: optical.quantity,
                  rate: optical.price,
                  amount: optical.price * optical.quantity
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
            <OpticalNon
              billNumber={`OPT-${new Date().getTime().toString().slice(-6)}`}
              date={new Date().toLocaleDateString()}
              customerName={patientName}
              gstNo="36AENPC8304C3ZS"
              items={selectedOpticals.map((optical, index) => ({
                slNo: index + 1,
                particulars: `${optical.brand} ${optical.model} (${optical.type})${optical.power ? ` Power: ${optical.power}` : ''}${optical.size ? ` Size: ${optical.size}` : ''}`,
                rate: optical.price,
                amount: optical.price * optical.quantity
              }))}
              total={totalAmount}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Opticals
