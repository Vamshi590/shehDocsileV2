'use client'

import React from 'react'
import eyeimage from '../../assets/eye_image.jpg'
import nabhimage from '../../assets/nabh_accredited.jpg'
import { toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'

interface PrescriptionItem {
  medicine: string
  times: string
  days: string
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
  referredBy?: string
  mobile: string
  doctorName: string
  department: string
  admissionDate?: string
  dateOfDischarge?: string
  followUpDate?: string
  dateOfOperation?: string
}

interface InPatientDischargeSummaryProps {
  patientData: PatientData
  operationProcedure?: string
  billNumber?: string
  operationDetails?: string
  dischargePrescriptionData?: PrescriptionItem[]
  authorizedSignatory?: string
  admissionDate?: string
  dateOfDischarge?: string
  followUpDate?: string
  operationDate?: string
  provisionDiagnosis?: string
}

export default function InPatientDischargeSummary({
  patientData,
  dateOfDischarge,
  operationDate,
  provisionDiagnosis = '',
  operationProcedure = '',
  operationDetails = '',
  dischargePrescriptionData = [],
  authorizedSignatory = ''
}: InPatientDischargeSummaryProps): React.ReactElement {
  // Ensure dischargePrescriptionData is a valid array with required properties
  const prescriptionItems = Array.isArray(dischargePrescriptionData)
    ? dischargePrescriptionData.filter((item) => {
        // Validate each item has the required properties
        const isValid =
          item &&
          typeof item === 'object' &&
          'medicine' in item &&
          'times' in item &&
          'days' in item

        if (!isValid) {
          console.warn('Invalid prescription item found:', item)
        }

        return isValid
      })
    : []

  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
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

        <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">DISCHARGE SUMMARY</h2>
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
              <div>{''}</div>
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

        {/* Medical Information Section */}
        <div className="pb-3 mb-4 border-b border-[#000000]">
          <h3 className="text-xs font-bold mb-3">MEDICAL INFORMATION</h3>
          {/* grid-based layout */}
          <div className="text-[11px] flex justify-between gap-x-4 gap-y-2 mb-4">
            {/* Patient ID */}
            <div>
              <div className="font-bold">DATE OF ADMISSION</div>
              <div>
                {patientData.admissionDate &&
                  format(
                    toZonedTime(patientData.admissionDate, 'Asia/Kolkata'),
                    'dd-MM-yyyy hh:mm a'
                  )}
              </div>
            </div>
            {/* Date */}
            <div>
              <div className="font-bold">DATE OF DISCHARGE</div>
              <div>
                {(dateOfDischarge &&
                  format(toZonedTime(dateOfDischarge, 'Asia/Kolkata'), 'dd-MM-yyyy hh:mm a')) ||
                  format(toZonedTime(new Date(), 'Asia/Kolkata'), 'dd-MM-yyyy hh:mm a')}
              </div>
            </div>
            {/* Patient Name */}
            <div>
              <div className="font-bold">DATE OF OPERATION</div>
              <div>
                {operationDate &&
                  format(toZonedTime(operationDate, 'Asia/Kolkata'), 'dd-MM-yyyy hh:mm a')}
              </div>
            </div>
          </div>

          <div className="text-[11px] flex flex-col justify-between gap-x-4 gap-y-2">
            {/* Gender */}
            <div className="flex space-x-2">
              <div className="font-bold">DIAGNOSIS</div>
              <div>{provisionDiagnosis}</div>
            </div>
            {/* Guardian Name */}
            <div className="flex space-x-2">
              <div className="font-bold">OPERATION PROCEDURE</div>
              <div>{operationProcedure}</div>
            </div>
            {/* Age */}
            <div className="flex space-x-2">
              <div className="font-bold">OPERATION DETAILS</div>
              <div>{operationDetails}</div>
            </div>
          </div>
        </div>
        {/* Prescription Section */}
        {prescriptionItems && prescriptionItems.length > 0 && (
          <div className="pb-3 mb-4">
            <h3 className="text-xs font-bold mb-3">PRESCRIPTION</h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#000000] p-2 text-left">Medicine</th>
                  <th className="border border-[#000000] p-2 text-center">Timing</th>
                  <th className="border border-[#000000] p-2 text-center">Days</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-[#000000] p-2">{item.medicine}</td>
                    <td className="border border-[#000000] p-2 text-center">{item.times}</td>
                    <td className="border border-[#000000] p-2 text-center">{item.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Follow-up Section */}
        <div className="pb-3 mb-4 text-end">
          <h3 className="text-xs font-bold mb-3">FOLLOW-UP DATE</h3>
          <p className="font-bold text-[11px]">{patientData.followUpDate}</p>
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
          <div className="border-t border-[#000000] pt-1 mt-2 text-center text-[9px] text-[#000000]">
            <p className="mt-1 text-sm font-semibold text-center">
              Arogya Sri and Insurance facilities available
            </p>
            <div className="flex justify-between items-center">
              <span>
                This is a computer generated receipt. Please preserve this for your records.
              </span>
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>
            <p className="mt-1 text-[8px]">© 2025 Sri Harsha Eye Hospital. All rights reserved.</p>
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
