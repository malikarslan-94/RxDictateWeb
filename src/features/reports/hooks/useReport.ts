import { useEffect } from 'react';

import { Role } from '@/constants/roles';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { useGetReportQuery, useReviewReportMutation } from '../api';
import { LINK_REFRESH_MARGIN_MS } from '../constants';
import { reportsCopy } from '../copy';
import { firstExpiry, toReportItem, toReportPages } from '../utils';

/**
 * One report and its pages. Its links are asked for each time it opens and
 * again before they expire; an image that fails after that asks once more.
 * The doctor opening a new one marks it reviewed.
 */
export function useReport(reportId: string) {
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  const report = useGetReportQuery(reportId, {
    refetchOnMountOrArgChange: true,
  });
  const [review] = useReviewReportMutation();
  const { refetch } = report;
  const expiry = report.data ? firstExpiry(report.data) : null;
  const isUnreviewed = report.data?.reviewedAt === null;

  useEffect(() => {
    // Best effort: a failed review leaves it "New" for the next look.
    if (isDoctor && isUnreviewed) review(reportId);
  }, [isDoctor, isUnreviewed, reportId, review]);

  useEffect(() => {
    if (expiry === null) return;
    const timer = setTimeout(
      refetch,
      Math.max(0, expiry - Date.now() - LINK_REFRESH_MARGIN_MS),
    );
    return () => clearTimeout(timer);
  }, [expiry, refetch]);

  const item = report.data ? toReportItem(report.data) : null;

  return {
    title: item?.title ?? reportsCopy.viewer.title,
    line: item?.line ?? '',
    pages: report.data ? toReportPages(report.data) : [],
    isLoading: report.isLoading,
    error: report.error ? messageFor(toApiError(report.error)) : undefined,
    retry: refetch,
    /** A page that won't load: its link may have run out. */
    pageFailed: () => {
      if (expiry !== null && Date.now() >= expiry - LINK_REFRESH_MARGIN_MS) {
        refetch();
      }
    },
  };
}
