import React, { useState } from 'react'
import { InPatient } from '../../pages/InPatients'

interface DischargeModalProps {
  inpatient: InPatient
  onConfirm: (inpatient: InPatient, dischargeDate: string) => void
  onClose: () => void
}

const DischargeModal: React.FC<DischargeModalProps> = ({ inpatient, onConfirm, onClose }) => {
  // Get current Indian date and time
  const getCurrentIndianDateTime = (): { date: string; time: string } => {
    const now = new Date()
    // IST is UTC+5:30
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)

    // Format date as YYYY-MM-DD
    const date = istTime.toISOString().split('T')[0]
    // Format time as HH:MM (24-hour)
    const time = istTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    return { date, time }
  }

  const { date: currentDate, time: currentTime } = getCurrentIndianDateTime()
  const [dischargeDate, setDischargeDate] = useState(currentDate)
  const [dischargeTime, setDischargeTime] = useState(currentTime)

  const handleConfirm = (): void => {
    // Combine date and time for the discharge date
    const dischargeDateTimeString = `${dischargeDate}T${dischargeTime}`
    onConfirm(inpatient, dischargeDateTimeString)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Discharge Patient</h2>
        <p className="mb-4">
          Are you sure you want to discharge patient{' '}
          <span className="font-semibold">{inpatient.name}</span>?
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Date</label>
          <input
            type="date"
            value={dischargeDate}
            onChange={(e) => setDischargeDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>{' '}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Discharge Time</label>
          <input
            type="time"
            value={dischargeTime}
            onChange={(e) => setDischargeTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Confirm Discharge
          </button>
        </div>
      </div>
    </div>
  )
}

export default DischargeModal
