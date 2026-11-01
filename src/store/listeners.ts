import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { z } from 'zod';

import { handleMembershipRemoved, signOut } from '@/features/auth/signOut';
import {
  locationChosen,
  membershipLost,
  membershipsUpdated,
  sessionRestored,
  sessionStarted,
  signOutRequested,
  tellOtherTabs,
} from '@/lib/session';
import { StorageKey, readJson, writeJson } from '@/lib/storage';

import type { AppDispatch, RootState } from './index';

/**
 * Where the API client's verdicts become actions. lib/api can't reach the
 * auth feature, so it reports what the server said and these act on it.
 */
export const listeners = createListenerMiddleware();
const startListening = listeners.startListening.withTypes<
  RootState,
  AppDispatch
>();

/** The place each user last worked at on this computer. */
const lastLocationsSchema = z.record(z.string(), z.string());

// The server ended the session: clear the browser without calling it back.
startListening({
  actionCreator: signOutRequested,
  effect: async (action, api) => {
    await api.dispatch(signOut({ reason: action.payload, callServer: false }));
  },
});

// Removed from the active clinic: move to another one, or sign out.
startListening({
  actionCreator: membershipLost,
  effect: async (action, api) => {
    await api.dispatch(handleMembershipRemoved(action.payload));
  },
});

// Signed in on a computer used before: open where this user worked last.
startListening({
  matcher: isAnyOf(sessionStarted, sessionRestored, membershipsUpdated),
  effect: (_action, api) => {
    const { session } = api.getState().session;
    if (!session) return;
    const last = readJson(StorageKey.location, lastLocationsSchema);
    const locationId = last?.[session.user.id];
    if (locationId) api.dispatch(locationChosen(locationId));
  },
});

// A new location: remember it, and show it in this browser's other tabs.
// A tab that hears it from another finds it already stored and stays quiet.
startListening({
  actionCreator: locationChosen,
  effect: (_action, api) => {
    const { session, locationId } = api.getState().session;
    if (!session || !locationId) return;
    const last = readJson(StorageKey.location, lastLocationsSchema) ?? {};
    if (last[session.user.id] === locationId) return;
    writeJson(StorageKey.location, { ...last, [session.user.id]: locationId });
    tellOtherTabs({ kind: 'locationChosen', locationId });
  },
});
