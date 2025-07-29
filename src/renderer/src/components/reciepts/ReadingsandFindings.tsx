/* eslint-disable prettier/prettier */
'use client'

import type React from 'react'
import cliniseye from '../../assets/clinicseye.png'

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
  department: string
  receiptNo: string
}

interface ClinicalFindingsData {
  patientName?: string
  date?: string
  leftEye: {
    lids: string
    conjunctiva: string
    cornea: string
    ac: string
    iris: string
    pupil: string
    lens: string
    tension: string
    fundus: string
    opticDisk: string
    macula: string
    vessels: string
    peripheralRetina: string
    retinoscopy: string
    retino1: string
    retino2: string
    retino3: string
    retino4: string
  }
  rightEye: {
    lids: string
    conjunctiva: string
    cornea: string
    ac: string
    iris: string
    pupil: string
    lens: string
    tension: string
    fundus: string
    opticDisk: string
    macula: string
    vessels: string
    peripheralRetina: string
    retinoscopy: string
    retino1: string
    retino2: string
    retino3: string
    retino4: string
  }
}

interface EyeReceiptProps {
  patientData: PatientData
  arReadingData?: ARReadingData
  previousGlassPrescription?: EyePrescriptionData
  subjectiveRefraction?: EyePrescriptionData
  pd?: string
  clinicalFindings?: ClinicalFindingsData
  lensType?: string
  sighttype?: string
}

