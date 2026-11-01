import { skipToken } from '@reduxjs/toolkit/query';

import { messageFor, toApiError } from '@/lib/api';

import { useListPatientReportsQuery } from '../api';
import { reportsCopy } from '../copy';
import { byNewestTest, toReportItem } from '../utils';

/** A patient's reports, newest test first, and how many are new. */
export function usePatientReports(patientId: string) {
  const reports = useListPatientReportsQuery(patientId || skipToken);
  const items = [...(reports.data ?? [])].sort(byNewestTest).map(toReportItem);

  return {
    items,
    newCount: items.filter((item) => item.isNew).length,
    isLoading: reports.isLoading,
    error: reports.error ? messageFor(toApiError(reports.error)) : undefined,
    retry: reports.refetch,
    emptyText: reportsCopy.list.empty,
  };
}

/** "Reports · 2 new", for a button that opens them. */
export function useReportsButtonLabel(patientId: string) {
  return reportsCopy.button(usePatientReports(patientId).newCount);
}
