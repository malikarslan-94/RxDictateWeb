import type { z } from 'zod';

/**
 * The browser's storage, made safe: a private window, blocked site data or a
 * full quota never throws here. Reads come back null and writes are dropped,
 * so the app keeps working and only loses what it remembered.
 *
 * `local` outlives the browser; `session` ends with the tab.
 */
export type StorageArea = 'local' | 'session';

/** Every key the app keeps. Sign-out removes the ones in USER_STORAGE_KEYS. */
export const StorageKey = {
  /** One per browser, kept through sign-outs (sent at sign-in). */
  deviceId: 'device.id',
  tokens: 'session.tokens',
  /** The location this computer last worked at, per user. */
  location: 'session.location',
  /** The unlock PIN's hash for each user on this computer. */
  pins: 'lock.pins',
  /** Lock after inactivity: this computer's setting. */
  lock: 'lock.settings',
  /** Locked when the tab closed, so a reload stays locked. */
  locked: 'lock.locked',
  print: 'print.settings',
  microphone: 'voice.microphone',
  /** Prescriptions printed on this computer, until the server keeps it. */
  printed: 'print.printed',
} as const;
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];

function areaOf(area: StorageArea): Storage | null {
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readItem(key: StorageKey, area: StorageArea = 'local') {
  try {
    return areaOf(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeItem(
  key: StorageKey,
  value: string,
  area: StorageArea = 'local',
): void {
  try {
    areaOf(area)?.setItem(key, value);
  } catch {
    // Nothing to do: the value just isn't remembered.
  }
}

/** Remove from one area, or from both. */
export function removeItem(key: StorageKey, area?: StorageArea): void {
  const areas: StorageArea[] = area ? [area] : ['local', 'session'];
  areas.forEach((name) => {
    try {
      areaOf(name)?.removeItem(key);
    } catch {
      // Already unreachable, so already gone as far as the app can tell.
    }
  });
}

/** A stored value checked against its schema; null when missing or stale. */
export function readJson<T>(
  key: StorageKey,
  schema: z.ZodType<T>,
  area: StorageArea = 'local',
): T | null {
  const raw = readItem(key, area);
  if (!raw) return null;
  try {
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeJson(
  key: StorageKey,
  value: unknown,
  area: StorageArea = 'local',
): void {
  writeItem(key, JSON.stringify(value), area);
}
