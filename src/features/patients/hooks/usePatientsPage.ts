import { useRef, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { Hotkeys } from '@/constants/keys';
import type { PatientView } from '@/contract';
import { useListTodayVisitsQuery } from '@/features/visits';
import { useDebounce } from '@/hooks/useDebounce';
import { useHotkey } from '@/hooks/useHotkey';
import { messageFor, toApiError } from '@/lib/api';

import { useSearchPatientsQuery } from '../api';
import {
  DAYS_IN_WEEK,
  PatientFilter,
  RECENT_LIMIT,
  SEARCH_DEBOUNCE_MS,
  TABLE_PAGE_SIZE,
} from '../constants';
import { patientsCopy } from '../copy';
import {
  isSeenThisWeek,
  matchesText,
  searchQuery,
  toPatientRow,
} from '../utils';

const copy = patientsCopy.list;

/**
 * Every patient of the clinic: search, seen today or this week, a page at a
 * time, and the one picked shown beside the table. "/" jumps to the search.
 */
export function usePatientsPage() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<PatientFilter>(PatientFilter.All);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PatientView | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const settled = useDebounce(text, SEARCH_DEBOUNCE_MS);
  const q = searchQuery(settled);

  const everyone = useSearchPatientsQuery({ q: '', limit: 1 });
  const all = useSearchPatientsQuery(
    filter === PatientFilter.All
      ? { q, limit: TABLE_PAGE_SIZE, page }
      : skipToken,
  );
  const recent = useSearchPatientsQuery(
    filter === PatientFilter.ThisWeek
      ? { q, limit: RECENT_LIMIT, sort: 'lastVisit' }
      : skipToken,
  );
  const visits = useListTodayVisitsQuery();

  useHotkey(Hotkeys.focusSearch, () => searchRef.current?.focus());

  // The server pages "All"; the other two are short lists paged here.
  const local: PatientView[] =
    filter === PatientFilter.SeenToday
      ? (visits.data ?? [])
          .flatMap((visit) => (visit.patient ? [visit.patient] : []))
          .filter((patient) => matchesText(patient, settled))
      : (recent.data?.patients ?? []).filter((patient) =>
          isSeenThisWeek(patient, DAYS_IN_WEEK),
        );
  const isServerPaged = filter === PatientFilter.All;
  const total = isServerPaged ? (all.data?.total ?? 0) : local.length;
  const start = (page - 1) * TABLE_PAGE_SIZE;
  const patients = isServerPaged
    ? (all.data?.patients ?? [])
    : local.slice(start, start + TABLE_PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(total / TABLE_PAGE_SIZE));
  const source =
    filter === PatientFilter.All
      ? all
      : filter === PatientFilter.ThisWeek
        ? recent
        : visits;

  return {
    meta: copy.meta(everyone.data?.total ?? 0),
    searchRef,
    text,
    setText: (next: string) => {
      setText(next);
      setPage(1);
    },
    filters: (
      [
        PatientFilter.All,
        PatientFilter.SeenToday,
        PatientFilter.ThisWeek,
      ] as const
    ).map((value) => ({ value, label: copy.filters[value] })),
    filter,
    setFilter: (next: PatientFilter) => {
      setFilter(next);
      setPage(1);
    },
    rows: patients.map((patient) => toPatientRow(patient)),
    isLoading: source.isLoading,
    error: source.error ? messageFor(toApiError(source.error)) : undefined,
    retry: source.refetch,
    emptyText: settled.trim()
      ? copy.noMatches
      : filter === PatientFilter.SeenToday
        ? copy.noneToday
        : filter === PatientFilter.ThisWeek
          ? copy.noneThisWeek
          : copy.empty,
    showing:
      total > 0
        ? copy.showing(
            start + 1,
            Math.min(start + TABLE_PAGE_SIZE, total),
            total,
          )
        : '',
    canGoBack: page > 1,
    canGoOn: page < pageCount,
    previous: () => setPage((current) => Math.max(1, current - 1)),
    next: () => setPage((current) => Math.min(pageCount, current + 1)),
    selected,
    select: (patient: PatientView) => setSelected(patient),
    closePanel: () => setSelected(null),
    isAdding,
    openAdd: () => setIsAdding(true),
    closeAdd: () => setIsAdding(false),
  };
}
