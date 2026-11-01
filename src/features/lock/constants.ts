/** The idle times offered, in minutes. */
export const LOCK_CHOICES = [5, 15, 30, 60] as const;
export type LockMinutes = (typeof LOCK_CHOICES)[number];

/** A shared reception computer locks by default. */
export const DEFAULT_LOCK = { isEnabled: true, minutes: 15 as LockMinutes };

export const PIN_LENGTH = 4;

/** After this many wrong PINs, signing in again is the way back. */
export const MAX_PIN_TRIES = 5;

/** How often idleness is checked. */
export const CHECK_EVERY_MS = 10_000;

/** What counts as someone at the computer. */
export const ACTIVITY_EVENTS = [
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
] as const;

export const MS_PER_MINUTE = 60_000;
