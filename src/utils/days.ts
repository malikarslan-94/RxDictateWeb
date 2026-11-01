import { DAYS, DAY_LABELS } from '@/constants/days';
import type { DayKey } from '@/constants/days';

/**
 * Collapse a set of days into printout copy: a contiguous run of three or more
 * becomes a range ("Mon–Sat"), anything else is listed ("Mon, Wed, Fri").
 */
export function formatDays(days: readonly DayKey[]): string {
  const picked = DAYS.filter((day) => days.includes(day));
  if (picked.length === 0) return '';

  const isContiguous = picked.every(
    (day, i) =>
      i === 0 || DAYS.indexOf(day) === DAYS.indexOf(picked[i - 1]) + 1,
  );

  if (isContiguous && picked.length > 2) {
    return `${DAY_LABELS[picked[0]]}–${DAY_LABELS[picked[picked.length - 1]]}`;
  }
  return picked.map((day) => DAY_LABELS[day]).join(', ');
}
