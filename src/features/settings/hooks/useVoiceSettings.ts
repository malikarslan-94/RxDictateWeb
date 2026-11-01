import {
  useGetPracticeQuery,
  useUpdatePracticeMutation,
} from '@/features/clinic';
import { voiceCopy } from '@/features/voice';
import { messageFor, toApiError } from '@/lib/api';

import { AUDIO_RETENTION_CHOICES } from '../constants';

/**
 * Settings › Voice: the microphone is this computer's; how long dictation
 * audio is kept is the clinic's.
 */
export function useVoiceSettings() {
  const practice = useGetPracticeQuery();
  const [updatePractice, { isLoading: isSaving, error }] =
    useUpdatePracticeMutation();
  const days = practice.data?.settings.audioRetentionDays;

  return {
    retentionOptions: AUDIO_RETENTION_CHOICES.map((choice) => ({
      label: voiceCopy.settings.keepDays(choice),
      value: String(choice),
    })),
    retention: days === undefined ? null : String(days),
    chooseRetention: (value: string) => {
      updatePractice({ settings: { audioRetentionDays: Number(value) } });
    },
    isSaving,
    error: error ? messageFor(toApiError(error)) : undefined,
  };
}
