import type { HTMLAttributes } from 'react';

import { cx } from '@/utils/classes';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** `none` for a card whose content (a table) runs to its edges. */
  padding?: 'none' | 'medium' | 'large';
};

/** A white surface with the card radius and a hairline border. */
export function Card({ padding = 'large', className, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        'rounded-card border border-border bg-surface',
        padding === 'large' && 'p-6',
        padding === 'medium' && 'p-4',
        className,
      )}
      {...rest}
    />
  );
}
