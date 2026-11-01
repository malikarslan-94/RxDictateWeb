import { useCallback, useEffect, useState } from 'react';

import { ErrorCode } from '@/constants/errorCodes';
import type { ErrorCode as AnyErrorCode } from '@/constants/errorCodes';
import { clinicApi } from '@/features/clinic';
import { toApiError } from '@/lib/api';
import {
  SignOutReason,
  getDeviceId,
  loadTokens,
  sessionRestored,
  tokensLoaded,
} from '@/lib/session';
import { useAppDispatch } from '@/store/hooks';

import { useSignOut } from './useSignOut';

export type LaunchState = 'loading' | 'unreachable' | 'ready';

/** Answers meaning the stored session is over; the base query signs out. */
const SESSION_REFUSED: readonly AnyErrorCode[] = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
  ErrorCode.UNAUTHENTICATED,
  ErrorCode.SESSION_REVOKED,
  ErrorCode.SESSION_EXPIRED,
];

/**
 * Opening the page: load the stored tokens, then ask GET /me who they belong
 * to. No answer keeps the session and offers a retry; a refused session has
 * already been signed out, so Sign in explains it. No tokens goes straight in.
 */
export function useSessionRestore() {
  const dispatch = useAppDispatch();
  const { signOut } = useSignOut();
  const [state, setState] = useState<LaunchState>('loading');

  const restore = useCallback(async () => {
    setState('loading');
    // Made on the first visit and never again, signed in or not.
    getDeviceId();
    const tokens = loadTokens();
    if (!tokens) {
      setState('ready');
      return;
    }
    dispatch(tokensLoaded(tokens));

    const request = dispatch(
      clinicApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    );
    try {
      dispatch(sessionRestored(await request.unwrap()));
      setState('ready');
    } catch (caught) {
      const { code } = toApiError(caught);
      setState(SESSION_REFUSED.includes(code) ? 'ready' : 'unreachable');
    } finally {
      request.unsubscribe();
    }
  }, [dispatch]);

  useEffect(() => {
    restore();
  }, [restore]);

  return {
    state,
    retry: restore,
    signInWithDifferentNumber: async () => {
      await signOut({ reason: SignOutReason.User });
      setState('ready');
    },
  };
}
