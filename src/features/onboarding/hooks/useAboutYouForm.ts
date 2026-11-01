import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { Routes } from '@/constants/routes';
import {
  profileSchema,
  useUpdateMeMutation,
  useUpdatePracticeMutation,
} from '@/features/clinic';
import type { ProfileValues } from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { splitList } from '@/utils/text';

import { profileSaved, selectDoctorProfile } from '../slice';

const EMPTY_PROFILE: ProfileValues = {
  fullName: '',
  qualifications: '',
  speciality: '',
  pmdcNo: '',
  clinicName: '',
};

/** Step 1: the doctor's name on their account, credentials on the clinic. */
export function useAboutYouForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectDoctorProfile);
  const [updateMe, { isLoading: isSavingName }] = useUpdateMeMutation();
  const [updatePractice, { isLoading: isSavingPractice }] =
    useUpdatePracticeMutation();

  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: saved ?? EMPTY_PROFILE,
  });

  const submit = handleSubmit(async (profile) => {
    try {
      await updateMe({ name: profile.fullName }).unwrap();
      await updatePractice({
        pmdcNo: profile.pmdcNo,
        qualifications: splitList(profile.qualifications),
        speciality: profile.speciality,
      }).unwrap();
      dispatch(profileSaved(profile));
      navigate(Routes.setupLocation);
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    isSaving: isSavingName || isSavingPractice,
    formError: formState.errors.root?.message,
  };
}
