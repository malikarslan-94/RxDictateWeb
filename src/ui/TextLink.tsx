import type { ButtonHTMLAttributes } from 'react';

import { cx } from '@/utils/classes';

export type TextLinkProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  label: string;
  tone?: 'primary' | 'muted' | 'danger';
  underline?: boolean;
};

/** A button that reads as a link: "Resend", "Fix it", "Not you?". */
export function TextLink({
  label,
  tone = 'primary',
  underline = false,
  className,
  type = 'button',
  ...rest
}: TextLinkProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline font-bold hover:underline disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'primary' && 'text-primary-strong',
        tone === 'muted' && 'text-ink-secondary',
        tone === 'danger' && 'text-danger',
        underline && 'underline',
        className,
      )}
      {...rest}
    >
      {label}
    </button>
  );
}
