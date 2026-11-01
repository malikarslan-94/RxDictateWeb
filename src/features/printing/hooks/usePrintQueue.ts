import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { RxStatus, useListPrescriptionsQuery } from '@/features/prescription';
import { toQueue, useListTodayVisitsQuery } from '@/features/visits';
import { useNow } from '@/hooks/useNow';
import { formatTimeAgo, toDateString } from '@/utils/date';

import { PRINT_QUEUE_POLL_MS, QUEUE_LIMIT } from '../constants';
import { printingCopy } from '../copy';
import { usePrintedMarks } from './usePrintedMarks';
import { usePrintout } from './usePrintout';
import { usePrintSettings } from './usePrintSettings';

const copy = printingCopy.queue;

/**
 * The assistant's print queue: today's approvals not yet printed on this
 * computer, oldest first. Print, then "Mark as printed · next".
 */
export function usePrintQueue() {
  const [search] = useSearchParams();
  const approved = useListPrescriptionsQuery(
    { status: RxStatus.approved, limit: QUEUE_LIMIT },
    { pollingInterval: PRINT_QUEUE_POLL_MS },
  );
  const visits = useListTodayVisitsQuery(undefined, {
    pollingInterval: PRINT_QUEUE_POLL_MS,
  });
  const marks = usePrintedMarks();
  const settings = usePrintSettings();
  const now = useNow(PRINT_QUEUE_POLL_MS);
  const tokens = new Map(
    toQueue(visits.data ?? []).map((entry) => [entry.id, entry]),
  );

  const today = toDateString(now);
  const approvedToday = (approved.data ?? []).filter(
    (rx) => rx.approvedAt && toDateString(rx.approvedAt) === today,
  );
  const ready = approvedToday
    .filter((rx) => !marks.isPrinted(rx.id))
    .sort(
      (a, b) => (a.approvedAt?.getTime() ?? 0) - (b.approvedAt?.getTime() ?? 0),
    );

  const [chosenId, setChosenId] = useState<string | null>(search.get('id'));
  const selectedId =
    chosenId && approvedToday.some((rx) => rx.id === chosenId)
      ? chosenId
      : (ready[0]?.id ?? null);
  const printout = usePrintout(selectedId);
  const doctor = approvedToday[0]?.letterheadSnapshot?.doctorName ?? '';

  return {
    meta: copy.meta(doctor),
    title: copy.title,
    readyTitle: copy.ready(ready.length),
    printedNote:
      approvedToday.length > ready.length
        ? copy.printedToday(approvedToday.length - ready.length)
        : '',
    items: ready.map((rx) => {
      const entry = rx.visitId ? tokens.get(rx.visitId) : undefined;
      return {
        id: rx.id,
        token: entry ? String(entry.token) : commonCopy.none,
        name: entry?.name ?? rx.number ?? '',
        approved: copy.approvedAgo(formatTimeAgo(rx.approvedAt ?? now, now)),
        isSelected: rx.id === selectedId,
        select: () => setChosenId(rx.id),
      };
    }),
    isLoading: approved.isLoading,
    emptyText: copy.empty,
    printout,
    settings,
    markPrintedNext: selectedId
      ? () => {
          const next = ready.find((rx) => rx.id !== selectedId);
          marks.markPrinted(selectedId);
          setChosenId(next?.id ?? null);
        }
      : undefined,
  };
}
