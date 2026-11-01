import { useState } from 'react';

import { StorageKey, readJson, writeJson } from '@/lib/storage';

import { printedSchema } from '../schemas';

/**
 * Which prescriptions this computer has printed.
 *
 * TODO(backend): the server has no "printed" state yet, so the reception
 * computer keeps it (docs/backend-requests/web-client.md). Until then the
 * doctor's list shows approved, not printed.
 */
export function usePrintedMarks() {
  const [printed, setPrinted] = useState<Record<string, string>>(
    () => readJson(StorageKey.printed, printedSchema) ?? {},
  );
  return {
    isPrinted: (id: string) => id in printed,
    markPrinted: (id: string) =>
      setPrinted((current) => {
        const next = { ...current, [id]: new Date().toISOString() };
        writeJson(StorageKey.printed, next);
        return next;
      }),
  };
}
