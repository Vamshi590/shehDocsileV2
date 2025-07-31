/* eslint-disable prettier/prettier */
import { JSX, useEffect, useState } from 'react'
import EditableCombobox from '../common/EditableCombobox'
import { Patient } from './ReceiptForm'
// Standard options for eye prescription fields and prescription options
import { axisOptions, cylOptions, sphOptions, vaOptions, medicineOptions, adviceOptions, timingOptions } from '../../utils/dropdownOptions'
interface ReadingFormData {
    patientId: string

    // Doctor and department information
    'DOCTOR NAME'?: string
    DEPARTMENT?: string
    'REFFERED BY'?: string
    'PRESENT COMPLAIN'?: string
    'PREVIOUS HISTORY'?: string
    OTHERS?: string
    OTHERS1?: string

    // Prescription fields (up to 10 prescriptions)
    'PRESCRIPTION 1'?: string
    'DAYS 1'?: string
    'TIMING 1'?: string
    'PRESCRIPTION 2'?: string
    'DAYS 2'?: string
    'TIMING 2'?: string
    'PRESCRIPTION 3'?: string
    'DAYS 3'?: string
    'TIMING 3'?: string
    'PRESCRIPTION 4'?: string
    'DAYS 4'?: string
    'TIMING 4'?: string
    'PRESCRIPTION 5'?: string
    'DAYS 5'?: string
    'TIMING 5'?: string
    'PRESCRIPTION 6'?: string
    'DAYS 6'?: string
    'TIMING 6'?: string
    'PRESCRIPTION 7'?: string
    'DAYS 7'?: string
    'TIMING 7'?: string
    'PRESCRIPTION 8'?: string
    'DAYS 8'?: string
    'TIMING 8'?: string
    'PRESCRIPTION 9'?: string
    'DAYS 9'?: string
    'TIMING 9'?: string
    'PRESCRIPTION 10'?: string
    'DAYS 10'?: string
    'TIMING 10'?: string

    // Advice fields (up to 10 advice entries)
    'ADVICE 1'?: string
    'ADVICE 2'?: string
    'ADVICE 3'?: string
    'ADVICE 4'?: string
    'ADVICE 5'?: string
    'ADVICE 6'?: string
    'ADVICE 7'?: string
    'ADVICE 8'?: string
    'ADVICE 9'?: string
    'ADVICE 10'?: string

    // Additional notes and follow-up
    NOTES?: string
    'FOLLOW UP DATE'?: string

    // Patient information fields
    'PATIENT ID'?: string
    'PATIENT NAME'?: string
    'PHONE NUMBER'?: string
    AGE?: number | string
    GENDER?: string

    // Glasses Reading (GR)
    'GR-RE-D-SPH': string
    'GR-RE-D-CYL': string
    'GR-RE-D-AXIS': string
    'GR-RE-D-VISION': string
    'GR-RE-N-SPH': string
    'GR-RE-N-CYL': string
    'GR-RE-N-AXIS': string
    'GR-RE-N-VISION': string
    'GR-LE-D-SPH': string
    'GR-LE-D-CYL': string
    'GR-LE-D-AXIS': string
    'GR-LE-D-VISION': string
    'GR-LE-N-SPH': string
    'GR-LE-N-CYL': string
    'GR-LE-N-AXIS': string
    'GR-LE-N-VISION': string
    'ADVISED FOR': string
    SIGHTTYPE?: string
    // Auto Refractometer (AR)
    'AR-RE-SPH': string
    'AR-RE-CYL': string
    'AR-RE-AXIS': string
    'AR-RE-VA': string
    'AR-RE-VAC.P.H': string
    'AR-LE-SPH': string
    'AR-LE-CYL': string
    'AR-LE-AXIS': string
    'AR-LE-VA': string
    'AR-LE-VAC.P.H': string
    PD: string
    // Power Glass Prescription (PGP)
    'PGP-RE-D-SPH': string
    'PGP-RE-D-CYL': string
    'PGP-RE-D-AXIS': string
    'PGP-RE-D-VA': string
    'PGP-RE-N-SPH': string
    'PGP-RE-N-CYL': string
    'PGP-RE-N-AXIS': string
    'PGP-RE-N-VA': string
    'PGP-LE-D-SPH': string
    'PGP-LE-D-CYL': string
    'PGP-LE-D-AXIS': string
    'PGP-LE-D-BCVA': string
    'PGP-LE-N-SPH': string
    'PGP-LE-N-CYL': string
    'PGP-LE-N-AXIS': string
    'PGP-LE-N-BCVA': string
    // Subjective Refraction (SR)
    'SR-RE-D-SPH': string
    'SR-RE-D-CYL': string
    'SR-RE-D-AXIS': string
    'SR-RE-D-VA': string
    'SR-RE-N-SPH': string
    'SR-RE-N-CYL': string
    'SR-RE-N-AXIS': string
    'SR-RE-N-VA': string
    'SR-LE-D-SPH': string
    'SR-LE-D-CYL': string
    'SR-LE-D-AXIS': string
    'SR-LE-D-BCVA': string
    'SR-LE-N-SPH': string
    'SR-LE-N-CYL': string
    'SR-LE-N-AXIS': string
    'SR-LE-N-BCVA': string

    // Clinical Findings (CF)

    'CF-RE-LIDS': string
    'CF-RE-SAC': string
    'CF-RE-CONJUCTIVA': string
    'CF-RE-CORNEA': string
    'CF-RE-A.C.': string
    'CF-RE-IRIS': string
    'CF-RE-PUPIL': string
    'CF-RE-LENS': string
    'CF-RE-TENSION': string
    'CF-RE-FUNDUS': string
    'CF-RE-RETINO 1': string
    'CF-RE-RETINO 2': string
    'CF-RE-RETINO 3': string
    'CF-RE-RETINO 4': string
    'CF-LE-LIDS': string
    'CF-LE-SAC': string
    'CF-LE-CONJUCTIVA': string
    'CF-LE-CORNEA': string
    'CF-LE-A.C.': string
    'CF-LE-IRIS': string
    'CF-LE-PUPIL': string
    'CF-LE-LENS': string
    'CF-LE-TENSION': string
    'CF-LE-FUNDUS': string
    'CF-LE-RETINO 1': string
    'CF-LE-RETINO 2': string
    'CF-LE-RETINO 3': string
    'CF-LE-RETINO 4': string

    // Index signature for compatibility with Prescription type
    [key: string]: string | number | readonly string[] | undefined
}

interface ReadingFormProps {
    onSubmit: (formData: ReadingFormData) => Promise<void>
    onCancel: () => void
    // Keeping patients for API compatibility
    patients?: Patient[]
    selectedPatient: Patient | null
    initialData?: Record<string, unknown>
}

