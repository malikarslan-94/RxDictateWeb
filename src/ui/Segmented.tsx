import { cx } from '@/utils/classes';

export type SegmentedOption<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  /** `null` until chosen: nothing is picked for the user. */
  value: T | null;
  onChange: (value: T) => void;
  label: string;
  fullWidth?: boolean;
  size?: 'medium' | 'small';
};

/** A white pill on a tinted track: Male / Female / Other, Both / Original. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  fullWidth = false,
  size = 'medium',
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'inline-flex gap-1 rounded-full bg-primary-soft p-1',
        fullWidth && 'flex w-full',
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cx(
              'rounded-full px-4 font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              size === 'medium' ? 'h-10 text-body' : 'h-8 text-meta',
              fullWidth && 'flex-1',
              isSelected
                ? 'bg-surface text-primary-strong'
                : 'text-ink-secondary hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
