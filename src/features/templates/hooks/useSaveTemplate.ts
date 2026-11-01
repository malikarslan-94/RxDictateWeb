import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { messageFor, toApiError } from '@/lib/api';

import { useCreateTemplateMutation } from '../api';
import { templatesCopy } from '../copy';
import { saveTemplateSchema } from '../schemas';

export type UseSaveTemplateOptions = {
  /** The approved prescription to copy. */
  prescriptionId: string;
  /** What the name field starts as, e.g. the diagnosis. */
  suggestedName?: string;
};

/**
 * "Save as template" on an approved prescription: a name, and the server
 * copies everything but the complaints. Says so once it's saved.
 */
export function useSaveTemplate({
  prescriptionId,
  suggestedName = '',
}: UseSaveTemplateOptions) {
  const [create, { isLoading }] = useCreateTemplateMutation();
  const [savedName, setSavedName] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(saveTemplateSchema),
    defaultValues: { name: suggestedName },
  });

  const submit = handleSubmit(async ({ name }) => {
    try {
      const template = await create({
        name,
        fromPrescriptionId: prescriptionId,
      }).unwrap();
      setSavedName(template.name);
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    isSaving: isLoading,
    formError: formState.errors.root?.message,
    /** Set once it's saved: the dialog then only says so. */
    savedNote: savedName !== null ? templatesCopy.save.saved(savedName) : null,
  };
}
