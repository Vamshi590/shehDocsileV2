import React from 'react'

interface ReportSearchProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchType: 'id' | 'name' | 'phone'
  setSearchType: (type: 'id' | 'name' | 'phone') => void
  handleSearch: (e: React.FormEvent) => Promise<void>
  loading: boolean
}

const ReportSearch: React.FC<ReportSearchProps> = ({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  handleSearch,
  loading
}) => {
  return (
    <div className="max-w-7xl mt-4 mx-auto px-6 py-4 sm:px-8 lg:px-10 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Search Patient Reports</h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <input
              type="text"
              id="search"
              placeholder={
                searchType === 'id'
                  ? 'Enter Patient ID'
                  : searchType === 'name'
                    ? 'Enter Patient Name'
                    : 'Enter Patient Phone Number'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch(e)
                }
              }}
            />
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">
              Search By
            </label>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'id' | 'name' | 'phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="id">Patient ID</option>
              <option value="name">Patient Name</option>
              <option value="phone">Phone Number</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 ${
              loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                <span>Searching...</span>
              </>
            ) : (
              <>
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
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportSearch
