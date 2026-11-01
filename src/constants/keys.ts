import type { Hotkey } from '@/hooks/useHotkey';

/** Every keyboard shortcut, so a key is never taken twice. */
export const Hotkeys = {
  search: { key: 'k', ctrl: true },
  dictate: { key: 'm', ctrl: true },
  approve: { key: 'Enter', ctrl: true },
  nextPatient: { key: 'ArrowDown', ctrl: true },
  addPatient: { key: 'n' },
  focusSearch: { key: '/' },
} as const satisfies Record<string, Hotkey>;

/** How each shortcut is written in the page, e.g. "Ctrl K". */
export const HotkeyLabel = {
  search: 'Ctrl K',
  dictate: 'Ctrl M',
  approve: 'Ctrl Enter',
  nextPatient: 'Ctrl ↓',
  print: 'Ctrl P',
  addPatient: 'N',
  focusSearch: '/',
} as const;
