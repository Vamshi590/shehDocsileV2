import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Define interfaces
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

interface ExpenseFormData {
  title: string
  amount: string
  category: string
  reason: string
  date: string
}

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, expenseData: ExpenseFormData) => void
  categories: string[]
  expense: Expense | null
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  expense
}) => {
  // Initialize form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: '',
    category: categories[0] || '',
    reason: '',
    date: format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd')
  })

  // Form validation state
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({})

  // Update form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        reason: expense.reason || '',
        date: expense.date
      })
    }
  }, [expense])

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error when field is edited
    if (errors[name as keyof ExpenseFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    if (validateForm() && expense) {
      onSave(expense.id, formData)
    }
  }

  if (!isOpen || !expense) return null

  return (
    <div className="bg-black/30 fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-6 w-full max-w-md animate-scaleIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Edit Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Expense Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Expense Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter expense title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Expense <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                max={format(toZonedTime(new Date(), 'Asia/Kolkata'), 'yyyy-MM-dd')}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* Reason (Optional) */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for expense"
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
            >
              Update Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditExpenseModal
