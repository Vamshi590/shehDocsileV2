/* eslint-disable prettier/prettier */
'use client'
import React from 'react'

interface VennelaLabReceiptProps {
  billNumber?: string
  date?: string
  patientName?: string
  doctorName?: string
  labData?: Record<string, unknown>
  discountPercentage?: number
  amountReceived?: number
  amountDue?: number
  totalAmount?: number
}

export default function VennelaLabReceipt({
  billNumber = '',
  date = '',
  patientName = '',
  doctorName = '',
  labData = {},
  discountPercentage = 0,
  amountReceived = 0,
  amountDue = 0,
  totalAmount = 0
}: VennelaLabReceiptProps): React.ReactNode {
  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-[#ffffff] border-2 border-[#000000] print:border-0 print:shadow-none shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-left">
          <span className="font-bold text-sm"></span>
        </div>
        <div className="text-[#000000] px-3 py-1 rounded">
        </div>
        <div className="text-right">
          <span className="font-bold">Cell: 9885029367</span>
        </div>
      </div>

      {/* Business Name */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold tracking-wider">VENNELA OCULAR DIAGNOSTICS</h1>
      </div>

      {/* Address */}
      <div className="text-center text-sm mb-4">
        <p>Hno: 6-6-652, 1st Floor, Beside Olga Hospital, Opp: Jayasri Neuro Hospital.</p>
        <p>Subhashnagar Road, KARIMNAGAR-505001.</p>
      </div>
      <div className="text-center text-sm mb-8">
        <p className="font-bold mt-1">LAB RECEIPT</p>
      </div>

      {/* Bill Details */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span>Bill No.</span>
          <span className="text-[#E53935] font-bold text-xl">{billNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="pb-2">Date</span>
          <div className="border-b border-[#000000] w-32 h-6 flex items-end py-2">
            <span className="text-md">{date}</span>
          </div>
        </div>
      </div>

      {/* Patient Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="pb-2 w-24">Patient Name</span>
          <div className="border-b border-[#000000] py-2 flex-1 h-6 flex items-end">
            <span className="text-md">{patientName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="pb-2 w-24">Doctor</span>
          <div className="border-b border-[#000000] py-2 flex-1 h-6 flex items-end">
            <span className="text-md">{doctorName}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-[#000000] flex flex-col">
        {/* Table Header */}
        <div className="border-b-2 border-[#000000] flex">
          <div className="w-16 border-r-2 border-[#000000] p-2 text-center font-bold">
            Sl.
            <br />
            No.
          </div>
          <div className="flex-1 border-r-2 border-[#000000] p-2 text-center font-bold">
            PARTICULARS
          </div>
          <div className="w-32 p-2 text-center font-bold">
            AMOUNT
            <br />
            <div className="flex">
              <span className="flex-1 border-r border-[#000000]">Rs.</span>
              <span className="flex-1">Ps.</span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 flex">
          <div className="w-16 border-r-2 border-[#000000]">
            {Array.from({ length: 10 }).map((_, index) => {
              const testKey = `VLAB TEST ${index + 1}`
              
              if (!labData[testKey]) return null
              
              return (
                <div key={index} className="p-2 text-center text-sm border-b border-[#dee2e6]">
                  {index + 1}
                </div>
              )
            })}
          </div>
          <div className="flex-1 border-r-2 border-[#000000]">
            {Array.from({ length: 10 }).map((_, index) => {
              const testKey = `VLAB TEST ${index + 1}`
              
              if (!labData[testKey]) return null
              
              return (
                <div key={index} className="p-2 text-sm border-b border-[#dee2e6]">
                  {labData[testKey] as string}
                </div>
              )
            })}
          </div>
          <div className="w-32">
            {Array.from({ length: 10 }).map((_, index) => {
              const amountKey = `VAMOUNT ${index + 1}`
              const amount = Number(labData[amountKey] || 0)
              
              if (!labData[`VLAB TEST ${index + 1}`]) return null
              
              return (
                <div key={index} className="p-2 flex border-b border-[#dee2e6]">
                  <div className="flex-1 border-r border-[#000000] text-center text-sm">
                    {Math.floor(amount)}
                  </div>
                  <div className="flex-1 text-center text-sm">
                    {Math.round((amount % 1) * 100)
                      .toString()
                      .padStart(2, '0')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Billing Summary */}
        <div className="border-t-2 border-[#000000]">
          <div className="flex border-b border-[#dee2e6]">
            <div className="flex-1 p-2 text-right font-medium">Total Amount:</div>
            <div className="w-32 p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center">
                {Math.floor(totalAmount)}
              </div>
              <div className="flex-1 text-center">
                {Math.round((totalAmount % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="flex border-b border-[#dee2e6]">
            <div className="flex-1 p-2 text-right font-medium">Discount ({discountPercentage}%):</div>
            <div className="w-32 p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center">
                {Math.floor(totalAmount * discountPercentage / 100)}
              </div>
              <div className="flex-1 text-center">
                {Math.round(((totalAmount * discountPercentage / 100) % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="flex border-b border-[#dee2e6]">
            <div className="flex-1 p-2 text-right font-medium">Amount Received:</div>
            <div className="w-32 p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center">
                {Math.floor(amountReceived)}
              </div>
              <div className="flex-1 text-center">
                {Math.round((amountReceived % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-1 p-2 text-right font-bold">Amount Due:</div>
            <div className="w-32 p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold">
                {Math.floor(amountDue)}
              </div>
              <div className="flex-1 text-center font-bold">
                {Math.round((amountDue % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-sm flex flex-col">
          <span>Thank you for choosing our services</span>
          <span>Amount paid not refundable / transferable</span>
          <span>Subject to karimnagar jurisdiction</span>
        </div>
        <div className="text-right">
          <div className="border-b border-[#000000] w-32 h-8 flex items-end py-2 justify-center">
            <span className="text-sm italic">Authorized Signature</span>
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
