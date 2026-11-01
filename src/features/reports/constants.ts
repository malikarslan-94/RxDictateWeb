import { REPORT_UPLOAD, reportContentTypeSchema } from '@/contract';

/** `ReportContentType['image/jpeg']`, `['image/png']`, `['application/pdf']`. */
export const ReportContentType = reportContentTypeSchema.enum;

/** Straight from the contract, so the app refuses what the server would. */
export const {
  allowedContentTypes: ALLOWED_CONTENT_TYPES,
  maxBytes: MAX_PAGE_BYTES,
  maxPages: MAX_PAGES,
} = REPORT_UPLOAD;

/** Enough for a patient's history in one list. */
export const REPORT_LIST_LIMIT = 50;

export const BYTES_PER_MB = 1024 * 1024;

/** What the file picker offers: the same types the server takes. */
export const FILE_ACCEPT = ALLOWED_CONTENT_TYPES.join(',');

/** "Today" for the test date moves on at midnight; a minute is near enough. */
export const TODAY_TICK_MS = 60_000;

/** Ask for fresh page links this long before the old ones stop working. */
export const LINK_REFRESH_MARGIN_MS = 30_000;

/** Patients with new reports, a page at a time. */
export const NEW_REPORTS_PAGE_SIZE = 20;

/** The menu's count of new reports checks for uploads this often. */
export const NEW_REPORTS_POLL_MS = 60_000;
