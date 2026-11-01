/**
 * Where every request goes. In development the Vite server proxies /api to
 * clinic-api on this machine (vite.config.ts), so the page and the API share
 * an origin. A deployed build sets VITE_API_URL, including /api/v1.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api/v1';

/** Give up on a request after this long; the user sees a retry message. */
export const REQUEST_TIMEOUT_MS = 15_000;

export const Header = {
  Authorization: 'Authorization',
  PracticeId: 'X-Practice-Id',
  LocationId: 'X-Location-Id',
} as const;
