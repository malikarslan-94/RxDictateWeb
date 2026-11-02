export const verificationCopy = {
  title: 'Prescription check',
  checking: 'Checking this prescription…',
  valid: {
    title: 'Genuine prescription',
    line: (doctor: string, date: string) => `Approved by ${doctor} on ${date}.`,
  },
  replaced: {
    title: 'Replaced by a newer prescription',
    line: (number: string, date: string) =>
      `Replaced by Rx ID ${number} on ${date}. Ask the patient for the newer printout.`,
  },
  notFound: {
    title: 'We couldn’t find this prescription',
    line: 'The code may be wrong, or the printout may not be genuine. Check with the clinic before dispensing.',
  },
  rxId: (number: string) => `Rx ID ${number}`,
  sections: {
    doctor: 'Doctor',
    clinic: 'Clinic',
    patient: 'Patient',
    medicines: 'Medicines',
  },
  pmdc: (number: string) => `PMDC ${number}`,
  detail: (parts: string[]) => parts.filter(Boolean).join(' · '),
  compare:
    'Compare this with the paper. Anything added or changed by hand isn’t part of the prescription.',
} as const;