const CombinedForm = ({
    onSubmit,
    selectedPatient,
    initialData
}: ReadingFormProps): JSX.Element => {
    // State to control the visibility of the Eye Reading Form section
    const [showEyeReadingForm, setShowEyeReadingForm] = useState<boolean>(true);
    // State for managing visible prescription and advice fields
    const [visiblePrescription, setVisiblePrescription] = useState<number>(() => {
        // If initialData exists, count how many prescriptions are present
        if (initialData) {
            let count = 0;
            for (let i = 1; i <= 10; i++) {
                if (initialData[`PRESCRIPTION ${i}`]) {
                    count = i;
                }
            }
            // Return the count or at least 2 (default)
            return Math.max(count, 2);
        }
        return 2; // Default value
    })
    const [visibleAdvice, setVisibleAdvice] = useState<number>(() => {
        // If initialData exists, count how many advice entries are present
        if (initialData) {
            let count = 0;
            for (let i = 1; i <= 10; i++) {
                if (initialData[`ADVICE ${i}`]) {
                    count = i;
                }
            }
            // Return the count or at least 2 (default)
            return Math.max(count, 2);
        }
        return 2; // Default value
    })
    const [formData, setFormData] = useState<ReadingFormData>({
        patientId: selectedPatient?.patientId || '',

        // Doctor and department information
        'DOCTOR NAME': 'Dr. Srilatha ch',
        DEPARTMENT: 'Opthalmology',
        'REFFERED BY': 'Self',
        'PRESENT COMPLAIN': (initialData?.['PRESENT COMPLAIN'] as string) || '',
        'PREVIOUS HISTORY': (initialData?.['PREVIOUS HISTORY'] as string) || '',
        OTHERS: (initialData?.['OTHERS'] as string) || '',
        OTHERS1: (initialData?.['OTHERS1'] as string) || '',
        TEMPARATURE : (initialData?.['TEMPARATURE'] as string) || '',
        'P.R.' : (initialData?.['P.R.'] as string) || '',
        'SPO2' : (initialData?.['SPO2'] as string) || '',
        // Prescription fields
        'PRESCRIPTION 1': (initialData?.['PRESCRIPTION 1'] as string) || '',
        'DAYS 1': (initialData?.['DAYS 1'] as string) || '',
        'TIMING 1': (initialData?.['TIMING 1'] as string) || '',
        'PRESCRIPTION 2': (initialData?.['PRESCRIPTION 2'] as string) || '',
        'DAYS 2': (initialData?.['DAYS 2'] as string) || '',
        'TIMING 2': (initialData?.['TIMING 2'] as string) || '',
        'PRESCRIPTION 3': (initialData?.['PRESCRIPTION 3'] as string) || '',
        'DAYS 3': (initialData?.['DAYS 3'] as string) || '',
        'TIMING 3': (initialData?.['TIMING 3'] as string) || '',
        'PRESCRIPTION 4': (initialData?.['PRESCRIPTION 4'] as string) || '',
        'DAYS 4': (initialData?.['DAYS 4'] as string) || '',
        'TIMING 4': (initialData?.['TIMING 4'] as string) || '',
        'PRESCRIPTION 5': (initialData?.['PRESCRIPTION 5'] as string) || '',
        'DAYS 5': (initialData?.['DAYS 5'] as string) || '',
        'TIMING 5': (initialData?.['TIMING 5'] as string) || '',
        'PRESCRIPTION 6': (initialData?.['PRESCRIPTION 6'] as string) || '',
        'DAYS 6': (initialData?.['DAYS 6'] as string) || '',
        'TIMING 6': (initialData?.['TIMING 6'] as string) || '',
        'PRESCRIPTION 7': (initialData?.['PRESCRIPTION 7'] as string) || '',
        'DAYS 7': (initialData?.['DAYS 7'] as string) || '',
        'TIMING 7': (initialData?.['TIMING 7'] as string) || '',
        'PRESCRIPTION 8': (initialData?.['PRESCRIPTION 8'] as string) || '',
        'DAYS 8': (initialData?.['DAYS 8'] as string) || '',
        'TIMING 8': (initialData?.['TIMING 8'] as string) || '',
        'PRESCRIPTION 9': (initialData?.['PRESCRIPTION 9'] as string) || '',
        'DAYS 9': (initialData?.['DAYS 9'] as string) || '',
        'TIMING 9': (initialData?.['TIMING 9'] as string) || '',
        'PRESCRIPTION 10': (initialData?.['PRESCRIPTION 10'] as string) || '',
        'DAYS 10': (initialData?.['DAYS 10'] as string) || '',
        'TIMING 10': (initialData?.['TIMING 10'] as string) || '',

        // Advice fields
        'ADVICE 1': (initialData?.['ADVICE 1'] as string) || '',
        'ADVICE 2': (initialData?.['ADVICE 2'] as string) || '',
        'ADVICE 3': (initialData?.['ADVICE 3'] as string) || '',
        'ADVICE 4': (initialData?.['ADVICE 4'] as string) || '',
        'ADVICE 5': (initialData?.['ADVICE 5'] as string) || '',
        'ADVICE 6': (initialData?.['ADVICE 6'] as string) || '',
        'ADVICE 7': (initialData?.['ADVICE 7'] as string) || '',
        'ADVICE 8': (initialData?.['ADVICE 8'] as string) || '',
        'ADVICE 9': (initialData?.['ADVICE 9'] as string) || '',
        'ADVICE 10': (initialData?.['ADVICE 10'] as string) || '',

        // Additional notes and follow-up
        NOTES: (initialData?.NOTES as string) || '',
        'FOLLOW UP DATE': (initialData?.['FOLLOW UP DATE'] as string) || '',

        // Section 1: Glasses Reading (GR)
        'GR-RE-D-SPH': (initialData?.['GR-RE-D-SPH'] as string) || '',
        'GR-RE-D-CYL': (initialData?.['GR-RE-D-CYL'] as string) || '',
        'GR-RE-D-AXIS': (initialData?.['GR-RE-D-AXIS'] as string) || '',
        'GR-RE-D-VISION': (initialData?.['GR-RE-D-VISION'] as string) || '',
        'GR-RE-N-SPH': (initialData?.['GR-RE-N-SPH'] as string) || '',
        'GR-RE-N-CYL': (initialData?.['GR-RE-N-CYL'] as string) || '',
        'GR-RE-N-AXIS': (initialData?.['GR-RE-N-AXIS'] as string) || '',
        'GR-RE-N-VISION': (initialData?.['GR-RE-N-VISION'] as string) || '',
        'GR-LE-D-SPH': (initialData?.['GR-LE-D-SPH'] as string) || '',
        'GR-LE-D-CYL': (initialData?.['GR-LE-D-CYL'] as string) || '',
        'GR-LE-D-AXIS': (initialData?.['GR-LE-D-AXIS'] as string) || '',
        'GR-LE-D-VISION': (initialData?.['GR-LE-D-VISION'] as string) || '',
        'GR-LE-N-SPH': (initialData?.['GR-LE-N-SPH'] as string) || '',
        'GR-LE-N-CYL': (initialData?.['GR-LE-N-CYL'] as string) || '',
        'GR-LE-N-AXIS': (initialData?.['GR-LE-N-AXIS'] as string) || '',
        'GR-LE-N-VISION': (initialData?.['GR-LE-N-VISION'] as string) || '',
        'ADVISED FOR': (initialData?.['ADVISED FOR'] as string) || '',
        'SIGHTTYPE': (initialData?.['SIGHTTYPE'] as string) || '',

        // Section 2: Auto Refractometer (AR)
        'AR-RE-SPH': (initialData?.['AR-RE-SPH'] as string) || '',
        'AR-RE-CYL': (initialData?.['AR-RE-CYL'] as string) || '',
        'AR-RE-AXIS': (initialData?.['AR-RE-AXIS'] as string) || '',
        'AR-RE-VA': (initialData?.['AR-RE-VA'] as string) || '',
        'AR-RE-VAC.P.H': (initialData?.['AR-RE-VAC.P.H'] as string) || '',
        'AR-LE-SPH': (initialData?.['AR-LE-SPH'] as string) || '',
        'AR-LE-CYL': (initialData?.['AR-LE-CYL'] as string) || '',
        'AR-LE-AXIS': (initialData?.['AR-LE-AXIS'] as string) || '',
        'AR-LE-VA': (initialData?.['AR-LE-VA'] as string) || '',
        'AR-LE-VAC.P.H': (initialData?.['AR-LE-VAC.P.H'] as string) || '',
        PD: (initialData?.['PD'] as string) || '',

        // Section 3: Power Glass Prescription (PGP)
        'PGP-RE-D-SPH': (initialData?.['PGP-RE-D-SPH'] as string) || '',
        'PGP-RE-D-CYL': (initialData?.['PGP-RE-D-CYL'] as string) || '',
        'PGP-RE-D-AXIS': (initialData?.['PGP-RE-D-AXIS'] as string) || '',
        'PGP-RE-D-VA': (initialData?.['PGP-RE-D-VA'] as string) || '',
        'PGP-RE-N-SPH': (initialData?.['PGP-RE-N-SPH'] as string) || '',
        'PGP-RE-N-CYL': (initialData?.['PGP-RE-N-CYL'] as string) || '',
        'PGP-RE-N-AXIS': (initialData?.['PGP-RE-N-AXIS'] as string) || '',
        'PGP-RE-N-VA': (initialData?.['PGP-RE-N-VA'] as string) || '',
        'PGP-LE-D-SPH': (initialData?.['PGP-LE-D-SPH'] as string) || '',
        'PGP-LE-D-CYL': (initialData?.['PGP-LE-D-CYL'] as string) || '',
        'PGP-LE-D-AXIS': (initialData?.['PGP-LE-D-AXIS'] as string) || '',
        'PGP-LE-D-BCVA': (initialData?.['PGP-LE-D-BCVA'] as string) || '',
        'PGP-LE-N-SPH': (initialData?.['PGP-LE-N-SPH'] as string) || '',
        'PGP-LE-N-CYL': (initialData?.['PGP-LE-N-CYL'] as string) || '',
        'PGP-LE-N-AXIS': (initialData?.['PGP-LE-N-AXIS'] as string) || '',
        'PGP-LE-N-BCVA': (initialData?.['PGP-LE-N-BCVA'] as string) || '',

        // Section 4: Subjective Refraction (SR)
        'SR-RE-D-SPH': (initialData?.['SR-RE-D-SPH'] as string) || '',
        'SR-RE-D-CYL': (initialData?.['SR-RE-D-CYL'] as string) || '',
        'SR-RE-D-AXIS': (initialData?.['SR-RE-D-AXIS'] as string) || '',
        'SR-RE-D-VA': (initialData?.['SR-RE-D-VA'] as string) || '',
        'SR-RE-N-SPH': (initialData?.['SR-RE-N-SPH'] as string) || '',
        'SR-RE-N-CYL': (initialData?.['SR-RE-N-CYL'] as string) || '',
        'SR-RE-N-AXIS': (initialData?.['SR-RE-N-AXIS'] as string) || '',
        'SR-RE-N-VA': (initialData?.['SR-RE-N-VA'] as string) || '',
        'SR-LE-D-SPH': (initialData?.['SR-LE-D-SPH'] as string) || '',
        'SR-LE-D-CYL': (initialData?.['SR-LE-D-CYL'] as string) || '',
        'SR-LE-D-AXIS': (initialData?.['SR-LE-D-AXIS'] as string) || '',
        'SR-LE-D-BCVA': (initialData?.['SR-LE-D-BCVA'] as string) || '',
        'SR-LE-N-SPH': (initialData?.['SR-LE-N-SPH'] as string) || '',
        'SR-LE-N-CYL': (initialData?.['SR-LE-N-CYL'] as string) || '',
        'SR-LE-N-AXIS': (initialData?.['SR-LE-N-AXIS'] as string) || '',
        'SR-LE-N-BCVA': (initialData?.['SR-LE-N-BCVA'] as string) || '',

        // Section 5: Clinical Findings (CF) - Using the exact field names from Excel
        'CF-RE-LIDS': (initialData?.['CF-RE-LIDS'] as string) || '',
        'CF-RE-SAC': (initialData?.['CF-RE-SAC'] as string) || '',
        'CF-RE-CONJUCTIVA': (initialData?.['CF-RE-CONJUCTIVA'] as string) || '',
        'CF-RE-CORNEA': (initialData?.['CF-RE-CORNEA'] as string) || '',
        'CF-RE-A.C.': (initialData?.['CF-RE-A.C.'] as string) || '',
        'CF-RE-IRIS': (initialData?.['CF-RE-IRIS'] as string) || '',
        'CF-RE-PUPIL': (initialData?.['CF-RE-PUPIL'] as string) || '',
        'CF-RE-LENS': (initialData?.['CF-RE-LENS'] as string) || '',
        'CF-RE-TENSION': (initialData?.['CF-RE-TENSION'] as string) || '',
        'CF-RE-FUNDUS': (initialData?.['CF-RE-FUNDUS'] as string) || '',
        'CF-RE-OPTICALDISK': (initialData?.['CF-RE-OPTICALDISK'] as string) || '',
        'CF-RE-MACULA': (initialData?.['CF-RE-MACULA'] as string) || '',
        'CF-RE-VESSELS': (initialData?.['CF-RE-VESSELS'] as string) || '',
        'CF-RE-PERIPHERALRETINA': (initialData?.['CF-RE-PERIPHERALRETINA'] as string) || '',
        'CF-RE-RETINO 1': (initialData?.['CF-RE-RETINO 1'] as string) || '',
        'CF-RE-RETINO 2': (initialData?.['CF-RE-RETINO 2'] as string) || '',
        'CF-RE-RETINO 3': (initialData?.['CF-RE-RETINO 3'] as string) || '',
        'CF-RE-RETINO 4': (initialData?.['CF-RE-RETINO 4'] as string) || '',
        'CF-LE-LIDS': (initialData?.['CF-LE-LIDS'] as string) || '',
        'CF-LE-SAC': (initialData?.['CF-LE-SAC'] as string) || '',
        'CF-LE-CONJUCTIVA': (initialData?.['CF-LE-CONJUCTIVA'] as string) || '',
        'CF-LE-CORNEA': (initialData?.['CF-LE-CORNEA'] as string) || '',
        'CF-LE-A.C.': (initialData?.['CF-LE-A.C.'] as string) || '',
        'CF-LE-IRIS': (initialData?.['CF-LE-IRIS'] as string) || '',
        'CF-LE-PUPIL': (initialData?.['CF-LE-PUPIL'] as string) || '',
        'CF-LE-LENS': (initialData?.['CF-LE-LENS'] as string) || '',
        'CF-LE-TENSION': (initialData?.['CF-LE-TENSION'] as string) || '',
        'CF-LE-FUNDUS': (initialData?.['CF-LE-FUNDUS'] as string) || '',
        'CF-LE-OPTICALDISK': (initialData?.['CF-LE-OPTICALDISK'] as string) || '',
        'CF-LE-MACULA': (initialData?.['CF-LE-MACULA'] as string) || '',
        'CF-LE-VESSELS': (initialData?.['CF-LE-VESSELS'] as string) || '',
        'CF-LE-PERIPHERALRETINA': (initialData?.['CF-LE-PERIPHERALRETINA'] as string) || '',
        'CF-LE-RETINO 1': (initialData?.['CF-LE-RETINO 1'] as string) || '',
        'CF-LE-RETINO 2': (initialData?.['CF-LE-RETINO 2'] as string) || '',
        'CF-LE-RETINO 3': (initialData?.['CF-LE-RETINO 3'] as string) || '',
        'CF-LE-RETINO 4': (initialData?.['CF-LE-RETINO 4'] as string) || ''
    })

    // Update form data when selected patient changes
    useEffect(() => {
        if (selectedPatient) {
            setFormData((prevData) => ({
                ...prevData,
                patientId: selectedPatient.patientId,
                patientName: selectedPatient.name
            }))
        }
    }, [selectedPatient])

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
        const { name, value } = e.target

        // Ensure the value is always a string to match our interface
        const stringValue = typeof value === 'string' ? value : String(value)

        setFormData((prevData) => ({
            ...prevData,
            [name]: stringValue
        }))
    }

    // Handle add prescription button
    const handleAddPrescription = (): void => {
        if (visiblePrescription < 10) {
            setVisiblePrescription(visiblePrescription + 1)
        }
    }

    // Handle add advice button
    const handleAddAdvice = (): void => {
        if (visibleAdvice < 10) {
            setVisibleAdvice(visibleAdvice + 1)
        }
    }

    // Store medicine combinations for autofill (medicine name, days, timing)
    const [medicineCombinations, setMedicineCombinations] = useState<Record<string, { days: string, timing: string }>>({});

    // Load saved medicine combinations from localStorage
    useEffect(() => {
        const savedCombinations = localStorage.getItem('medicineCombinations');
        if (savedCombinations) {
            try {
                setMedicineCombinations(JSON.parse(savedCombinations));
                console.log('Loaded medicine combinations:', JSON.parse(savedCombinations));
            } catch (error) {
                console.error('Error loading saved medicine combinations:', error);
            }
        }
    }, []);

    // Track the last changed field and its value for medicine combinations
    const [lastChanged, setLastChanged] = useState<{
        prescriptionNum: string;
        field: 'medicine' | 'days' | 'timing';
        value: string;
    } | null>(null);

    // Effect to update medicine combinations when form data changes
    useEffect(() => {
        // Only run if we have a last changed field
        if (!lastChanged) return;

        const { prescriptionNum } = lastChanged;
        const medicineField = `PRESCRIPTION ${prescriptionNum}`;
        const daysField = `DAYS ${prescriptionNum}`;
        const timingField = `TIMING ${prescriptionNum}`;

        // Get current values from form data
        const medicine = formData[medicineField] as string;
        const days = formData[daysField] as string;
        const timing = formData[timingField] as string;

        // Only save if all fields are filled
        if (medicine && medicine.trim() !== '' && 
            days && days.trim() !== '' && 
            timing && timing.trim() !== '') {

            // Create updated combinations - don't depend on current medicineCombinations state
            // to avoid infinite loop
            const savedCombinations = localStorage.getItem('medicineCombinations');
            let currentCombinations = {};
            
            try {
                if (savedCombinations) {
                    currentCombinations = JSON.parse(savedCombinations);
                }
            } catch (error) {
                console.error('Error parsing saved combinations:', error);
            }
            
            const newCombinations = {
                ...currentCombinations,
                [medicine]: { days, timing }
            };
            
            // Save to localStorage first
            try {
                localStorage.setItem('medicineCombinations', JSON.stringify(newCombinations));
                console.log('Saving updated combination for:', medicine, { days, timing });
                
                // Then update state - but only if it's different to avoid loop
                if (JSON.stringify(medicineCombinations[medicine]) !== JSON.stringify({ days, timing })) {
                    setMedicineCombinations(newCombinations);
                }
            } catch (error) {
                console.error('Error saving medicine combinations:', error);
            }
            
            // Clear the last changed field to prevent repeated updates
            setLastChanged(null);
        }
    }, [formData, lastChanged]);  // Remove medicineCombinations from dependencies

    // Handle EditableCombobox changes with autofill functionality
    const handleComboboxChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ): void => {
        const { name, value } = e.target;
        
        // Update the form data with the new value
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        
        // Handle medicine field autofill
        if (name.startsWith('PRESCRIPTION ')) {
            const prescriptionNum = name.split(' ')[1];
            
            // If we have saved data for this medicine, autofill related fields
            if (medicineCombinations[value]) {
                const savedDays = medicineCombinations[value].days;
                const savedTiming = medicineCombinations[value].timing;
                
                // Autofill the days and timing fields if they're empty
                setFormData(prevData => {
                    const currentDays = prevData[`DAYS ${prescriptionNum}`] as string;
                    const currentTiming = prevData[`TIMING ${prescriptionNum}`] as string;
                    
                    return {
                        ...prevData,
                        [`DAYS ${prescriptionNum}`]: (!currentDays || currentDays === '') ? savedDays : currentDays,
                        [`TIMING ${prescriptionNum}`]: (!currentTiming || currentTiming === '') ? savedTiming : currentTiming
                    };
                });
            }
            
            // Track this change for medicine combination updates
            setLastChanged({
                prescriptionNum,
                field: 'medicine',
                value
            });
        }
        
        // Track days field changes
        else if (name.startsWith('DAYS ')) {
            const prescriptionNum = name.split(' ')[1];
            setLastChanged({
                prescriptionNum,
                field: 'days',
                value
            });
        }
        
        // Track timing field changes
        else if (name.startsWith('TIMING ')) {
            const prescriptionNum = name.split(' ')[1];
            setLastChanged({
                prescriptionNum,
                field: 'timing',
                value
            });
        }
    };

    // Helper function to extract only the changed fields from form data compared to original data
    // Helper function to compare initial data with current form data
    const hasFieldChanged = (key: string, currentValue: unknown): boolean => {
        if (!initialData) return true; // If no initial data, consider everything changed
        
        // Handle special case for numeric values
        if (typeof currentValue === 'number' && typeof initialData[key] === 'string') {
            return currentValue.toString() !== initialData[key];
        }
        
        // Handle special case for string values
        if (typeof currentValue === 'string' && typeof initialData[key] === 'number') {
            return currentValue !== initialData[key].toString();
        }
        
        // Regular comparison
        return JSON.stringify(currentValue) !== JSON.stringify(initialData[key]);
    };
    

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()


             // Filter entries to include only visible prescription/advice fields
             const visibleEntries = Object.entries(formData).filter(([key]) =>
                (key.startsWith('PRESCRIPTION') && parseInt(key.split(' ')[1]) <= visiblePrescription) ||
                (key.startsWith('ADVICE') && parseInt(key.split(' ')[1]) <= visibleAdvice) ||
                !key.startsWith('PRESCRIPTION') && !key.startsWith('ADVICE')
            );

        const changedFields: Record<string, unknown> = {};

        // If we have an initialData with an ID, we're updating an existing record
        if (initialData && initialData.id) {
            changedFields.id = initialData.id;
        }

        changedFields.patientId = formData.patientId;
        
        visibleEntries.forEach(([key, value]) => {
            if (hasFieldChanged(key, value)) {
                changedFields[key] = value;
            }
        });

        console.log('Changed fields:', changedFields)

        await onSubmit(changedFields as ReadingFormData)
    }

    // Dynamic dropdown options state
    const [dynamicPresentComplainOptions, setDynamicPresentComplainOptions] = useState<string[]>([])
    const [dynamicPreviousHistoryOptions, setDynamicPreviousHistoryOptions] = useState<string[]>([])
    const [dynamicOthersOptions, setDynamicOthersOptions] = useState<string[]>([])

    const fetchDropdownOptions = async (): Promise<void> => {
        try {
          const [presentComplainOpts, previousHistoryOpts, othersOpts] = await Promise.all([
            window.api.getDropdownOptions('presentComplainOptions'),
            window.api.getDropdownOptions('previousHistoryOptions'),
            window.api.getDropdownOptions('othersOptions')
          ])
          console.log('Dropdown options:', presentComplainOpts, previousHistoryOpts, othersOpts)
    
          // Set dynamic options - API returns { success: boolean, options?: string[], error?: string }
          const presentOptions = (presentComplainOpts as { options?: string[] })?.options || []
          const previousOptions = (previousHistoryOpts as { options?: string[] })?.options || []
          const othersOptions = (othersOpts as { options?: string[] })?.options || []
    
     
    
          setDynamicPresentComplainOptions([...new Set(presentOptions as string[])])
          setDynamicPreviousHistoryOptions([...new Set(previousOptions as string[])])
          setDynamicOthersOptions([...new Set(othersOptions as string[])])
        } catch (error) {
          console.error('Error fetching dropdown options:', error)
        }
      }

    // Helper function to add new option permanently
    const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
        try {
            console.log('Adding new option permanently:', fieldName, value)
            const response = await window.api.addDropdownOption(fieldName, value)
            console.log('Response:', response)
            // Refresh options from backend
            await fetchDropdownOptions()
        } catch (error) {
            console.error('Error adding new dropdown option:', error)
        }
    }


    // Fetch dropdown options on component mount
    useEffect(() => {
        fetchDropdownOptions()
    }, [])

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Eye Reading Form with toggle button */}
            <div onClick={() => setShowEyeReadingForm(!showEyeReadingForm)} className={`sticky top-0 bg-white z-10 py-2 flex justify-between cursor-pointer items-center ${showEyeReadingForm ? '' : 'border border-gray-500 shadow-md rounded-md '}`}>
                <h2 className="text-xl font-medium px-2">Eye Reading Form</h2>
                <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-black"
                >
                    {showEyeReadingForm ? (<>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </>

                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {/* Eye Reading Form Sections - Conditionally rendered */}
            {showEyeReadingForm && (
                <div className="space-y-4 ">
                    {/* Section 2: Auto Refractometer (AR) */}
                    <div className="p-3 rounded-md bg-gray-100 border border-gray-300 shadow-sm">
                        <h3 className="text-md font-medium mb-2 flex items-center">Auto Refractometer (AR)</h3>

                        {/* Right Eye */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Right Eye :</h4>
                            <div className="grid grid-cols-5 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SPH</label>
                                    <EditableCombobox
                                        id="AR-RE-SPH"
                                        name="AR-RE-SPH"
                                        value={formData['AR-RE-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">CYL</label>
                                    <EditableCombobox
                                        id="AR-RE-CYL"
                                        name="AR-RE-CYL"
                                        value={formData['AR-RE-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">AXIS</label>
                                    <EditableCombobox
                                        id="AR-RE-AXIS"
                                        name="AR-RE-AXIS"
                                        value={formData['AR-RE-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">VA</label>
                                    <EditableCombobox
                                        id="AR-RE-VA"
                                        name="AR-RE-VA"
                                        value={formData['AR-RE-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">VAC.P.H</label>
                                    <input
                                        type="text"
                                        name="AR-RE-VAC.P.H"
                                        value={formData['AR-RE-VAC.P.H']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye */}
                        <div className="mb-1">
                            <h4 className="text-sm font-medium mb-1">Left Eye :</h4>
                            <div className="grid grid-cols-5 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="AR-LE-SPH"
                                        name="AR-LE-SPH"
                                        value={formData['AR-LE-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="AR-LE-CYL"
                                        name="AR-LE-CYL"
                                        value={formData['AR-LE-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="AR-LE-AXIS"
                                        name="AR-LE-AXIS"
                                        value={formData['AR-LE-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="AR-LE-VA"
                                        name="AR-LE-VA"
                                        value={formData['AR-LE-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="AR-LE-VAC.P.H"
                                        value={formData['AR-LE-VAC.P.H']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2">
                            <label className="block text-xs font-medium text-gray-700">PD</label>
                            <input
                                type="text"
                                name="PD"
                                value={formData['PD']}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    {/* Section 1: Glasses Reading (GR) */}
                    <div className="bg-gray-100 border border-gray-300 shadow-sm p-3 rounded-md">
                        <h3 className="text-md font-medium mb-2 flex items-center">Glasses Reading (GR)</h3>

                        {/* Right Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Right Eye - Distance:</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SPH</label>
                                    <EditableCombobox
                                        id="GR-RE-D-SPH"
                                        name="GR-RE-D-SPH"
                                        value={formData['GR-RE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">CYL</label>
                                    <EditableCombobox
                                        id="GR-RE-D-CYL"
                                        name="GR-RE-D-CYL"
                                        value={formData['GR-RE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">AXIS</label>
                                    <EditableCombobox
                                        id="GR-RE-D-AXIS"
                                        name="GR-RE-D-AXIS"
                                        value={formData['GR-RE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">VISION</label>
                                    <EditableCombobox
                                        id="GR-RE-D-VISION"
                                        name="GR-RE-D-VISION"
                                        value={formData['GR-RE-D-VISION']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Eye - Near */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="GR-RE-N-SPH"
                                        name="GR-RE-N-SPH"
                                        value={formData['GR-RE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-RE-N-CYL"
                                        name="GR-RE-N-CYL"
                                        value={formData['GR-RE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-RE-N-AXIS"
                                        name="GR-RE-N-AXIS"
                                        value={formData['GR-RE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-RE-N-VISION"
                                        name="GR-RE-N-VISION"
                                        value={formData['GR-RE-N-VISION']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-D-SPH"
                                        name="GR-LE-D-SPH"
                                        value={formData['GR-LE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-D-CYL"
                                        name="GR-LE-D-CYL"
                                        value={formData['GR-LE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-D-AXIS"
                                        name="GR-LE-D-AXIS"
                                        value={formData['GR-LE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-D-VISION"
                                        name="GR-LE-D-VISION"
                                        value={formData['GR-LE-D-VISION']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Near */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-N-SPH"
                                        name="GR-LE-N-SPH"
                                        value={formData['GR-LE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-N-CYL"
                                        name="GR-LE-N-CYL"
                                        value={formData['GR-LE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-N-AXIS"
                                        name="GR-LE-N-AXIS"
                                        value={formData['GR-LE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="GR-LE-N-VISION"
                                        name="GR-LE-N-VISION"
                                        value={formData['GR-LE-N-VISION']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-1 px-2 text-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Power Glass Prescription (PGP) */}
                    <div className="bg-gray-100 border border-gray-300 shadow-sm  p-3 rounded-md">
                        <h3 className="text-md font-medium mb-2 flex items-center">
                            Previous Glass Prescription (PGP)
                        </h3>

                        {/* Right Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Right Eye - Distance :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SPH</label>
                                    <EditableCombobox
                                        id="PGP-RE-D-SPH"
                                        name="PGP-RE-D-SPH"
                                        value={formData['PGP-RE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">CYL</label>
                                    <EditableCombobox
                                        id="PGP-RE-D-CYL"
                                        name="PGP-RE-D-CYL"
                                        value={formData['PGP-RE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">AXIS</label>
                                    <EditableCombobox
                                        id="PGP-RE-D-AXIS"
                                        name="PGP-RE-D-AXIS"
                                        value={formData['PGP-RE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">VA</label>
                                    <EditableCombobox
                                        id="PGP-RE-D-VA"
                                        name="PGP-RE-D-VA"
                                        value={formData['PGP-RE-D-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Eye - Near */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="PGP-RE-N-SPH"
                                        name="PGP-RE-N-SPH"
                                        value={formData['PGP-RE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-RE-N-CYL"
                                        name="PGP-RE-N-CYL"
                                        value={formData['PGP-RE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-RE-N-AXIS"
                                        name="PGP-RE-N-AXIS"
                                        value={formData['PGP-RE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-RE-N-VA"
                                        name="PGP-RE-N-VA"
                                        value={formData['PGP-RE-N-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-D-SPH"
                                        name="PGP-LE-D-SPH"
                                        value={formData['PGP-LE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-D-CYL"
                                        name="PGP-LE-D-CYL"
                                        value={formData['PGP-LE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-D-AXIS"
                                        name="PGP-LE-D-AXIS"
                                        value={formData['PGP-LE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-D-BCVA"
                                        name="PGP-LE-D-BCVA"
                                        value={formData['PGP-LE-D-BCVA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Near */}
                        <div className="mb-1">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-N-SPH"
                                        name="PGP-LE-N-SPH"
                                        value={formData['PGP-LE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-N-CYL"
                                        name="PGP-LE-N-CYL"
                                        value={formData['PGP-LE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-N-AXIS"
                                        name="PGP-LE-N-AXIS"
                                        value={formData['PGP-LE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="PGP-LE-N-BCVA"
                                        name="PGP-LE-N-BCVA"
                                        value={formData['PGP-LE-N-BCVA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Present Glass Prescription */}
                    <div className="bg-gray-100 p-3 rounded-md shadow-sm border border-gray-300">
                        <h3 className="text-md font-medium mb-2 flex items-center">Present Glass Prescription</h3>

                        {/* Right Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Right Eye - Distance :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SPH</label>
                                    <EditableCombobox
                                        id="SR-RE-D-SPH"
                                        name="SR-RE-D-SPH"
                                        value={formData['SR-RE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">CYL</label>
                                    <EditableCombobox
                                        id="SR-RE-D-CYL"
                                        name="SR-RE-D-CYL"
                                        value={formData['SR-RE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">AXIS</label>
                                    <EditableCombobox
                                        id="SR-RE-D-AXIS"
                                        name="SR-RE-D-AXIS"
                                        value={formData['SR-RE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">VA</label>
                                    <EditableCombobox
                                        id="SR-RE-D-VA"
                                        name="SR-RE-D-VA"
                                        value={formData['SR-RE-D-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Eye - Near */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="SR-RE-N-SPH"
                                        name="SR-RE-N-SPH"
                                        value={formData['SR-RE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-RE-N-CYL"
                                        name="SR-RE-N-CYL"
                                        value={formData['SR-RE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-RE-N-AXIS"
                                        name="SR-RE-N-AXIS"
                                        value={formData['SR-RE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-RE-N-VA"
                                        name="SR-RE-N-VA"
                                        value={formData['SR-RE-N-VA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Distance */}
                        <div className="mb-3">
                            <h4 className="text-sm font-medium mb-1">Left Eye - Distance :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-D-SPH"
                                        name="SR-LE-D-SPH"
                                        value={formData['SR-LE-D-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-D-CYL"
                                        name="SR-LE-D-CYL"
                                        value={formData['SR-LE-D-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-D-AXIS"
                                        name="SR-LE-D-AXIS"
                                        value={formData['SR-LE-D-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-D-BCVA"
                                        name="SR-LE-D-BCVA"
                                        value={formData['SR-LE-D-BCVA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye - Near */}
                        <div className="mb-1">
                            <h4 className="text-sm font-medium mb-1">Near :</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-N-SPH"
                                        name="SR-LE-N-SPH"
                                        value={formData['SR-LE-N-SPH']}
                                        options={sphOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-N-CYL"
                                        name="SR-LE-N-CYL"
                                        value={formData['SR-LE-N-CYL']}
                                        options={cylOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-N-AXIS"
                                        name="SR-LE-N-AXIS"
                                        value={formData['SR-LE-N-AXIS']}
                                        options={axisOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <EditableCombobox
                                        id="SR-LE-N-BCVA"
                                        name="SR-LE-N-BCVA"
                                        value={formData['SR-LE-N-BCVA']}
                                        options={vaOptions}
                                        onChange={handleComboboxChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-md font-semibold focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sight Type Options */}
                        <div className="mt-4 border-t pt-3 border-gray-300 w-full">
                            <h4 className="text-sm font-medium mb-2">Sight Type:</h4>
                            <div className="flex flex-wrap justify-between gap-4">
                                {[
                                    { id: 'distant', label: 'Distant' },
                                    { id: 'near', label: 'Near' },
                                    { id: 'bifocal', label: 'Bifocal' },
                                    { id: 'progressive', label: 'Progressive' },
                                    { id: 'photochromatic', label: 'Photochromatic' },
                                    { id: 'brc-hmc', label: 'BRC HMC' }
                                ].map((option) => (
                                    <div key={option.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`sight-type-${option.id}`}
                                            checked={typeof formData['SIGHTTYPE'] === 'string' && (formData['SIGHTTYPE'].includes(`${option.label}/`) || formData['SIGHTTYPE'].includes(`/${option.label}`) || formData['SIGHTTYPE'] === option.label || formData['SIGHTTYPE'].endsWith(`/${option.label}`)) || false}
                                            onChange={(e) => {
                                                const currentValues = typeof formData['SIGHTTYPE'] === 'string' ? formData['SIGHTTYPE'].split('/') : [];
                                                let newValues: string[];
                                                
                                                if (e.target.checked) {
                                                    // Add the value if it doesn't exist
                                                    if (!currentValues.includes(option.label)) {
                                                        newValues = [...currentValues, option.label];
                                                    } else {
                                                        newValues = currentValues;
                                                    }
                                                } else {
                                                    // Remove the value
                                                    newValues = currentValues.filter(val => val !== option.label);
                                                }
                                                
                                                // Join with '/' and update form data
                                                const newSightType = newValues.join('/');
                                                setFormData({
                                                    ...formData,
                                                    'SIGHTTYPE': newSightType
                                                });
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`sight-type-${option.id}`} className="ml-2 text-sm text-gray-700">
                                            {option.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Clinical Findings (CF) */}
                    <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
                        <h3 className="text-md font-medium mb-2 flex items-center">Clinical Findings (CF)</h3>

                        {/* Right Eye Clinical Findings */}
                        <div className="mb-3  p-3 rounded-md">
                            <h4 className="text-sm font-medium mb-1 ">Right Eye:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Lid</label>
                                    <input
                                        type="text"
                                        name="CF-RE-LIDS"
                                        value={formData['CF-RE-LIDS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SAC</label>
                                    <input
                                        type="text"
                                        name="CF-RE-SAC"
                                        value={formData['CF-RE-SAC']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Cornea</label>
                                    <input
                                        type="text"
                                        name="CF-RE-CORNEA"
                                        value={formData['CF-RE-CORNEA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
                                    <input
                                        type="text"
                                        name="CF-RE-CONJUCTIVA"
                                        value={formData['CF-RE-CONJUCTIVA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
                                    <input
                                        type="text"
                                        name="CF-RE-A.C."
                                        value={formData['CF-RE-A.C.']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Iris</label>
                                    <input
                                        type="text"
                                        name="CF-RE-IRIS"
                                        value={formData['CF-RE-IRIS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Pupil</label>
                                    <input
                                        type="text"
                                        name="CF-RE-PUPIL"
                                        value={formData['CF-RE-PUPIL']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Lens</label>
                                    <input
                                        type="text"
                                        name="CF-RE-LENS"
                                        value={formData['CF-RE-LENS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="hidden">
                                    <label className="block text-xs font-medium text-gray-700">Tension</label>
                                    <input
                                        type="text"
                                        name="CF-RE-TENSION"
                                        value={formData['CF-RE-TENSION']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Fundus</label>
                                    <input
                                        type="text"
                                        name="CF-RE-FUNDUS"
                                        value={formData['CF-RE-FUNDUS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Optical Disk</label>
                                    <input
                                        type="text"
                                        name="CF-RE-OPTICALDISK"
                                        value={formData['CF-RE-OPTICALDISK']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Macula</label>
                                    <input
                                        type="text"
                                        name="CF-RE-MACULA"
                                        value={formData['CF-RE-MACULA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Vessels</label>
                                    <input
                                        type="text"
                                        name="CF-RE-VESSELS"
                                        value={formData['CF-RE-VESSELS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Peripheral Retina</label>
                                    <input
                                        type="text"
                                        name="CF-RE-PERIPHERALRETINA"
                                        value={formData['CF-RE-PERIPHERALRETINA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 1</label>
                                    <input
                                        type="text"
                                        name="CF-RE-RETINO 1"
                                        value={formData['CF-RE-RETINO 1']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 2</label>
                                    <input
                                        type="text"
                                        name="CF-RE-RETINO 2"
                                        value={formData['CF-RE-RETINO 2']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 3</label>
                                    <input
                                        type="text"
                                        name="CF-RE-RETINO 3"
                                        value={formData['CF-RE-RETINO 3']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 4</label>
                                    <input
                                        type="text"
                                        name="CF-RE-RETINO 4"
                                        value={formData['CF-RE-RETINO 4']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Left Eye Clinical Findings */}
                        <div className="mb-3 p-3 rounded-md">
                            <h4 className="text-sm font-medium mb-1">Left Eye:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Lids</label>
                                    <input
                                        type="text"
                                        name="CF-LE-LIDS"
                                        value={formData['CF-LE-LIDS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">SAC</label>
                                    <input
                                        type="text"
                                        name="CF-LE-SAC"
                                        value={formData['CF-LE-SAC']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Cornea</label>
                                    <input
                                        type="text"
                                        name="CF-LE-CORNEA"
                                        value={formData['CF-LE-CORNEA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
                                    <input
                                        type="text"
                                        name="CF-LE-CONJUCTIVA"
                                        value={formData['CF-LE-CONJUCTIVA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
                                    <input
                                        type="text"
                                        name="CF-LE-A.C."
                                        value={formData['CF-LE-A.C.']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Iris</label>
                                    <input
                                        type="text"
                                        name="CF-LE-IRIS"
                                        value={formData['CF-LE-IRIS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Pupil</label>
                                    <input
                                        type="text"
                                        name="CF-LE-PUPIL"
                                        value={formData['CF-LE-PUPIL']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Lens</label>
                                    <input
                                        type="text"
                                        name="CF-LE-LENS"
                                        value={formData['CF-LE-LENS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="hidden">
                                    <label className="block text-xs font-medium text-gray-700">Tension</label>
                                    <input
                                        type="text"
                                        name="CF-LE-TENSION"
                                        value={formData['CF-LE-TENSION']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Fundus</label>
                                    <input
                                        type="text"
                                        name="CF-LE-FUNDUS"
                                        value={formData['CF-LE-FUNDUS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Optical Disk</label>
                                    <input
                                        type="text"
                                        name="CF-LE-OPTICALDISK"
                                        value={formData['CF-LE-OPTICALDISK']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Macula</label>
                                    <input
                                        type="text"
                                        name="CF-LE-MACULA"
                                        value={formData['CF-LE-MACULA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Vessels</label>
                                    <input
                                        type="text"
                                        name="CF-LE-VESSELS"
                                        value={formData['CF-LE-VESSELS']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Peripheral Retina</label>
                                    <input
                                        type="text"
                                        name="CF-LE-PERIPHERALRETINA"
                                        value={formData['CF-LE-PERIPHERALRETINA']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 1 </label>
                                    <input
                                        type="text"
                                        name="CF-LE-RETINO 1"
                                        value={formData['CF-LE-RETINO 1']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 2</label>
                                    <input
                                        type="text"
                                        name="CF-LE-RETINO 2"
                                        value={formData['CF-LE-RETINO 2']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 3</label>
                                    <input
                                        type="text"
                                        name="CF-LE-RETINO 3"
                                        value={formData['CF-LE-RETINO 3']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Retino 4</label>
                                    <input
                                        type="text"
                                        name="CF-LE-RETINO 4"
                                        value={formData['CF-LE-RETINO 4']}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                </div>)}
            {/* Prescription Section */}
            <div className="mt-8 bg-white shadow rounded-lg p-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 sticky top-0 bg-white z-10 py-2 flex justify-between items-center">Prescription Form</h2>

                {/* Vital Signs Section */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* TEMPARATURE */}
                        <div>
                            <label htmlFor="TEMPARATURE" className="block text-sm font-medium text-gray-700">
                                Temperature (°F)
                            </label>
                            <input
                                type="number"
                                name="TEMPARATURE"
                                id="TEMPARATURE"
                                step="0.1"
                                value={(formData.TEMPARATURE as number) || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* P.R. (Pulse Rate) */}
                        <div>
                            <label htmlFor="P.R." className="block text-sm font-medium text-gray-700">
                                Pulse Rate (bpm)
                            </label>
                            <input
                                type="number"
                                name="P.R."
                                id="P.R."
                                value={(formData['P.R.'] as number) || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* SPO2 */}
                        <div>
                            <label htmlFor="SPO2" className="block text-sm font-medium text-gray-700">
                                SPO2 (%)
                            </label>
                            <input
                                type="number"
                                name="SPO2"
                                id="SPO2"
                                min="0"
                                max="100"
                                value={(formData.SPO2 as number) || ''}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>



                {/* Patient Complaint Section */}
                <div className="bg-gray-50 p-4 rounded-md my-6 border border-gray-300">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Present Complain */}
                        <div>
                            <label htmlFor="PRESENT COMPLAIN" className="block text-sm font-medium text-gray-700">
                                Present Complain
                            </label>
                            <EditableCombobox
                                id="PRESENT COMPLAIN"
                                name="PRESENT COMPLAIN"
                                value={(formData['PRESENT COMPLAIN'] as string) || ''}
                                options={dynamicPresentComplainOptions}
                                onChange={handleChange}
                                onAddNewOption={(_fieldName, value) =>
                                    addNewOptionPermanently('presentComplainOptions', value)
                                }
                                placeholder="Select or type present complain..."
                                className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md  py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Previous History */}
                        <div>
                            <label htmlFor="PREVIOUS HISTORY" className="block text-sm font-medium text-gray-700">
                                Previous History
                            </label>
                            <EditableCombobox
                                id="PREVIOUS HISTORY"
                                name="PREVIOUS HISTORY"
                                value={(formData['PREVIOUS HISTORY'] as string) || ''}
                                options={dynamicPreviousHistoryOptions}
                                onChange={handleChange}
                                onAddNewOption={(_fieldName, value) =>
                                    addNewOptionPermanently('previousHistoryOptions', value)
                                }
                                placeholder="Select or type previous history..."
                                className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md  py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Others */}
                        <div>
                            <label htmlFor="OTHERS" className="block text-sm font-medium text-gray-700">
                                Diagnosis
                            </label>
                            <EditableCombobox
                                id="OTHERS"
                                name="OTHERS"
                                value={(formData['OTHERS'] as string) || ''}
                                options={dynamicOthersOptions}
                                onChange={handleChange}
                                onAddNewOption={(_fieldName, value) =>
                                    addNewOptionPermanently('othersOptions', value)
                                }
                                placeholder="Select or type other information..."
                                className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md  py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Others1 */}
                        <div className="hidden">
                            <label htmlFor="OTHERS1" className="block text-sm font-medium text-gray-700">
                                Others1
                            </label>
                            <EditableCombobox
                                id="OTHERS1"
                                name="OTHERS1"
                                value={(formData['OTHERS1'] as string) || ''}
                                options={dynamicOthersOptions}
                                onChange={handleChange}
                                onAddNewOption={(_fieldName, value) =>
                                    addNewOptionPermanently('othersOptions', value)
                                }
                                placeholder="Select or type additional information..."
                            />
                        </div>
                    </div>
                </div>



                {/* Medicines Section */}
                <div className="mb-6 border border-gray-300 rounded-md p-4 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medicines</h3>
                    <div className="space-y-4">
                        {Array.from({ length: visiblePrescription }).map((_, index) => {
                            const prescriptionNum = index + 1
                            return (
                                <div key={prescriptionNum} className="grid grid-cols-3 gap-4">
                                    {/* Medicine Name */}
                                    <div>
                                        <label htmlFor={`PRESCRIPTION ${prescriptionNum}`} className="block text-sm font-medium text-gray-700">
                                            Medicine {prescriptionNum}
                                        </label>
                                        <EditableCombobox
                                            id={`PRESCRIPTION ${prescriptionNum}`}
                                            name={`PRESCRIPTION ${prescriptionNum}`}
                                            value={formData[`PRESCRIPTION ${prescriptionNum}`] as string}
                                            onChange={handleComboboxChange}
                                            options={medicineOptions}
                                            className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Select or type medicine"
                                        />
                                    </div>

                                    {/* Days */}
                                    <div>
                                        <label htmlFor={`DAYS ${prescriptionNum}`} className="block text-sm font-medium text-gray-700">
                                            Days
                                        </label>
                                        <input
                                            type="text"
                                            name={`DAYS ${prescriptionNum}`}
                                            id={`DAYS ${prescriptionNum}`}
                                            value={formData[`DAYS ${prescriptionNum}`] as string}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Number of days"
                                        />
                                    </div>

                                    {/* Timing */}
                                    <div>
                                        <label htmlFor={`TIMING ${prescriptionNum}`} className="block text-sm font-medium text-gray-700">
                                            Timing
                                        </label>
                                        <EditableCombobox
                                            id={`TIMING ${prescriptionNum}`}
                                            name={`TIMING ${prescriptionNum}`}
                                            value={formData[`TIMING ${prescriptionNum}`] as string}
                                            onChange={handleComboboxChange}
                                            options={timingOptions}
                                            className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Select or type timing"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {visiblePrescription < 10 && (
                        <button
                            type="button"
                            onClick={handleAddPrescription}
                            className="mt-4 inline-flex items-center cursor-pointer justify-end px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Add More Medicines
                        </button>
                    )}
                </div>

                {/* Advice Section */}
                <div className="mb-6 border border-gray-300 rounded-md p-4 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Advice / Investigations</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: visibleAdvice }).map((_, index) => {
                            const adviceNum = index + 1
                            return (
                                <div key={adviceNum}>
                                    <label htmlFor={`ADVICE ${adviceNum}`} className="block text-sm font-medium text-gray-700">
                                        Investigation {adviceNum}
                                    </label>
                                    <EditableCombobox
                                        id={`ADVICE ${adviceNum}`}
                                        name={`ADVICE ${adviceNum}`}
                                        value={formData[`ADVICE ${adviceNum}`] as string}
                                        onChange={handleComboboxChange}
                                        options={adviceOptions}
                                        className="mt-1 block w-full border border-gray-300 bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Select or type advice"
                                    />
                                </div>
                            )
                        })}
                    </div>
                    {visibleAdvice < 10 && (
                        <button
                            type="button"
                            onClick={handleAddAdvice}
                            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-black"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                            Add More Advice
                        </button>
                    )}
                </div>

                {/* Additional Notes Section */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-300">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* NOTES */}
                        <div>
                            <label htmlFor="NOTES" className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <input
                                type="text"
                                name="NOTES"
                                id="NOTES"
                                value={formData.NOTES as string}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Additional notes"
                            />
                        </div>

                        {/* FOLLOW UP DATE */}
                        <div>
                            <label htmlFor="FOLLOW UP DATE" className="block text-sm font-medium text-gray-700">
                                Follow Up Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="FOLLOW UP DATE"
                                    id="FOLLOW UP DATE"
                                    value={formData['FOLLOW UP DATE'] as string}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 text-black bg-white font-semibold rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Click to select a date</p>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default CombinedForm
