import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/utils/classes';

import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tonal'
  | 'text'
  | 'destructive'
  /** Dashed outline for "+ Add …" rows. */
  | 'dashed'
  /** On a primary-filled surface, e.g. the sign-in panel. */
  | 'inverse';

export type ButtonSize = 'large' | 'medium' | 'small';

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered before the label. */
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-ink-on-primary hover:bg-primary-strong',
  secondary:
    'border border-border bg-surface text-ink hover:border-primary hover:text-primary-strong',
  tonal: 'bg-primary-soft text-primary-strong hover:bg-primary-tint',
  text: 'text-ink hover:bg-neutral-soft',
  destructive: 'bg-danger text-ink-on-primary hover:opacity-90',
  dashed:
    'border border-dashed border-primary text-primary-strong hover:bg-primary-tint',
  inverse: 'bg-surface text-primary-strong hover:opacity-90',
};

const SIZE: Record<ButtonSize, string> = {
  large: 'h-control px-6 text-body font-bold',
  medium: 'h-11 px-5 text-body font-bold',
  small: 'h-control-sm px-4 text-meta font-bold',
};

/** The one button family. Every variant is pill-shaped. */
export function Button({
  label,
  variant = 'primary',
  size = 'large',
  icon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap transition-colors',
        SIZE[size],
        isDisabled
          ? 'cursor-not-allowed bg-disabled text-disabled-ink'
          : VARIANT[variant],
        isDisabled && variant === 'text' && 'bg-transparent',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {label}
    </button>
  );
}
