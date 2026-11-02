import { DAYS } from '@/constants/days';
import type { DayKey } from '@/constants/days';
import type { LocationView, Timing } from '@/contract';
import { printCopy } from '@/constants/printCopy';
import type { Printout } from '@/types/printout';
import { formatPrintDate } from '@/utils/date';
import { formatDays } from '@/utils/days';
import { formatE164 } from '@/utils/phone';
import { doctorTitle, signatureName } from '@/utils/text';
import { formatTimeRange } from '@/utils/time';

import {
  DEFAULT_CLINIC_DAYS,
  DEFAULT_CLOSES_AT,
  DEFAULT_OPENS_AT,
} from './constants';
import { clinicCopy } from './copy';
import type { LocationFormInput, LocationFormValues } from './schemas';

/** One timing per selected day, all with the same hours. */
export function toTimings(
  days: readonly DayKey[],
  opensAt: string,
  closesAt: string,
): Timing[] {
  return days.map((day) => ({
    day,
    from: opensAt,
    to: closesAt,
    closed: false,
  }));
}

/** "Mon–Sat · 5–9 pm". Hours are left out until both are chosen. */
export function scheduleLine(
  days: readonly DayKey[],
  opensAt: string,
  closesAt: string,
): string {
  const hours = opensAt && closesAt ? formatTimeRange(opensAt, closesAt) : '';
  return [formatDays(days), hours].filter(Boolean).join(' · ');
}

/**
 * A stored location as the form edits it. The form has one set of hours for
 * every open day, so it starts from the first open day's.
 */
export function toLocationForm(location: LocationView): LocationFormInput {
  const open = location.timings.filter((timing) => !timing.closed);
  const days = DAYS.filter((day) => open.some((timing) => timing.day === day));
  return {
    name: location.name,
    address: location.address,
    province: location.province ?? '',
    city: location.city ?? '',
    phone: location.phone,
    days: days.length > 0 ? days : DEFAULT_CLINIC_DAYS,
    opensAt: open[0]?.from ?? DEFAULT_OPENS_AT,
    closesAt: open[0]?.to ?? DEFAULT_CLOSES_AT,
  };
}

/**
 * What a saved location form sends. The form doesn't edit the letterhead
 * lines, so a saved location keeps the ones it has.
 */
export function toLocationBody(
  values: LocationFormValues,
  letterhead = { en: '', ur: '' },
) {
  return {
    name: values.name,
    address: values.address,
    // Blank is "not said"; the server writes the city in title case.
    province: values.province || null,
    city: values.city || null,
    phone: values.phone,
    timings: toTimings(values.days, values.opensAt, values.closesAt),
    letterhead,
  };
}

/** What a letterhead preview needs, as typed so far. */
export type LetterheadDraft = {
  doctorName: string;
  qualifications: string;
  speciality: string;
  pmdcNo: string;
  clinicName: string;
  address: string;
  phone: string;
  schedule: string;
};

/**
 * A made-up prescription under the clinic's real letterhead, so the doctor
 * sees how the top of the page will look as they type it.
 */
export function samplePrintout(
  draft: LetterheadDraft,
  today: Date = new Date(),
): Printout {
  const sample = clinicCopy.sample;
  const phone = draft.phone.startsWith('+')
    ? formatE164(draft.phone)
    : draft.phone;
  const doctorName =
    doctorTitle(draft.doctorName) || clinicCopy.preview.doctorName;
  return {
    isDraft: false,
    doctor: {
      name: doctorName,
      qualifications: draft.qualifications,
      speciality: draft.speciality,
      pmdc: draft.pmdcNo ? printCopy.pmdc(draft.pmdcNo) : '',
    },
    clinic: {
      name: draft.clinicName || clinicCopy.preview.clinicName,
      address: draft.address,
      schedule: draft.schedule,
      phone: phone ? printCopy.appointments(phone) : '',
    },
    patient: { ...sample.patient, date: formatPrintDate(today) },
    vitals: [],
    allergy: sample.allergy,
    diagnosis: [...sample.diagnosis],
    complaints: [...sample.complaints],
    investigations: [...sample.investigations],
    followUp: { date: sample.followUp, note: '' },
    medicines: sample.medicines.map((medicine) => ({ ...medicine })),
    avoid: [...sample.avoid],
    eatMore: [],
    advice: [...sample.advice],
    rxNumber: sample.rxNumber,
    // The sample shows where the QR goes, not one that checks anything.
    verifyQrUrl: null,
    signature: signatureName(draft.doctorName),
    signedBy: doctorName,
  };
}
