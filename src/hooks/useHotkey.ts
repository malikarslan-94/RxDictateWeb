import { useEffect, useRef } from 'react';

export type Hotkey = {
  /** `KeyboardEvent.key`, e.g. "m", "Enter", "ArrowDown", "/". */
  key: string;
  /** Ctrl on Windows; Ctrl or ⌘ on a Mac. */
  ctrl?: boolean;
};

/** Where typing happens: a bare-key shortcut must not fire there. */
function isTypingIn(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

/**
 * A keyboard shortcut for as long as the component is on screen. A shortcut
 * without Ctrl is ignored while the user is typing in a field.
 */
export function useHotkey(
  hotkey: Hotkey,
  onPress: () => void,
  isEnabled = true,
) {
  const handler = useRef(onPress);
  handler.current = onPress;

  useEffect(() => {
    if (!isEnabled) return;
    const onKey = (event: KeyboardEvent) => {
      const withCtrl = event.ctrlKey || event.metaKey;
      if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) return;
      if (!!hotkey.ctrl !== withCtrl) return;
      if (!hotkey.ctrl && isTypingIn(event.target)) return;
      event.preventDefault();
      handler.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey.key, hotkey.ctrl, isEnabled]);
}
