/** Indexed by `Date#getDay()`. */
export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Indexed by `Date#getMonth()`. */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MS_PER_MINUTE = 60_000;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
