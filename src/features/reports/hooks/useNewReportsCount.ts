import { useSearchPatientsQuery } from '@/features/patients';

import { NEW_REPORTS_POLL_MS } from '../constants';

/**
 * How many patients have a report the doctor hasn't opened: the menu's
 * badge. Asked only for the doctor, and again now and then for new uploads.
 */
export function useNewReportsCount(isDoctor: boolean): number {
  const { data } = useSearchPatientsQuery(
    { q: '', limit: 1, newReports: true },
    { skip: !isDoctor, pollingInterval: NEW_REPORTS_POLL_MS },
  );
  return data?.counts?.newReports ?? 0;
}
