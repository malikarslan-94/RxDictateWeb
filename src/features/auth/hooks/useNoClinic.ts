import { useState } from 'react';
import { useLocation } from 'react-router';

import { messageFor, toApiError } from '@/lib/api';
import { SignOutReason, membershipsUpdated, selectUser } from '@/lib/session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatE164 } from '@/utils/phone';

import { useCreatePracticeMutation } from '../api';
import type { NoClinicState } from '../types';
import { useSignOut } from './useSignOut';

/**
 * Verified, but no clinic has this number. A doctor sets one up here without
 * a second code; the router then opens setup. An assistant goes back.
 */
export function useNoClinic() {
  const dispatch = useAppDispatch();
  const state = useLocation().state as NoClinicState | null;
  const user = useAppSelector(selectUser);
  const [createPractice, { isLoading: isCreating }] =
    useCreatePracticeMutation();
  const [error, setError] = useState<string>();
  const { signOut } = useSignOut();

  return {
    phoneLabel: formatE164(state?.phone ?? user?.phone ?? ''),
    setUpClinic: async () => {
      setError(undefined);
      try {
        const me = await createPractice({}).unwrap();
        dispatch(membershipsUpdated(me.memberships));
      } catch (caught) {
        setError(messageFor(toApiError(caught)));
      }
    },
    isCreating,
    error,
    // Verified means signed in: end that session before another number.
    backToSignIn: () => signOut({ reason: SignOutReason.User }),
  };
}
