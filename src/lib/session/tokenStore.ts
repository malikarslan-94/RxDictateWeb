import { tokenPairSchema } from '@/contract';
import type { TokenPair } from '@/contract';
import { StorageKey, readJson, removeItem, writeJson } from '@/lib/storage';
import type { StorageArea } from '@/lib/storage';

/**
 * Where this computer keeps the signed-in user's tokens.
 *
 * "Keep me signed in on this computer" keeps them in localStorage, so they
 * outlive the browser; otherwise in sessionStorage, gone when the tab closes.
 * A reception computer is shared, so the box is off by default.
 *
 * TODO(backend): an httpOnly refresh cookie that page code can't read
 * replaces this (docs/backend-requests/web-client.md). Until then the refresh
 * token is in storage this site's scripts can read.
 */
let area: StorageArea = 'session';

export function saveTokens(tokens: TokenPair, keepSignedIn?: boolean): void {
  if (keepSignedIn !== undefined) {
    removeItem(StorageKey.tokens);
    area = keepSignedIn ? 'local' : 'session';
  }
  writeJson(StorageKey.tokens, tokens, area);
}

/** The stored tokens: this tab's first, then the computer's. */
export function loadTokens(): TokenPair | null {
  const inTab = readJson(StorageKey.tokens, tokenPairSchema, 'session');
  if (inTab) {
    area = 'session';
    return inTab;
  }
  const kept = readJson(StorageKey.tokens, tokenPairSchema, 'local');
  if (kept) area = 'local';
  return kept;
}

/** "Keep me signed in" was ticked: the tokens outlive the browser. */
export function isKeptSignedIn(): boolean {
  return area === 'local';
}

export function clearTokens(): void {
  removeItem(StorageKey.tokens);
}
