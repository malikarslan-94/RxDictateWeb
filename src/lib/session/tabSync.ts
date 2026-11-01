/**
 * Tells this browser's other tabs about the session. Logging out in one tab
 * logs out all of them; a new location in one shows in the others.
 */
export type TabMessage =
  { kind: 'signedOut' } | { kind: 'locationChosen'; locationId: string };

const CHANNEL = 'clinic-session';

let channel: BroadcastChannel | null = null;

function open(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  channel ??= new BroadcastChannel(CHANNEL);
  return channel;
}

export function tellOtherTabs(message: TabMessage): void {
  open()?.postMessage(message);
}

/** Listen to the other tabs. Returns the stop function, for an effect. */
export function listenToOtherTabs(
  onMessage: (message: TabMessage) => void,
): () => void {
  const tabs = open();
  if (!tabs) return () => undefined;
  const handle = (event: MessageEvent<TabMessage>) => onMessage(event.data);
  tabs.addEventListener('message', handle);
  return () => tabs.removeEventListener('message', handle);
}
