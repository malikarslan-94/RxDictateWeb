import { useEffect, useState } from 'react';

import { StorageKey, readJson, writeJson } from '@/lib/storage';

import { DEFAULT_LOCK } from '../constants';
import type { LockMinutes } from '../constants';
import { lockSettingsSchema } from '../schemas';
import type { LockSettings } from '../schemas';

/** Read fresh each time, so a change in Settings reaches the lock at once. */
export function readLockSettings(): LockSettings {
  return readJson(StorageKey.lock, lockSettingsSchema) ?? DEFAULT_LOCK;
}

/**
 * Lock after inactivity, as this computer is set.
 *
 * TODO(backend): the design has the doctor set it for the clinic's computers;
 * until the server keeps it, each computer keeps its own
 * (docs/backend-requests/web-client.md).
 */
export function useLockSettings() {
  const [settings, setSettings] = useState(readLockSettings);

  // Another tab changed it.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === StorageKey.lock) setSettings(readLockSettings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const change = (next: Partial<LockSettings>) =>
    setSettings((current) => {
      const merged = { ...current, ...next };
      writeJson(StorageKey.lock, merged);
      return merged;
    });

  return {
    ...settings,
    setEnabled: (isEnabled: boolean) => change({ isEnabled }),
    setMinutes: (minutes: LockMinutes) => change({ minutes }),
  };
}
