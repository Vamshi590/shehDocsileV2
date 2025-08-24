/* eslint-disable prettier/prettier */
import { JSX } from 'react'

const DischargeBack = (): JSX.Element => {
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        <h2 className="text-xl font-semibold mb-4 text-center text-[#000000]">
          Sri Harsha Eye Hospital
        </h2>
        <h3 className="text-lg font-semibold mb-3 text-[#000000]">Discharge Instructions:</h3>
        <ol className="list-decimal list-inside mb-4 text-[#000000] space-y-3">
          <li>తక్కువ మొత్తంలో తరచుగా ఆహారం తీసుకోండి. (Eat small amounts of food frequently.)</li>
          <li>తేలికగా జీర్ణమయ్యే ఆహారం తీసుకోండి. (Eat easily digestible food.)</li>
          <li>పుల్లని, కారమైన ఆహారాలకు దూరంగా ఉండండి. (Stay away from sour and spicy foods.)</li>
          <li>ఆల్కహాల్ మరియు స్మోకింగ్‌కు దూరంగా ఉండండి. (Stay away from alcohol and smoking.)</li>
          <li>
            మీ డాక్టర్ సూచించిన విధంగా మందులు క్రమం తప్పకుండా తీసుకోండి. (Take medications regularly
            as prescribed by your doctor.)
          </li>
          <li>
            ఆరోగ్యం బాగాలేదనిపిస్తే లేదా నొప్పిగా ఉంటే వెంటనే మీ డాక్టర్‌ను సంప్రదించండి. (Consult
            your doctor immediately if you feel unwell or have pain.)
          </li>
          <li>
            కంటిని రుద్దకండి మరియు మీ కంటికి నీరు తగలకుండా జాగ్రత్త వహించండి. (Do not rub your eyes
            and take care not to get water in your eyes.)
          </li>
          <li>
            బయటకు వెళ్ళేటప్పుడు తప్పనిసరిగా కళ్ళజోడు ధరించండి. (Wear glasses without fail when going
            out.)
          </li>
          <li>
            మీ తదుపరి అపాయింట్‌మెంట్ తేదీలో తప్పనిసరిగా హాజరుకాండి. (Be sure to attend on your next
            appointment date.)
          </li>
          <li>
            మీ డాక్టర్ సలహా మేరకు కంటి చుక్కలు వేయండి. (Apply eye drops as advised by your doctor.)
          </li>
        </ol>

        <div className="mb-3 text-[#000000]">
          <h4 className="font-semibold">Condition on Discharge:</h4>
          <p>{'Stable'}</p>
        </div>

        <div className="mb-3 text-[#000000]">
          <h4 className="font-semibold">Follow Up Appointments/Advice:</h4>
          <p>{'3 days, 7 days and between 20 to 30 days'}</p>
        </div>

        <div className="mb-3 text-[#000000]">
          <h4 className="font-semibold">When to Obtain Urgent Care:</h4>
          <p>
            కంటి నుండి నీరు కారడం, ఎరుపు, కనురెప్ప వాపు, దురద & అలెర్జీ వచ్చినప్పుడు. (Eye Watering,
            Increased, Eye Redness, Eye Lid Swelling, Itching & Allergy etc.,)
          </p>
        </div>

        <div className="mb-3 text-[#000000]">
          <h4 className="font-semibold">How to Obtain Urgent Care:</h4>
          <p>
            అత్యవసర పరిస్థితుల్లో ఈ నెంబర్‌కు ఫోన్ చేయగలరు:{' '}
            <a href="tel:9885029367" className="text-[#000000]">
              9885029367
            </a>{' '}
            (In case of emergency, you can call this number:{' '}
            <a href="tel:9885029367" className="text-[#000000]">
              9885029367
            </a>
            )
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="receipt-footer">
        <div className="pt-3">
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

export default DischargeBack
