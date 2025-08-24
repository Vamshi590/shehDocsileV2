import React, { useState, useEffect, useCallback } from 'react'
import { toast, Toaster } from 'sonner'
import { format } from 'date-fns'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import EditExpenseModal from '../components/expenses/EditExpenseModal'
import '../styles/animations.css'
import { toZonedTime } from 'date-fns-tz'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

// Define interfaces for expense data
interface Expense {
  id: string
  title: string
  amount: number
  category: string
  reason?: string
  date: string
  createdAt: string
  updatedAt?: string
}

interface ExpenseResponse<T = unknown> {
  success: boolean
  data: T
  error: string | null
  statusCode: number
}

interface ExpenseCategory {
  name: string
  color: string
}

// Define expense categories with colors for the pie chart
const expenseCategories: ExpenseCategory[] = [
  { name: 'Stationary', color: 'rgba(59, 130, 246, 0.7)' }, // Blue
  { name: 'House Keeping', color: 'rgba(16, 185, 129, 0.7)' }, // Green
  { name: "DR's & RMP's", color: 'rgba(244, 63, 94, 0.7)' }, // Red
  { name: 'Lab', color: 'rgba(249, 115, 22, 0.7)' }, // Orange
  { name: 'Salaries', color: 'rgba(139, 92, 246, 0.7)' }, // Purple
  { name: 'Medicine', color: 'rgba(236, 72, 153, 0.7)' }, // Pink
  { name: 'Opticals', color: 'rgba(20, 184, 166, 0.7)' }, // Teal
  { name: 'Maintenance', color: 'rgba(125, 156, 40, 0.7)' }, // Teal
  { name: 'Other', color: 'rgba(161, 161, 170, 0.7)' } // Gray
]

