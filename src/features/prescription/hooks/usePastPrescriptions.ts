import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate } from 'react-router';

import { printPath } from '@/constants/routes';
import type { PrescriptionView } from '@/contract';
import { useGetPatientQuery } from '@/features/patients';
import { useGetVisitVitalsQuery } from '@/features/vitals';
import { messageFor, toApiError } from '@/lib/api';

import { useListPrescriptionsQuery } from '../api';
import { PAST_RX_PRINT_OPTIONS, RxStatus } from '../constants';
import { rxCopy } from '../copy';
import { buildPrintout } from '../printout';
import { toPastRxItem } from '../utils';

const issuedAt = (rx: PrescriptionView) =>
  (rx.approvedAt ?? rx.createdAt).getTime();

export type UsePastPrescriptionsOptions = {
  patientId: string;
  /** This visit's own prescription is the one being written, not history. */
  visitId: string | null;
  /** The prescription to show first; the newest otherwise. */
  initialId?: string | null;
};

/**
 * A patient's approved prescriptions from other visits, newest first, and
 * the one chosen as its page. The same list the draft reads, so it comes
 * from the cache.
 */
export function usePastPrescriptions({
  patientId,
  visitId,
  initialId = null,
}: UsePastPrescriptionsOptions) {
  const navigate = useNavigate();
  const approved = useListPrescriptionsQuery({
    patientId,
    status: RxStatus.approved,
  });
  const patient = useGetPatientQuery(patientId || skipToken);
  const [chosenId, setChosenId] = useState(initialId);

  const past = (approved.data ?? [])
    .filter((rx) => visitId === null || rx.visitId !== visitId)
    .sort((a, b) => issuedAt(b) - issuedAt(a));
  const selected = past.find((rx) => rx.id === chosenId) ?? past[0] ?? null;
  const vitals = useGetVisitVitalsQuery(selected?.visitId ?? skipToken);

  return {
    patientName: patient.data?.name ?? '',
    /** The one shown, for "Save as template". */
    selectedId: selected?.id ?? null,
    /** Its diagnosis, as a name for the template. */
    suggestedName:
      selected?.sections.diagnosis.map((item) => item.text).join(', ') ?? '',
    select: setChosenId,
    items: past.map((rx) => ({
      ...toPastRxItem(rx),
      isSelected: rx.id === selected?.id,
      select: () => setChosenId(rx.id),
    })),
    printout:
      selected && patient.data
        ? buildPrintout({
            rx: selected,
            patient: patient.data,
            // No vitals for that visit is normal; the page leaves them out.
            vitals: vitals.data ?? null,
            // An approved prescription prints its own frozen letterhead.
            me: null,
            practice: null,
            location: null,
            today: selected.approvedAt ?? selected.createdAt,
          })
        : null,
    options: PAST_RX_PRINT_OPTIONS,
    isLoading: approved.isLoading || patient.isLoading,
    error: approved.error ? messageFor(toApiError(approved.error)) : undefined,
    retry: approved.refetch,
    emptyText: rxCopy.pastRx.empty,
    openPrint: selected ? () => navigate(printPath(selected.id)) : undefined,
  };
}
