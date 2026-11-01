import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cx } from '@/utils/classes';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
};

/** The multi-line input: the same shell as `Input`, taller. */
export function Textarea({
  label,
  error,
  hint,
  containerClassName,
  className,
  id,
  rows = 3,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={fieldId} className="mb-2 block text-label">
          {label}
        </label>
      ) : null}
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cx(
          'w-full resize-none rounded-card border bg-surface px-4 py-3 text-body outline-none placeholder:text-ink-secondary focus:border-primary focus:ring-1 focus:ring-primary',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...rest}
      />
      {error || hint ? (
        <p
          className={cx(
            'mt-1 ml-3 text-meta',
            error ? 'text-danger' : 'text-ink-secondary',
          )}
        >
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}
