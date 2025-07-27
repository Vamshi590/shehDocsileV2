import React from 'react'
import eyeimage from '../../assets/eye_image.jpg'
import nabhimage from '../../assets/nabh_accredited.jpg'
interface EyeData {
  sph: string
  cyl: string
  axis: string
  va: string
  vacPh?: string
}

interface ARReadingData {
  rightEye: EyeData
  leftEye: EyeData
}

interface EyePrescriptionData {
  dist: {
    rightEye: EyeData
    leftEye: EyeData
  }
  near: {
    rightEye: EyeData
    leftEye: EyeData
  }
}

interface PatientData {
  patientId: string
  date: string
  patientName: string
  gender: string
  guardianName?: string
  age: string
  address: string
  mobile: string
  doctorName: string
  referredBy: string
  department: string
  receiptNo: string
}

interface EyeReceiptProps {
  patientData: PatientData
  arReadingData?: ARReadingData
  previousGlassPrescription?: EyePrescriptionData
  subjectiveRefraction?: EyePrescriptionData
  pd?: string
  lensType?: string
  advise?: string
  reviewDate?: string
}

export default function EyeReceipt({
  patientData,
  arReadingData,
  previousGlassPrescription,
  subjectiveRefraction,
  pd,
  lensType = '',
  advise = '',
  reviewDate = ''
}: EyeReceiptProps): React.ReactElement {
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-4 border-b-2 border-[#000000]">
          <div className="flex justify-end">
            <p className="text-[10px] font-semibold">Ph: 08782955955, Cell: 9885029367</p>
          </div>
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12  flex items-center justify-center">
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
        <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">READINGS</h2>

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
            </div>{' '}
            {/* Guardian Name */}
            <div>
              <div className="font-bold">REFFERED BY</div>
              <div>{patientData.referredBy || ''}</div>
            </div>
            {/* Sno */}
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
          </div>
        </div>

        {/* AR Reading Section */}
        {arReadingData && (
          <div className="pb-3 mb-4 ">
            <h3 className="text-xs font-bold mb-3 text-center">
              AR READING {pd && `(PD: ${pd} mm)`}
            </h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-16"></th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-16">
                    SPH
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-16">
                    CYL
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-16">
                    AXIS
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-16">
                    VA
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff] w-20">
                    VAC P.H.
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">R/E</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.rightEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.rightEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.rightEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.rightEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.rightEye.vacPh}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">L/E</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.leftEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.leftEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.leftEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.leftEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {arReadingData.leftEye.vacPh}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Previous Glass Prescription Section */}
        {previousGlassPrescription && (
          <div className="pb-3 mb-4">
            <h3 className="text-xs font-bold mb-3 text-center">PREVIOUS GLASS PRESCRIPTION</h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"></th>
                  <th
                    className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"
                    colSpan={4}
                  >
                    RIGHT EYE
                  </th>
                  <th
                    className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"
                    colSpan={4}
                  >
                    LEFT EYE
                  </th>
                </tr>
                <tr>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"></th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    SPH
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    CYL
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    AXIS
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    BCVA
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    SPH
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    CYL
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    AXIS
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    BCVA
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">DIST</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.rightEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.rightEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.rightEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.rightEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.leftEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.leftEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.leftEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.dist.leftEye.va}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">NEAR</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.rightEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.rightEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.rightEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.rightEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.leftEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.leftEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.leftEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {previousGlassPrescription.near.leftEye.va}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Subjective Refraction Section */}
        {subjectiveRefraction && (
          <div className="pb-3 mb-4 border-b border-[#000000]">
            <h3 className="text-xs font-bold mb-3 text-center">SUBJECTIVE REFRACTION</h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"></th>
                  <th
                    className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"
                    colSpan={4}
                  >
                    RIGHT EYE
                  </th>
                  <th
                    className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"
                    colSpan={4}
                  >
                    LEFT EYE
                  </th>
                </tr>
                <tr>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]"></th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    SPH
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    CYL
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    AXIS
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    BCVA
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    SPH
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    CYL
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    AXIS
                  </th>
                  <th className="border border-[#000000] p-2 text-center font-bold bg-[#ffffff]">
                    BCVA
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">DIST</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.rightEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.rightEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.rightEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.rightEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.leftEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.leftEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.leftEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.dist.leftEye.va}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] p-2 text-center font-bold">NEAR</td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.rightEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.rightEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.rightEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.rightEye.va}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.leftEye.sph}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.leftEye.cyl}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.leftEye.axis}
                  </td>
                  <td className="border border-[#000000] p-2 text-center">
                    {subjectiveRefraction.near.leftEye.va}
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Lens Type Information */}
            {lensType && <div className="mt-4 text-center text-[10px] font-bold">{lensType}</div>}
          </div>
        )}

        {/* Advice Section */}
        {advise && (
          <div className="pb-3 mb-4">
            <div className="text-[11px]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-bold w-20 py-1">ADVISE</td>
                    <td className="py-1">{advise}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Date Section */}
        {reviewDate && (
          <div className="pb-3 mb-4">
            <div className="text-[11px]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-bold w-20 py-1">REVIEW DATE</td>
                    <td className="py-1">{reviewDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Clean Fixed Footer */}
      <div className="receipt-footer">
        <div className="pt-3">
          {/* Hospital Authorization */}
          <div className="flex justify-between items-center ">
            <div className="text-left text-[11px]"></div>

            <div className="text-right text-[11px] space-y-1">
              <p className="font-bold">For SRI HARSHA EYE HOSPITAL</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="border-t border-[#000000] mt-2 pt-1 text-center text-[9px] text-[#000000]">
            <p className="mt-1 text-sm font-semibold text-center">
              Arogya Sri and Insurance facilities available
            </p>
            <div className="flex justify-between items-center">
              <span>
                This is a computer generated receipt. Please preserve this for your records.
              </span>
              <span>Generated on: {new Date().toLocaleString()}</span>
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
