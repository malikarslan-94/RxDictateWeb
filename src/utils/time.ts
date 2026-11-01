/**
 * Times travel as the API's `HH:mm` (24 hour). People read and type them as
 * "5:00 pm". These convert between the two.
 */

const LABEL_PATTERN = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*$/i;

/** "5:00 pm" -> "17:00"; "12 am" -> "00:00". Null when it isn't a time. */
export function parseTimeLabel(label: string): string | null {
  const match = label.match(LABEL_PATTERN);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  if (hour12 < 1 || hour12 > 12 || minutes > 59) return null;

  const isPm = match[3].toLowerCase() === 'pm';
  const hour24 = (hour12 % 12) + (isPm ? 12 : 0);
  return `${pad(hour24)}:${pad(minutes)}`;
}

/** "17:00" -> "5:00 pm". */
export function formatTimeLabel(time: string): string {
  const [hour24, minutes] = time.split(':').map(Number);
  const suffix = hour24 >= 12 ? 'pm' : 'am';
  return `${hour24 % 12 || 12}:${pad(minutes)} ${suffix}`;
}

/** "17:00", "21:00" -> "5–9 pm"; drops ":00" and a repeated suffix. */
export function formatTimeRange(from: string, to: string): string {
  const short = (time: string) => formatTimeLabel(time).replace(':00', '');
  const start = short(from);
  const end = short(to);
  const sameSuffix = start.slice(-2) === end.slice(-2);
  return `${sameSuffix ? start.slice(0, -3) : start}–${end}`;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * Every `stepMinutes` from midnight as `HH:mm`, for a time list. `keep` (a
 * time already saved off the steps, say 9:10) is slotted in where it falls.
 */
export function timeSteps(stepMinutes: number, keep = ''): string[] {
  const times: string[] = [];
  for (let minute = 0; minute < MINUTES_PER_DAY; minute += stepMinutes) {
    times.push(
      `${pad(Math.floor(minute / MINUTES_PER_HOUR))}:${pad(minute % MINUTES_PER_HOUR)}`,
    );
  }
  if (keep && !times.includes(keep)) {
    times.push(keep);
    times.sort();
  }
  return times;
}

/** A clock reading as the API's `HH:mm`. */
export function toTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `HH:mm` as that time on `day` (today by default), for a time picker. */
export function timeOnDay(time: string, day: Date = new Date()): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const at = new Date(day);
  at.setHours(hours, minutes, 0, 0);
  return at;
}

/** 75 -> "1:15". For resend countdowns and recording timers. */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
