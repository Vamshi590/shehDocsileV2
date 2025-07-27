import React, { useState, useEffect } from 'react'
import { StaffUser } from '../../types/staff'
import { toast, Toaster } from 'sonner'

interface AddStaffFormProps {
  onSubmit: (data: StaffUser | Partial<StaffUser>) => void
  onCancel: () => void
  initialData?: StaffUser | null
  isEditing?: boolean
}

const AddStaffForm: React.FC<AddStaffFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Partial<StaffUser>>({
    username: '',
    fullName: '',
    position: '',
    salary: 0,
    phone: '',
    email: '',
    permissions: {
      patients: false,
      prescriptions: false,
      medicines: false,
      opticals: false,
      receipts: false,
      analytics: false,
      staff: false,
      operations: false,
      reports: false,
      duesFollowUp: false,
      data: false,
      labs: false,
      certificates: false
    },
    isAdmin: false
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Populate form with initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Don't include passwordHash in form data
        passwordHash: undefined
      })
    }
  }, [initialData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked

      // Handle permission checkboxes
      if (name.startsWith('permission-')) {
        const permissionName = name.replace('permission-', '') as keyof StaffUser['permissions']

        const updatedPermissions = {
          ...formData.permissions,
          [permissionName]: isChecked
        } as StaffUser['permissions']

        setFormData({
          ...formData,
          permissions: updatedPermissions
        })

        // If this is the staff permission and it's being checked, also set isAdmin to true
        if (permissionName === 'staff' && isChecked) {
          setFormData((prev) => ({
            ...prev,
            isAdmin: true
          }))
        } else if (permissionName === 'staff' && !isChecked) {
          setFormData((prev) => ({
            ...prev,
            isAdmin: false
          }))
        }
      } else if (name === 'isAdmin') {
        // If isAdmin is checked, also enable staff permission
        const updatedPermissions = {
          ...formData.permissions,
          staff: isChecked
        } as StaffUser['permissions']

        setFormData({
          ...formData,
          isAdmin: isChecked,
          permissions: updatedPermissions
        })
      } else {
        setFormData({
          ...formData,
          [name]: isChecked
        })
      }
    } else {
      // Handle regular inputs
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value
      })
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Validate form
    if (!formData.username || !formData.fullName || !formData.position) {
      toast.error('Please fill in all required fields')
      return
    }

    // Prepare final form data with permissions properly set
    // This ensures both top-level and nested permission properties are set correctly
    const finalFormData = {
      ...formData,
      // Set top-level permission properties from the nested permissions object
      patients: formData.permissions?.patients || false,
      prescriptions: formData.permissions?.prescriptions || false,
      medicines: formData.permissions?.medicines || false,
      opticals: formData.permissions?.opticals || false,
      receipts: formData.permissions?.receipts || false,
      analytics: formData.permissions?.analytics || false,
      staff: formData.permissions?.staff || false,
      operations: formData.permissions?.operations || false,
      reports: formData.permissions?.reports || false,
      duesFollowUp: formData.permissions?.duesFollowUp || false,
      data: formData.permissions?.data || false,
      labs: formData.permissions?.labs || false,
      certificates: formData.permissions?.certificates || false
    }

    // Password validation for new staff
    if (!isEditing) {
      if (!password) {
        setPasswordError('Password is required')
        return
      }

      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match')
        return
      }

      // Include password for new staff
      onSubmit({ ...finalFormData, passwordHash: password })
    } else {
      // For editing, only include password if it was changed
      if (password) {
        if (password.length < 6) {
          setPasswordError('Password must be at least 6 characters')
          return
        }

        if (password !== confirmPassword) {
          setPasswordError('Passwords do not match')
          return
        }

        onSubmit({ ...finalFormData, passwordHash: password })
      } else {
        // Don't include password if not changing it
        onSubmit(finalFormData)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg w-full p-6 border border-gray-200">
      <Toaster />
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isEditing} // Username cannot be changed once created
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Receptionist, Doctor, Admin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                  Administrator (full access to all modules)
                </label>
              </div>
            </div>
          </div>

          {/* Password and Permissions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Password</h3>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                  {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isEditing}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                  {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordError('')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!isEditing}
                />
              </div>

              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Module Permissions</h3>

              <div className="space-y-3">
                {/* Disable individual permissions if isAdmin is checked */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-patients"
                      name="permission-patients"
                      checked={formData.permissions?.patients || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-patients"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Patients Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-prescriptions"
                      name="permission-prescriptions"
                      checked={formData.permissions?.prescriptions || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-prescriptions"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Prescriptions Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-medicines"
                      name="permission-medicines"
                      checked={formData.permissions?.medicines || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-medicines"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Medicines Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-opticals"
                      name="permission-opticals"
                      checked={formData.permissions?.opticals || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-opticals"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Opticals Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-receipts"
                      name="permission-receipts"
                      checked={formData.permissions?.receipts || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-receipts"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Receipts Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-analytics"
                      name="permission-analytics"
                      checked={formData.permissions?.analytics || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-analytics"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Analytics Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-operations"
                      name="permission-operations"
                      checked={formData.permissions?.operations || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-operations"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Operations Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-reports"
                      name="permission-reports"
                      checked={formData.permissions?.reports || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-reports"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Reports Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-duesFollowUp"
                      name="permission-duesFollowUp"
                      checked={formData.permissions?.duesFollowUp || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-duesFollowUp"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Dues Follow-Up Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-data"
                      name="permission-data"
                      checked={formData.permissions?.data || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="permission-data" className="ml-2 block text-sm text-gray-700">
                      Data Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-labs"
                      name="permission-labs"
                      checked={formData.permissions?.labs || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="permission-labs" className="ml-2 block text-sm text-gray-700">
                      Labs Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-certificates"
                      name="permission-certificates"
                      checked={formData.permissions?.certificates || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-certificates"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Certificates Module
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permission-staff"
                      name="permission-staff"
                      checked={formData.permissions?.staff || formData.isAdmin}
                      onChange={handleInputChange}
                      disabled={formData.isAdmin}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="permission-staff"
                      className="ml-2 block text-sm text-gray-700 font-semibold text-blue-600"
                    >
                      Staff Module (Admin only)
                    </label>
                  </div>
                </div>

                {formData.isAdmin && (
                  <p className="text-sm text-gray-500 mt-2">
                    Administrator has access to all modules by default
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Update Staff' : 'Add Staff'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStaffForm
