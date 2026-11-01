import { prescriptionStatusSchema } from '@/contract';
import type { PatientView, PrescriptionView } from '@/contract';
import { consultPath, patientHistoryPath } from '@/constants/routes';
import {
  addDays,
  formatPrintDate,
  formatRelativeDay,
  fromDateString,
  toDateString,
} from '@/utils/date';
import { patientDetails } from '@/utils/patient';
import { maskE164, toPhoneSearch } from '@/utils/phone';

import { REGULAR_VISITS } from './constants';
import { patientsCopy } from './copy';
import type {
  PanelPrescription,
  PatientRowItem,
  PatientRxSummary,
  VisitorTag,
} from './types';

/** What the server searches by: an E.164 prefix for a number, else the text. */
export function searchQuery(text: string): string {
  const trimmed = text.trim();
  return toPhoneSearch(trimmed) ?? trimmed;
}

/** "45 · M · MR-10231". */
export function patientLine(patient: PatientView): string {
  return [patientDetails(patient), patient.mrNo].filter(Boolean).join(' · ');
}

export function toPatientRow(
  patient: PatientView,
  today: Date = new Date(),
): PatientRowItem {
  return {
    id: patient.id,
    name: patient.name,
    details: patientLine(patient),
    phone: patient.phone ? maskE164(patient.phone) : '',
    lastVisit: patient.lastVisitDate
      ? formatRelativeDay(fromDateString(patient.lastVisitDate), today)
      : patientsCopy.list.never,
    patient,
  };
}

/** Seen within the last week, today included. */
export function isSeenThisWeek(
  patient: PatientView,
  daysInWeek: number,
  today: Date = new Date(),
): boolean {
  if (!patient.lastVisitDate) return false;
  return patient.lastVisitDate > toDateString(addDays(today, -daysInWeek));
}

/** The text matches the patient's name, MR number or phone. */
export function matchesText(patient: PatientView, text: string): boolean {
  const needle = text.trim().toLowerCase();
  if (!needle) return true;
  const phone = toPhoneSearch(needle);
  return (
    patient.name.toLowerCase().includes(needle) ||
    patient.mrNo.toLowerCase().includes(needle) ||
    (!!phone && patient.phone.startsWith(phone))
  );
}

export function toPanelPrescription(
  rx: PrescriptionView,
  today: Date = new Date(),
): PanelPrescription {
  const isDraft = rx.status === prescriptionStatusSchema.enum.draft;
  const date = rx.approvedAt ?? rx.createdAt;
  return {
    id: rx.id,
    date:
      toDateString(date) === toDateString(today)
        ? formatRelativeDay(date, today)
        : formatPrintDate(date),
    summary:
      rx.sections.medicines
        .map((item) => [item.name, item.strength].filter(Boolean).join(' '))
        .join(', ') || patientsCopy.panel.noMedicines,
    line: patientsCopy.panel.rxLine(rx.number ?? '', isDraft),
    href: isDraft
      ? consultPath(rx.patientId, rx.visitId)
      : patientHistoryPath(rx.patientId, rx.id),
  };
}

/** "Hypertension, Type 2 diabetes": the newest approved prescription's. */
export function lastDiagnosis(summary: PatientRxSummary): string {
  return (
    summary.latest?.sections.diagnosis.map((item) => item.text).join(', ') ?? ''
  );
}

/**
 * New, a few visits, or a regular, counted by approved prescriptions. None
 * here but seen before today means seen somewhere this can't count: no tag.
 */
export function visitorTag(
  summary: PatientRxSummary,
  lastVisitDate: string | null,
  today: Date = new Date(),
): VisitorTag | null {
  const copy = patientsCopy.list.visitor;
  if (summary.count === 0) {
    const isFirstTime =
      lastVisitDate === null || lastVisitDate === toDateString(today);
    return isFirstTime ? { label: copy.new, tone: 'active' } : null;
  }
  return summary.count >= REGULAR_VISITS
    ? { label: copy.regular(summary.count), tone: 'neutral' }
    : { label: copy.visits(summary.count), tone: 'neutral' };
}
