import type { ButtonHTMLAttributes } from 'react';

import { cx } from '@/utils/classes';

import { Icon } from './Icon';
import type { IconName } from './Icon';

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  icon: IconName;
  /** Required: an icon alone says nothing to a screen reader. */
  label: string;
  size?: 'medium' | 'small';
  /**
   * Filled soft circle (close buttons) instead of an outline. `danger` is a
   * plain button in the danger colour: removing or deleting something.
   */
  tone?: 'outline' | 'soft' | 'plain' | 'danger';
};

/** A round button holding one icon: back, close, bell, remove. */
export function IconButton({
  icon,
  label,
  size = 'medium',
  tone = 'outline',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        tone !== 'danger' && 'text-ink',
        size === 'medium' ? 'size-11' : 'size-8',
        tone === 'outline' &&
          'border border-border bg-surface hover:border-primary',
        tone === 'soft' && 'bg-neutral-soft hover:bg-primary-soft',
        tone === 'plain' && 'hover:bg-neutral-soft',
        tone === 'danger' && 'text-danger hover:bg-danger-soft',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} className={size === 'medium' ? 'size-5' : 'size-4'} />
    </button>
  );
}
