'use client'

import React from 'react'
import eyeimage from '../../assets/eye_image.jpg'
import nabhimage from '../../assets/nabh_accredited.jpg'
interface BillingItem {
  particulars: string
  amount: number
  days?: number
}

interface PatientData {
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
  department: string
  dateOfAdmit?: string
  dateOfDischarge?: string
  dateOfOperation?: string
}

interface BillingData {
  totalAmount: number
  advancePaid: number
  discountPercent: number
  discountAmount: number
  amountReceived: number
  balance: number
}

interface BillingReceiptProps {
  patientData: PatientData
  diagnosis?: string
  operationProcedure?: string
  billNumber?: string
  operationDetails?: string
  billingItems?: BillingItem[]
  billingData?: BillingData
  authorizedSignatory?: string
}

export default function BillingReceipt({
  patientData,
  diagnosis = '',
  operationProcedure = '',
  billNumber = '',
  operationDetails = '',
  billingItems = [],
  billingData,
  authorizedSignatory = ''
}: BillingReceiptProps): React.ReactElement {
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-4 border-b-2 border-[#000000]">
          <div className="flex justify-end">
            <p className="text-[10px] font-semibold mb-2">Ph: 08782955955, Cell: 9885029367</p>
          </div>
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="" />
            </div>
            <div className="text-center flex-1 mx-2">
              <h1 className="text-lg font-bold leading-tight">SRI HARSHA EYE HOSPITAL</h1>
              <p className="text-[10px] leading-tight mt-0.5">
                Near Mancherial Chowrasta, Ambedkarnagar, Choppadandi Road, KARIMNAGAR-505001
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="" />
            </div>
          </div>

          {/* Doctor Information Row */}
          <div className="flex justify-between items-start text-[9px] leading-[1.2] mb-2">
            {/* Left Doctor */}
            <div className="w-[30%] pr-1">
              <p className="font-bold text-sm">డా. శ్రీలత</p>
              <p>M.B.B.S., M.S.(Ophth)</p>
              <p>FICLEP (LVPEI), FICO (UK),</p>
              <p>Obs. Paediatric Ophthalmology</p>
              <p>& Squint (AEH, Madurai)</p>
              <p>Ex. Asst. Professor in CAIMS, MIMS (Hyd)</p>
              <p>Ex. Civil Assistant Surgeon, Karimnagar</p>
              <p>Phaco Surgeon</p>
              <p className="mt-0.5">Regd. No. 46756</p>
            </div>

            {/* Center NABH */}
            <div className="w-[20%] flex justify-center">
              <div className="w-24 h-24  flex items-center justify-center bg-[#ffffff]">
                <img src={nabhimage} alt="" />
              </div>
            </div>

            {/* Right Doctor */}
            <div className="w-[30%] pl-1 text-right">
              <p className="font-bold text-sm">Dr. CH. SRILATHA</p>
              <p>M.B.B.S., M.S.(Ophth)</p>
              <p>FICLEP (LVPEI), FICO (UK),</p>
              <p>Obs. Paediatric Ophthalmology</p>
              <p>& Squint (AEH, Madurai)</p>
              <p>Ex. Asst. Professor in CAIMS, MIMS (Hyd)</p>
              <p>Ex. Civil Assistant Surgeon, Karimnagar</p>
              <p>Phaco Surgeon</p>
              <p className="mt-0.5">Regd. No. 46756</p>
            </div>
          </div>

          {/* Timing Only */}
          <div className="text-center text-[9px] mt-1">
            <p className="font-semibold">Daily Timings: 9:00 am to 2:30 pm & 5:30 pm to 7:30 pm</p>
          </div>
        </div>

        <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">BILLING RECEIPT</h2>

        {/* Patient Information Section */}
        <div className="pb-3 mb-4 border-b border-[#000000]">
          <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
          {/* grid-based layout */}
          <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <div>
              <div className="font-bold">BILL NO</div>
              <div>{billNumber}</div>
            </div>
            {/* Patient ID */}
            <div>
              <div className="font-bold">PATIENT ID</div>
              <div>{patientData.patientId}</div>
            </div>
            {/* Date */}
            <div>
              <div className="font-bold">DATE</div>
              <div>{patientData.date}</div>
            </div>
            {/* Patient Name */}
            <div>
              <div className="font-bold">PATIENT NAME</div>
              <div>{patientData.patientName}</div>
            </div>
            {/* Gender */}
            <div>
              <div className="font-bold">GENDER</div>
              <div>{patientData.gender}</div>
            </div>
            {/* Guardian Name */}
            <div>
              <div className="font-bold">GUARDIAN NAME</div>
              <div>{patientData.guardianName || ''}</div>
            </div>
            {/* Age */}
            <div>
              <div className="font-bold">AGE</div>
              <div>{patientData.age}</div>
            </div>
            {/* Address */}
            <div>
              <div className="font-bold">ADDRESS</div>
              <div>{patientData.address}</div>
            </div>
            {/* Mobile */}
            <div>
              <div className="font-bold">MOBILE</div>
              <div>{patientData.mobile}</div>
            </div>
            {/* Doctor Name */}
            <div>
              <div className="font-bold">DOCTOR NAME</div>
              <div>{patientData.doctorName}</div>
            </div>
            {/* Department */}
            <div>
              <div className="font-bold">DEPT.</div>
              <div>{patientData.department}</div>
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="pb-3 mb-4 border-b border-[#000000]">
          <h3 className="text-xs font-bold mb-3">MEDICAL INFORMATION</h3>
          {/* grid-based layout */}
          <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {/* Patient ID */}
            <div>
              <div className="font-bold">DATE OF ADMISSION</div>
              <div>{patientData.dateOfAdmit}</div>
            </div>
            {/* Date */}
            <div>
              <div className="font-bold">DATE OF DISCHARGE</div>
              <div>{patientData.dateOfDischarge}</div>
            </div>
            {/* Patient Name */}
            <div>
              <div className="font-bold">DATE OF OPERATION</div>
              <div>{patientData.dateOfOperation}</div>
            </div>
            {/* Gender */}
            <div>
              <div className="font-bold">DIAGNOSIS</div>
              <div>{diagnosis}</div>
            </div>
            {/* Guardian Name */}
            <div>
              <div className="font-bold">OPERATION PROCEDURE</div>
              <div>{operationProcedure}</div>
            </div>
            {/* Age */}
            <div>
              <div className="font-bold">OPERATION DETAILS</div>
              <div>{operationDetails}</div>
            </div>
          </div>
        </div>
        {/* Billing Table Section */}
        <div className="pb-3 mb-4">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                  PARTICULARS
                </th>
                <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-32">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Billing Items */}
              {billingItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">
                    {item.particulars}
                    {item.days && item.days > 0 && (
                      <span className="ml-1">
                        ({item.days} {item.days === 1 ? 'day' : 'days'})
                      </span>
                    )}
                  </td>
                  <td className="border border-black p-2 text-right">
                    {item.amount > 0 ? item.amount.toFixed(2) : ''}
                  </td>
                </tr>
              ))}

              {/* Empty rows for additional items */}
              {Array.from({ length: Math.max(0, 4 - billingItems.length) }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-[#000000] p-2 h-8"></td>
                  <td className="border border-[#000000] p-2 h-8"></td>
                </tr>
              ))}

              {/* Financial Summary */}
              {billingData && (
                <>
                  <tr>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      TOTAL AMOUNT
                    </td>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      {billingData.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      ADVANCE PAID
                    </td>
                    <td className="border border-[#000000] p-2 text-right">
                      {billingData.advancePaid.toFixed(2)}
                    </td>
                  </tr>
                  {billingData.discountPercent > 0 && (
                    <tr>
                      <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                        DISCOUNT %
                      </td>
                      <td className="border border-[#000000] p-2 text-right">
                        {billingData.discountPercent}
                      </td>
                    </tr>
                  )}
                  {billingData.discountAmount > 0 && (
                    <tr>
                      <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                        DISCOUNT AMOUNT
                      </td>
                      <td className="border border-[#000000] p-2 text-right">
                        {billingData.discountAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      AMT. RECEIVED
                    </td>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      {billingData.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      BALANCE
                    </td>
                    <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                      {billingData.balance.toFixed(2)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Fixed Footer */}
      <div className="receipt-footer">
        <div className="pt-3">
          {/* Hospital Authorization */}
          <div className="flex justify-between items-center ">
            <div className="text-left text-[11px]"></div>

            <div className="text-right text-[11px] space-y-1">
              <p className="font-bold">AUTHORISED SIGNATORY</p>
              <p className="font-bold">{authorizedSignatory || 'For SRI HARSHA EYE HOSPITAL'}</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="border-t border-[#000000] pt-1 text-center mt-2 text-[9px] text-[#000000]">
            <p className="mt-1 text-sm font-semibold text-center">
              Arogya Sri and Insurance facilities available
            </p>
            <div className="flex justify-between items-center">
              <span>
                This is a computer generated receipt. Please preserve this for your records.
              </span>
              <span>
                Generated on:{' '}
                {new Date().toLocaleDateString('en-GB', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}{' '}
                {new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-container {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          font-family: 'Arial', sans-serif;
          line-height: 1.2;
          display: flex;
          flex-direction: column;
        }

        .receipt-content {
          flex: 1;
        }

        .receipt-footer {
          margin-top: auto;
          padding-top: 20px;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .receipt-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 8mm;
            box-shadow: none;
            page-break-after: avoid;
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
