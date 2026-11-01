import { cx } from '@/utils/classes';

/** How many bars the meter is drawn with. */
const BARS = 20;

export type LevelMeterProps = {
  /** 0 to 1. */
  level: number;
  label: string;
};

/** A row of bars lit up to the current level, e.g. how loud the mic hears. */
export function LevelMeter({ level, label }: LevelMeterProps) {
  const lit = Math.round(Math.min(1, Math.max(0, level)) * BARS);
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={BARS}
      aria-valuenow={lit}
      className="flex gap-1"
    >
      {Array.from({ length: BARS }, (_, index) => (
        <span
          key={index}
          className={cx(
            'h-2 flex-1 rounded-full',
            index < lit ? 'bg-primary' : 'bg-primary-soft',
          )}
        />
      ))}
    </div>
  );
}
