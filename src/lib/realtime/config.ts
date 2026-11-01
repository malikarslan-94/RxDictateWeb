import { REALTIME_HEARTBEAT_MS, REALTIME_PATH } from '@/contract';
import { API_BASE_URL } from '@/lib/api';

/**
 * The socket's address: the API's own host, over wss from an https page. In
 * development that's the Vite server, which passes the socket on to
 * clinic-api like any other /api request.
 */
export function realtimeUrl(): string {
  const url = new URL(API_BASE_URL, window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = REALTIME_PATH;
  url.search = '';
  return url.toString();
}

/** The wait before each try to reconnect; the last one repeats. */
export const RETRY_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000] as const;

/** Room for a slow network on top of the two heartbeats. */
const HEARTBEAT_GRACE_MS = 5_000;

/**
 * Two heartbeats missed: the line is dead, even when the socket hasn't
 * noticed (a router that dropped it, a laptop that slept).
 */
export const SILENCE_LIMIT_MS = 2 * REALTIME_HEARTBEAT_MS + HEARTBEAT_GRACE_MS;
