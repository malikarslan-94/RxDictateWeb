/** One reading as a row of vitals shows it. */
export type VitalReading = {
  key: string;
  /** "BP". */
  label: string;
  /** "150/95", "98.6°F". */
  value: string;
  /** Outside the normal range. */
  isFlagged: boolean;
};
