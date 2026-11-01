import { commonCopy } from '@/constants/copy';
import {
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  MONTH_NAMES,
  MS_PER_MINUTE,
  WEEKDAY_NAMES,
} from '@/constants/dates';

const copy = commonCopy.time;

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

/** The phone's local day as the API's `YYYY-MM-DD`. */
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `YYYY-MM-DD` as local midnight on that day. */
export function fromDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "Today", "Tomorrow", "Yesterday", else "Sat 26 Sep". */
export function formatRelativeDay(date: Date, now: Date = new Date()): string {
  const day = toDateString(date);
  if (day === toDateString(now)) return copy.today;
  if (day === toDateString(addDays(now, 1))) return copy.tomorrow;
  if (day === toDateString(addDays(now, -1))) return copy.yesterday;
  return formatDayAndDate(date);
}

/** "Saturday, 26 September". */
export function formatLongDate(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

/** "Sat 26 Sep". */
export function formatDayAndDate(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()].slice(0, 3)} ${formatShortDate(date)}`;
}

/** "9:30 am". */
export function formatClockTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'pm' : 'am'}`;
}

/** "26 Sep 2026" — the date on a printed prescription. */
export function formatPrintDate(date: Date): string {
  return `${formatShortDate(date)} ${date.getFullYear()}`;
}

/** "Sat, 10 Oct 2026". */
export function formatWeekdayDate(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()].slice(0, 3)}, ${formatPrintDate(date)}`;
}

/** "26 Sep". */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

/** "Just now", "5 min ago", "2 h ago", "Yesterday", then "26 Sep". */
export function formatTimeAgo(date: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / MS_PER_MINUTE);
  if (minutes < 1) return copy.justNow;
  if (minutes < MINUTES_PER_HOUR) return copy.minutesAgo(minutes);

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY && date.getDate() === now.getDate()) {
    return copy.hoursAgo(hours);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return copy.yesterday;

  return formatShortDate(date);
}
