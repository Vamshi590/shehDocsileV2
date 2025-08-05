'use client'

import React, { useEffect, useState } from 'react'
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
  referredBy?: string
}

interface BillingData {
  totalAmount: number
  advancePaid: number
  discountPercent: number
  discountAmount: number
  amountReceived: number
  balance: number
}

interface InPatientCashReceiptProps {
  patientData: PatientData
  diagnosis?: string
  operationProcedure?: string
  billNumber?: string
  operationDetails?: string
  billingItems?: BillingItem[]
  billingData?: BillingData
  authorizedSignatory?: string
}

export default function InPatientCashReceipt({
  patientData,
  billingItems = [],
  billingData,
  authorizedSignatory = ''
}: InPatientCashReceiptProps): React.ReactElement {
  // State to track pagination
  const [pages, setPages] = useState<BillingItem[][]>([])
  const [currentPage, setCurrentPage] = useState(0)
  // Maximum number of items per page
  const [ITEMS_PER_PAGE] = useState(billingItems.length)

  // Effect to handle pagination of billing items
  useEffect(() => {
    if (!billingItems || billingItems.length === 0) {
      setPages([[]])
      return
    }

    // Calculate how many pages we need
    const pageCount = Math.ceil(billingItems.length / ITEMS_PER_PAGE)
    const paginatedItems: BillingItem[][] = []

    // Split items into pages
    for (let i = 0; i < pageCount; i++) {
      const startIndex = i * ITEMS_PER_PAGE
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, billingItems.length)
      paginatedItems.push(billingItems.slice(startIndex, endIndex))
    }

    setPages(paginatedItems)
  }, [billingItems])

  // Function to render a single receipt page
  const renderReceiptPage = (
    pageItems: BillingItem[],
    pageIndex: number,
    isLastPage: boolean
  ): React.ReactElement => {
    return (
      <div
        key={`page-${pageIndex}`}
        className={`receipt-container bg-[#ffffff] mx-auto relative ${pageIndex !== currentPage ? 'hidden' : ''}`}
      >
        {/* Main Content */}
        <div className="receipt-content">
          {/* Header Section - Show on all pages */}
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
              <p className="font-semibold">
                Daily Timings: 9:00 am to 2:30 pm & 5:30 pm to 7:30 pm
              </p>
            </div>
          </div>

          <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">BILLING RECEIPT</h2>

          {/* Patient Information Section */}
          <div className="pb-3 mb-4 border-b border-[#000000]">
            <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
            {/* grid-based layout */}
            <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              {/* Patient Name */}
              <div>
                <div className="font-bold">PATIENT NAME</div>
                <div>{patientData.patientName}</div>
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
              <div>
                <div className="font-bold">BILL NO</div>
                <div>{patientData.billNumber}</div>
              </div>
              {/* Gender */}
              <div>
                <div className="font-bold">GENDER</div>
                <div>{patientData.gender}</div>
              </div>
              {/* Guardian Name */}
              <div>
                <div className="font-bold">REFERRED BY</div>
                <div>{patientData.referredBy || ''}</div>
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

          {/* Billing Table Section - Show items for current page */}
          <div className="pb-3 mb-4">
            <h3 className="text-xs font-bold mb-3">BILLING DETAILS</h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#000000] p-2 text-left">S.No</th>
                  <th className="border border-[#000000] p-2 text-left">Particulars</th>
                  <th className="border border-[#000000] p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item, index) => {
                  // Check if this is a sub-item by looking for the '  - ' prefix
                  const isSubItem = item.particulars.startsWith('  - ')
                  // Only increment and show serial number for main items (not sub-items)
                  let itemNumber = ''
                  if (!isSubItem) {
                    const subItemsBeforeCount = pageItems
                      .slice(0, index)
                      .filter((i) => i.particulars.startsWith('  - ')).length
                    itemNumber = String(
                      pageIndex * ITEMS_PER_PAGE + index + 1 - subItemsBeforeCount
                    )
                  }

                  return (
                    <tr key={`item-${index}`}>
                      <td className="border border-[#000000] p-2">{isSubItem ? '' : itemNumber}</td>
                      <td className="border border-[#000000] p-2">{item.particulars}</td>
                      <td className="border border-[#000000] p-2 text-right">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}

                {/* Empty rows to maintain consistent table size */}
                {pageItems.length < ITEMS_PER_PAGE &&
                  Array(ITEMS_PER_PAGE - pageItems.length)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="border border-[#000000] p-2">&nbsp;</td>
                        <td className="border border-[#000000] p-2">&nbsp;</td>
                        <td className="border border-[#000000] p-2">&nbsp;</td>
                      </tr>
                    ))}

                {/* Summary rows - Show only on last page */}
                {isLastPage && billingData && (
                  <>
                    <tr>
                      <td className="border border-[#000000] p-2" colSpan={2}>
                        <div className="text-right font-bold">TOTAL AMOUNT</div>
                      </td>
                      <td className="border border-[#000000] p-2 text-right font-bold">
                        {billingData.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    {billingData.discountPercent > 0 && (
                      <tr>
                        <td className="border border-[#000000] p-2" colSpan={2}>
                          <div className="text-right font-bold">DISCOUNT %</div>
                        </td>
                        <td className="border border-[#000000] p-2 text-right">
                          {billingData.discountPercent}%
                        </td>
                      </tr>
                    )}
                    {billingData.discountAmount > 0 && (
                      <tr>
                        <td className="border border-[#000000] p-2" colSpan={2}>
                          <div className="text-right font-bold">DISCOUNT AMOUNT</div>
                        </td>
                        <td className="border border-[#000000] p-2 text-right">
                          {billingData.discountAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="border border-[#000000] p-2" colSpan={2}>
                        <div className="text-right font-bold">NET AMOUNT</div>
                      </td>
                      <td className="border border-[#000000] p-2 text-right font-bold">
                        {(billingData.totalAmount - billingData.discountAmount).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2" colSpan={2}>
                        <div className="text-right font-bold">AMT. RECEIVED</div>
                      </td>
                      <td className="border border-[#000000] p-2 text-right">
                        {billingData.amountReceived.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-[#000000] p-2" colSpan={2}>
                        <div className="text-right font-bold">BALANCE</div>
                      </td>
                      <td className="border border-[#000000] p-2 text-right font-bold">
                        {billingData.balance.toFixed(2)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clean Fixed Footer - Show on all pages */}
        <div className="receipt-footer">
          <div className="pt-3">
            {/* Page number */}
            <div className="text-center text-[10px] mb-2">
              Page {pageIndex + 1} of {pages.length}
            </div>

            {/* Hospital Authorization - Show on last page */}
            {isLastPage && (
              <div className="flex justify-between items-center">
                <div className="text-left text-[11px]"></div>

                <div className="text-right text-[11px] space-y-1">
                  <p className="font-bold">AUTHORISED SIGNATORY</p>
                  <p className="font-bold">
                    {authorizedSignatory || 'For SRI HARSHA EYE HOSPITAL'}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Disclaimer - Show on all pages */}
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
      </div>
    )
  }

  // Pagination controls
  const handlePrevPage = (): void => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))
  }

  return (
    <div>
      {/* Render all pages (only the current one will be visible) */}
      {pages.map((pageItems, index) =>
        renderReceiptPage(pageItems, index, index === pages.length - 1)
      )}

      {/* Pagination controls - only show if there are multiple pages */}
      {pages.length > 1 && (
        <div className="flex justify-center items-center mt-4 gap-4 print:hidden">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`px-3 py-1 rounded ${
              currentPage === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Previous Page
          </button>
          <span className="text-sm">
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === pages.length - 1}
            className={`px-3 py-1 rounded ${
              currentPage === pages.length - 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Next Page
          </button>
        </div>
      )}

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
            page-break-after: always;
          }

          .receipt-container:last-child {
            page-break-after: avoid;
          }

          .hidden {
            display: block !important;
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
