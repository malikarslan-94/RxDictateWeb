import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useDebounce } from '@/hooks/useDebounce';
import { messageFor, toApiError } from '@/lib/api';

import { useListPrescriptionLogQuery } from '../api';
import { LOG_PAGE_SIZE, LOG_SEARCH_DEBOUNCE_MS, LogFilter } from '../constants';
import { rxCopy } from '../copy';
import { toLogRow } from '../log';

const copy = rxCopy.log;

/**
 * The doctor's History log: every prescription at this location, newest
 * first, narrowed by patient and status. A draft opens the consult; a
 * signed one opens print preview.
 */
export function usePrescriptionLog() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<LogFilter>(LogFilter.all);
  const [page, setPage] = useState(1);
  const q = useDebounce(text.trim(), LOG_SEARCH_DEBOUNCE_MS);
  const result = useListPrescriptionLogQuery(
    {
      q: q || undefined,
      status: filter === LogFilter.all ? undefined : filter,
      page,
      limit: LOG_PAGE_SIZE,
    },
    { refetchOnMountOrArgChange: true },
  );
  const items = result.data?.items ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = result.data?.totalPages ?? 1;
  const from = (page - 1) * LOG_PAGE_SIZE + 1;

  return {
    meta: result.data ? copy.meta(total) : '',
    text,
    setText: (next: string) => {
      setText(next);
      setPage(1);
    },
    filter,
    filters: Object.values(LogFilter).map((value) => ({
      value,
      label: copy.filters[value],
    })),
    setFilter: (next: LogFilter) => {
      setFilter(next);
      setPage(1);
    },
    rows: items.map((item) => {
      const row = toLogRow(item);
      const { href } = row;
      return {
        ...row,
        statusLabel: copy.status[row.status],
        open: href ? () => navigate(href) : undefined,
      };
    }),
    isLoading: result.isLoading,
    error: result.error ? messageFor(toApiError(result.error)) : undefined,
    retry: result.refetch,
    emptyText: q ? copy.noMatch : copy.empty,
    showing:
      totalPages > 1
        ? copy.showing(from, from + items.length - 1, total)
        : null,
    canGoBack: page > 1,
    canGoOn: page < totalPages,
    previous: () => setPage((current) => Math.max(1, current - 1)),
    next: () => setPage((current) => Math.min(totalPages, current + 1)),
  };
}
