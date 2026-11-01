import { createAction, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { Role } from '@/constants/roles';
import type { MeView, MembershipView, Session, TokenPair } from '@/contract';

import { pickLocationId, pickMembership } from './selection';

/** Which part of the app the user may be in. The root layout guards on it. */
export const AppArea = {
  /** Signed out, or signed in with no clinic. */
  Auth: 'auth',
  /** A doctor who hasn't finished setting up the clinic. */
  Onboarding: 'onboarding',
  App: 'app',
} as const;
export type AppArea = (typeof AppArea)[keyof typeof AppArea];

/** Why the user was signed out. Sign in explains the forced ones. */
export const SignOutReason = {
  User: 'user',
  Expired: 'expired',
  Revoked: 'revoked',
  RemovedEverywhere: 'removed_everywhere',
} as const;
export type SignOutReason = (typeof SignOutReason)[keyof typeof SignOutReason];

export type SessionState = {
  session: Session | null;
  /** Sent with every request; the copy in `session` is from sign-in only. */
  tokens: TokenPair | null;
  /** The clinic every request is scoped to (X-Practice-Id). */
  practiceId: string | null;
  /** The location within that clinic (X-Location-Id). */
  locationId: string | null;
  needsOnboarding: boolean;
  /** Set by the last sign-out until Sign in has shown it. */
  signOutReason: SignOutReason | null;
  /** A clinic the user just lost access to, for the toast. */
  lostAccessTo: string | null;
};

export type SessionRootState = { session: SessionState };

const initialState: SessionState = {
  session: null,
  tokens: null,
  practiceId: null,
  locationId: null,
  needsOnboarding: false,
  signOutReason: null,
  lostAccessTo: null,
};

/** Point the session at the first usable clinic in `memberships`. */
function chooseClinic(state: SessionState, memberships: MembershipView[]) {
  const membership = pickMembership(memberships);
  state.practiceId = membership?.practiceId ?? null;
  state.locationId = membership ? pickLocationId(membership) : null;
  // A doctor with no name yet came straight from the clinic the server
  // created at verify: they still have the setup steps to do.
  state.needsOnboarding =
    membership?.role === Role.doctor &&
    (state.session?.user.name.trim() ?? '') === '';
}

/** The server said the session is over; signOut does the clearing. */
export const signOutRequested = createAction<SignOutReason>(
  'session/signOutRequested',
);

/** The server said the user is no longer a member of the active clinic. */
export const membershipLost = createAction<string>('session/membershipLost');

/**
 * Who is signed in and which clinic they're working in. Tokens are kept in
 * browser storage too (tokenStore); this is the copy requests read.
 */
export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<Session>) {
      state.session = action.payload;
      state.tokens = action.payload.tokens;
      state.signOutReason = null;
      chooseClinic(state, action.payload.memberships);
    },
    /** At launch: the stored tokens, before GET /me says who they belong to. */
    tokensLoaded(state, action: PayloadAction<TokenPair>) {
      state.tokens = action.payload;
    },
    tokensRefreshed(state, action: PayloadAction<TokenPair>) {
      state.tokens = action.payload;
    },
    /** At launch: GET /me answered for the stored tokens. */
    sessionRestored(state, action: PayloadAction<MeView>) {
      if (!state.tokens) return;
      const { memberships, ...user } = action.payload;
      state.session = { user, memberships, tokens: state.tokens };
      chooseClinic(state, memberships);
    },
    /** They changed their own details, e.g. their name. */
    userUpdated(state, action: PayloadAction<MeView>) {
      if (!state.session) return;
      const { memberships: _memberships, ...user } = action.payload;
      state.session.user = user;
    },
    /** After setting up a clinic from the "not linked" screen. */
    membershipsUpdated(state, action: PayloadAction<MembershipView[]>) {
      if (!state.session) return;
      state.session.memberships = action.payload;
      chooseClinic(state, action.payload);
    },
    /** Removed from one clinic: carry on in the next one. */
    clinicAccessLost(
      state,
      action: PayloadAction<{
        memberships: MembershipView[];
        clinicName: string;
      }>,
    ) {
      if (!state.session) return;
      state.session.memberships = action.payload.memberships;
      state.lostAccessTo = action.payload.clinicName;
      chooseClinic(state, action.payload.memberships);
    },
    lostAccessShown(state) {
      state.lostAccessTo = null;
    },
    /** The location switcher, or the place this computer worked at last. */
    locationChosen(state, action: PayloadAction<string>) {
      const membership = state.session?.memberships.find(
        (item) => item.practiceId === state.practiceId,
      );
      const isAllowed = membership?.locations.some(
        (location) =>
          location.id === action.payload && location.status === 'active',
      );
      if (isAllowed) state.locationId = action.payload;
    },
    onboardingCompleted(state) {
      state.needsOnboarding = false;
    },
    signedOut: (_state, action: PayloadAction<SignOutReason | undefined>) => ({
      ...initialState,
      signOutReason: action.payload ?? null,
    }),
    signOutReasonShown(state) {
      state.signOutReason = null;
    },
  },
  selectors: {
    selectSession: (state) => state.session,
    selectUser: (state) => state.session?.user ?? null,
    selectActiveMembership: (state) =>
      state.session?.memberships.find(
        (membership) => membership.practiceId === state.practiceId,
      ) ?? null,
    selectActiveRole: (state) =>
      state.session?.memberships.find(
        (membership) => membership.practiceId === state.practiceId,
      )?.role ?? null,
    selectActiveLocationId: (state) => state.locationId,
    selectAppArea: (state): AppArea => {
      if (!state.session || !state.practiceId) return AppArea.Auth;
      return state.needsOnboarding ? AppArea.Onboarding : AppArea.App;
    },
    selectRequestScope: (state) => ({
      accessToken: state.tokens?.access.token ?? null,
      practiceId: state.practiceId,
      locationId: state.locationId,
    }),
    selectRefreshToken: (state) => state.tokens?.refresh.token ?? null,
    /** The access token and when it runs out. */
    selectAccessToken: (state) => state.tokens?.access ?? null,
    selectSignOutReason: (state) => state.signOutReason,
    selectLostAccessTo: (state) => state.lostAccessTo,
  },
});

export const {
  sessionStarted,
  tokensLoaded,
  tokensRefreshed,
  sessionRestored,
  userUpdated,
  membershipsUpdated,
  clinicAccessLost,
  lostAccessShown,
  locationChosen,
  onboardingCompleted,
  signedOut,
  signOutReasonShown,
} = sessionSlice.actions;
export const {
  selectSession,
  selectUser,
  selectActiveMembership,
  selectActiveRole,
  selectActiveLocationId,
  selectAppArea,
  selectRequestScope,
  selectRefreshToken,
  selectAccessToken,
  selectSignOutReason,
  selectLostAccessTo,
} = sessionSlice.selectors;
