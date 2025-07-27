/* eslint-disable prettier/prettier */
'use client'

import type React from 'react'

interface BusinessInfo {
  name: string
  address: string
  dlNo: string
  gstin: string
  phone1: string
  phone2: string
}

interface PatientInfo {
  billNumber: string
  patientId: string
  date: string
  patientName: string
  gender: string
  guardianName?: string
  age: string
  address: string
  mobile: string
  doctorName: string
  dept: string
}

interface MedicalItem {
  particulars: string
  qty: number
  batchNumber?: string
  expiryDate?: string
  rate: number
  amount: number
}

interface Totals {
  totalAmount: number
  advancePaid: number
  amtReceived: number
  discount: number
  balance: number
}

interface ReceiptData {
  businessInfo: BusinessInfo
  patientInfo: PatientInfo
  items: MedicalItem[]
  totals: Totals
}

interface MedicalReceiptProps {
  data: ReceiptData
}

const MedicalReceipt: React.FC<MedicalReceiptProps> = ({ data }) => {
  const { businessInfo, patientInfo, items, totals } = data

  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-[#ffffff] border-2 border-[#000000] print:border-0 print:shadow-none shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-left">
          <div className="text-xs">
            <div>D.L. No: {businessInfo.dlNo}</div>
            <div>GSTIN: {businessInfo.gstin}</div>
          </div>
        </div>
        <div className="text-[#000000] px-3 py-1 rounded">
          <span className="font-bold text-sm">CASH BILL</span>
        </div>
        <div className="text-right text-xs">
          <div>Cell: {businessInfo.phone1}</div>
          <div>{businessInfo.phone2}</div>
        </div>
      </div>

      {/* Business Name */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold tracking-wider">{businessInfo.name}</h1>
        <p className="text-sm font-bold">WHOLESALE & RETAIL</p>
      </div>

      {/* Address */}
      <div className="text-center text-sm mb-4">
        <p>{businessInfo.address}</p>
      </div>

      {/* Bill Details */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span>No.</span>
          <span className="text-[#E53935] font-bold text-xl">{patientInfo.billNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mb-2">Date</span>
          <div className="border-b border-[#000000] w-32 h-6 flex items-end">
            <span className="text-sm py-2">{patientInfo.date}</span>
          </div>
        </div>
      </div>

      {/* Patient Information Section */}
      <div className="mb-4 p-3 border border-[#000000]">
        <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
        <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          <div>
            <div className="font-bold">BILL NO.</div>
            <div>{patientInfo.billNumber}</div>
          </div>
          <div>
            <div className="font-bold">PATIENT ID</div>
            <div>{patientInfo.patientId}</div>
          </div>
          <div>
            <div className="font-bold">DATE</div>
            <div>{patientInfo.date}</div>
          </div>
          <div>
            <div className="font-bold">PATIENT NAME</div>
            <div>{patientInfo.patientName}</div>
          </div>
          <div>
            <div className="font-bold">GENDER</div>
            <div>{patientInfo.gender}</div>
          </div>
          <div>
            <div className="font-bold">GUARDIAN NAME</div>
            <div>{patientInfo.guardianName || ''}</div>
          </div>
          <div>
            <div className="font-bold">AGE</div>
            <div>{patientInfo.age}</div>
          </div>
          <div>
            <div className="font-bold">ADDRESS</div>
            <div>{patientInfo.address}</div>
          </div>
          <div>
            <div className="font-bold">MOBILE</div>
            <div>{patientInfo.mobile}</div>
          </div>
          <div>
            <div className="font-bold">DOCTOR NAME</div>
            <div>{patientInfo.doctorName}</div>
          </div>
          <div>
            <div className="font-bold">DEPT.</div>
            <div>{patientInfo.dept}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-[#000000] h-[300px] flex flex-col">
        {/* Table Header */}
        <div className="border-b-2 border-[#000000] flex">
          <div className="w-12 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            Sl.
            <br />
            No.
          </div>
          <div className="flex-1 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            PARTICULARS
          </div>
          <div className="w-16 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            Qty
          </div>
          <div className="w-20 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            Batch
            <br />
            No.
          </div>
          <div className="w-20 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            Date of
            <br />
            Expiry
          </div>
          <div className="w-16 border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            Rate
          </div>
          <div className="w-24 p-2 text-center font-bold text-xs">AMOUNT</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 flex">
          <div className="w-12 border-r-2 border-[#000000]">
            {items.map((_, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-xs border-b border-[#000000]">
                {item.particulars}
              </div>
            ))}
          </div>
          <div className="w-16 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {item.qty}
              </div>
            ))}
          </div>
          <div className="w-20 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {item.batchNumber || '-'}
              </div>
            ))}
          </div>
          <div className="w-20 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {item.expiryDate || '-'}
              </div>
            ))}
          </div>
          <div className="w-16 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {item.rate.toFixed(2)}
              </div>
            ))}
          </div>
          <div className="w-24">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#000000]">
                {item.amount.toFixed(2)}
              </div>
            ))}
          </div>
        </div>

        {/* Total Row */}
        <div className="border-t-2 border-[#000000] flex">
          <div className="flex-1"></div>
          <div className="w-16 border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
            Total
          </div>
          <div className="w-24 border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
            {totals.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-sm">
          <span>Goods once Sold Can not be taken back</span>
          <div className="mt-2">
            <span className="text-xs">E & O.E</span>
          </div>
        </div>
        <div className="text-right">
          <div className="border-b border-[#000000] w-32 h-8 flex items-end justify-center">
            <span className="text-sm italic py-2">Signature</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default MedicalReceipt
