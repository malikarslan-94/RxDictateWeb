import { DAYS, DAY_LABELS } from '@/constants/days';
import type { DayKey } from '@/constants/days';
import { cx } from '@/utils/classes';

export type DayPickerProps = {
  value: readonly DayKey[];
  onChange: (days: DayKey[]) => void;
  label: string;
};

/** Mon to Sun as round toggles; the chosen ones are filled. */
export function DayPicker({ value, onChange, label }: DayPickerProps) {
  const toggle = (day: DayKey) =>
    onChange(
      value.includes(day)
        ? value.filter((item) => item !== day)
        : DAYS.filter((item) => item === day || value.includes(item)),
    );

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const isOn = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            aria-pressed={isOn}
            onClick={() => toggle(day)}
            className={cx(
              'h-10 min-w-14 rounded-full border px-4 text-body font-bold transition-colors',
              isOn
                ? 'border-primary bg-primary text-ink-on-primary'
                : 'border-border bg-surface text-ink hover:border-primary',
            )}
          >
            {DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
