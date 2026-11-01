import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';

import { ErrorCode } from '@/constants/errorCodes';
import type { ErrorCode as AnyErrorCode } from '@/constants/errorCodes';
import { sessionSchema } from '@/contract';
import type { SuccessBody } from '@/contract';
import {
  SignOutReason,
  loadTokens,
  membershipLost,
  saveTokens,
  selectRefreshToken,
  selectRequestScope,
  signOutRequested,
  tokensRefreshed,
} from '@/lib/session';
import type { SessionRootState } from '@/lib/session';
import { ToastTone, toastShown } from '@/lib/toast';

import { fromFetchError } from './apiError';
import type { ApiError } from './apiError';
import { API_BASE_URL, Header, REQUEST_TIMEOUT_MS } from './config';
import { messageFor } from './errorMessages';

/** RTK's request meta plus the envelope's `meta` (paging and the like). */
export type ApiMeta = FetchBaseQueryMeta & {
  envelope?: Record<string, unknown>;
};

/**
 * What an endpoint says when it's done, set in its `extraOptions`. Every
 * mutation that fails says so on its own; one that works says `success`.
 */
export type ApiExtraOptions = {
  /** Shown once the mutation works, e.g. "Appointment booked". */
  success?: string;
  /** Runs in the background (marking a report seen): nothing either way. */
  quiet?: boolean;
};

const SESSION_PATH = '/auth/';
const REFRESH_PATH = '/auth/refresh';

/** The access token alone is the problem: refresh it and try again. */
const NEEDS_REFRESH: readonly AnyErrorCode[] = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
  ErrorCode.UNAUTHENTICATED,
];

/** The session itself is over: logged out elsewhere, revoked, or too old. */
const SESSION_OVER: readonly AnyErrorCode[] = [
  ErrorCode.SESSION_REVOKED,
  ErrorCode.SESSION_EXPIRED,
];

/** On the refresh call, any of these means there's no session to keep. */
const REFRESH_REFUSED: readonly AnyErrorCode[] = [
  ...SESSION_OVER,
  ...NEEDS_REFRESH,
];

/** The session's own news: sign in and the clinic switcher say it instead. */
const NOT_TOASTED: readonly AnyErrorCode[] = [
  ...REFRESH_REFUSED,
  ErrorCode.MEMBERSHIP_REMOVED,
];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken, practiceId, locationId } = selectRequestScope(
      getState() as SessionRootState,
    );
    if (accessToken) headers.set(Header.Authorization, `Bearer ${accessToken}`);
    if (practiceId) headers.set(Header.PracticeId, practiceId);
    if (locationId) headers.set(Header.LocationId, locationId);
    return headers;
  },
});

const urlOf = (args: string | FetchArgs) =>
  typeof args === 'string' ? args : args.url;

/** How a token refresh went. */
export const RefreshOutcome = {
  Refreshed: 'refreshed',
  /** The server refused it: the session is over. */
  Expired: 'expired',
  /** Offline or a server fault: keep the session and try later. */
  Unavailable: 'unavailable',
} as const;
export type RefreshOutcome =
  (typeof RefreshOutcome)[keyof typeof RefreshOutcome];

/** Shared by every request that fails while one refresh is under way. */
let refreshing: Promise<RefreshOutcome> | null = null;

/** One refresh at a time across every tab of this browser. */
const REFRESH_LOCK = 'session-refresh';

/**
 * Trade the refresh token for a new pair. The server burns the old one, so
 * the new pair is saved before anything else can use it.
 *
 * Tabs that keep the session in localStorage share one refresh token, so
 * they take turns: a tab that waited reads the pair the other just saved
 * instead of spending the burnt token and being signed out for reuse.
 */
async function refreshSession(
  api: BaseQueryApi,
  extraOptions: object,
): Promise<RefreshOutcome> {
  const run = () => refreshOnce(api, extraOptions);
  return typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(REFRESH_LOCK, run)
    : run();
}

