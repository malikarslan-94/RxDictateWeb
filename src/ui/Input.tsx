import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/utils/classes';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  /** Shown under the field and turns the border red. */
  error?: string;
  /** Helper text, replaced by `error` when there is one. */
  hint?: string;
  /**
   * Needs attention but isn't wrong, e.g. a reading outside the normal
   * range. Shown in the warning colour; `error` replaces it, it replaces
   * `hint`.
   */
  warning?: string;
  /** e.g. the "+92" block on a phone field, or a search icon. */
  leading?: ReactNode;
  /** e.g. a keyboard shortcut hint. */
  trailing?: ReactNode;
  containerClassName?: string;
};

/**
 * The one text input. Three looks, all from tokens: default, focused
 * (primary border), error (danger border and a message under it).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    warning,
    leading,
    trailing,
    containerClassName,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const noteId = `${inputId}-note`;
  const note = error || warning || hint;

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-label">
          {label}
        </label>
      ) : null}
      <div
        className={cx(
          'flex h-control items-center gap-3 overflow-hidden rounded-control border bg-surface px-4 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          error
            ? 'border-danger'
            : warning
              ? 'border-warning'
              : 'border-border',
        )}
      >
        {leading}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={cx(
            'h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-secondary focus-visible:outline-none',
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      {note ? (
        <p
          id={noteId}
          className={cx(
            'mt-1 ml-3 text-meta',
            error
              ? 'text-danger'
              : warning
                ? 'text-warning-strong'
                : 'text-ink-secondary',
          )}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
});
