import { APP_NAME_PARTS } from '@/constants/app';
import { cx } from '@/utils/classes';

export type WordmarkProps = {
  size?: 'medium' | 'large';
  /** On a teal surface: all white. */
  inverse?: boolean;
};

/** The product's name as the logo writes it: "Rx" in dark teal, "Dictate" in ink. */
export function Wordmark({ size = 'medium', inverse = false }: WordmarkProps) {
  return (
    <span
      className={cx(
        'whitespace-nowrap',
        size === 'large' ? 'text-title' : 'text-section',
        inverse ? 'text-ink-on-primary' : 'text-ink',
      )}
    >
      <span className={inverse ? undefined : 'text-primary-strong'}>
        {APP_NAME_PARTS.lead}
      </span>
      {APP_NAME_PARTS.rest}
    </span>
  );
}
