import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNavigate, useParams } from 'react-router';

import { Routes } from '@/constants/routes';
import {
  useCreateTemplateMutation,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
} from '@/features/templates';
import { messageFor, toApiError } from '@/lib/api';

import { rxCopy } from '../copy';
import { templateEditorSchema } from '../schemas';
import { isEmpty } from '../utils';
import { useLocalRxEditor } from './useLocalRxEditor';

const copy = rxCopy.templateEditor;

/**
 * A new template, or one being changed, over the Templates page: its name
 * and the same sections a prescription has, edited here and saved whole.
 */
export function useTemplateEditor() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const existing = useGetTemplateQuery(templateId ?? skipToken);
  const [create, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [update, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const local = useLocalRxEditor();
  const { control, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(templateEditorSchema),
    defaultValues: { name: '' },
  });

  // A saved template fills the editor once it has loaded.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  if (existing.data && loadedId !== existing.data.id) {
    setLoadedId(existing.data.id);
    local.reset(existing.data.sections);
    reset({ name: existing.data.name });
  }

  const close = () => navigate(Routes.templates);

  const save = handleSubmit(async ({ name }) => {
    if (isEmpty(local.sections)) {
      setError('root', { message: copy.empty });
      return;
    }
    try {
      if (templateId) {
        await update({
          id: templateId,
          body: { name, sections: local.sections },
        }).unwrap();
      } else {
        await create({ name, sections: local.sections }).unwrap();
      }
      close();
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    title: templateId ? copy.editTitle : copy.newTitle,
    control,
    sections: local.sections,
    editor: local.editor,
    // Until it has loaded, an edit would be lost when it arrives.
    isLoading: !!templateId && !existing.data,
    error: existing.error ? messageFor(toApiError(existing.error)) : undefined,
    save,
    isSaving: isCreating || isUpdating,
    formError: formState.errors.root?.message,
    close,
  };
}
