import { StorageKey } from '@/lib/storage';

/**
 * Every browser-storage key that belongs to the signed-in user. signOut
 * removes them all, so a feature that keeps something for the user adds its
 * key here. This computer's own settings (print, microphone, lock time) and
 * the device id stay.
 */
export const USER_STORAGE_KEYS: readonly StorageKey[] = [
  StorageKey.tokens,
  StorageKey.locked,
];
