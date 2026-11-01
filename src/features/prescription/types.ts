import type {
  HistoryItemView,
  HistoryKind,
  PrescriptionListItem,
  PrescriptionStatus,
} from '@/contract';
import type { VitalReading } from '@/features/vitals';
import type { IconName } from '@/ui';

/** One earlier prescription on the Past Rx tab, ready to show. */
export type PastRxItem = {
  id: string;
  /** "RX-00012". */
  title: string;
  /** "26 Sep 2026 · 3 medicines". */
  line: string;
  /** The diagnosis, when one was written. */
  diagnosis: string;
};

/** One page of the History log. */
export type PrescriptionLogPage = {
  items: PrescriptionListItem[];
  /** Every prescription matching, not just this page. */
  total: number;
  totalPages: number;
};

export type PrescriptionLogQuery = {
  /** A patient's name, phone or MR number. */
  q?: string;
  status?: PrescriptionStatus;
  page: number;
  limit: number;
};

/** One line of the History log, ready to show. */
export type PrescriptionLogRow = {
  id: string;
  patientName: string;
  /** "45 · M · MR-12". */
  patientLine: string;
  /** "RX-2026-000418", or "Draft". */
  title: string;
  /** The diagnosis, else the medicines. */
  summary: string;
  /** "28 Oct 2026 · 9:22 pm". */
  date: string;
  status: PrescriptionStatus;
  /** Where it opens: the consult for a draft, print preview once signed. */
  href: string | null;
};

/** A patient's timeline, as far as it has been read. */
export type PatientHistoryPage = {
  items: HistoryItemView[];
  /** Everything on record of the kind asked for. */
  total: number;
};

export type PatientHistoryQuery = {
  patientId: string;
  kind?: HistoryKind;
  limit: number;
};

/** One entry on the timeline, ready to show. */
export type TimelineEntry = {
  key: string;
  kind: HistoryKind;
  icon: IconName;
  title: string;
  /** What it was: the reason, the diagnosis, the result. */
  line: string;
  /** "28 Oct 2026". */
  date: string;
  /** A visit's vitals. */
  readings: VitalReading[];
  status: { status: PrescriptionStatus; label: string } | null;
  /** A report the doctor hasn't opened. */
  isNew: boolean;
  /** A signed prescription opens on the Past prescriptions tab. */
  prescriptionId: string | null;
};
