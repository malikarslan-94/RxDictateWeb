import { messageFor, toApiError } from '@/lib/api';

import { useDeleteTemplateMutation } from '../api';

/** Delete a template; prescriptions started from it stay as they are. */
export function useDeleteTemplate(templateId: string, onDone: () => void) {
  const [deleteTemplate, { isLoading, error }] = useDeleteTemplateMutation();
  return {
    isDeleting: isLoading,
    error: error ? messageFor(toApiError(error)) : undefined,
    confirm: async () => {
      const result = await deleteTemplate(templateId);
      if (!('error' in result)) onDone();
    },
  };
}
