import React, { useState, useEffect } from 'react'
import EditableCombobox from '../common/EditableCombobox'
import { Patient } from './ReceiptForm'

// Standard options for eye prescription fields
const sphOptions = [
  '-0.25',
  '-0.50',
  '-0.75',
  '-1.00',
  '-1.25',
  '-1.50',
  '-1.75',
  '-2.00',
  '-2.25',
  '-2.50',
  '-2.75',
  '-3.00',
  '-3.25',
  '-3.50',
  '-3.75',
  '-4.00',
  '-4.25',
  '-4.50',
  '-4.75',
  '-5.00',
  '-5.25',
  '-5.50',
  '-5.75',
  '-6.00',
  '-6.25',
  '-6.50',
  '-6.75',
  '-7.00',
  '-7.25',
  '-7.50',
  '-7.75',
  '-8.00',
  '-8.25',
  '-8.50',
  '-8.75',
  '-9.00',
  '-9.25',
  '-9.50',
  '-9.75',
  '-10.00',
  'Plano',
  '+0.25',
  '+0.50',
  '+0.75',
  '+1.00',
  '+1.25',
  '+1.50',
  '+1.75',
  '+2.00',
  '+2.25',
  '+2.50',
  '+2.75',
  '+3.00',
  '+3.25',
  '+3.50',
  '+3.75',
  '+4.00',
  '+4.25',
  '+4.50',
  '+4.75',
  '+5.00',
  '+5.25',
  '+5.50',
  '+5.75',
  '+6.00',
  '+6.25',
  '+6.50',
  '+6.75',
  '+7.00',
  '+7.25',
  '+7.50',
  '+7.75',
  '+8.00',
  '+8.25',
  '+8.50',
  '+8.75',
  '+9.00',
  '+9.25',
  '+9.50',
  '+9.75',
  '+10.00'
]

const cylOptions = [
  '-0.25',
  '-0.50',
  '-0.75',
  '-1.00',
  '-1.25',
  '-1.50',
  '-1.75',
  '-2.00',
  '-2.25',
  '-2.50',
  '-2.75',
  '-3.00',
  '-3.25',
  '-3.50',
  '-3.75',
  '-4.00',
  '-4.25',
  '-4.50',
  '-4.75',
  '-5.00',
  '-5.25',
  '-5.50',
  '-5.75',
  '-6.00',
  'Plano',
  '+0.25',
  '+0.50',
  '+0.75',
  '+1.00',
  '+1.25',
  '+1.50',
  '+1.75',
  '+2.00',
  '+2.25',
  '+2.50',
  '+2.75',
  '+3.00',
  '+3.25',
  '+3.50',
  '+3.75',
  '+4.00',
  '+4.25',
  '+4.50',
  '+4.75',
  '+5.00',
  '+5.25',
  '+5.50',
  '+5.75',
  '+6.00'
]

const axisOptions = [
  '1',
  '5',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
  '60',
  '65',
  '70',
  '75',
  '80',
  '85',
  '90',
  '95',
  '100',
  '105',
  '110',
  '115',
  '120',
  '125',
  '130',
  '135',
  '140',
  '145',
  '150',
  '155',
  '160',
  '165',
  '170',
  '175',
  '180'
]

const vaOptions = [
  '6/6',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
  '5/60',
  '4/60',
  '3/60',
  '2/60',
  '1/60',
  'CFCF',
  'HM',
  'PL',
  'NPL'
]

interface ReadingFormData {
  patientId: string