const Expenses: React.FC = () => {
  // State variables
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'custom'>('today')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Calculate date range based on time filter
  const getDateRangeFromFilter = useCallback((): { startDate: string; endDate: string } => {
    const today = toZonedTime(new Date(), 'Asia/Kolkata')
    const todayStr = format(today, 'yyyy-MM-dd') // Today's date in YYYY-MM-DD format

    // Default to today for end date
    const calculatedEndDate = todayStr

    // Initialize start date
    let calculatedStartDate: string

    // Calculate start date based on filter
    switch (timeFilter) {
      case 'today': {
        const currentDate = toZonedTime(new Date(), 'Asia/Kolkata')
        calculatedStartDate = format(currentDate, 'yyyy-MM-dd') // Same as today
        break
      }
      case 'week': {
        const currentDate = toZonedTime(new Date(), 'Asia/Kolkata')
        const weekAgoDate = new Date(format(currentDate, 'yyyy-MM-dd'))
        weekAgoDate.setDate(currentDate.getDate() - 7)
        calculatedStartDate = weekAgoDate.toISOString().split('T')[0]
        break
      }
      case 'month': {
        const currentDate = toZonedTime(new Date(), 'Asia/Kolkata')
        const monthAgoDate = new Date(format(currentDate, 'yyyy-MM-dd'))
        monthAgoDate.setMonth(currentDate.getMonth() - 1)
        calculatedStartDate = monthAgoDate.toISOString().split('T')[0]
        break
      }
      case 'custom': {
        // Use custom dates if set, otherwise use defaults
        const currentDate = toZonedTime(new Date(), 'Asia/Kolkata')
        const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd')
        return {
          startDate: startDate || formattedCurrentDate,
          endDate: endDate || formattedCurrentDate
        }
      }
      default: {
        // Default to last month
        const currentDate = toZonedTime(new Date(), 'Asia/Kolkata')
        const defaultMonthAgo = new Date(format(currentDate, 'yyyy-MM-dd'))
        defaultMonthAgo.setMonth(currentDate.getMonth() - 1)
        calculatedStartDate = defaultMonthAgo.toISOString().split('T')[0]
      }
    }

    return { startDate: calculatedStartDate, endDate: calculatedEndDate }
  }, [timeFilter, startDate, endDate])

  // Fetch expenses data
  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Get date range based on current filter
      const { startDate: filterStartDate, endDate: filterEndDate } = getDateRangeFromFilter()

      // Use getExpensesByDateRange instead of getExpenses
      const response = (await api.getExpensesByDateRange(
        filterStartDate,
        filterEndDate
      )) as ExpenseResponse<Expense[]>

      if (response.success && response.data) {
        setExpenses(response.data)
        toast.success('Expenses loaded successfully', {
          description: `${response.data.length} expense records retrieved`,
          duration: 3000
        })
      } else {
        console.error('Error fetching expenses:', response.error)
        toast.error('Failed to load expenses', {
          description: response.error || 'Could not retrieve expense data from the server',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to load expenses data')
    } finally {
      setLoading(false)
    }
  }, [getDateRangeFromFilter])

  // Load data when component mounts or timeFilter changes
  useEffect(() => {
    fetchExpenses()
  }, [timeFilter, fetchExpenses])

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format amount in short form (e.g., 1K, 1.5M)
  const formatAmountShort = (amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M'
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K'
    } else {
      return amount.toString()
    }
  }
  // Apply client-side filtering for search and category, and sort the results
  const filteredExpenses = [...expenses]
    .filter((expense) => {
      // Apply search filter if there's a search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const titleMatch = expense.title.toLowerCase().includes(query)
        const categoryMatch = expense.category.toLowerCase().includes(query)
        const reasonMatch = expense.reason ? expense.reason.toLowerCase().includes(query) : false

        if (!titleMatch && !categoryMatch && !reasonMatch) {
          return false
        }
      }

      // Apply category filter if not set to 'all'
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === 'highest') {
        return b.amount - a.amount
      } else {
        return a.amount - b.amount
      }
    })
  // Calculate total expenses for reference (used in percentage calculations for pie chart tooltips)
  const totalExpensesAmount = filteredExpenses.reduce((total, expense) => total + expense.amount, 0)

  // Calculate expenses by category
  const expensesByCategory = expenseCategories
    .map((category): { name: string; amount: number; color: string } => {
      const total = filteredExpenses
        .filter((expense) => expense.category === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        name: category.name,
        amount: total,
        color: category.color
      }
    })
    .filter((category) => category.amount > 0)

  // Handle adding a new expense
  const handleAddExpense = async (expenseData: {
    title: string
    amount: string
    category: string
    reason: string
    date: string
  }): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.addExpense({
        title: expenseData.title,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        reason: expenseData.reason || '',
        date: expenseData.date
      })) as ExpenseResponse<Expense>

      if (response.success && response.data) {
        toast.success('Expense added successfully')
        setShowAddModal(false)
        fetchExpenses()
      } else {
        toast.error(response.error || 'Failed to add expense')
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('Failed to add expense', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 4000
      })
    }
  }

  // Handle editing an expense
  const handleEditExpense = (expense: Expense): void => {
    setSelectedExpense(expense)
    setShowEditModal(true)
  }

  // Handle saving edited expense
  const handleSaveEditedExpense = async (
    id: string,
    expenseData: {
      title: string
      amount: string
      category: string
      reason: string
      date: string
    }
  ): Promise<void> => {
    try {
      console.log('Editing expense with ID:', id)
      console.log('Expense data:', expenseData)
      setLoading(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.updateExpense({
        data: {
          id,
          title: expenseData.title,
          amount: parseFloat(expenseData.amount),
          category: expenseData.category,
          reason: expenseData.reason || '',
          date: expenseData.date
        }
      })) as ExpenseResponse<Expense>

      if (response.success && response.data) {
        toast.success('Expense updated successfully')
        setShowEditModal(false)
        setSelectedExpense(null)
        fetchExpenses()
      } else {
        toast.error(response.error || 'Failed to update expense')
      }
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error('Failed to update expense', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  // Show delete confirmation modal
  const showDeleteConfirmation = (id: string): void => {
    setExpenseToDelete(id)
    setShowDeleteModal(true)
  }

  // Handle deleting an expense
  const handleDeleteExpense = async (): Promise<void> => {
    if (!expenseToDelete) return

    try {
      setLoading(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.deleteExpense(expenseToDelete)) as ExpenseResponse

      if (response.success) {
        toast.success('Expense deleted successfully', {
          description: 'The expense has been removed from your records',
          duration: 3000
        })
        fetchExpenses() // Refresh the expenses list
      } else {
        toast.error('Failed to delete expense', {
          description: response.error || 'There was a problem removing this expense',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 4000
      })
    } finally {
      setShowDeleteModal(false)
      setExpenseToDelete('')
      setLoading(false)
    }
  }

  // Handle filtering expenses by date range
  const handleDateRangeFilter = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const response = (await api.getExpensesByDateRange(
        startDate || '2000-01-01', // Default start date if not provided
        endDate || format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd') // Default to today if not provided
      )) as ExpenseResponse<Expense[]>
      if (response.success && response.data) {
        setExpenses(response.data)
        toast.success('Date filter applied', {
          description: `Found ${response.data.length} expenses in the selected date range`,
          duration: 3000
        })
      } else {
        toast.error('Failed to filter by date', {
          description: response.error || 'Could not apply date range filter to expenses',
          duration: 4000
        })
      }
    } catch (error) {
      console.error('Error filtering expenses by date:', error)
      toast.error('Date filter error', {
        description: error instanceof Error ? error.message : 'Could not apply date range filter',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering is now used instead of server-side category filtering

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6 animate-slideInBottom">
        <h1 className="text-2xl font-bold text-gray-800">Expenses Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:shadow-lg"
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
            Add Expense
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

      <Toaster />

      {/* Time filter tabs */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-slideInBottom"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-300`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-300`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-300`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('custom')}
            className={`px-4 py-2 rounded-lg ${
              timeFilter === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors duration-300`}
          >
            Custom Range
          </button>

          {timeFilter === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleDateRangeFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard content */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideInBottom"
        style={{ animationDelay: '0.2s' }}
      >
        {/* Left column - Pie chart and stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover-shadow">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Expense Summary</h2>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-full"></div>
              </div>
            ) : (
              <div className="h-72 relative">
                {expensesByCategory.length > 0 ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none">
                      <div className="text-3xl font-bold text-gray-800">
                        ₹{formatAmountShort(totalExpensesAmount)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Total Spent</div>
                    </div>
                    <Pie
                      data={{
                        labels: expensesByCategory.map((cat) => cat.name),
                        datasets: [
                          {
                            data: expensesByCategory.map((cat) => cat.amount),
                            backgroundColor: expensesByCategory.map((cat) => cat.color),
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            borderWidth: 2,
                            borderRadius: 4,
                            hoverBorderWidth: 0,
                            hoverOffset: 10
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              font: {
                                size: 12,
                                family: "'Inter', sans-serif"
                              },
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: 'circle'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                              size: 14,
                              family: "'Inter', sans-serif"
                            },
                            bodyFont: {
                              size: 13,
                              family: "'Inter', sans-serif"
                            },
                            callbacks: {
                              label: function (context) {
                                const label = expensesByCategory[context.dataIndex].name || ''
                                const value = context.raw
                                const percentage = ((value as number) / totalExpensesAmount) * 100
                                return `${label}: ${formatCurrency(value as number)} (${percentage.toFixed(1)}%)`
                              }
                            }
                          }
                        },
                        elements: {
                          arc: {
                            borderWidth: 0
                          }
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      No expense data available for the selected period
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">Expenses by Category</h3>
              <div className="space-y-2">
                {loading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-3 w-3 rounded-full bg-gray-200 mr-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="ml-auto h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {expensesByCategory.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(category.amount)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Total Expenses</h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-800 mb-4">
                {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </div>
            )}
            <div className="text-sm text-gray-500">
              {timeFilter === 'today'
                ? 'Today'
                : timeFilter === 'week'
                  ? 'This Week'
                  : timeFilter === 'month'
                    ? 'This Month'
                    : 'Custom Period'}
            </div>
          </div>
        </div>

        {/* Right column - Expense list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">Expense List</h2>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg w-full sm:w-auto"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-2 top-2.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {expenseCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="w-3/4">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500">No expenses found for the selected filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="border-b border-gray-100 py-4 last:border-b-0 hover-shadow hover-scale animate-slideInRight stagger-item"
                    style={{ padding: '12px', borderRadius: '8px', margin: '4px 0' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{expense.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="mr-3">
                            {format(new Date(expense.date), 'dd MMM yyyy')}
                          </span>
                          <span
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: expenseCategories.find(
                                (cat) => cat.name === expense.category
                              )?.color,
                              color: 'white'
                            }}
                          >
                            {expense.category}
                          </span>
                        </div>
                        {expense.reason && (
                          <p className="text-sm text-gray-600 mt-2">{expense.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <div className="font-semibold text-gray-800 mr-4">
                          {formatCurrency(expense.amount)}
                        </div>
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-200 mr-2"
                          title="Edit expense"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                          onClick={() => showDeleteConfirmation(expense.id)}
                          title="Delete Expense"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddExpense}
          categories={expenseCategories.map((cat) => cat.name)}
        />
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <EditExpenseModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedExpense(null)
          }}
          onSave={handleSaveEditedExpense}
          categories={expenseCategories.map((cat) => cat.name)}
          expense={selectedExpense}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="bg-black/30 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="text-center mb-5">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Expense</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowDeleteModal(false)
                  setExpenseToDelete('')
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteExpense}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
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
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
