import React, { useState, useEffect } from 'react'
import StaffList from '../components/staff/StaffList'
import AddStaffForm from '../components/staff/AddStaffForm'
import { StaffUser } from '../types/staff'
import { toast, Toaster } from 'sonner'

const Staff = (): React.JSX.Element => {
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
  const [currentUser, setCurrentUser] = useState<Omit<StaffUser, 'passwordHash'> | null>(null)

  useEffect(() => {
    // Check if user has admin permissions
    const user = localStorage.getItem('currentUser')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)

        // // Redirect if not admin
        // if (!parsedUser.permissions?.staff) {
        //   window.location.hash = '/dashboard'
        //   return
        // }
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    } else {
      // No user found, redirect to login
      window.location.hash = '/login'
      return
    }

    loadStaffList()
  }, [])

  const loadStaffList = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const staff = (await api.getStaffList()) as StaffUser[]
      setStaffList(staff)
      setError(null)
    } catch (err) {
      setError('Failed to load staff list')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStaff = async (staffData: StaffUser | Partial<StaffUser>): Promise<void> => {
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.addStaff(staffData)
      loadStaffList() // Reload the list
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to add staff member')
      console.error(err)
    }
  }

  const handleUpdateStaff = async (id: string, staffData: Partial<StaffUser>): Promise<void> => {
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.updateStaff(id, staffData)
      loadStaffList() // Reload the list
      setEditingStaff(null)
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to update staff member')
      console.error(err)
    }
  }

  const handleDeleteStaff = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.deleteStaff(id)
      loadStaffList() // Reload the list
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to delete staff member')
      console.error(err)
    }
  }

  const handleResetPassword = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to reset this user's password?")) {
      return
    }

    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newPassword = (await api.resetStaffPassword(id)) as string
      toast.success(`Password has been reset to: ${newPassword}\n\nPlease share this with the user`)
    } catch (err) {
      setError('Failed to reset password')
      console.error(err)
    }
  }

  const startEditing = (staff: StaffUser): void => {
    setEditingStaff(staff)
    setShowAddForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Staff Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
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
              <span>Add Staff</span>
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
      {/* 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Staff
          </button>
        )}
      </div> */}

      {error && (
        <div className="max-w-7xl mx-auto mt-4 mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showAddForm ? (
        <div className="max-w-7xl p-6 mx-auto">
          <AddStaffForm
            onSubmit={
              editingStaff ? (data) => handleUpdateStaff(editingStaff.id, data) : handleAddStaff
            }
            onCancel={() => {
              setShowAddForm(false)
              setEditingStaff(null)
            }}
            initialData={editingStaff}
            isEditing={!!editingStaff}
          />
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-6">
          <StaffList
            staffList={staffList}
            isLoading={isLoading}
            onEdit={startEditing}
            onDelete={handleDeleteStaff}
            onResetPassword={handleResetPassword}
            currentUser={currentUser}
          />
        </main>
      )}
    </div>
  )
}

export default Staff
