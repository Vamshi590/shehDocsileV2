/* eslint-disable prettier/prettier */
'use client'

interface OpticalCashBillProps {
  billNumber?: string
  date?: string
  customerName?: string
  gstNo?: string
  items?: Array<{
    slNo: number
    particulars: string
    rate: number
    amount: number
  }>
  total?: number
}

export default function OpticalCashBill({
  billNumber = '217',
  date = '',
  customerName = '',
  gstNo = '36AABCS1234F1Z5',
  items = [],
  total = 0
}: OpticalCashBillProps): React.ReactNode {
  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-[#ffffff] border-2 border-[#000000] print:border-0 print:shadow-none shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-left">
          <span className="font-bold text-sm">GST No: {gstNo}</span>
        </div>
        <div className="text-[#000000] px-3 py-1 rounded">
          <span className="font-bold text-sm">CASH BILL</span>
        </div>
        <div className="text-right">
          <span className="font-bold">Cell: 9494362719</span>
        </div>
      </div>

      {/* Business Name */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold tracking-wider">SRI MEHER OPTICALS</h1>
        <h2 className="text-xl font-bold tracking-wider">wholesale & retail</h2>
      </div>

      {/* Address */}
      <div className="text-center text-sm mb-4">
        <p># 6-6-650/1, Ambedkarnagar, Subhashnagar Road, Beside Honda Show Room,</p>
        <p>KARIMNAGAR-505001.</p>
      </div>

      {/* Bill Details */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <span>No.</span>
          <span className="text-[#E53935] font-bold text-xl">{billNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="pb-2">Date</span>
          <div className="border-b border-[#000000] w-32 h-6 flex items-end py-2">
            <span className="text-md">{date}</span>
          </div>
        </div>
      </div>

      {/* Customer Name */}
      <div className="flex items-center gap-2 mb-4">
        <span className="pb-2">Sri/Smt</span>
        <div className="border-b border-[#000000] py-2 flex-1 h-6 flex items-end">
          <span className="text-md">{customerName}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-[#000000] h-[500px] flex flex-col">
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
          <div className="w-20 border-r-2 border-[#000000] p-2 text-center font-bold">Rate</div>
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
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-sm border-b border-[#dee2e6]">
                {item.slNo}
              </div>
            ))}
          </div>
          <div className="flex-1 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-sm border-b border-[#dee2e6]">
                {item.particulars}
              </div>
            ))}
          </div>
          <div className="w-20 border-r-2 border-[#000000]">
            {items.map((item, index) => (
              <div key={index} className="p-2 text-center text-sm border-b border-[#dee2e6]">
                {item.rate.toFixed(2)}
              </div>
            ))}
          </div>
          <div className="w-32">
            {items.map((item, index) => (
              <div key={index} className="p-2 flex border-b border-[#dee2e6]">
                <div className="flex-1 border-r border-[#000000] text-center text-sm">
                  {Math.floor(item.amount)}
                </div>
                <div className="flex-1 text-center text-sm">
                  {Math.round((item.amount % 1) * 100)
                    .toString()
                    .padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Row */}
        <div className="border-t-2 border-[#000000] flex">
          <div className="flex-1"></div>
          <div className="w-20 border-l-2 border-[#000000] p-2 text-center font-bold">Total</div>
          <div className="w-32 border-l-2 border-[#000000] p-2 flex">
            <div className="flex-1 border-r border-[#000000] text-center font-bold">
              {Math.floor(total)}
            </div>
            <div className="flex-1 text-center font-bold">
              {Math.round((total % 1) * 100)
                .toString()
                .padStart(2, '0')}
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
          <div className="border-b border-[#000000] w-32 h-8 flex items-end py-2 justify-center">
            <span className="text-sm italic">Signature</span>
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
