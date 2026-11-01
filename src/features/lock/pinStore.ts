import { StorageKey, readJson, writeJson } from '@/lib/storage';

import { pinsSchema } from './schemas';

const HEX = 16;

async function digest(salt: string, pin: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${pin}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(HEX).padStart(2, '0'))
    .join('');
}

function readPins() {
  return readJson(StorageKey.pins, pinsSchema) ?? {};
}

/**
 * Each user's unlock PIN on this computer. Only a salted hash is kept, and
 * only here: it guards a screen, not the account, which still needs a code.
 */
export function hasPin(userId: string): boolean {
  return userId in readPins();
}

export async function savePin(userId: string, pin: string): Promise<void> {
  const salt = crypto.randomUUID();
  writeJson(StorageKey.pins, {
    ...readPins(),
    [userId]: { salt, hash: await digest(salt, pin) },
  });
}

export async function checkPin(userId: string, pin: string): Promise<boolean> {
  const stored = readPins()[userId];
  return !!stored && stored.hash === (await digest(stored.salt, pin));
}

/** At sign-out: the next sign-in sets a fresh one. */
export function forgetPin(userId: string): void {
  const { [userId]: _forgotten, ...rest } = readPins();
  writeJson(StorageKey.pins, rest);
}
