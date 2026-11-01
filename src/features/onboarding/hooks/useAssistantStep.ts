import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { Role } from '@/constants/roles';
import { Routes } from '@/constants/routes';
import {
  assistantSchema,
  teamCopy,
  useAddMemberMutation,
} from '@/features/team';
import { messageFor, toApiError } from '@/lib/api';
import { onboardingCompleted, selectActiveLocationId } from '@/lib/session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { firstName } from '@/utils/text';

import { onboardingCopy } from '../copy';
import { onboardingFinished, selectDoctorProfile } from '../slice';

/**
 * Step 3, optional. The assistant is added by phone number; the server finds
 * or creates their account. Skipping is a first-class choice.
 */
export function useAssistantStep() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectDoctorProfile);
  const locationId = useAppSelector(selectActiveLocationId);
  const [addMember, { isLoading: isSaving }] = useAddMemberMutation();

  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(assistantSchema),
    defaultValues: { name: '', phone: '' },
  });

  // Closing setup opens the app; the router moves to Today.
  const finish = () => {
    dispatch(onboardingFinished());
    dispatch(onboardingCompleted());
  };

  const submit = handleSubmit(async (assistant) => {
    if (!locationId) {
      setError('root', { message: onboardingCopy.errors.noActiveClinic });
      return;
    }
    try {
      await addMember({
        name: assistant.name,
        phone: assistant.phone,
        role: Role.pa,
        locationIds: [locationId],
      }).unwrap();
      finish();
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    control,
    submit,
    skip: finish,
    isSaving,
    formError: formState.errors.root?.message,
    smsPreview: teamCopy.fields.smsPreview(firstName(profile?.fullName ?? '')),
    back: () => navigate(Routes.setupLocation),
  };
}
