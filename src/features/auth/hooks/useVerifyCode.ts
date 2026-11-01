import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ErrorCode } from '@/constants/errorCodes';
import { Routes } from '@/constants/routes';
import { useCountdown } from '@/hooks/useCountdown';
import { detailNumber, messageFor, toApiError } from '@/lib/api';
import { getDeviceInfo, saveTokens, sessionStarted } from '@/lib/session';
import { useAppDispatch } from '@/store/hooks';
import { formatE164 } from '@/utils/phone';
import { formatCountdown } from '@/utils/time';

import { useSendOtpMutation, useVerifyOtpMutation } from '../api';
import {
  AuthMode,
  DEAD_CODE_ERRORS,
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
} from '../constants';
import { authCopy } from '../copy';
import type { NoClinicState, SignInState, VerifyState } from '../types';

/**
 * The code step: verify, resend on a cooldown, and decide where a verified
 * user goes next. Opened without a number (a reload, a typed URL), it has
 * nothing to verify and says so with `isMissing`.
 */
export function useVerifyCode() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const state = useLocation().state as VerifyState | null;

  // Development servers return the code, so testing needs no SMS.
  const [code, setCode] = useState(state?.devCode ?? '');
  const [error, setError] = useState<string>();
  const countdown = useCountdown(RESEND_COOLDOWN_SECONDS);
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp] = useSendOtpMutation();

  const changeCode = (next: string) => {
    setCode(next);
    setError(undefined);
  };

  const verify = async (candidate: string = code) => {
    if (!state) return;
    if (candidate.length !== OTP_LENGTH) {
      setError(authCopy.verify.enterCode);
      return;
    }
    const isSignUp = state.mode === AuthMode.SignUp;
    try {
      // Only "Set up your clinic" asks the server to create a clinic; an
      // unknown number on "Sign in" comes back with none.
      const session = await verifyOtp({
        phone: state.phone,
        code: candidate,
        intent: isSignUp ? AuthMode.SignUp : AuthMode.SignIn,
        ...getDeviceInfo(),
      }).unwrap();
      saveTokens(session.tokens, state.keepSignedIn);
      dispatch(sessionStarted(session));
      // With a clinic, the router takes over: setup for a new doctor, the
      // role's home for everyone else. Without one, explain why.
      if (session.memberships.length === 0) {
        const next: NoClinicState = { phone: state.phone };
        navigate(Routes.noClinic, { replace: true, state: next });
      }
    } catch (caught) {
      const apiError = toApiError(caught);
      setCode('');
      if (DEAD_CODE_ERRORS.includes(apiError.code)) {
        const back: SignInState = { reason: apiError.code, mode: state.mode };
        navigate(Routes.signIn, { replace: true, state: back });
        return;
      }
      setError(messageFor(apiError));
    }
  };

  const resend = async () => {
    if (!state || countdown.isRunning) return;
    setError(undefined);
    setCode('');
    try {
      const result = await sendOtp({ phone: state.phone }).unwrap();
      if (result.devCode) setCode(result.devCode);
      countdown.restart();
    } catch (caught) {
      const apiError = toApiError(caught);
      if (apiError.code === ErrorCode.OTP_COOLDOWN) {
        // Trust the server's number over our own guess.
        countdown.restart(
          detailNumber(apiError, 'retryAfterSeconds') ??
            RESEND_COOLDOWN_SECONDS,
        );
      } else {
        setError(messageFor(apiError));
      }
    }
  };

  return {
    isMissing: !state,
    sentTo: state ? authCopy.verify.sentTo(formatE164(state.phone)) : '',
    code,
    changeCode,
    error,
    verify,
    isVerifying,
    resend,
    canResend: !countdown.isRunning,
    resendIn: formatCountdown(countdown.remaining),
    changeNumber: () =>
      navigate(Routes.signIn, {
        state: { mode: state?.mode } satisfies SignInState,
      }),
  };
}
