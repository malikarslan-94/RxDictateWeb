import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { commonCopy } from '@/constants/copy';
import { cx } from '@/utils/classes';

import { IconButton } from './IconButton';

export type DialogProps = {
  title: string;
  /** A line under the title. */
  description?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  /** Right-aligned at the bottom, secondary first, primary last. */
  actions?: ReactNode;
  /** `large` holds two things side by side, e.g. a list beside an A4 page. */
  width?: 'default' | 'wide' | 'large';
};

/**
 * The one modal: centred, over a scrim. Esc and the close button dismiss it,
 * focus moves into it on open and back where it was on close. On a phone
 * browser it sits at the bottom like the app's sheet.
 */
export function Dialog({
  title,
  description,
  onClose,
  children,
  actions,
  width = 'default',
}: DialogProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  // The latest onClose, so a parent's new function each render doesn't
  // re-run the focus effect and pull focus out of a field.
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-scrim sm:items-center sm:p-6">
      <div className="absolute inset-0" aria-hidden onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'relative flex max-h-modal w-full flex-col gap-5 overflow-y-auto rounded-t-sheet bg-surface p-6 outline-none sm:rounded-sheet',
          width === 'large'
            ? 'sm:max-w-dialog-large'
            : width === 'wide'
              ? 'sm:max-w-dialog-wide'
              : 'sm:max-w-dialog',
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 id={titleId} className="text-title">
              {title}
            </h2>
            {description ? (
              <div className="mt-2 text-body text-ink-secondary">
                {description}
              </div>
            ) : null}
          </div>
          <IconButton
            icon="close"
            label={commonCopy.close}
            tone="soft"
            onClick={onClose}
          />
        </div>
        {children}
        {actions ? (
          <div className="flex flex-wrap justify-end gap-3">{actions}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
