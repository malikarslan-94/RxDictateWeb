import { Card, IconButton } from '@/ui';
import { cx } from '@/utils/classes';

import { appointmentsCopy } from '../copy';
import type { DayTile } from '../types';

const copy = appointmentsCopy.schedule;

export type WeekStripProps = {
  days: DayTile[];
  onSelect: (day: string) => void;
  /** Absent on the current week: booking is from today on. */
  onPrevious?: () => void;
  onNext: () => void;
};

/** Seven days, each with how many are booked; one is chosen. */
export function WeekStrip({
  days,
  onSelect,
  onPrevious,
  onNext,
}: WeekStripProps) {
  return (
    <Card padding="medium" className="flex items-center gap-2">
      <IconButton
        icon="chevronLeft"
        label={copy.previousWeek}
        tone="plain"
        disabled={!onPrevious}
        onClick={onPrevious}
      />
      <ol className="grid flex-1 grid-cols-7 gap-2">
        {days.map((day) => (
          <li key={day.key}>
            <button
              type="button"
              aria-pressed={day.isSelected}
              aria-label={day.label}
              onClick={() => onSelect(day.key)}
              className={cx(
                'flex w-full flex-col items-center gap-1 rounded-md px-2 py-3 transition-colors',
                day.isSelected
                  ? 'bg-primary text-ink-on-primary'
                  : 'hover:bg-primary-tint',
                !day.isSelected && day.isToday && 'ring-1 ring-primary',
              )}
            >
              <span
                className={cx(
                  'text-meta',
                  !day.isSelected && 'text-ink-secondary',
                )}
              >
                {day.weekday}
              </span>
              <span className="text-title">{day.date}</span>
              <span
                className={cx(
                  'min-h-3.5 text-chip',
                  !day.isSelected && 'text-primary-strong',
                )}
              >
                {day.countLabel}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <IconButton
        icon="chevronRight"
        label={copy.nextWeek}
        tone="plain"
        onClick={onNext}
      />
    </Card>
  );
}
