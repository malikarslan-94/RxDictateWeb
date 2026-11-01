import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router';

import { Routes } from '@/constants/routes';
import { messageFor, messageForCode, toApiError } from '@/lib/api';
import {
  SignOutReason,
  selectSignOutReason,
  signOutReasonShown,
} from '@/lib/session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { useSendOtpMutation } from '../api';
import { AuthMode } from '../constants';
import { authCopy } from '../copy';
import { signInFormSchema } from '../schemas';
import type { SignInFormInput } from '../schemas';
import type { SignInState, VerifyState } from '../types';

const DEFAULTS: SignInFormInput = { phone: '', keepSignedIn: false };

/**
 * The phone step, for signing in and for a new doctor setting up a clinic:
 * check the number, ask the server for a code, then open the code screen.
 */
export function useSendCodeForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const state = (useLocation().state ?? {}) as SignInState;
  const [mode, setMode] = useState<AuthMode>(state.mode ?? AuthMode.SignIn);
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(signInFormSchema),
    defaultValues: DEFAULTS,
  });

  // Signed out by the server or the clinic: say so until the first keystroke.
  const signOutReason = useAppSelector(selectSignOutReason);
  const phone = useWatch({ control, name: 'phone' });
  useEffect(() => {
    if (phone) dispatch(signOutReasonShown());
  }, [phone, dispatch]);
  const notice =
    signOutReason === SignOutReason.Expired ||
    signOutReason === SignOutReason.Revoked
      ? authCopy.banner.expired
      : signOutReason === SignOutReason.RemovedEverywhere
        ? authCopy.banner.removed
        : null;

  // Sent back from the code screen (code expired or locked): say why.
  useEffect(() => {
    if (state.reason)
      setError('phone', { message: messageForCode(state.reason) });
  }, [state.reason, setError]);

  const submit = handleSubmit(async ({ phone, keepSignedIn }) => {
    try {
      const { devCode } = await sendOtp({ phone }).unwrap();
      const next: VerifyState = { phone, mode, keepSignedIn, devCode };
      navigate(Routes.verify, { state: next });
    } catch (error) {
      setError('phone', { message: messageFor(toApiError(error)) });
    }
  });

  const isSignUp = mode === AuthMode.SignUp;
  return {
    control,
    submit,
    isSending,
    notice,
    isSignUp,
    copy: isSignUp ? authCopy.signUp : authCopy.signIn,
    switchMode: () => setMode(isSignUp ? AuthMode.SignIn : AuthMode.SignUp),
  };
}
