import { useRef } from 'react';

import type { PrescriptionView } from '@/contract';

import { useCreatePrescriptionMutation } from '../api';
import { PrintLanguage, RxSource, RxStatus } from '../constants';

export type UseOpenDraftOptions = {
  /** What the page shows now: the draft to use, if it is one. */
  prescription: PrescriptionView | null;
  patientId: string;
  visitId: string | null;
  onCreated: (created: PrescriptionView) => void;
};

/**
 * The open draft, made on the first change and never just by looking. One
 * create at a time, so two quick edits can't make two drafts.
 */
export function useOpenDraft({
  prescription,
  patientId,
  visitId,
  onCreated,
}: UseOpenDraftOptions) {
  const [create] = useCreatePrescriptionMutation();
  const creating = useRef<Promise<PrescriptionView> | null>(null);

  return (): Promise<PrescriptionView> => {
    if (prescription?.status === RxStatus.draft) {
      return Promise.resolve(prescription);
    }
    // The server puts them on today's list if they aren't on it, and the
    // visit becomes "With doctor": from the queue, a search or Add patient.
    creating.current ??= create({
      patientId,
      visitId,
      source: RxSource.typed,
      printLanguage: PrintLanguage.en_ur,
    })
      .unwrap()
      .then((created) => {
        onCreated(created);
        return created;
      })
      .finally(() => {
        creating.current = null;
      });
    return creating.current;
  };
}
