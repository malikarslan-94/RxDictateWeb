import { consultPath, printPath } from '@/constants/routes';
import type { PrescriptionListItem } from '@/contract';
import { formatClockTime, formatPrintDate } from '@/utils/date';
import { patientDetails } from '@/utils/patient';

import { RxStatus } from './constants';
import { rxCopy } from './copy';
import type { PrescriptionLogRow } from './types';

/** One prescription as the History log lists it, and where it opens. */
export function toLogRow(rx: PrescriptionListItem): PrescriptionLogRow {
  const copy = rxCopy.log;
  const diagnosis = rx.sections.diagnosis.map((item) => item.text);
  const medicines = rx.sections.medicines.map((item) => item.name);
  return {
    id: rx.id,
    patientName: rx.patient?.name ?? copy.unknownPatient,
    patientLine: rx.patient
      ? [patientDetails(rx.patient), rx.patient.mrNo]
          .filter(Boolean)
          .join(' · ')
      : '',
    title: rx.number ?? copy.draftTitle,
    summary: (diagnosis.length > 0 ? diagnosis : medicines).join(', '),
    date: copy.date(
      formatPrintDate(rx.createdAt),
      formatClockTime(rx.createdAt),
    ),
    status: rx.status,
    href:
      rx.status === RxStatus.draft
        ? consultPath(rx.patientId, rx.visitId)
        : rx.status === RxStatus.cancelled
          ? null
          : printPath(rx.id),
  };
}
