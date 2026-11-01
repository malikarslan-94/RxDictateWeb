import { useEffect, useRef } from 'react';

import { clinicApi } from '@/features/clinic';
import {
  ALL_API_TAGS,
  RefreshOutcome,
  baseApi,
  refreshSessionNow,
} from '@/lib/api';
import {
  Verdict,
  connectRealtime,
  liveInterrupted,
  liveRestored,
  realtimeUrl,
  tagsFor,
} from '@/lib/realtime';
import type { RealtimeConnection } from '@/lib/realtime';
import {
  SignOutReason,
  membershipLost,
  membershipsUpdated,
  selectAccessToken,
  selectActiveLocationId,
  selectActiveMembership,
  selectRequestScope,
  selectUser,
  signOutRequested,
} from '@/lib/session';
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks';

import {
  INTERRUPTED_AFTER_MS,
  LIVE_LOCATION_GONE,
  LIVE_NEEDS_REFRESH,
  LIVE_NOT_A_MEMBER,
  LIVE_SESSION_OVER,
  REFRESH_AHEAD_MS,
} from '../constants';

/**
 * Keeps every list on screen current: the server says what changed and the
 * cache refetches just that. No polling sits behind it, so after any drop the
 * reconnect refetches everything, and the access token is refreshed before
 * it runs out so the line stays open.
 */
export function useLiveUpdates() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const userId = useAppSelector(selectUser)?.id ?? null;
  const practiceId = useAppSelector(selectActiveMembership)?.practiceId ?? null;
  const locationId = useAppSelector(selectActiveLocationId);
  const access = useAppSelector(selectAccessToken);
  const connection = useRef<RealtimeConnection | null>(null);

  // One connection for each user, clinic and location.
  useEffect(() => {
    if (!userId || !practiceId || !locationId) return;
    let interrupting: ReturnType<typeof setTimeout> | undefined;
    const down = () => {
      interrupting ??= setTimeout(
        () => dispatch(liveInterrupted()),
        INTERRUPTED_AFTER_MS,
      );
    };
    const up = () => {
      clearTimeout(interrupting);
      interrupting = undefined;
      dispatch(liveRestored());
    };
    const refetch = (tags: Parameters<typeof baseApi.util.invalidateTags>[0]) =>
      dispatch(baseApi.util.invalidateTags(tags));

    const refreshMemberships = async () => {
      const request = dispatch(
        clinicApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      );
      try {
        const me = await request.unwrap();
        dispatch(membershipsUpdated(me.memberships));
      } catch {
        // The next try to connect asks again.
      } finally {
        request.unsubscribe();
      }
    };

    const live = connectRealtime(realtimeUrl(), {
      auth: () => {
        const token = selectRequestScope(store.getState()).accessToken;
        return token ? { type: 'auth', token, practiceId, locationId } : null;
      },
      onReady: (hasMissed) => {
        up();
        // Whatever changed while the line was down.
        if (hasMissed) refetch(ALL_API_TAGS);
      },
      onChanged: (topic, id) => refetch(tagsFor(topic, id)),
      onDown: down,
      onRefused: async (code) => {
        if (LIVE_NEEDS_REFRESH.includes(code)) {
          const outcome = await dispatch(refreshSessionNow());
          return outcome === RefreshOutcome.Expired
            ? Verdict.Stop
            : Verdict.Retry;
        }
        if (LIVE_SESSION_OVER.includes(code)) {
          dispatch(signOutRequested(SignOutReason.Expired));
          return Verdict.Stop;
        }
        if (LIVE_NOT_A_MEMBER.includes(code)) {
          dispatch(membershipLost(practiceId));
          return Verdict.Stop;
        }
        // A new location closes this connection and opens the next one.
        if (LIVE_LOCATION_GONE.includes(code)) await refreshMemberships();
        return Verdict.Retry;
      },
    });
    connection.current = live;
    down();
    return () => {
      live.close();
      connection.current = null;
      clearTimeout(interrupting);
      dispatch(liveRestored());
    };
  }, [dispatch, store, userId, practiceId, locationId]);

  // Each new token goes to the server, and the next one is fetched shortly
  // before it runs out. Never sooner than halfway, however short it lives.
  useEffect(() => {
    if (!access) return;
    connection.current?.reauth();
    const left = access.expires.getTime() - Date.now();
    const timer = setTimeout(
      () => void dispatch(refreshSessionNow()),
      Math.max(left - REFRESH_AHEAD_MS, left / 2),
    );
    return () => clearTimeout(timer);
  }, [dispatch, access]);
}