async function refreshOnce(
  api: BaseQueryApi,
  extraOptions: object,
): Promise<RefreshOutcome> {
  const refreshToken = selectRefreshToken(api.getState() as SessionRootState);
  if (!refreshToken) return RefreshOutcome.Expired;

  const stored = loadTokens();
  if (stored && stored.refresh.token !== refreshToken) {
    api.dispatch(tokensRefreshed(stored));
    return RefreshOutcome.Refreshed;
  }

  const result = await rawBaseQuery(
    { url: REFRESH_PATH, method: 'POST', body: { refreshToken } },
    api,
    extraOptions,
  );
  if (result.error) {
    // Offline or a server fault is not a verdict: keep the session.
    return REFRESH_REFUSED.includes(fromFetchError(result.error).code)
      ? RefreshOutcome.Expired
      : RefreshOutcome.Unavailable;
  }

  const session = sessionSchema.safeParse(
    (result.data as SuccessBody<unknown> | undefined)?.data,
  );
  if (!session.success) return RefreshOutcome.Unavailable;
  saveTokens(session.data.tokens);
  api.dispatch(tokensRefreshed(session.data.tokens));
  return RefreshOutcome.Refreshed;
}

/** Joins the refresh under way, or starts one. */
function refreshShared(
  api: BaseQueryApi,
  extraOptions: object,
): Promise<RefreshOutcome> {
  refreshing ??= refreshSession(api, extraOptions).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/**
 * Refresh now, without a refused request: the live connection does this
 * before the access token runs out, so it stays open. A refusal ends the
 * session, as it does for a request.
 */
export function refreshSessionNow(): ThunkAction<
  Promise<RefreshOutcome>,
  SessionRootState,
  unknown,
  UnknownAction
> {
  return async (dispatch, getState) => {
    const outcome = await refreshShared(
      {
        dispatch,
        getState,
        signal: new AbortController().signal,
        abort: () => undefined,
        extra: undefined,
        endpoint: REFRESH_PATH,
        type: 'mutation',
      },
      {},
    );
    if (outcome === RefreshOutcome.Expired) {
      dispatch(signOutRequested(SignOutReason.Expired));
    }
    return outcome;
  };
}

/**
 * Every request goes through here. It unwraps `{ data, meta }`, so endpoints
 * receive the payload itself, and turns every failure into an ApiError.
 *
 * A request refused for its access token is retried once after a refresh. A
 * refresh the server rejects ends the session; a request refused because the
 * user left the clinic hands over to the membership check.
 */
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError,
  ApiExtraOptions,
  ApiMeta
> = async (args, api, extraOptions = {}) => {
  const isAnnounced = api.type === 'mutation' && !extraOptions.quiet;
  const state = () => api.getState() as SessionRootState;
  const sentWith = selectRequestScope(state()).accessToken;
  let result = await rawBaseQuery(args, api, extraOptions);
  // Sign-in calls manage tokens themselves, and signed out there's no session.
  const guardsSession =
    !urlOf(args).startsWith(SESSION_PATH) &&
    selectRefreshToken(state()) !== null;

  if (
    result.error &&
    guardsSession &&
    NEEDS_REFRESH.includes(fromFetchError(result.error).code)
  ) {
    // Another request may have refreshed while this one was out.
    const outcome =
      selectRequestScope(state()).accessToken !== sentWith
        ? RefreshOutcome.Refreshed
        : await refreshShared(api, extraOptions);
    if (outcome === RefreshOutcome.Refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else if (outcome === RefreshOutcome.Expired) {
      api.dispatch(signOutRequested(SignOutReason.Expired));
    }
  }

  if (result.error) {
    const error = fromFetchError(result.error);
    if (guardsSession && SESSION_OVER.includes(error.code)) {
      api.dispatch(signOutRequested(SignOutReason.Expired));
    }
    const { practiceId } = selectRequestScope(state());
    if (
      guardsSession &&
      error.code === ErrorCode.MEMBERSHIP_REMOVED &&
      practiceId
    ) {
      api.dispatch(membershipLost(practiceId));
    }
    if (isAnnounced && !NOT_TOASTED.includes(error.code)) {
      api.dispatch(
        toastShown({ tone: ToastTone.danger, message: messageFor(error) }),
      );
    }
    return { error, meta: result.meta };
  }

  if (isAnnounced && extraOptions.success) {
    api.dispatch(
      toastShown({ tone: ToastTone.success, message: extraOptions.success }),
    );
  }
  const body = result.data as SuccessBody<unknown> | undefined;
  return {
    data: body?.data,
    meta: result.meta && { ...result.meta, envelope: body?.meta },
  };
};
