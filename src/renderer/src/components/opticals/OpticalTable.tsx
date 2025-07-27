import React from 'react'

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

interface OpticalTableProps {
  opticals: Optical[]
  onEdit: (optical: Optical) => void
  onAddToDispense?: (optical: Optical, quantity: number) => void
  showDispenseControls?: boolean
}

const OpticalTable: React.FC<OpticalTableProps> = ({
  opticals,
  onEdit,
  onAddToDispense,
  showDispenseControls = false
}) => {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({})
  // Function to get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  // Function to get type badge class
  const getTypeBadgeClass = (type: string): string => {
    switch (type) {
      case 'frame':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'lens':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Type
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Brand
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Model
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Size
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {/* Power column only for lenses */}
            Power
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Quantity
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Price
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
          {showDispenseControls && (
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Dispense Quantity
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {opticals.map((optical) => (
          <tr key={optical.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(
                  optical.type
                )}`}
              >
                {optical.type === 'frame' ? 'Frame' : 'Lens'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{optical.brand}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{optical.model}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{optical.size}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">
                {optical.type === 'lens' ? optical.power : '-'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{optical.quantity}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">₹{optical.price.toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  optical.status
                )}`}
              >
                {optical.status === 'available'
                  ? 'Available'
                  : optical.status === 'completed'
                    ? 'Completed'
                    : 'Out of Stock'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end space-x-2">
                {/* Edit button */}
                <button
                  onClick={() => onEdit(optical)}
                  className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
                  title="Edit"
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
              </div>
            </td>
            {showDispenseControls && (
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      const currentQty = quantities[optical.id] || 0
                      if (currentQty > 0) {
                        setQuantities({
                          ...quantities,
                          [optical.id]: currentQty - 1
                        })
                      }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    disabled={!quantities[optical.id]}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{quantities[optical.id] || 0}</span>
                  <button
                    onClick={() => {
                      const currentQty = quantities[optical.id] || 0
                      if (currentQty < optical.quantity) {
                        setQuantities({
                          ...quantities,
                          [optical.id]: currentQty + 1
                        })
                      }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                    disabled={quantities[optical.id] >= optical.quantity}
                  >
                    +
                  </button>
                  <button
                    onClick={() => {
                      const quantity = quantities[optical.id] || 0
                      if (quantity > 0 && onAddToDispense) {
                        onAddToDispense(optical, quantity)
                        setQuantities({
                          ...quantities,
                          [optical.id]: 0
                        })
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                    disabled={!quantities[optical.id]}
                  >
                    Add
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default OpticalTable
