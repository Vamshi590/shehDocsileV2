import React, { useState } from 'react'
import TabNavigation from '../components/data/TabNavigation'
import PatientsTab from '../components/data/PatientsTab'
import PrescriptionsTab from '../components/data/PrescriptionsTab'
import OperationsTab from '../components/data/OperationsTab'
import OptionsTab from '../components/data/OptionsTab'
import ReadingsTab from '../components/data/ReadingsTab'

// Define tab types
type TabType = 'patients' | 'prescriptions' | 'operations' | 'options' | 'readings'

const Data: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>('patients')

  // Function to handle tab change
  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">Data Management</h1>
              <p className="text-sm text-gray-500">View and search all stored information</p>
            </div>
            <button
              onClick={() => (window.location.hash = '/dashboard')}
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
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'patients' && <PatientsTab />}
            {activeTab === 'prescriptions' && <PrescriptionsTab />}
            {activeTab === 'operations' && <OperationsTab />}
            {activeTab === 'options' && <OptionsTab />}
            {activeTab === 'readings' && <ReadingsTab />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Data
