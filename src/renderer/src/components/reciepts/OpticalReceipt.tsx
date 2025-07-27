'use client'

interface BusinessInfo {
  name: string
  address: string
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

interface OpticalItem {
  particulars: string
  power?: string
  size?: string
  qty: number
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
  items: OpticalItem[]
  totals: Totals
}

interface OpticalReceiptProps {
  data: ReceiptData
}

export default function OpticalReceipt({ data }: OpticalReceiptProps): React.ReactNode {
  const { businessInfo, patientInfo, items, totals } = data

  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-[#ffffff] border-2 border-[#000000] print:border-0 print:shadow-none shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-left">
          <div className="text-xs">
            <div>GSTIN: {businessInfo.gstin}</div>
          </div>
        </div>
        <div className=" text-[#000000] px-3 rounded">
          <span className="font-bold text-sm">CASH BILL</span>
        </div>
        <div className="text-right text-xs">
          <div>Cell: {businessInfo.phone1}</div>
        </div>
      </div>

      {/* Business Name */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold tracking-wider">{businessInfo.name}</h1>
        <h2 className="text-xl font-bold tracking-wider">wholesale & retail</h2>
      </div>

      {/* Address */}
      <div className="text-center text-sm mb-4">
        <p># 6-6-650/1, Ambedkarnagar, Subhashnagar Road, Beside Honda Show Room,</p>
        <p>KARIMNAGAR-505001.</p>
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
      <div className="border-2 border-[#000000] h-[400px] flex flex-col">
        {/* Table Header */}
        <div className="border-b-2 border-[#000000] flex">
          <div className="w-[35%] border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            PARTICULARS
          </div>
          <div className="w-[15%] border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            POWER/SIZE
          </div>
          <div className="w-[10%] border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            QTY
          </div>
          <div className="w-[15%] border-r-2 border-[#000000] p-2 text-center font-bold text-xs">
            RATE
          </div>
          <div className="w-[25%] p-2 text-center font-bold text-xs">
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
          <div className="w-[35%] border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-xs border-b border-[#dee2e6]">
                {item.particulars}
              </div>
            ))}
          </div>
          <div className="w-[15%] border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#dee2e6]">
                {item.power || item.size || '-'}
              </div>
            ))}
          </div>
          <div className="w-[10%] border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#dee2e6]">
                {item.qty}
              </div>
            ))}
          </div>
          <div className="w-[15%] border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-xs border-b border-[#dee2e6]">
                {item.rate.toFixed(2)}
              </div>
            ))}
          </div>
          <div className="w-[25%]">
            {items.map((item, index) => (
              <div key={index} className="p-2 flex border-b border-[#dee2e6]">
                <div className="flex-1 border-r border-[#000000] text-center text-xs">
                  {Math.floor(item.amount)}
                </div>
                <div className="flex-1 text-center text-xs">
                  {Math.round((item.amount % 1) * 100)
                    .toString()
                    .padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Rows */}
        <div className="border-t-2 border-[#000000]">
          <div className="flex border-b border-[#000000]">
            <div className="flex-1"></div>
            <div className="w-[15%] border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
              Total Amount
            </div>
            <div className="w-[25%] border-l-2 border-[#000000] p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold text-xs">
                {Math.floor(totals.totalAmount)}
              </div>
              <div className="flex-1 text-center font-bold text-xs">
                {Math.round((totals.totalAmount % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
          <div className="flex border-b border-[#000000]">
            <div className="flex-1"></div>
            <div className="w-[15%] border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
              Advance Paid
            </div>
            <div className="w-[25%] border-l-2 border-[#000000] p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold text-xs">
                {totals.advancePaid > 0 ? Math.floor(totals.advancePaid) : '-'}
              </div>
              <div className="flex-1 text-center font-bold text-xs">
                {totals.advancePaid > 0
                  ? Math.round((totals.advancePaid % 1) * 100)
                      .toString()
                      .padStart(2, '0')
                  : '-'}
              </div>
            </div>
          </div>
          <div className="flex border-b border-[#000000]">
            <div className="flex-1"></div>
            <div className="w-[15%] border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
              Amt. Received
            </div>
            <div className="w-[25%] border-l-2 border-[#000000] p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold text-xs">
                {totals.amtReceived > 0 ? Math.floor(totals.amtReceived) : '-'}
              </div>
              <div className="flex-1 text-center font-bold text-xs">
                {totals.amtReceived > 0
                  ? Math.round((totals.amtReceived % 1) * 100)
                      .toString()
                      .padStart(2, '0')
                  : '-'}
              </div>
            </div>
          </div>
          <div className="flex border-b border-[#000000]">
            <div className="flex-1"></div>
            <div className="w-[15%] border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
              Discount
            </div>
            <div className="w-[25%] border-l-2 border-[#000000] p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold text-xs">
                {totals.discount > 0 ? Math.floor(totals.discount) : '-'}
              </div>
              <div className="flex-1 text-center font-bold text-xs">
                {totals.discount > 0
                  ? Math.round((totals.discount % 1) * 100)
                      .toString()
                      .padStart(2, '0')
                  : '-'}
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex-1"></div>
            <div className="w-[15%] border-l-2 border-[#000000] p-2 text-center font-bold text-xs">
              Balance
            </div>
            <div className="w-[25%] border-l-2 border-[#000000] p-2 flex">
              <div className="flex-1 border-r border-[#000000] text-center font-bold text-xs">
                {Math.floor(totals.balance)}
              </div>
              <div className="flex-1 text-center font-bold text-xs">
                {Math.round((totals.balance % 1) * 100)
                  .toString()
                  .padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-4">
        <div className="text-sm">
          <span>Goods once sold can not be taken back</span>
        </div>
        <div className="text-right">
          <div className="border-b border-[#000000] w-32 h-8 p-2 flex items-end justify-center">
            <span className="text-sm italic p-2">Signature</span>
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