  // Glasses Reading (GR)
  'GR-RE-D-SPH': string
  'GR-RE-D-CYL': string
  'GR-RE-D-AXIS': string
  'GR-RE-D-VISION': string
  'GR-RE-N-SPH': string
  'GR-RE-N-CYL': string
  'GR-RE-N-AXIS': string
  'GR-RE-N-VISION': string
  'GR-LE-D-SPH': string
  'GR-LE-D-CYL': string
  'GR-LE-D-AXIS': string
  'GR-LE-D-VISION': string
  'GR-LE-N-SPH': string
  'GR-LE-N-CYL': string
  'GR-LE-N-AXIS': string
  'GR-LE-N-VISION': string
  'ADVISED FOR': string
  // Auto Refractometer (AR)
  'AR-RE-SPH': string
  'AR-RE-CYL': string
  'AR-RE-AXIS': string
  'AR-RE-VA': string
  'AR-RE-VAC.P.H': string
  'AR-LE-SPH': string
  'AR-LE-CYL': string
  'AR-LE-AXIS': string
  'AR-LE-VA': string
  'AR-LE-VAC.P.H': string
  PD: string
  // Power Glass Prescription (PGP)
  'PGP-RE-D-SPH': string
  'PGP-RE-D-CYL': string
  'PGP-RE-D-AXIS': string
  'PGP-RE-D-VA': string
  'PGP-RE-N-SPH': string
  'PGP-RE-N-CYL': string
  'PGP-RE-N-AXIS': string
  'PGP-RE-N-VA': string
  'PGP-LE-D-SPH': string
  'PGP-LE-D-CYL': string
  'PGP-LE-D-AXIS': string
  'PGP-LE-D-BCVA': string
  'PGP-LE-N-SPH': string
  'PGP-LE-N-CYL': string
  'PGP-LE-N-AXIS': string
  'PGP-LE-N-BCVA': string
  // Subjective Refraction (SR)
  'SR-RE-D-SPH': string
  'SR-RE-D-CYL': string
  'SR-RE-D-AXIS': string
  'SR-RE-D-VA': string
  'SR-RE-N-SPH': string
  'SR-RE-N-CYL': string
  'SR-RE-N-AXIS': string
  'SR-RE-N-VA': string
  'SR-LE-D-SPH': string
  'SR-LE-D-CYL': string
  'SR-LE-D-AXIS': string
  'SR-LE-D-BCVA': string
  'SR-LE-N-SPH': string
  'SR-LE-N-CYL': string
  'SR-LE-N-AXIS': string
  'SR-LE-N-BCVA': string

  // Clinical Findings (CF)

  'CF-RE-LIDS': string
  'CF-RE-SAC': string
  'CF-RE-CONJUCTIVA': string
  'CF-RE-CORNEA': string
  'CF-RE-A.C.': string
  'CF-RE-IRIS': string
  'CF-RE-PUPIL': string
  'CF-RE-LENS': string
  'CF-RE-TENSION': string
  'CF-RE-FUNDUS': string
  'CF-RE-RETINO 1': string
  'CF-RE-RETINO 2': string
  'CF-RE-RETINO 3': string
  'CF-RE-RETINO 4': string
  'CF-LE-LIDS': string
  'CF-LE-SAC': string
  'CF-LE-CONJUCTIVA': string
  'CF-LE-CORNEA': string
  'CF-LE-A.C.': string
  'CF-LE-IRIS': string
  'CF-LE-PUPIL': string
  'CF-LE-LENS': string
  'CF-LE-TENSION': string
  'CF-LE-FUNDUS': string
  'CF-LE-RETINO 1': string
  'CF-LE-RETINO 2': string
  'CF-LE-RETINO 3': string
  'CF-LE-RETINO 4': string

  // Index signature for compatibility with Prescription type
  [key: string]: string | number | readonly string[] | undefined
}

interface ReadingFormProps {
  onSubmit: (formData: ReadingFormData) => Promise<void>
  onCancel: () => void
  // Keeping patients for API compatibility
  patients?: Patient[]
  selectedPatient: Patient | null
  initialData?: Record<string, unknown>
}

