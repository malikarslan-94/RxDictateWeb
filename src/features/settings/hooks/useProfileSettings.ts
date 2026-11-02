import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  profileSchema,
  useGetMeQuery,
  useGetPracticeQuery,
  useUpdateMeMutation,
  useUpdatePracticeMutation,
} from '@/features/clinic';
import type { ProfileValues } from '@/features/clinic';
import { useInView } from '@/hooks/useInView';
import { messageFor, toApiError } from '@/lib/api';
import { signatureName, splitList } from '@/utils/text';

const EMPTY: ProfileValues = {
  fullName: '',
  qualifications: '',
  speciality: '',
  pmdcNo: '',
  clinicName: '',
  specialties: [],
};

const sameItems = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item));

/**
 * Settings › Profile: the doctor's name, specialties, credentials and
 * clinic name. While
 * there are changes and the Save at the foot is out of sight, Save floats at
 * the bottom of the window instead; never both at once.
 */
export function useProfileSettings() {
  const me = useGetMeQuery();
  const practice = useGetPracticeQuery();
  const [updateMe, { isLoading: isSavingName }] = useUpdateMeMutation();
  const [updatePractice, { isLoading: isSavingPractice }] =
    useUpdatePracticeMutation();
  const actions = useInView<HTMLDivElement>();

  const saved: ProfileValues | undefined =
    me.data && practice.data
      ? {
          fullName: me.data.name,
          qualifications: practice.data.qualifications.join(', '),
          speciality: practice.data.speciality,
          pmdcNo: practice.data.pmdcNo,
          clinicName: practice.data.name,
          specialties: me.data.specialties,
        }
      : undefined;

  const { control, handleSubmit, setError, reset, formState } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY,
    // Filled in once both have loaded, without undoing what's been typed.
    values: saved,
    resetOptions: { keepDirtyValues: true },
  });

  const submit = handleSubmit(async (profile) => {
    try {
      if (
        profile.fullName !== saved?.fullName ||
        !sameItems(profile.specialties, saved.specialties)
      ) {
        await updateMe({
          name: profile.fullName,
          specialties: profile.specialties,
        }).unwrap();
      }
      await updatePractice({
        pmdcNo: profile.pmdcNo,
        qualifications: splitList(profile.qualifications),
        speciality: profile.speciality,
        // An emptied name keeps the one the clinic has.
        ...(profile.clinicName ? { name: profile.clinicName } : {}),
      }).unwrap();
      // What was saved is the new starting point: nothing left to save.
      reset(profile);
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    isLoading: !saved && (me.isLoading || practice.isLoading),
    isSaving: isSavingName || isSavingPractice,
    /** Goes on the row with the Save at the foot of the form. */
    watchSaveRow: actions.observe,
    isSaveFloating: formState.isDirty && !actions.isInView,
    formError: formState.errors.root?.message,
    signature: signatureName(me.data?.name ?? ''),
  };
}
