import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { consultPath } from '@/constants/routes';
import type { TemplateView } from '@/contract';
import { messageFor, toApiError } from '@/lib/api';

import { useCreateFromTemplateMutation } from '../api';
import { useTemplateSchema } from '../schemas';

/**
 * "Use" on the Templates page: pick the patient, and their prescription
 * starts from the template (or gains its lines), then the consult opens.
 */
export function useUseTemplate(template: TemplateView) {
  const navigate = useNavigate();
  const [startFrom, { isLoading }] = useCreateFromTemplateMutation();
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(useTemplateSchema),
    defaultValues: { patientId: '' },
  });

  const submit = handleSubmit(async ({ patientId }) => {
    try {
      // The server puts them on today's list as "With doctor" if needed.
      const draft = await startFrom({
        templateId: template.id,
        body: { patientId },
      }).unwrap();
      navigate(consultPath(patientId, draft.visitId));
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    isStarting: isLoading || formState.isSubmitting,
    formError: formState.errors.root?.message,
  };
}