const ReadingForm: React.FC<ReadingFormProps> = ({
  onSubmit,
  onCancel,
  selectedPatient,
  initialData
}) => {
  const [formData, setFormData] = useState<ReadingFormData>({
    patientId: selectedPatient?.patientId || '',

    // Section 1: Glasses Reading (GR)
    'GR-RE-D-SPH': (initialData?.['GR-RE-D-SPH'] as string) || '',
    'GR-RE-D-CYL': (initialData?.['GR-RE-D-CYL'] as string) || '',
    'GR-RE-D-AXIS': (initialData?.['GR-RE-D-AXIS'] as string) || '',
    'GR-RE-D-VISION': (initialData?.['GR-RE-D-VISION'] as string) || '',
    'GR-RE-N-SPH': (initialData?.['GR-RE-N-SPH'] as string) || '',
    'GR-RE-N-CYL': (initialData?.['GR-RE-N-CYL'] as string) || '',
    'GR-RE-N-AXIS': (initialData?.['GR-RE-N-AXIS'] as string) || '',
    'GR-RE-N-VISION': (initialData?.['GR-RE-N-VISION'] as string) || '',
    'GR-LE-D-SPH': (initialData?.['GR-LE-D-SPH'] as string) || '',
    'GR-LE-D-CYL': (initialData?.['GR-LE-D-CYL'] as string) || '',
    'GR-LE-D-AXIS': (initialData?.['GR-LE-D-AXIS'] as string) || '',
    'GR-LE-D-VISION': (initialData?.['GR-LE-D-VISION'] as string) || '',
    'GR-LE-N-SPH': (initialData?.['GR-LE-N-SPH'] as string) || '',
    'GR-LE-N-CYL': (initialData?.['GR-LE-N-CYL'] as string) || '',
    'GR-LE-N-AXIS': (initialData?.['GR-LE-N-AXIS'] as string) || '',
    'GR-LE-N-VISION': (initialData?.['GR-LE-N-VISION'] as string) || '',
    'ADVISED FOR': (initialData?.['ADVISED FOR'] as string) || '',

    // Section 2: Auto Refractometer (AR)
    'AR-RE-SPH': (initialData?.['AR-RE-SPH'] as string) || '',
    'AR-RE-CYL': (initialData?.['AR-RE-CYL'] as string) || '',
    'AR-RE-AXIS': (initialData?.['AR-RE-AXIS'] as string) || '',
    'AR-RE-VA': (initialData?.['AR-RE-VA'] as string) || '',
    'AR-RE-VAC.P.H': (initialData?.['AR-RE-VAC.P.H'] as string) || '',
    'AR-LE-SPH': (initialData?.['AR-LE-SPH'] as string) || '',
    'AR-LE-CYL': (initialData?.['AR-LE-CYL'] as string) || '',
    'AR-LE-AXIS': (initialData?.['AR-LE-AXIS'] as string) || '',
    'AR-LE-VA': (initialData?.['AR-LE-VA'] as string) || '',
    'AR-LE-VAC.P.H': (initialData?.['AR-LE-VAC.P.H'] as string) || '',
    PD: (initialData?.['PD'] as string) || '',

    // Section 3: Power Glass Prescription (PGP)
    'PGP-RE-D-SPH': (initialData?.['PGP-RE-D-SPH'] as string) || '',
    'PGP-RE-D-CYL': (initialData?.['PGP-RE-D-CYL'] as string) || '',
    'PGP-RE-D-AXIS': (initialData?.['PGP-RE-D-AXIS'] as string) || '',
    'PGP-RE-D-VA': (initialData?.['PGP-RE-D-VA'] as string) || '',
    'PGP-RE-N-SPH': (initialData?.['PGP-RE-N-SPH'] as string) || '',
    'PGP-RE-N-CYL': (initialData?.['PGP-RE-N-CYL'] as string) || '',
    'PGP-RE-N-AXIS': (initialData?.['PGP-RE-N-AXIS'] as string) || '',
    'PGP-RE-N-VA': (initialData?.['PGP-RE-N-VA'] as string) || '',
    'PGP-LE-D-SPH': (initialData?.['PGP-LE-D-SPH'] as string) || '',
    'PGP-LE-D-CYL': (initialData?.['PGP-LE-D-CYL'] as string) || '',
    'PGP-LE-D-AXIS': (initialData?.['PGP-LE-D-AXIS'] as string) || '',
    'PGP-LE-D-BCVA': (initialData?.['PGP-LE-D-BCVA'] as string) || '',
    'PGP-LE-N-SPH': (initialData?.['PGP-LE-N-SPH'] as string) || '',
    'PGP-LE-N-CYL': (initialData?.['PGP-LE-N-CYL'] as string) || '',
    'PGP-LE-N-AXIS': (initialData?.['PGP-LE-N-AXIS'] as string) || '',
    'PGP-LE-N-BCVA': (initialData?.['PGP-LE-N-BCVA'] as string) || '',

    // Section 4: Subjective Refraction (SR)
    'SR-RE-D-SPH': (initialData?.['SR-RE-D-SPH'] as string) || '',
    'SR-RE-D-CYL': (initialData?.['SR-RE-D-CYL'] as string) || '',
    'SR-RE-D-AXIS': (initialData?.['SR-RE-D-AXIS'] as string) || '',
    'SR-RE-D-VA': (initialData?.['SR-RE-D-VA'] as string) || '',
    'SR-RE-N-SPH': (initialData?.['SR-RE-N-SPH'] as string) || '',
    'SR-RE-N-CYL': (initialData?.['SR-RE-N-CYL'] as string) || '',
    'SR-RE-N-AXIS': (initialData?.['SR-RE-N-AXIS'] as string) || '',
    'SR-RE-N-VA': (initialData?.['SR-RE-N-VA'] as string) || '',
    'SR-LE-D-SPH': (initialData?.['SR-LE-D-SPH'] as string) || '',
    'SR-LE-D-CYL': (initialData?.['SR-LE-D-CYL'] as string) || '',
    'SR-LE-D-AXIS': (initialData?.['SR-LE-D-AXIS'] as string) || '',
    'SR-LE-D-BCVA': (initialData?.['SR-LE-D-BCVA'] as string) || '',
    'SR-LE-N-SPH': (initialData?.['SR-LE-N-SPH'] as string) || '',
    'SR-LE-N-CYL': (initialData?.['SR-LE-N-CYL'] as string) || '',
    'SR-LE-N-AXIS': (initialData?.['SR-LE-N-AXIS'] as string) || '',
    'SR-LE-N-BCVA': (initialData?.['SR-LE-N-BCVA'] as string) || '',

    // Section 5: Clinical Findings (CF) - Using the exact field names from Excel
    'CF-RE-LIDS': (initialData?.['CF-RE-LIDS'] as string) || '',
    'CF-RE-SAC': (initialData?.['CF-RE-SAC'] as string) || '',
    'CF-RE-CONJUCTIVA': (initialData?.['CF-RE-CONJUCTIVA'] as string) || '',
    'CF-RE-CORNEA': (initialData?.['CF-RE-CORNEA'] as string) || '',
    'CF-RE-A.C.': (initialData?.['CF-RE-A.C.'] as string) || '',
    'CF-RE-IRIS': (initialData?.['CF-RE-IRIS'] as string) || '',
    'CF-RE-PUPIL': (initialData?.['CF-RE-PUPIL'] as string) || '',
    'CF-RE-LENS': (initialData?.['CF-RE-LENS'] as string) || '',
    'CF-RE-TENSION': (initialData?.['CF-RE-TENSION'] as string) || '',
    'CF-RE-FUNDUS': (initialData?.['CF-RE-FUNDUS'] as string) || '',
    'CF-RE-OPTICALDISK': (initialData?.['CF-RE-OPTICALDISK'] as string) || '',
    'CF-RE-MACULA': (initialData?.['CF-RE-MACULA'] as string) || '',
    'CF-RE-VESSELS': (initialData?.['CF-RE-VESSELS'] as string) || '',
    'CF-RE-PERIPHERALRETINA': (initialData?.['CF-RE-PERIPHERALRETINA'] as string) || '',
    'CF-RE-RETINO 1': (initialData?.['CF-RE-RETINO 1'] as string) || '',
    'CF-RE-RETINO 2': (initialData?.['CF-RE-RETINO 2'] as string) || '',
    'CF-RE-RETINO 3': (initialData?.['CF-RE-RETINO 3'] as string) || '',
    'CF-RE-RETINO 4': (initialData?.['CF-RE-RETINO 4'] as string) || '',
    'CF-LE-LIDS': (initialData?.['CF-LE-LIDS'] as string) || '',
    'CF-LE-SAC': (initialData?.['CF-LE-SAC'] as string) || '',
    'CF-LE-CONJUCTIVA': (initialData?.['CF-LE-CONJUCTIVA'] as string) || '',
    'CF-LE-CORNEA': (initialData?.['CF-LE-CORNEA'] as string) || '',
    'CF-LE-A.C.': (initialData?.['CF-LE-A.C.'] as string) || '',
    'CF-LE-IRIS': (initialData?.['CF-LE-IRIS'] as string) || '',
    'CF-LE-PUPIL': (initialData?.['CF-LE-PUPIL'] as string) || '',
    'CF-LE-LENS': (initialData?.['CF-LE-LENS'] as string) || '',
    'CF-LE-TENSION': (initialData?.['CF-LE-TENSION'] as string) || '',
    'CF-LE-FUNDUS': (initialData?.['CF-LE-FUNDUS'] as string) || '',
    'CF-LE-OPTICALDISK': (initialData?.['CF-LE-OPTICALDISK'] as string) || '',
    'CF-LE-MACULA': (initialData?.['CF-LE-MACULA'] as string) || '',
    'CF-LE-VESSELS': (initialData?.['CF-LE-VESSELS'] as string) || '',
    'CF-LE-PERIPHERALRETINA': (initialData?.['CF-LE-PERIPHERALRETINA'] as string) || '',
    'CF-LE-RETINO 1': (initialData?.['CF-LE-RETINO 1'] as string) || '',
    'CF-LE-RETINO 2': (initialData?.['CF-LE-RETINO 2'] as string) || '',
    'CF-LE-RETINO 3': (initialData?.['CF-LE-RETINO 3'] as string) || '',
    'CF-LE-RETINO 4': (initialData?.['CF-LE-RETINO 4'] as string) || ''
  })

  // Update form data when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData((prevData) => ({
        ...prevData,
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.name
      }))
    }
  }, [selectedPatient])

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target

    // Ensure the value is always a string to match our interface
    const stringValue = typeof value === 'string' ? value : String(value)

    setFormData((prevData) => ({
      ...prevData,
      [name]: stringValue
    }))
  }

  // Handle EditableCombobox changes
  const handleComboboxChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-medium">Eye Reading Form</h2>

      {/* Section 2: Auto Refractometer (AR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Auto Refractometer (AR)</h3>

        {/* Right Eye */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye :</h4>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <EditableCombobox
                id="AR-RE-SPH"
                name="AR-RE-SPH"
                value={formData['AR-RE-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <EditableCombobox
                id="AR-RE-CYL"
                name="AR-RE-CYL"
                value={formData['AR-RE-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <EditableCombobox
                id="AR-RE-AXIS"
                name="AR-RE-AXIS"
                value={formData['AR-RE-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <EditableCombobox
                id="AR-RE-VA"
                name="AR-RE-VA"
                value={formData['AR-RE-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VAC.P.H</label>
              <input
                type="text"
                name="AR-RE-VAC.P.H"
                value={formData['AR-RE-VAC.P.H']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Left Eye :</h4>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <EditableCombobox
                id="AR-LE-SPH"
                name="AR-LE-SPH"
                value={formData['AR-LE-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="AR-LE-CYL"
                name="AR-LE-CYL"
                value={formData['AR-LE-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="AR-LE-AXIS"
                name="AR-LE-AXIS"
                value={formData['AR-LE-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="AR-LE-VA"
                name="AR-LE-VA"
                value={formData['AR-LE-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="text"
                name="AR-LE-VAC.P.H"
                value={formData['AR-LE-VAC.P.H']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="w-1/2">
          <label className="block text-xs font-medium text-gray-700">PD</label>
          <input
            type="text"
            name="PD"
            value={formData['PD']}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {/* Section 1: Glasses Reading (GR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Glasses Reading (GR)</h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance:</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <EditableCombobox
                id="GR-RE-D-SPH"
                name="GR-RE-D-SPH"
                value={formData['GR-RE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <EditableCombobox
                id="GR-RE-D-CYL"
                name="GR-RE-D-CYL"
                value={formData['GR-RE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <EditableCombobox
                id="GR-RE-D-AXIS"
                name="GR-RE-D-AXIS"
                value={formData['GR-RE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VISION</label>
              <EditableCombobox
                id="GR-RE-D-VISION"
                name="GR-RE-D-VISION"
                value={formData['GR-RE-D-VISION']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="GR-RE-N-SPH"
                name="GR-RE-N-SPH"
                value={formData['GR-RE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-RE-N-CYL"
                name="GR-RE-N-CYL"
                value={formData['GR-RE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-RE-N-AXIS"
                name="GR-RE-N-AXIS"
                value={formData['GR-RE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-RE-N-VISION"
                name="GR-RE-N-VISION"
                value={formData['GR-RE-N-VISION']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="GR-LE-D-SPH"
                name="GR-LE-D-SPH"
                value={formData['GR-LE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-D-CYL"
                name="GR-LE-D-CYL"
                value={formData['GR-LE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-D-AXIS"
                name="GR-LE-D-AXIS"
                value={formData['GR-LE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-D-VISION"
                name="GR-LE-D-VISION"
                value={formData['GR-LE-D-VISION']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="GR-LE-N-SPH"
                name="GR-LE-N-SPH"
                value={formData['GR-LE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-N-CYL"
                name="GR-LE-N-CYL"
                value={formData['GR-LE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-N-AXIS"
                name="GR-LE-N-AXIS"
                value={formData['GR-LE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="GR-LE-N-VISION"
                name="GR-LE-N-VISION"
                value={formData['GR-LE-N-VISION']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Power Glass Prescription (PGP) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">
          Previous Glass Prescription (PGP)
        </h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <EditableCombobox
                id="PGP-RE-D-SPH"
                name="PGP-RE-D-SPH"
                value={formData['PGP-RE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <EditableCombobox
                id="PGP-RE-D-CYL"
                name="PGP-RE-D-CYL"
                value={formData['PGP-RE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <EditableCombobox
                id="PGP-RE-D-AXIS"
                name="PGP-RE-D-AXIS"
                value={formData['PGP-RE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <EditableCombobox
                id="PGP-RE-D-VA"
                name="PGP-RE-D-VA"
                value={formData['PGP-RE-D-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="PGP-RE-N-SPH"
                name="PGP-RE-N-SPH"
                value={formData['PGP-RE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-RE-N-CYL"
                name="PGP-RE-N-CYL"
                value={formData['PGP-RE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-RE-N-AXIS"
                name="PGP-RE-N-AXIS"
                value={formData['PGP-RE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-RE-N-VA"
                name="PGP-RE-N-VA"
                value={formData['PGP-RE-N-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="PGP-LE-D-SPH"
                name="PGP-LE-D-SPH"
                value={formData['PGP-LE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-D-CYL"
                name="PGP-LE-D-CYL"
                value={formData['PGP-LE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-D-AXIS"
                name="PGP-LE-D-AXIS"
                value={formData['PGP-LE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-D-BCVA"
                name="PGP-LE-D-BCVA"
                value={formData['PGP-LE-D-BCVA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="PGP-LE-N-SPH"
                name="PGP-LE-N-SPH"
                value={formData['PGP-LE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-N-CYL"
                name="PGP-LE-N-CYL"
                value={formData['PGP-LE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-N-AXIS"
                name="PGP-LE-N-AXIS"
                value={formData['PGP-LE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="PGP-LE-N-BCVA"
                name="PGP-LE-N-BCVA"
                value={formData['PGP-LE-N-BCVA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Subjective Refraction (SR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Subjective Refraction</h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <EditableCombobox
                id="SR-RE-D-SPH"
                name="SR-RE-D-SPH"
                value={formData['SR-RE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <EditableCombobox
                id="SR-RE-D-CYL"
                name="SR-RE-D-CYL"
                value={formData['SR-RE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <EditableCombobox
                id="SR-RE-D-AXIS"
                name="SR-RE-D-AXIS"
                value={formData['SR-RE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <EditableCombobox
                id="SR-RE-D-VA"
                name="SR-RE-D-VA"
                value={formData['SR-RE-D-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="SR-RE-N-SPH"
                name="SR-RE-N-SPH"
                value={formData['SR-RE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-RE-N-CYL"
                name="SR-RE-N-CYL"
                value={formData['SR-RE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-RE-N-AXIS"
                name="SR-RE-N-AXIS"
                value={formData['SR-RE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-RE-N-VA"
                name="SR-RE-N-VA"
                value={formData['SR-RE-N-VA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="SR-LE-D-SPH"
                name="SR-LE-D-SPH"
                value={formData['SR-LE-D-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-D-CYL"
                name="SR-LE-D-CYL"
                value={formData['SR-LE-D-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-D-AXIS"
                name="SR-LE-D-AXIS"
                value={formData['SR-LE-D-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-D-BCVA"
                name="SR-LE-D-BCVA"
                value={formData['SR-LE-D-BCVA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Near :</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <EditableCombobox
                id="SR-LE-N-SPH"
                name="SR-LE-N-SPH"
                value={formData['SR-LE-N-SPH']}
                options={sphOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-N-CYL"
                name="SR-LE-N-CYL"
                value={formData['SR-LE-N-CYL']}
                options={cylOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-N-AXIS"
                name="SR-LE-N-AXIS"
                value={formData['SR-LE-N-AXIS']}
                options={axisOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <EditableCombobox
                id="SR-LE-N-BCVA"
                name="SR-LE-N-BCVA"
                value={formData['SR-LE-N-BCVA']}
                options={vaOptions}
                onChange={handleComboboxChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Clinical Findings (CF) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Clinical Findings (CF)</h3>

        {/* Right Eye Clinical Findings */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Lid</label>
              <input
                type="text"
                name="CF-RE-LIDS"
                value={formData['CF-RE-LIDS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">SAC</label>
              <input
                type="text"
                name="CF-RE-SAC"
                value={formData['CF-RE-SAC']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Cornea</label>
              <input
                type="text"
                name="CF-RE-CORNEA"
                value={formData['CF-RE-CORNEA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
              <input
                type="text"
                name="CF-RE-CONJUCTIVA"
                value={formData['CF-RE-CONJUCTIVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
              <input
                type="text"
                name="CF-RE-A.C."
                value={formData['CF-RE-A.C.']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Iris</label>
              <input
                type="text"
                name="CF-RE-IRIS"
                value={formData['CF-RE-IRIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pupil</label>
              <input
                type="text"
                name="CF-RE-PUPIL"
                value={formData['CF-RE-PUPIL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Lens</label>
              <input
                type="text"
                name="CF-RE-LENS"
                value={formData['CF-RE-LENS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="hidden">
              <label className="block text-xs font-medium text-gray-700">Tension</label>
              <input
                type="text"
                name="CF-RE-TENSION"
                value={formData['CF-RE-TENSION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Fundus</label>
              <input
                type="text"
                name="CF-RE-FUNDUS"
                value={formData['CF-RE-FUNDUS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Optical Disk</label>
              <input
                type="text"
                name="CF-RE-OPTICALDISK"
                value={formData['CF-RE-OPTICALDISK']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Macula</label>
              <input
                type="text"
                name="CF-RE-MACULA"
                value={formData['CF-RE-MACULA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Vessels</label>
              <input
                type="text"
                name="CF-RE-VESSELS"
                value={formData['CF-RE-VESSELS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Peripheral Retina</label>
              <input
                type="text"
                name="CF-RE-PERIPHERALRETINA"
                value={formData['CF-RE-PERIPHERALRETINA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 1</label>
              <input
                type="text"
                name="CF-RE-RETINO 1"
                value={formData['CF-RE-RETINO 1']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 2</label>
              <input
                type="text"
                name="CF-RE-RETINO 2"
                value={formData['CF-RE-RETINO 2']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 3</label>
              <input
                type="text"
                name="CF-RE-RETINO 3"
                value={formData['CF-RE-RETINO 3']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 4</label>
              <input
                type="text"
                name="CF-RE-RETINO 4"
                value={formData['CF-RE-RETINO 4']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye Clinical Findings */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Lids</label>
              <input
                type="text"
                name="CF-LE-LIDS"
                value={formData['CF-LE-LIDS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">SAC</label>
              <input
                type="text"
                name="CF-LE-SAC"
                value={formData['CF-LE-SAC']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Cornea</label>
              <input
                type="text"
                name="CF-LE-CORNEA"
                value={formData['CF-LE-CORNEA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
              <input
                type="text"
                name="CF-LE-CONJUCTIVA"
                value={formData['CF-LE-CONJUCTIVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
              <input
                type="text"
                name="CF-LE-A.C."
                value={formData['CF-LE-A.C.']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Iris</label>
              <input
                type="text"
                name="CF-LE-IRIS"
                value={formData['CF-LE-IRIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pupil</label>
              <input
                type="text"
                name="CF-LE-PUPIL"
                value={formData['CF-LE-PUPIL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Lens</label>
              <input
                type="text"
                name="CF-LE-LENS"
                value={formData['CF-LE-LENS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="hidden">
              <label className="block text-xs font-medium text-gray-700">Tension</label>
              <input
                type="text"
                name="CF-LE-TENSION"
                value={formData['CF-LE-TENSION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Fundus</label>
              <input
                type="text"
                name="CF-LE-FUNDUS"
                value={formData['CF-LE-FUNDUS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Optical Disk</label>
              <input
                type="text"
                name="CF-LE-OPTICALDISK"
                value={formData['CF-LE-OPTICALDISK']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Macula</label>
              <input
                type="text"
                name="CF-LE-MACULA"
                value={formData['CF-LE-MACULA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Vessels</label>
              <input
                type="text"
                name="CF-LE-VESSELS"
                value={formData['CF-LE-VESSELS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Peripheral Retina</label>
              <input
                type="text"
                name="CF-LE-PERIPHERALRETINA"
                value={formData['CF-LE-PERIPHERALRETINA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 1 </label>
              <input
                type="text"
                name="CF-LE-RETINO 1"
                value={formData['CF-LE-RETINO 1']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 2</label>
              <input
                type="text"
                name="CF-LE-RETINO 2"
                value={formData['CF-LE-RETINO 2']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 3</label>
              <input
                type="text"
                name="CF-LE-RETINO 3"
                value={formData['CF-LE-RETINO 3']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 4</label>
              <input
                type="text"
                name="CF-LE-RETINO 4"
                value={formData['CF-LE-RETINO 4']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default ReadingForm
