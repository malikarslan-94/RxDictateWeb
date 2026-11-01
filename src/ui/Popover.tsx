import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { cx } from '@/utils/classes';

export type PopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  /** What it hangs from, e.g. the location button. */
  anchor: ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
};

/**
 * A panel under its anchor that closes on Esc or a click outside: the
 * location switcher, the bell. Not a modal: the page stays usable.
 */
export function Popover({
  isOpen,
  onClose,
  anchor,
  children,
  align = 'start',
  className,
}: PopoverProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={root} className="relative">
      {anchor}
      {isOpen ? (
        <div
          className={cx(
            'absolute top-full z-40 mt-2 rounded-card border border-border bg-surface p-2',
            align === 'start' ? 'left-0' : 'right-0',
            className,
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
