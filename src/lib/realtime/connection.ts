import type { ErrorCode } from '@/constants/errorCodes';
import { realtimeServerMessageSchema } from '@/contract';
import type { RealtimeClientMessage, RealtimeTopic } from '@/contract';

import { RETRY_DELAYS_MS, SILENCE_LIMIT_MS } from './config';

/** After the server refuses a connection: try again, or leave it closed. */
export const Verdict = { Retry: 'retry', Stop: 'stop' } as const;
export type Verdict = (typeof Verdict)[keyof typeof Verdict];

export type RealtimeHandlers = {
  /** The sign-in message, with the latest token. Null when there's none. */
  auth: () => RealtimeClientMessage | null;
  /**
   * Signed in. `hasMissed` after a drop or a failed try, even before the
   * first ready (the page loaded offline): what's on screen may be behind.
   */
  onReady: (hasMissed: boolean) => void;
  onChanged: (topic: RealtimeTopic, id: string | undefined) => void;
  /** The connection went, or the try to make one failed. */
  onDown: () => void;
  /** The server gave this reason before closing. */
  onRefused: (code: ErrorCode) => Promise<Verdict> | Verdict;
};

export type RealtimeConnection = {
  /** Hand the server a fresh token, so the socket outlives the old one. */
  reauth: () => void;
  close: () => void;
};

/**
 * One live connection to the server, kept open until `close`. It signs in,
 * passes on what changed, and reconnects whenever it drops: after a pause
 * that grows, at once when the network or the tab comes back, and when
 * the heartbeat goes quiet.
 */
export function connectRealtime(
  url: string,
  handlers: RealtimeHandlers,
): RealtimeConnection {
  let socket: WebSocket | null = null;
  let isClosed = false;
  let isReady = false;
  let hasMissed = false;
  let attempt = 0;
  let sentToken: string | null = null;
  let refusal: ErrorCode | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let silenceTimer: ReturnType<typeof setTimeout> | undefined;

  const signIn = (onlyIfNew: boolean) => {
    const message = handlers.auth();
    if (!message || (onlyIfNew && message.token === sentToken)) return;
    socket?.send(JSON.stringify(message));
    sentToken = message.token;
  };

  const lost = async () => {
    clearTimeout(silenceTimer);
    isReady = false;
    hasMissed = true;
    handlers.onDown();
    if (isClosed) return;
    const verdict = refusal ? await handlers.onRefused(refusal) : Verdict.Retry;
    if (isClosed || socket || verdict === Verdict.Stop) return;
    const delay =
      RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
    attempt += 1;
    retryTimer = setTimeout(open, delay);
  };

  // A dead line can take minutes to finish closing: don't wait for it.
  const drop = () => {
    const current = socket;
    if (!current) return;
    socket = null;
    current.close();
    void lost();
  };

  const listen = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(drop, SILENCE_LIMIT_MS);
  };

  const receive = (data: unknown) => {
    listen();
    let raw: unknown;
    try {
      raw = JSON.parse(String(data));
    } catch {
      return;
    }
    const parsed = realtimeServerMessageSchema.safeParse(raw);
    if (!parsed.success) return;
    const message = parsed.data;
    switch (message.type) {
      case 'ready':
        isReady = true;
        attempt = 0;
        handlers.onReady(hasMissed);
        hasMissed = false;
        // A token refreshed while this one was signing in.
        signIn(true);
        break;
      case 'changed':
        if (isReady) handlers.onChanged(message.topic, message.id);
        break;
      case 'error':
        refusal = message.code;
        break;
      case 'heartbeat':
        break;
    }
  };

  function open() {
    clearTimeout(retryTimer);
    if (isClosed || socket) return;
    // Offline, the 'online' event brings it back.
    if (!navigator.onLine) {
      hasMissed = true;
      return;
    }
    refusal = null;
    const current = new WebSocket(url);
    socket = current;
    current.onopen = () => {
      signIn(false);
      listen();
    };
    current.onmessage = (event) => receive(event.data);
    // An error event is always followed by close.
    current.onclose = () => {
      if (socket !== current) return;
      socket = null;
      void lost();
    };
  }

  const retryNow = () => {
    if (isClosed || socket) return;
    attempt = 0;
    open();
  };
  const handleVisible = () => {
    if (document.visibilityState === 'visible') retryNow();
  };
  window.addEventListener('online', retryNow);
  window.addEventListener('offline', drop);
  document.addEventListener('visibilitychange', handleVisible);
  open();

  return {
    reauth: () => {
      if (isReady) signIn(true);
    },
    close: () => {
      isClosed = true;
      clearTimeout(retryTimer);
      clearTimeout(silenceTimer);
      window.removeEventListener('online', retryNow);
      window.removeEventListener('offline', drop);
      document.removeEventListener('visibilitychange', handleVisible);
      const current = socket;
      socket = null;
      current?.close();
    },
  };
}
