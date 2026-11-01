import { cx } from '@/utils/classes';
import { initialsOf } from '@/utils/text';

export type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Warm for team members, teal for patients, solid when selected. */
  tone?: 'teal' | 'warm' | 'solid';
};

const SIZE = {
  sm: 'size-8 text-chip',
  md: 'size-10 text-meta',
  lg: 'size-12 text-body',
  xl: 'size-16 text-title',
};

const TONE = {
  teal: 'bg-primary-tint text-primary-strong',
  warm: 'bg-warning-soft text-warning-strong',
  solid: 'bg-primary text-ink-on-primary',
};

/** Initials in a circle. */
export function Avatar({ name, size = 'md', tone = 'teal' }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        SIZE[size],
        TONE[tone],
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
