import { useSearchPatientsQuery } from '@/features/patients';

/**
 * How many patients have a report the doctor hasn't opened: the menu's
 * badge. Asked only for whoever reviews reports, and again whenever a report changes.
 */
export function useNewReportsCount(canReview: boolean): number {
  const { data } = useSearchPatientsQuery(
    { q: '', limit: 1, newReports: true },
    { skip: !canReview },
  );
  return data?.counts?.newReports ?? 0;
}
