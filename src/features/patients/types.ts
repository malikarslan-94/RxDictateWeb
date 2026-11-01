import type { PatientView, PrescriptionView } from '@/contract';
import type { ChipTone } from '@/ui';

/** One row of the Patients table, ready to show. */
export type PatientRowItem = {
  id: string;
  name: string;
  /** "45 · M · MR-10231". */
  details: string;
  /** "+92 301 •••• 442". */
  phone: string;
  /** "Today", "12 Sep", or a dash when never seen. */
  lastVisit: string;
  patient: PatientView;
};

/** One prescription in a patient's side panel. */
export type PanelPrescription = {
  id: string;
  /** "Today", "23 Sep 2026". */
  date: string;
  /** "Amlodipine 5 mg, Losartan 50 mg". */
  summary: string;
  /** "RX-2026-000418 · draft". */
  line: string;
  /** Where Open goes: the workspace for a draft, History otherwise. */
  href: string;
};

/** One patient in the "New prescription" picker. */
export type PickerRow = {
  id: string;
  name: string;
  details: string;
  /** Their token, when they're on today's list. */
  token: number | null;
  pick: () => void;
};

/** A patient's newest approved prescription here, and how many there are. */
export type PatientRxSummary = {
  latest: PrescriptionView | null;
  count: number;
};

/** "New", "2 visits", "Regular · 6 visits", beside a name. */
export type VisitorTag = {
  label: string;
  tone: ChipTone;
};
