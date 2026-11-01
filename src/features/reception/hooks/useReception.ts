import { useState } from 'react';
import { useNavigate } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { MINUTES_PER_HOUR, MS_PER_MINUTE } from '@/constants/dates';
import { Routes } from '@/constants/routes';
import { VisitStatus } from '@/constants/visits';
import { usePrintedMarks } from '@/features/printing';
import { RxStatus, useListPrescriptionsQuery } from '@/features/prescription';
import {
  inQueueOrder,
  toQueue,
  useListTodayVisitsQuery,
} from '@/features/visits';
import type { QueueEntry } from '@/features/visits';
import { useNow } from '@/hooks/useNow';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveLocationId, selectActiveMembership } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatClockTime, formatLongDate } from '@/utils/date';

import { RECEPTION_POLL_MS, ReceptionStage, WAIT_TICK_MS } from '../constants';
import { receptionCopy } from '../copy';
import { useQueueReorder } from './useQueueReorder';

const copy = receptionCopy.queue;

type RowAction = { kind: 'upload' | 'book'; patientId: string };

/** Ready to print first, then waiting by token, the printed last. */
/**
 * The assistant's Today: the queue at their location, what's ready to
 * print as the doctor approves it, and the add-patient panel beside it.
 */
export function useReception() {
  const navigate = useNavigate();
  const now = useNow(WAIT_TICK_MS);
  const membership = useAppSelector(selectActiveMembership);
  const locationId = useAppSelector(selectActiveLocationId);
  const visits = useListTodayVisitsQuery(undefined, {
    pollingInterval: RECEPTION_POLL_MS,
  });
  const approved = useListPrescriptionsQuery(
    { status: RxStatus.approved },
    { pollingInterval: RECEPTION_POLL_MS },
  );
  const marks = usePrintedMarks();
  // What's open for a patient from their row.
  const [action, setAction] = useState<RowAction | null>(null);

  const rxByVisit = new Map(
    (approved.data ?? []).flatMap((rx) =>
      rx.visitId ? [[rx.visitId, rx.id]] : [],
    ),
  );
  const doctor =
    approved.data?.find((rx) => rx.letterheadSnapshot)?.letterheadSnapshot
      ?.doctorName ?? '';
  const location = membership?.locations.find(
    (place) => place.id === locationId,
  );
  const waited = (entry: QueueEntry) => {
    const minutes = Math.floor(
      (now.getTime() - entry.arrivedAt.getTime()) / MS_PER_MINUTE,
    );
    return minutes < MINUTES_PER_HOUR
      ? commonCopy.time.minutes(Math.max(0, minutes))
      : formatClockTime(entry.arrivedAt);
  };

  // The same order the doctor sees.
  const rows = toQueue(visits.data ?? [])
    .sort(inQueueOrder)
    .map((entry) => {
      const rxId = rxByVisit.get(entry.id) ?? null;
      const stage: ReceptionStage =
        entry.status === VisitStatus.done && rxId
          ? marks.isPrinted(rxId)
            ? ReceptionStage.printed
            : ReceptionStage.ready
          : entry.status === VisitStatus.done
            ? ReceptionStage.printed
            : entry.status;
      const print = rxId
        ? () => navigate(`${Routes.printQueue}?id=${rxId}`)
        : undefined;
      return {
        id: entry.id,
        patientId: entry.patientId,
        token: entry.token,
        name: entry.name,
        details: [entry.details, entry.mrNo].filter(Boolean).join(' · '),
        stage,
        status:
          stage === ReceptionStage.ready
            ? copy.ready
            : stage === ReceptionStage.printed
              ? copy.printed
              : stage === ReceptionStage.with_doctor
                ? copy.withDoctor
                : copy.waiting(waited(entry)),
        print: stage === ReceptionStage.ready ? print : undefined,
        reprint: stage === ReceptionStage.printed ? print : undefined,
        // Taken while they wait; the doctor has them once they're in.
        canTakeVitals: stage === ReceptionStage.waiting,
        vitalsRecordedAt: entry.vitalsRecordedAt,
        uploadLabel: copy.uploadFor(entry.name),
        upload: () => setAction({ kind: 'upload', patientId: entry.patientId }),
        bookLabel: copy.bookFor(entry.name),
        book: () => setAction({ kind: 'book', patientId: entry.patientId }),
      };
    });
  // Only those still waiting can be moved, and only among themselves.
  const reorder = useQueueReorder(
    rows
      .filter((row) => row.stage === ReceptionStage.waiting)
      .map((row) => row.id),
  );

  return {
    meta: receptionCopy.meta([
      formatLongDate(now),
      location?.name ?? '',
      membership?.practiceName ?? '',
    ]),
    stats: [
      {
        key: 'today',
        value: rows.length,
        label: receptionCopy.stats.today,
        tone: 'default',
      },
      {
        key: 'waiting',
        value: rows.filter((row) => row.stage === ReceptionStage.waiting)
          .length,
        label: receptionCopy.stats.waiting,
        tone: 'warning',
      },
      {
        key: 'ready',
        value: rows.filter((row) => row.stage === ReceptionStage.ready).length,
        label: receptionCopy.stats.ready,
        tone: 'primary',
      },
      {
        key: 'printed',
        value: rows.filter((row) => row.stage === ReceptionStage.printed)
          .length,
        label: receptionCopy.stats.printed,
        tone: 'default',
      },
    ] as const,
    live: copy.live(doctor),
    reorderHint: copy.reorderHint,
    rows: rows.map((row) => ({ ...row, move: reorder.rowFor(row.id) })),
    isLoading: visits.isLoading,
    error: visits.error ? messageFor(toApiError(visits.error)) : undefined,
    retry: visits.refetch,
    action,
    closeAction: () => setAction(null),
  };
}
