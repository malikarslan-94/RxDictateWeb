import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { Routes } from '@/constants/routes';
import {
  EMPTY_LOCATION,
  locationSchema,
  samplePrintout,
  scheduleLine,
  toLocationBody,
  useUpdateLocationMutation,
} from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveLocationId } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { toE164 } from '@/utils/phone';

import { onboardingCopy } from '../copy';
import { selectDoctorProfile } from '../slice';

/**
 * Step 2: fills in the location verify created ("My clinic"), and keeps a
 * live printout of what the doctor is typing beside the form.
 */
export function useLocationStep() {
  const navigate = useNavigate();
  const profile = useAppSelector(selectDoctorProfile);
  const locationId = useAppSelector(selectActiveLocationId);
  const [updateLocation, { isLoading: isSaving }] = useUpdateLocationMutation();

  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: EMPTY_LOCATION,
  });
  const [name, address, phone, days, opensAt, closesAt] = useWatch({
    control,
    name: ['name', 'address', 'phone', 'days', 'opensAt', 'closesAt'],
  });

  const submit = handleSubmit(async (clinic) => {
    if (!locationId) {
      setError('root', { message: onboardingCopy.errors.noActiveClinic });
      return;
    }
    try {
      await updateLocation({
        id: locationId,
        body: toLocationBody(clinic),
      }).unwrap();
      navigate(Routes.setupAssistant);
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    isSaving,
    formError: formState.errors.root?.message,
    preview: samplePrintout({
      doctorName: profile?.fullName ?? '',
      qualifications: profile?.qualifications ?? '',
      speciality: profile?.speciality ?? '',
      pmdcNo: profile?.pmdcNo ?? '',
      clinicName: name,
      address,
      phone: toE164(phone) ?? '',
      schedule: scheduleLine(days, opensAt, closesAt),
    }),
    back: () => navigate(Routes.setupAboutYou),
  };
}
