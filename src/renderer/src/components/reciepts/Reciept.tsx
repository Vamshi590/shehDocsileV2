'use client'

import React from 'react'
import nabhimage from '../../assets/nabh_accredited.jpg'
import eyeimage from '../../assets/eye_image.jpg'
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
  receiptNo: string
  referredBy: string
}

interface PaymentData {
  paidFor: string
  mode: string
  totalAmount: number
  advancePaid: number
  discountPercent: number
  discountAmount: number
  amountReceived: number
  amountDue: number
}

interface CashReceiptProps {
  patientData: PatientData
  paymentData: PaymentData
  authorizedSignatory?: string
}

export default function CashReceipt({
  patientData,
  paymentData,
  authorizedSignatory = ''
}: CashReceiptProps): React.ReactElement {
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-2 border-b-2 border-[#000000]">
          <div className="flex justify-end">
            <p className="text-[10px] font-semibold">Ph: 08782955955, Cell: 9885029367</p>
          </div>
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" />
            </div>
            <div className="text-center flex-1 mx-2">
              <h1 className="text-lg font-bold leading-tight">SRI HARSHA EYE HOSPITAL</h1>
              <p className="text-[10px] leading-tight mt-0.5">
                Near Mancherial Chowrasta, Ambedkarnagar, Choppadandi Road, KARIMNAGAR-505001
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" />
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
              <div className="w-24 h-24 flex items-center justify-center bg-[#ffffff]">
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
        <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">CASH RECEIPT</h2>

        {/* Patient Information Section */}
        <div className="pb-3 mb-4 border-b border-[#000000]">
          <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
          {/* grid-based layout */}
          <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {/* Patient Name */}
            <div>
              <div className="font-bold">PATIENT NAME</div>
              <div className="font-semibold text-[13px]">{patientData.patientName}</div>
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
            {/* Mobile */}
            <div>
              <div className="font-bold">MOBILE</div>
              <div>{patientData.mobile}</div>
            </div>
            {/* Gender */}
            <div>
              <div className="font-bold">GENDER</div>
              <div>{patientData.gender}</div>
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
            {/* Sno */}
            <div>
              <div className="font-bold">REFERRED BY</div>
              <div>{patientData.referredBy || ''}</div>
            </div>
            <div>
              <div className="font-bold">RECEIPT NO</div>
              <div>{patientData.receiptNo}</div>
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
            <div>
              <div className="font-bold">PAID FOR</div>
              <div>{paymentData.paidFor}</div>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="pb-3 mb-4">
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">MODE</td>
                <td className="border border-[#000000] p-2 text-right font-bold">
                  {paymentData.mode}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">TOTAL AMOUNT</td>
                <td className="border border-[#000000] p-2 text-right font-bold">
                  {paymentData.totalAmount}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">ADVANCE PAID</td>
                <td className="border border-[#000000] p-2 text-right font-bold">
                  {paymentData.advancePaid}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">DISCOUNT %</td>
                <td className="border border-[#000000] p-2 text-right font-bold ">
                  {paymentData.discountPercent}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">
                  DISCOUNT AMOUNT
                </td>
                <td className="border border-[#000000] p-2 text-right font-bold">
                  {paymentData.discountAmount}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">
                  AMOUNT RECEIVED
                </td>
                <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                  {paymentData.amountReceived}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-2 font-bold bg-[#ffffff]">AMOUNT DUE</td>
                <td className="border border-[#000000] p-2 text-right font-bold bg-[#ffffff]">
                  {paymentData.amountDue}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Empty space for additional content */}
        <div className="pb-3 mb-16">
          <div className="h-32"></div>
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
              <p className="font-bold">{authorizedSignatory || 'SRI HARSHA EYE HOSPITAL'}</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="border-t border-[#000000] pt-1 text-center text-[9px] text-[#000000] mt-2">
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
