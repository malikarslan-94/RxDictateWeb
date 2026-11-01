import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

/** A typed letter waits this long for the next before starting over. */
const TYPEAHEAD_MS = 700;

/** How far Page Up and Page Down move. */
const PAGE_STEP = 10;

export type UseListboxOptions = {
  /** What each option reads as, for typing to find one. */
  labels: readonly string[];
  /** The chosen option, or -1 while nothing is chosen. */
  chosenIndex: number;
  /** Where the list opens while nothing is chosen. */
  startIndex?: number;
  onChoose: (index: number) => void;
  disabled?: boolean;
};

/**
 * A pick-one list that keeps focus on its field: it opens, the arrows, Home,
 * End and the page keys move, Enter or Space picks, Esc and Tab close, and
 * typing jumps to an option that starts so (and picks it while closed).
 */
export function useListbox({
  labels,
  chosenIndex,
  startIndex = -1,
  onChoose,
  disabled = false,
}: UseListboxOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typed = useRef({ text: '', at: 0 });
  const last = labels.length - 1;

  const open = () => {
    if (disabled || labels.length === 0) return;
    setActive(Math.max(0, chosenIndex >= 0 ? chosenIndex : startIndex));
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const choose = (index: number) => {
    if (index >= 0 && index !== chosenIndex) onChoose(index);
    close();
  };
  const move = (to: number) => setActive(Math.min(last, Math.max(0, to)));

  const typeAhead = (key: string) => {
    const now = Date.now();
    const isFresh = now - typed.current.at >= TYPEAHEAD_MS;
    const text = isFresh ? key : typed.current.text + key;
    typed.current = { text, at: now };
    const from = isOpen ? active : Math.max(chosenIndex, 0);
    // A new first letter looks past the current option; more letters refine it.
    const start = from + (text.length === 1 ? 1 : 0);
    const order = [...labels.keys()].map(
      (offset) => (start + offset) % labels.length,
    );
    const found = order.find((index) =>
      labels[index].toLowerCase().startsWith(text.toLowerCase()),
    );
    if (found === undefined) return;
    if (isOpen) setActive(found);
    else if (found !== chosenIndex) onChoose(found);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, () => void> = isOpen
      ? {
          ArrowDown: () => move(active + 1),
          ArrowUp: () => move(active - 1),
          Home: () => move(0),
          End: () => move(last),
          PageDown: () => move(active + PAGE_STEP),
          PageUp: () => move(active - PAGE_STEP),
          Enter: () => choose(active),
          ' ': () => choose(active),
          Escape: close,
        }
      : { ArrowDown: open, ArrowUp: open, Enter: open, ' ': open };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      // Esc closes the list, not the dialog it sits in.
      if (event.key === 'Escape') event.stopPropagation();
      action();
    } else if (event.key === 'Tab') {
      close();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      typeAhead(event.key);
    }
  };

  return {
    isOpen,
    active,
    setActive,
    toggle: () => (isOpen ? close() : open()),
    close,
    choose,
    handleKeyDown,
  };
}
