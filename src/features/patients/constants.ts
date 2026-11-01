/** Search waits for this many characters, then for typing to pause. */
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_RESULT_LIMIT = 10;

/** Rows per page of the Patients table. */
export const TABLE_PAGE_SIZE = 10;

/** "This week" reads this many of the most recently seen, then filters. */
export const RECENT_LIMIT = 100;
export const DAYS_IN_WEEK = 7;

/** Prescriptions shown in a patient's side panel. */
export const PANEL_PRESCRIPTIONS = 20;

export const MAX_PATIENT_AGE = 130;

/** Seen this many times or more, a patient is a regular. */
export const REGULAR_VISITS = 3;

export const PatientFilter = {
  All: 'all',
  SeenToday: 'seenToday',
  ThisWeek: 'thisWeek',
} as const;
export type PatientFilter = (typeof PatientFilter)[keyof typeof PatientFilter];
