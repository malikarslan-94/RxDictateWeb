import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { recordVitalsBodySchema } from '@/contract';
import type { VitalsView } from '@/contract';
import { messageFor, toApiError } from '@/lib/api';

import { useRecordVitalsMutation } from '../api';
import { vitalsCopy } from '../copy';
import { vitalsFormSchema } from '../schemas';
import { flagNotes, toVitalsBody, toVitalsInput } from '../utils';

export type UseVitalsDialogOptions = {
  /** The visit's readings when editing, else null. */
  vitals: VitalsView | null;
  /** The visit to record against, started first if there isn't one yet. */
  getVisitId: () => Promise<string>;
  onSaved: () => void;
};

/**
 * Record or correct a visit's vitals. A reading outside the normal range is
 * marked as soon as it's typed.
 */
export function useVitalsDialog({
  vitals,
  getVisitId,
  onSaved,
}: UseVitalsDialogOptions) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(vitalsFormSchema),
    defaultValues: toVitalsInput(vitals),
  });
  const typed = useWatch({ control });
  const [record] = useRecordVitalsMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const submit = handleSubmit(async (values) => {
    setError(undefined);
    // Every field is already valid; what's left is "at least one reading".
    const body = recordVitalsBodySchema.safeParse(toVitalsBody(values, vitals));
    if (!body.success) {
      setError(vitalsCopy.errors.noReading);
      return;
    }
    setIsSaving(true);
    try {
      const visitId = await getVisitId();
      await record({ visitId, body: body.data }).unwrap();
      onSaved();
    } catch (caught) {
      setError(messageFor(toApiError(caught)));
      setIsSaving(false);
    }
  });

  return {
    title: vitals ? vitalsCopy.editTitle : vitalsCopy.addTitle,
    control,
    warnings: flagNotes(typed),
    submit,
    isSaving,
    error,
  };
}
