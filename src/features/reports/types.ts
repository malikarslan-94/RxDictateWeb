import type { ReportContentType } from '@/contract';

/** A page chosen in the browser, held in memory until it's sent. */
export type PickedPage = {
  /** Stable for the list, since two files can share a name. */
  id: string;
  file: File;
  contentType: ReportContentType;
  /** An object URL for an image's thumbnail; null for a PDF. */
  previewUrl: string | null;
};

/** One report in a patient's list, ready to show. */
export type ReportItem = {
  id: string;
  title: string;
  /** "Lab · 26 Sep 2026 · 2 pages". */
  line: string;
  /** The doctor hasn't looked at it yet. */
  isNew: boolean;
  /** The patient sent it from their own area. */
  isFromPatient: boolean;
};

/** One page of a report being read. */
export type ReportPage = {
  key: string;
  url: string;
  isPdf: boolean;
  label: string;
};
