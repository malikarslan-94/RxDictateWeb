import { cx } from '@/utils/classes';

export type BrandMarkProps = {
  size?: 'medium' | 'large';
  /** On a teal surface: a white tile and a teal cross. */
  inverse?: boolean;
};

/** The pulse line: bolder and simpler where the mark is small. */
const PULSE = {
  medium: { points: '14,60 40,60 50,38 64,82 74,60 106,60', width: 11 },
  large: {
    points: '14,60 38,60 46,44 56,80 66,32 74,70 80,60 106,60',
    width: 7,
  },
} as const;

/**
 * The app's mark: a medical cross with a pulse line cut through it, the
 * same as the browser tab's icon. Decorative; the name beside it says what
 * it is.
 */
export function BrandMark({
  size = 'medium',
  inverse = false,
}: BrandMarkProps) {
  const pulse = PULSE[size];
  return (
    <span
      aria-hidden
      className={cx(
        'flex shrink-0 items-center justify-center',
        size === 'large' ? 'size-16 rounded-md' : 'size-10 rounded-sm',
        inverse ? 'bg-surface text-primary' : 'bg-primary text-ink-on-primary',
      )}
    >
      <svg
        viewBox="0 0 120 120"
        className={size === 'large' ? 'size-10' : 'size-6'}
      >
        <rect
          x="37"
          y="6"
          width="46"
          height="108"
          rx="16"
          fill="currentColor"
        />
        <rect
          x="6"
          y="37"
          width="108"
          height="46"
          rx="16"
          fill="currentColor"
        />
        {/* Drawn in the tile's colour, so it reads as cut through the cross. */}
        <polyline
          points={pulse.points}
          fill="none"
          strokeWidth={pulse.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={inverse ? 'stroke-surface' : 'stroke-primary'}
        />
      </svg>
    </span>
  );
}
