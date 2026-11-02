import type { PrescriptionSections, Sex } from '@/contract';

type MedicineForm = PrescriptionSections['medicines'][number]['form'];

/** Words on the printed page. Matches the server's print template. */
export const printCopy = {
  title: 'Preview',
  draftMark: 'Draft',
  pmdc: (no: string) => `PMDC Reg. No. ${no}`,
  appointments: (phone: string) => `Appointments: ${phone}`,
  patient: 'Patient',
  ageSex: 'Age / Sex',
  mrNo: 'MR No.',
  date: 'Date',
  ageSexValue: (age: number | null, sex: string) =>
    age === null ? sex : `${age} Y / ${sex}`,
  sex: { male: 'Male', female: 'Female', other: 'Other' } satisfies Record<
    Sex,
    string
  >,
  allergy: (list: string) => `Allergy: ${list}`,
  sections: {
    diagnosis: 'Diagnosis',
    complaints: 'Complaints',
    investigations: 'Tests advised',
    followUp: 'Follow-up',
    avoid: 'Avoid',
    eatMore: 'Eat more',
    advice: 'Advice',
  },
  rx: 'Rx',
  table: {
    index: '#',
    medicine: 'Medicine & instructions',
    dose: 'Dose',
    duration: 'Duration',
  },
  /** "Tab. Amlodipine 5 mg". */
  formAbbrev: {
    tab: 'Tab.',
    cap: 'Cap.',
    syp: 'Syp.',
    inj: 'Inj.',
    drops: 'Drops',
    cream: 'Cream',
    ointment: 'Oint.',
    sachet: 'Sachet',
    spray: 'Spray',
    other: '',
  } satisfies Record<MedicineForm, string>,
  rxId: (number: string) => `Rx ID: ${number}`,
  qr: 'QR',
  qrLabel: 'QR code to check this prescription',
  vitalsTitle: 'Vitals',
  approvedElectronically: 'Approved electronically by the doctor',
  issued: 'Issued electronically · approved by doctor',
  notYetValid: 'Not valid until the doctor approves it',
  signature: 'Signature',
  notValid: 'Not valid for medico-legal purposes',
  emergency: (phone: string) => `Emergency: ${phone}`,
  vital: {
    bp: 'BP',
    pulse: 'Pulse',
    temp: 'Temp',
    weight: 'Weight',
    spo2: 'SpO₂',
  },
} as const;
