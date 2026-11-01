import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { fullNameField, useUpdateMeMutation } from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

const accountNameSchema = z.object({ name: fullNameField });

/**
 * The assistant's own name, changed in place on My account: click it, type,
 * Enter saves and Esc puts it back. The menu shows the new one at once.
 */
export function useAccountName() {
  const user = useAppSelector(selectUser);
  const name = user?.name ?? '';
  const [isEditing, setIsEditing] = useState(false);
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const { control, handleSubmit, reset, setError } = useForm({
    resolver: zodResolver(accountNameSchema),
    defaultValues: { name },
  });

  const cancel = () => setIsEditing(false);
  const save = handleSubmit(async (values) => {
    if (values.name === name) {
      cancel();
      return;
    }
    try {
      await updateMe({ name: values.name }).unwrap();
      cancel();
    } catch (error) {
      setError('name', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    name,
    isEditing,
    startEdit: () => {
      reset({ name });
      setIsEditing(true);
    },
    control,
    save,
    cancel,
    isSaving: isLoading,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') cancel();
    },
  };
}
