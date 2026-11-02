import { VITAL_RANGES, medicineInstruction, verifyQrPath } from '@/contract';
import type {
  LetterheadSnapshot,
  LocationView,
  MeView,
  PatientView,
  PracticeView,
  PrescriptionView,
  VitalsView,
} from '@/contract';
import { DAYS } from '@/constants/days';
import type { DayKey } from '@/constants/days';
import { printCopy } from '@/constants/printCopy';
import { WEIGHT_UNIT } from '@/features/vitals';
import { API_BASE_URL } from '@/lib/api';
import { addDays, formatPrintDate, formatWeekdayDate } from '@/utils/date';
import { formatDays } from '@/utils/days';
import { formatE164 } from '@/utils/phone';
import { doctorTitle, signatureName } from '@/utils/text';
import type { Printout } from '@/types/printout';
import { formatTimeLabel } from '@/utils/time';

import { DoseLang, RxStatus } from './constants';
import { rxCopy } from './copy';

type Letterhead = Pick<
  LetterheadSnapshot,
  | 'doctorName'
  | 'speciality'
  | 'qualifications'
  | 'pmdcNo'
  | 'locationName'
  | 'address'
  | 'phone'
  | 'timings'
  | 'letterhead'
>;

function displayPhone(phone: string): string {
  return phone.startsWith('+') ? formatE164(phone) : phone;
}

/** "Mon–Sat · 5:00 pm – 9:00 pm" from the location's opening hours. */
function schedule(timings: Letterhead['timings']): string {
  const open = timings.filter((timing) => !timing.closed);
  if (open.length === 0) return '';
  const days = DAYS.filter((day: DayKey) => open.some((t) => t.day === day));
  const hours = `${formatTimeLabel(open[0].from)} – ${formatTimeLabel(open[0].to)}`;
  return `${formatDays(days)} · ${hours}`;
}

/** "1+0+1", or "SOS". */
function compactDose(
  pattern: PrescriptionView['sections']['medicines'][number]['pattern'],
) {
  return 'sos' in pattern
    ? rxCopy.sos
    : `${pattern.m}+${pattern.a}+${pattern.n}`;
}

function vitalsLine(vitals: VitalsView | null): Printout['vitals'] {
  if (!vitals) return [];
  const v = printCopy.vital;
  const rows: (Printout['vitals'][number] | null)[] = [
    vitals.bp
      ? {
          key: 'bp',
          label: v.bp,
          value: `${vitals.bp} ${VITAL_RANGES.systolic.unit}`,
        }
      : null,
    vitals.pulse !== null
      ? {
          key: 'pulse',
          label: v.pulse,
          value: `${vitals.pulse}${VITAL_RANGES.pulse.unit}`,
        }
      : null,
    vitals.tempF !== null
      ? {
          key: 'temp',
          label: v.temp,
          value: `${vitals.tempF}${VITAL_RANGES.tempF.unit}`,
        }
      : null,
    vitals.weightKg !== null
      ? {
          key: 'weight',
          label: v.weight,
          value: `${vitals.weightKg} ${WEIGHT_UNIT}`,
        }
      : null,
    vitals.spo2 !== null
      ? {
          key: 'spo2',
          label: v.spo2,
          value: `${vitals.spo2}${VITAL_RANGES.spo2.unit}`,
        }
      : null,
  ];
  return rows.filter((row): row is Printout['vitals'][number] => row !== null);
}

/**
 * Word the page. An approved prescription prints its frozen letterhead; a
 * draft shows the clinic as it is today.
 */
export function buildPrintout(input: {
  rx: PrescriptionView;
  patient: PatientView;
  vitals: VitalsView | null;
  me: MeView | null;
  practice: PracticeView | null;
  location: LocationView | null;
  today: Date;
}): Printout {
  const { rx, patient, vitals, me, practice, location, today } = input;
  const isDraft = rx.status === RxStatus.draft;

  const letterhead: Letterhead = rx.letterheadSnapshot ?? {
    doctorName: me?.name ?? '',
    speciality: practice?.speciality ?? '',
    qualifications: practice?.qualifications ?? [],
    pmdcNo: practice?.pmdcNo ?? '',
    locationName: location?.name ?? '',
    address: location?.address ?? '',
    phone: location?.phone ?? '',
    timings: location?.timings ?? [],
    letterhead: location?.letterhead ?? { en: '', ur: '' },
  };
  const issuedOn = rx.approvedAt ?? today;
  const { sections } = rx;
  const followUp = sections.followUp;
  const dueDate =
    followUp.date !== null
      ? new Date(followUp.date)
      : followUp.inDays !== null
        ? addDays(issuedOn, followUp.inDays)
        : null;
  const doctorName = doctorTitle(letterhead.doctorName);
  const phone = displayPhone(letterhead.phone);

  return {
    isDraft,
    doctor: {
      name: doctorName,
      qualifications: letterhead.qualifications.join(', '),
      speciality: letterhead.speciality,
      pmdc: letterhead.pmdcNo ? printCopy.pmdc(letterhead.pmdcNo) : '',
    },
    clinic: {
      name: letterhead.locationName,
      address: letterhead.address,
      schedule: schedule(letterhead.timings),
      phone: phone ? printCopy.appointments(phone) : '',
    },
    patient: {
      name: patient.name,
      ageSex: printCopy.ageSexValue(patient.age, printCopy.sex[patient.sex]),
      mrNo: patient.mrNo,
      date: formatPrintDate(issuedOn),
    },
    vitals: vitalsLine(vitals),
    allergy:
      patient.allergies.length > 0
        ? printCopy.allergy(patient.allergies.join(', '))
        : null,
    diagnosis: sections.diagnosis.map((item) => item.text),
    complaints: sections.complaints.map((item) => item.text),
    investigations: sections.labs.map((item) => item.text),
    followUp: dueDate
      ? { date: formatWeekdayDate(dueDate), note: followUp.note }
      : null,
    medicines: sections.medicines.map((medicine) => ({
      id: medicine.id,
      title: [
        printCopy.formAbbrev[medicine.form],
        medicine.name,
        medicine.strength,
      ]
        .filter(Boolean)
        .join(' '),
      en: medicineInstruction(medicine, DoseLang.en),
      ur: medicineInstruction(medicine, DoseLang.ur),
      dose: compactDose(medicine.pattern),
      duration:
        medicine.durationDays > 0 ? rxCopy.days(medicine.durationDays) : '',
    })),
    avoid: sections.dietAvoid.map((item) => item.text),
    eatMore: sections.dietEat.map((item) => item.text),
    advice: sections.advice.map((item) => item.text),
    rxNumber: rx.number,
    verifyQrUrl:
      !isDraft && rx.verification
        ? `${API_BASE_URL}${verifyQrPath(rx.verification.code)}`
        : null,
    signature: signatureName(letterhead.doctorName),
    signedBy: doctorName,
  };
}
