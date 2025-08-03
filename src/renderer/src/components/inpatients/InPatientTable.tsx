import React, { useState } from 'react'
import { InPatient } from '../../pages/InPatients'

interface InPatientTableProps {
  inpatients: InPatient[]
  onEdit: (inpatient: InPatient) => void
  onDelete: (id: string) => void
}

const InPatientTable: React.FC<InPatientTableProps> = ({ inpatients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInPatient, setSelectedInPatient] = useState<InPatient | null>(null)

  // Filter inpatients based on search term
  const filteredInpatients = searchTerm
    ? inpatients.filter((inpatient) => {
        return (
          inpatient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inpatient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inpatient.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inpatient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inpatient.operationName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : inpatients

  const handleRowClick = (inpatient: InPatient): void => {
    setSelectedInPatient(inpatient.id === selectedInPatient?.id ? null : inpatient)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-4 bg-white rounded-lg p-4">
      {/* Search and Action Buttons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search in-patients..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex space-x-2">
          {selectedInPatient ? (
            <>
              <button
                onClick={() => onEdit(selectedInPatient)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span>Edit In-Patient</span>
              </button>
              {currentUser?.isAdmin && (
                <button
                  onClick={() => {
                    onDelete(selectedInPatient.id)
                    setSelectedInPatient(null)
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Delete</span>
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-2 text-gray-500 flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Select an in-patient to perform actions
            </div>
          )}
        </div>
      </div>

      {/* In-Patient Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guardian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInpatients.length > 0 ? (
              filteredInpatients.map((inpatient) => (
                <tr
                  key={inpatient.id}
                  onClick={() => handleRowClick(inpatient)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedInPatient?.id === inpatient.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inpatient.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inpatient.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inpatient.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inpatient.guardianName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inpatient.operationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inpatient.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inpatient.doctorNames.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(inpatient.packageAmount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                  No in-patients found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center text-gray-500">
        {filteredInpatients.length === 0 && searchTerm ? (
          <p>No in-patients found matching your search. Try a different term.</p>
        ) : filteredInpatients.length === 0 ? (
          <p>No in-patients available. Add your first in-patient using the button above.</p>
        ) : null}
      </div>
    </div>
  )
}

export default InPatientTable
