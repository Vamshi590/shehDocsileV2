'use client'

import React from 'react'
import eyeimage from '../../assets/eye_image.jpg'
import nabhimage from '../../assets/nabh_accredited.jpg'

interface PatientData {
  patientName: string
  patientId: string
  guardianName?: string
  gender: string
  resident: string
  age: string
  department: string
}

interface AdmissionData {
  date: string
  dateOfAdmission: string
  timeOfAdmission: string
  provisionalDiagnosis: string
}

interface EmergencyAdmissionCertificateProps {
  patientData: PatientData
  admissionData: AdmissionData
}

export default function EmergencyAdmissionCertificate({
  patientData,
  admissionData
}: EmergencyAdmissionCertificateProps): React.ReactElement {
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-2 border-b-2 border-[#000000]">
          <div className="flex justify-end">
            <p className="text-[10px] font-semibold mb-2">Ph: 08782955955, Cell: 9885029367</p>
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
                <img src={nabhimage} alt="nabh image" />
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
        {/* Certificate Title */}
        <h2 className="text-sm text-center font-bold py-2 px-2 mb-4">
          EMERGENCY ADMISSION CERTIFICATE
        </h2>

        {/* Date Section */}
        <div className="flex justify-end mb-6">
          <div className="text-[11px]">
            <span className="font-bold">Date: </span>
            <span>{admissionData.date}</span>
          </div>
        </div>

        {/* Certificate Content as Single Paragraph */}
        <div className="mb-6">
          <div className="text-[11px] leading-relaxed">
            <p className="mb-6">
              This is to Certify that <span className="font-bold">{patientData.patientName}</span>{' '}
              Patient ID <span className="font-bold">{patientData.patientId}</span> Guardian Name{' '}
              <span className="font-bold">{patientData.guardianName || ''}</span> Age{' '}
              <span className="font-bold">{patientData.age}</span> Gender{' '}
              <span className="font-bold">{patientData.gender}</span> Resident of{' '}
              <span className="font-bold">{patientData.resident}</span> has admitted in our Hospital
              in <span className="font-bold">{patientData.department}</span> department under
              emergency.
            </p>
          </div>
        </div>

        {/* Admission Details */}
        <div className="mb-6 mt-20">
          <div className="text-[11px] space-y-4">
            <div className="flex items-center">
              <span className="font-bold w-32">Date of Admission</span>
              <span className="flex-1">{admissionData.dateOfAdmission}</span>
            </div>

            <div className="flex items-center">
              <span className="font-bold w-32">Time of Admission</span>
              <span className="flex-1">{admissionData.timeOfAdmission}</span>
            </div>
          </div>
        </div>

        {/* Provisional Diagnosis */}
        <div className="mb-16">
          <div className="text-[11px]">
            <div className="mb-2">
              <span className="font-bold">Provisional Diagnosis</span>
            </div>
            <div className="min-h-[24px]">{admissionData.provisionalDiagnosis}</div>
          </div>
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
              <p className="font-bold">For SRI HARSHA EYE HOSPITAL</p>
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
            <p className="mt-1 text-[8px] font-semibold text-left">Cautions / Patient Guidance:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[8px] text-left">
              <li>Complete the full course even if symptoms improve, unless advised otherwise.</li>
              <li>
                Report immediately if you experience any adverse effects or worsening symptoms.
              </li>
              <li>Attend your scheduled follow-up appointment on the given review date.</li>
            </ul>
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