export default function EyeReceipt({
  arReadingData,
  previousGlassPrescription,
  subjectiveRefraction,
  pd,
  sighttype,
  clinicalFindings,
  lensType = ''
}: EyeReceiptProps): React.ReactElement {
  const defaultClinicalData: ClinicalFindingsData = {
    leftEye: {
      lids: 'Normal',
      conjunctiva: 'Normal',
      cornea: 'Normal',
      ac: 'Normal',
      iris: 'Normal',
      pupil: 'Normal',
      lens: 'Normal',
      tension: '-',
      fundus: '-',
      opticDisk: 'Normal',
      macula: '-',
      vessels: '-',
      peripheralRetina: '-',
      retinoscopy: '-',
      retino1: '-',
      retino2: '-',
      retino3: '-',
      retino4: '-'
    },
    rightEye: {
      lids: 'Normal',
      conjunctiva: 'Normal',
      cornea: 'Normal',
      ac: 'Normal',
      iris: 'Normal',
      pupil: 'Normal',
      lens: 'Normal',
      tension: '-',
      fundus: '-',
      opticDisk: 'Normal',
      macula: '-',
      vessels: '-',
      peripheralRetina: '-',
      retinoscopy: '-',
      retino1: '-',
      retino2: '-',
      retino3: '-',
      retino4: '-'
    }
  }

  const clinicalData = clinicalFindings || defaultClinicalData

  return (
    <div className="receipt-container">
      <div className="receipt-content">
        <h2 className="text-lg text-center font-bold py-2 px-2 mb-3 border-b-2 border-[#000000]">
          READINGS
        </h2>

        {/* AR Reading Section */}

        <div className="pb-2 mb-2">
          <h3 className="text-sm font-bold mb-1 text-center">AR READING {pd && `(PD: ${pd} mm)`}</h3>
          <table className="w-full border-collapse text-xs mb-3">
            <thead>
              <tr>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12"></th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12">SPH</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12">CYL</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12">
                  AXIS
                </th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12">VA</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff] w-12">VAC PH</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">R/E</td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.rightEye.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.rightEye.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.rightEye.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">{arReadingData?.rightEye.va}</td>
                <td className="border border-[#000000] p-1 text-center">{arReadingData?.rightEye.vacPh}</td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">L/E</td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.leftEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.leftEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.leftEye.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.leftEye.va}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {arReadingData?.leftEye.vacPh}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pb-2 mb-2">
          <h3 className="text-sm font-bold mb-1 text-center">PREVIOUS GLASS PRESCRIPTION</h3>
          <table className="w-full border-collapse text-xs mb-3">
            <thead>
              <tr>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]"></th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]" colSpan={4}>
                  RIGHT EYE
                </th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]" colSpan={4}>
                  LEFT EYE
                </th>
              </tr>
              <tr>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]"></th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">SPH</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">CYL</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">AXIS</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">BCVA</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">SPH</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">CYL</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">AXIS</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">BCVA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">DIST</td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.rightEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.rightEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.rightEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.rightEye?.va}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.leftEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.leftEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.leftEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.dist?.leftEye?.va}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">NEAR</td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.rightEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.rightEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.rightEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.rightEye?.va}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.leftEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.leftEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.leftEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {previousGlassPrescription?.near?.leftEye?.va}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Subjective Refraction Section */}

        <div className="pb-2 mb-2 border-b-2 border-[#000000]">
          <h3 className="text-sm font-bold mb-1 text-center">PRESENT GLASS PRESCRIPTION {sighttype ? `(${sighttype})` : ''}</h3>
          <table className="w-full border-collapse text-xs mb-3">
            <thead>
              <tr>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]"></th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]" colSpan={4}>
                  RIGHT EYE
                </th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]" colSpan={4}>
                  LEFT EYE
                </th>
              </tr>
              <tr>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]"></th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">SPH</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">CYL</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">AXIS</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">BCVA</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">SPH</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">CYL</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">AXIS</th>
                <th className="border border-[#000000] p-1 text-center font-bold bg-[#ffffff]">BCVA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">DIST</td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.rightEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.rightEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.rightEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.rightEye?.va}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.leftEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.leftEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.leftEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.dist?.leftEye?.va}
                </td>
              </tr>
              <tr>
                <td className="border border-[#000000] p-1 text-center font-bold">NEAR</td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.rightEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.rightEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.rightEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.rightEye?.va}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.leftEye?.sph}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.leftEye?.cyl}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.leftEye?.axis}
                </td>
                <td className="border border-[#000000] p-1 text-center">
                  {subjectiveRefraction?.near?.leftEye?.va}
                </td>
              </tr>
            </tbody>
          </table>
          {lensType && <div className="mt-2 text-center text-xs font-bold">{lensType}</div>}
        </div>

        {/* Clinical Findings Section */}
        <div className="pb-2 mb-2">
          <div className='flex justify-between items-center mb-2'>
            <img className='w-16 h-16' src={cliniseye} alt="" />
          <h3 className="text-sm font-bold mb-2 text-center">CLINICAL FINDINGS</h3>
          <img className='w-16 h-16' src={cliniseye} alt="" />

          </div>

          {/* Eye Examination Section */}
          <div className="flex justify-between mb-2 pl-12">     
            {/* Right Eye */}
            <div className="w-[48%]">
              <div className="text-center mb-2">
                <p className="text-xs font-bold">Right Eye</p>
              </div>
              <div className="p-1 mb-2">
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="font-semibold">LIDS</div>
                  <div className="text-center">{clinicalData.rightEye.lids || 'Normal'}</div>
                  <div className="font-semibold">CONJUNCTIVA</div>
                  <div className="text-center">{clinicalData.rightEye.conjunctiva || 'Normal'}</div>
                  <div className="font-semibold">CORNEA</div>
                  <div className="text-center">{clinicalData.rightEye.cornea || 'Clear'}</div>
                  <div className="font-semibold">A.C.</div>
                  <div className="text-center">{clinicalData.rightEye.ac || 'Normal Depth and contents clear'}</div>
                  <div className="font-semibold">IRIS</div>
                  <div className="text-center">{clinicalData.rightEye.iris || 'Normal Color and Pattern'}</div>
                  <div className="font-semibold">PUPIL</div>
                  <div className="text-center">{clinicalData.rightEye.pupil || 'Round Regular Reacting'}</div>
                  <div className="font-semibold">LENS</div>
                  <div className="text-center">{clinicalData.rightEye.lens || 'Clear'}</div>
                  <div className="font-semibold">FUNDUS</div>
                  <div className="text-center">{clinicalData.rightEye.fundus || 'Within Normal Limits'}</div>
                  {clinicalData.rightEye.opticDisk && (
                    <>
                      <div className="font-semibold">OPTIC DISK</div>
                      <div className="text-center">{clinicalData.rightEye.opticDisk}</div>
                    </>
                  )}
                  {clinicalData.rightEye.macula && (
                    <>
                      <div className="font-semibold">MACULA</div>
                      <div className="text-center">{clinicalData.rightEye.macula}</div>
                    </>
                  )}
                  {clinicalData.rightEye.vessels && (
                    <>
                      <div className="font-semibold">VESSELS</div>
                      <div className="text-center">{clinicalData.rightEye.vessels}</div>
                    </>
                  )}
                  {clinicalData.rightEye.peripheralRetina && (
                    <>
                      <div className="font-semibold">PERIPHERAL RETINA</div>
                      <div className="text-center">{clinicalData.rightEye.peripheralRetina}</div>
                    </>
                  )}
                  <div className="font-semibold">RETINOSCOPY</div>
                  <div className="text-center">{clinicalData.rightEye.retinoscopy}</div>
                </div>
              </div>
              <div className="flex space-x-12 justify-center mt-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-[#000000]"></div>
                  <div className="absolute w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#000000] z-10 bg-[#ffffff]"></div>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0">
                    <line x1="15" y1="15" x2="85" y2="85" stroke="#000000" strokeWidth="2" />
                    <line x1="85" y1="15" x2="15" y2="85" stroke="#000000" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-0 left-6 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino1}</span>
                  </div>
                  <div className="absolute top-6 right-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino2}</span>
                  </div>
                  <div className="absolute bottom-0 left-6 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino3}</span>
                  </div>
                  <div className="absolute bottom-6 left-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino4}</span>
                  </div>
                </div>
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="absolute w-px h-full bg-[#000000]"></div>
                    <div className="absolute h-px w-full bg-[#000000]"></div>
                  </div>
                  <div className="absolute top-1 left-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino1}</span>
                  </div>
                  <div className="absolute top-1 right-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino2}</span>
                  </div>
                  <div className="absolute bottom-1 left-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino3}</span>
                  </div>
                  <div className="absolute bottom-1 right-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.rightEye.retino4}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Left Eye */}
            <div className="w-[48%]">
              <div className="text-center mb-2">
                <p className="text-xs font-bold">Left Eye</p>
              </div>
              <div className="p-1 mb-2">
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className="font-semibold">LIDS</div>
                  <div className="text-center">{clinicalData.leftEye.lids || 'Normal'}</div>
                  <div className="font-semibold">CONJUNCTIVA</div>
                  <div className="text-center">{clinicalData.leftEye.conjunctiva || 'Normal'}</div>
                  <div className="font-semibold">CORNEA</div>
                  <div className="text-center">{clinicalData.leftEye.cornea || 'Clear'}</div>
                  <div className="font-semibold">A.C.</div>
                  <div className="text-center">{clinicalData.leftEye.ac || 'Normal Depth and contents clear'}</div>
                  <div className="font-semibold">IRIS</div>
                  <div className="text-center">{clinicalData.leftEye.iris || 'Normal Color and Pattern'}</div>
                  <div className="font-semibold">PUPIL</div>
                  <div className="text-center">{clinicalData.leftEye.pupil || 'Round Regular Reacting'}</div>
                  <div className="font-semibold">LENS</div>
                  <div className="text-center">{clinicalData.leftEye.lens || 'Clear'}</div>
                  <div className="font-semibold">FUNDUS</div>
                  <div className="text-center">{clinicalData.leftEye.fundus || 'Within Normal Limits'}</div>
                  {clinicalData.leftEye.opticDisk && (
                    <>
                      <div className="font-semibold">OPTIC DISK</div>
                      <div className="text-center">{clinicalData.leftEye.opticDisk}</div>
                    </>
                  )}
                  {clinicalData.leftEye.macula && (
                    <>
                      <div className="font-semibold">MACULA</div>
                      <div className="text-center">{clinicalData.leftEye.macula}</div>
                    </>
                  )}
                  {clinicalData.leftEye.vessels && (
                    <>
                      <div className="font-semibold">VESSELS</div>
                      <div className="text-center">{clinicalData.leftEye.vessels}</div>
                    </>
                  )}
                  {clinicalData.leftEye.peripheralRetina && (
                    <>
                      <div className="font-semibold">PERIPHERAL RETINA</div>
                      <div className="text-center">{clinicalData.leftEye.peripheralRetina}</div>
                    </>
                  )}
              
                  <div className="font-semibold">RETINOSCOPY</div>
                  <div className="text-center">{clinicalData.leftEye.retinoscopy}</div>
                </div>
              </div>
              <div className="flex justify-center space-x-12 mt-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-[#000000]"></div>
                  <div className="absolute w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#000000] z-10 bg-[#ffffff]"></div>
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0">
                    <line x1="15" y1="15" x2="85" y2="85" stroke="#000000" strokeWidth="2" />
                    <line x1="85" y1="15" x2="15" y2="85" stroke="#000000" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-0 left-6 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino1}</span>
                  </div>
                  <div className="absolute top-6 right-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino2}</span>
                  </div>
                  <div className="absolute bottom-0 left-6 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino3}</span>
                  </div>
                  <div className="absolute bottom-6 left-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino4}</span>
                  </div>
                </div>
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="absolute w-px h-full bg-[#000000]"></div>
                    <div className="absolute h-px w-full bg-[#000000]"></div>
                  </div>
                  <div className="absolute top-1 left-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino1}</span>
                  </div>
                  <div className="absolute top-1 right-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino2}</span>
                  </div>
                  <div className="absolute bottom-1 left-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino3}</span>
                  </div>
                  <div className="absolute bottom-1 right-1 w-1/2 h-1/2 flex items-center justify-center">
                    <span className="text-[8px] text-center">{clinicalData.leftEye.retino4}</span>
                  </div>
                </div>
              </div>
            </div>

       
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
              <p className="font-bold">SRI HARSHA EYE HOSPITAL</p>
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
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      </div>

      <style>{`
        .receipt-container {
          width: 210mm;
          min-height: 297mm;
          max-width: 210mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
          font-family: 'Arial', sans-serif;
          line-height: 1.3;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .receipt-content {
          width: 100%;
          height: 100%;
        }
        
        @media print {
          .receipt-container {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 10mm;
            box-shadow: none;
            page-break-after: avoid;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
        
        @media screen and (max-width: 768px) {
          .receipt-container {
            width: 100%;
            max-width: 100%;
            padding: 8mm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
