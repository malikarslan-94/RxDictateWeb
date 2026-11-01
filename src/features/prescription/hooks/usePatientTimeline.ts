import { useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { historyKindSchema } from '@/contract';
import type { HistoryKind } from '@/contract';
import { messageFor, toApiError } from '@/lib/api';

import { useGetPatientHistoryQuery } from '../api';
import { TIMELINE_MAX, TIMELINE_PAGE_SIZE } from '../constants';
import { rxCopy } from '../copy';
import { toTimelineEntry } from '../timeline';

const copy = rxCopy.timeline;

/** The chips: everything, or one kind. */
const ALL = 'all';
type TimelineFilter = HistoryKind | typeof ALL;

/**
 * A patient's history as one timeline, newest first: visits with their
 * vitals, prescriptions, the labs they ordered, and reports. Narrowed to
 * one kind by the chips; "Show more" reads further back. A signed
 * prescription opens as its page.
 */
export function usePatientTimeline(
  patientId: string,
  onOpenPrescription: (prescriptionId: string) => void,
) {
  const [filter, setFilter] = useState<TimelineFilter>(ALL);
  const [limit, setLimit] = useState(TIMELINE_PAGE_SIZE);
  const history = useGetPatientHistoryQuery(
    patientId
      ? { patientId, kind: filter === ALL ? undefined : filter, limit }
      : skipToken,
    { refetchOnMountOrArgChange: true },
  );
  const items = history.data?.items ?? [];
  const filters: { value: TimelineFilter; label: string }[] = [
    { value: ALL, label: copy.all },
    ...historyKindSchema.options.map((kind) => ({
      value: kind,
      label: copy.kinds[kind],
    })),
  ];

  return {
    filter,
    filters,
    setFilter: (next: TimelineFilter) => {
      setFilter(next);
      setLimit(TIMELINE_PAGE_SIZE);
    },
    entries: items.map((item) => {
      const entry = toTimelineEntry(item);
      const { prescriptionId } = entry;
      return {
        ...entry,
        open: prescriptionId
          ? () => onOpenPrescription(prescriptionId)
          : undefined,
      };
    }),
    isLoading: history.isLoading,
    isFetching: history.isFetching,
    error: history.error ? messageFor(toApiError(history.error)) : undefined,
    retry: history.refetch,
    emptyText: filter === ALL ? copy.empty : copy.emptyKind,
    canShowMore:
      items.length < (history.data?.total ?? 0) && limit < TIMELINE_MAX,
    showMore: () =>
      setLimit((current) =>
        Math.min(TIMELINE_MAX, current + TIMELINE_PAGE_SIZE),
      ),
  };
}
