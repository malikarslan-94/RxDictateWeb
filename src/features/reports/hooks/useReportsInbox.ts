import { useState } from 'react';

import type { PatientView } from '@/contract';
import { patientLine, useSearchPatientsQuery } from '@/features/patients';
import { messageFor, toApiError } from '@/lib/api';

import { NEW_REPORTS_PAGE_SIZE } from '../constants';
import { reportsCopy } from '../copy';

const copy = reportsCopy.inbox;

/**
 * The doctor's "Reports and labs": every patient with a report nobody has
 * opened, a page at a time, and the one whose reports are open over it.
 */
export function useReportsInbox() {
  const [page, setPage] = useState(1);
  const [chosen, setChosen] = useState<PatientView | null>(null);
  const result = useSearchPatientsQuery({
    q: '',
    newReports: true,
    sort: 'lastVisit',
    limit: NEW_REPORTS_PAGE_SIZE,
    page,
  });
  const patients = result.data?.patients ?? [];
  const total = result.data?.total ?? 0;
  const totalPages = result.data?.totalPages ?? 1;
  const from = (page - 1) * NEW_REPORTS_PAGE_SIZE + 1;

  return {
    meta: result.data ? copy.meta(total) : '',
    rows: patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      details: patientLine(patient),
      openLabel: copy.open(patient.name),
      open: () => setChosen(patient),
    })),
    isLoading: result.isLoading,
    error: result.error ? messageFor(toApiError(result.error)) : undefined,
    retry: result.refetch,
    showing:
      totalPages > 1
        ? copy.showing(from, from + patients.length - 1, total)
        : null,
    canGoBack: page > 1,
    canGoOn: page < totalPages,
    previous: () => setPage((current) => Math.max(1, current - 1)),
    next: () => setPage((current) => Math.min(totalPages, current + 1)),
    /** Whose reports are open, over the list. */
    chosenId: chosen?.id ?? null,
    closeReports: () => setChosen(null),
  };
}
