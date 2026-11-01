import {
  prescriptionSectionsSchema,
  printLanguageSchema,
  prescriptionSourceSchema,
  prescriptionStatusSchema,
} from '@/contract';
import type { DoseLanguage, DosePattern } from '@/contract';
import type { PrintOptions } from '@/types/printout';

/** The server's strings, named: `RxStatus.draft`, `RxSource.typed`… */
export const RxStatus = prescriptionStatusSchema.enum;
export const RxSource = prescriptionSourceSchema.enum;
export const PrintLanguage = printLanguageSchema.enum;

/** A prescription or template with nothing on it yet. */
export const EMPTY_SECTIONS = prescriptionSectionsSchema.parse({});

/** The two languages a dose sentence is written in. */
export const DoseLang = { en: 'en', ur: 'ur' } as const satisfies Record<
  DoseLanguage,
  DoseLanguage
>;

/** The dose chips on the medicine sheet, most common first. */
export const DOSE_PRESETS: readonly DosePattern[] = [
  { m: 1, a: 0, n: 0 },
  { m: 0, a: 0, n: 1 },
  { m: 1, a: 0, n: 1 },
  { m: 1, a: 1, n: 1 },
  { m: 0, a: 1, n: 0 },
  { sos: true },
];

export const DURATION_PRESETS_DAYS = [3, 5, 7, 14, 30] as const;
export const FOLLOW_UP_PRESETS_DAYS = [3, 7, 14, 30] as const;

export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;

/** Medicine search starts after this many letters, once typing pauses. */
export const DRUG_SEARCH_MIN_LENGTH = 2;
export const DRUG_SEARCH_DEBOUNCE_MS = 250;
export const DRUG_SEARCH_LIMIT = 8;

/** The sections the review screen shows as plain lists, in print order. */
export const TEXT_SECTIONS = ['complaints', 'diagnosis', 'advice'] as const;
export type TextSection = (typeof TEXT_SECTIONS)[number] | 'labs';

/** The plain-text sections, in the order the editor shows them. */
export const EditorSection = {
  complaints: 'complaints',
  diagnosis: 'diagnosis',
  labs: 'labs',
  dietAvoid: 'dietAvoid',
  dietEat: 'dietEat',
  advice: 'advice',
} as const;
export type EditorSection = (typeof EditorSection)[keyof typeof EditorSection];

/** The follow-up buttons, in days. */
export const FOLLOW_UP_CHOICES = [
  { key: 'week', days: 7 },
  { key: 'twoWeeks', days: 14 },
  { key: 'month', days: 30 },
] as const;

/** Offered when a dictated medicine came without a duration. */
export const SUGGESTED_DURATION_DAYS = 30;

/** What a quick-typed medicine starts as when no dose was typed. */
export const DEFAULT_PATTERN = { m: 1, a: 0, n: 0 } as const;

/** …and when no days were typed. */
export const DEFAULT_DURATION_DAYS = 1;

/** The History log, a page at a time. */
export const LOG_PAGE_SIZE = 20;

/** The History log's search waits for typing to pause. */
export const LOG_SEARCH_DEBOUNCE_MS = 300;

/** The timeline reads this many at a time… */
export const TIMELINE_PAGE_SIZE = 20;

/** …up to the most the server sends in one answer. */
export const TIMELINE_MAX = 100;

/** The History log's chips, and the status each asks the server for. */
export const LogFilter = {
  all: 'all',
  draft: 'draft',
  approved: 'approved',
} as const;
export type LogFilter = (typeof LogFilter)[keyof typeof LogFilter];

/**
 * An earlier prescription read back on screen: the whole page with both
 * languages, not this computer's printer settings.
 */
export const PAST_RX_PRINT_OPTIONS: PrintOptions = {
  header: 'letterhead',
  language: 'en_ur',
  topMarginMm: 0,
  copies: 1,
};

/** "Saved 4 s ago" moves on this often. */
export const SAVED_TICK_MS = 5000;

/** Drug suggestions under the quick line. */
export const QUICK_SUGGESTIONS = 5;
