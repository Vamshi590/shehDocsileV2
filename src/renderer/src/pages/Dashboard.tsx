import React, { useState, useEffect } from 'react'
import DuesFollowUpSummary from '../components/duesFollowUp/DuesFollowUpSummary'
import { StaffUser } from '../types/staff'

const Dashboard = (): React.JSX.Element => {
  const [user, setUser] = useState<StaffUser | null>(null)

  useEffect(() => {
    // Load user data from localStorage
    const userDataString = localStorage.getItem('currentUser')
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString) as StaffUser
        console.log(userData)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    } else {
      // No user data found, redirect to login
      window.location.hash = '/login'
    }
  }, [])

  const navigateTo = (path: string): void => {
    window.location.hash = path
  }

  const handleLogout = (): void => {
    // Clear user data and redirect to login
    localStorage.removeItem('currentUser')
    window.location.hash = '/login'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">Sri Harsha Eye Hospital</h1>
              <p className="text-sm text-gray-500">Healthcare Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center space-x-1 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 4a1 1 0 102 0v-3a1 1 0 10-2 0v3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Dashboard</h2>
          <p className="text-gray-600">Manage your hospital operations efficiently</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Patients Card */}
          {(user?.patients || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/patients')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Manage Patients</h3>
              </div>
              <p className="text-gray-600 ml-16">Add, edit, and manage patient records</p>
            </div>
          )}

          {/* Prescriptions Card */}
          {(user?.prescriptions || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/prescriptions')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H5z"
                      clipRule="evenodd"
                    />
                    <path d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Prescriptions</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage prescriptions and receipts</p>
            </div>
          )}

          {/* Operations Card */}
          {(user?.operations || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/operations')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Operations</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage surgeries and operations</p>
            </div>
          )}

          {/* Medicines Card */}
          {(user?.medicines || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/medicines')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Medicines</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage medicine inventory and sales</p>
            </div>
          )}

          {/* Opticals Card */}
          {(user?.opticals || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/opticals')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Opticals</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage frames, lenses and optical sales</p>
            </div>
          )}

          {/* Reports Card */}
          {(user?.reports || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/reports')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-2a1 1 0 10-2 0v5a1 1 0 102 0V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Reports</h3>
              </div>
              <p className="text-gray-600 ml-16">Search and view patient reports</p>
            </div>
          )}

          {/* Dues/Follow-Up Card */}
          {(user?.duesFollowUp || user?.isAdmin) && (
            <DuesFollowUpSummary onClick={() => navigateTo('/dues-followup')} />
          )}

          {/* Data Management Card */}
          {(user?.data || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/data')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Data</h3>
              </div>
              <p className="text-gray-600 ml-16">Search and browse all data</p>
            </div>
          )}

          {/* Labs Card */}
          {(user?.labs || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/labs')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.354 18 4.828 18h10.343c2.474 0 4.011-3.231 2.121-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Labs</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage lab tests and results</p>
            </div>
          )}

          {/* Analytics Card */}
          {(user?.analytics || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/analytics')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Analytics</h3>
              </div>
              <p className="text-gray-600 ml-16">View analytics and trends</p>
            </div>
          )}

          {/* Staff Management Card */}
          {(user?.staff || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/staff')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Staff Management</h3>
              </div>
              <p className="text-gray-600 ml-16">Manage staff and permissions</p>
            </div>
          )}
          {/* Certificates Card */}
          {(user?.certificates || user?.isAdmin) && (
            <div
              onClick={() => navigateTo('/certificates')}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Certificates</h3>
              </div>
              <p className="text-gray-600 ml-16">Generate and manage patient certificates</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
