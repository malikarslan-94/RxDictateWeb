import { useState } from 'react';

import { useCreateFromTemplateMutation } from '@/features/templates';
import { messageFor, toApiError } from '@/lib/api';

import type { PrescriptionDraft } from './usePrescriptionDraft';

/**
 * "Start from template" in the consult: a draft from the template, or its
 * lines added to the open one (the server keeps everything already there).
 * As with any draft, the server puts the patient on today's list if needed
 * and the visit becomes "With doctor".
 */
export function useApplyTemplate(
  rx: PrescriptionDraft,
  patientId: string,
  visitId: string | null,
) {
  const [fromTemplate] = useCreateFromTemplateMutation();
  const [error, setError] = useState<string>();

  return {
    error,
    apply: async (templateId: string): Promise<boolean> => {
      setError(undefined);
      try {
        const draft = await fromTemplate({
          templateId,
          body: { patientId, visitId },
        }).unwrap();
        rx.show(draft.id);
        return true;
      } catch (caught) {
        setError(messageFor(toApiError(caught)));
        return false;
      }
    },
  };
}
