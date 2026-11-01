import { createAsyncThunk } from '@reduxjs/toolkit';

import { clinicApi } from '@/features/clinic';
import { baseApi } from '@/lib/api';
import { clearRecordings } from '@/lib/recordings';
import {
  SignOutReason,
  clearTokens,
  clinicAccessLost,
  runSignOutTasks,
  selectRefreshToken,
  signedOut,
  tellOtherTabs,
} from '@/lib/session';
import type { SessionRootState } from '@/lib/session';
import { removeItem } from '@/lib/storage';

import { authApi } from './api';
import { LOGOUT_TIMEOUT_MS } from './constants';
import { USER_STORAGE_KEYS } from './userKeys';

export type SignOutOptions = {
  reason: SignOutReason;
  /** Tell the server too. Off when the server is the one that ended it. */
  callServer?: boolean;
  /** Another tab signed out: follow it, without telling the tabs again. */
  fromOtherTab?: boolean;
};

/** One step of sign-out. A failure is swallowed so the next step still runs. */
async function attempt(step: () => unknown): Promise<void> {
  try {
    await step();
  } catch {
    // Signing out must always finish, online or not.
  }
}

/** Settles when `work` does, or after `ms`, whichever comes first. */
function within(work: Promise<unknown>, ms: number): Promise<unknown> {
  return Promise.race([
    work,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

let isSigningOut = false;

/**
 * The one way out. Leaves nothing of the user in this browser but the device
 * id and the computer's own settings: the server session, any recording, the
 * tokens, the user's stored keys and every cached response. Every tab follows.
 */
export const signOut = createAsyncThunk<
  void,
  SignOutOptions,
  { state: SessionRootState }
>(
  'auth/signOut',
  async (
    { reason, callServer = true, fromOtherTab = false },
    { dispatch, getState },
  ) => {
    isSigningOut = true;
    try {
      const refreshToken = selectRefreshToken(getState()) ?? undefined;
      if (callServer && !fromOtherTab) {
        await attempt(() =>
          within(
            dispatch(
              authApi.endpoints.logout.initiate({ refreshToken }),
            ).unwrap(),
            LOGOUT_TIMEOUT_MS,
          ),
        );
      }
      // Patient audio must not stay in the browser after sign-out.
      await attempt(runSignOutTasks);
      await attempt(clearRecordings);
      await attempt(clearTokens);
      await attempt(() => USER_STORAGE_KEYS.forEach((key) => removeItem(key)));
      dispatch(baseApi.util.resetApiState());
      dispatch(signedOut(reason));
      if (!fromOtherTab) tellOtherTabs({ kind: 'signedOut' });
    } finally {
      isSigningOut = false;
    }
  },
  // Several requests can fail at once; the first sign-out does the work.
  { condition: () => !isSigningOut },
);

let isCheckingMembership = false;

/**
 * The server says the user was removed from the clinic they're working in.
 * With another clinic left they carry on there; with none they're signed out.
 */
export const handleMembershipRemoved = createAsyncThunk<
  void,
  string,
  { state: SessionRootState }
>(
  'auth/membershipRemoved',
  async (practiceId, { dispatch, getState }) => {
    isCheckingMembership = true;
    const lost = getState().session.session?.memberships.find(
      (membership) => membership.practiceId === practiceId,
    );
    const request = dispatch(
      clinicApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
    );
    try {
      const me = await request.unwrap();
      const remaining = me.memberships.filter(
        (membership) => membership.practiceId !== practiceId,
      );
      if (remaining.length > 0) {
        dispatch(
          clinicAccessLost({
            memberships: remaining,
            clinicName: lost?.practiceName ?? '',
          }),
        );
      } else {
        await dispatch(
          signOut({
            reason: SignOutReason.RemovedEverywhere,
            callServer: true,
          }),
        );
      }
    } finally {
      request.unsubscribe();
      isCheckingMembership = false;
    }
  },
  { condition: () => !isCheckingMembership },
);
