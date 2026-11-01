import { reportContentTypeSchema } from '@/contract';
import type { ReportDetailView, ReportView } from '@/contract';
import { formatPrintDate, fromDateString } from '@/utils/date';

import {
  BYTES_PER_MB,
  MAX_PAGE_BYTES,
  MAX_PAGES,
  ReportContentType,
} from './constants';
import { reportsCopy } from './copy';
import type { ReportItem, ReportPage } from './types';

const errors = reportsCopy.errors;

/** Browsers don't always say what a file is; its name usually does. */
const TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: ReportContentType['image/jpeg'],
  jpeg: ReportContentType['image/jpeg'],
  png: ReportContentType['image/png'],
  pdf: ReportContentType['application/pdf'],
};

/** What the server will take, as the contract's own content type, or null. */
export function toContentType(file: Pick<File, 'type' | 'name'>) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const parsed = reportContentTypeSchema.safeParse(
    file.type.toLowerCase() || TYPE_BY_EXTENSION[extension],
  );
  return parsed.success ? parsed.data : null;
}

/**
 * Why a file can't be one of the report's pages, or null when it can.
 * `pagesSoFar` counts the pages already kept, this one not included.
 */
export function pageProblem(
  file: Pick<File, 'type' | 'name' | 'size'>,
  pagesSoFar: number,
): string | null {
  if (!toContentType(file)) return errors.wrongType;
  if (pagesSoFar >= MAX_PAGES) return errors.tooManyPages(MAX_PAGES);
  if (file.size > MAX_PAGE_BYTES) {
    return errors.tooBig(MAX_PAGE_BYTES / BYTES_PER_MB);
  }
  return null;
}

/** Newest test first; of two on one day, the one brought in last. */
export function byNewestTest(a: ReportView, b: ReportView): number {
  return (
    b.testDate.localeCompare(a.testDate) ||
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export function toReportItem(report: ReportView): ReportItem {
  return {
    id: report.id,
    title: report.testName,
    line: reportsCopy.line(
      reportsCopy.types[report.type],
      formatPrintDate(fromDateString(report.testDate)),
      report.pages,
    ),
    isNew: report.reviewedAt === null,
  };
}

export function toReportPages(report: ReportDetailView): ReportPage[] {
  const total = report.pageUrls.length;
  return report.pageUrls.map((page, index) => ({
    key: `${report.id}-${index}`,
    url: page.url,
    isPdf: page.contentType === ReportContentType['application/pdf'],
    label: reportsCopy.viewer.pageOf(index + 1, total),
  }));
}

/** When the first of a report's links stops working, or null if none do. */
export function firstExpiry(report: ReportDetailView): number | null {
  const times = report.pageUrls.map((page) => page.expiresAt.getTime());
  return times.length > 0 ? Math.min(...times) : null;
}
