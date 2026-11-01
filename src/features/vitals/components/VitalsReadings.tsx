import { Icon } from '@/ui';
import { cx } from '@/utils/classes';

import type { VitalReading } from '../types';

export type VitalsReadingsProps = {
  readings: VitalReading[];
  /** One line, for a list row, instead of a label over each reading. */
  compact?: boolean;
};

/** A visit's readings; one outside the normal range needs attention. */
export function VitalsReadings({
  readings,
  compact = false,
}: VitalsReadingsProps) {
  if (compact) {
    return (
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-meta">
        {readings.map((reading) => (
          <span
            key={reading.key}
            className={cx(
              'flex gap-1 whitespace-nowrap',
              reading.isFlagged && 'font-bold text-warning-strong',
            )}
          >
            <span
              className={reading.isFlagged ? undefined : 'text-ink-secondary'}
            >
              {reading.label}
            </span>
            <span>{reading.value}</span>
          </span>
        ))}
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap items-center gap-y-2 divide-x divide-primary-soft">
      {readings.map((reading) => (
        <li key={reading.key} className="px-5 first:pl-0 last:pr-0">
          <p
            className={cx(
              'text-chip',
              reading.isFlagged ? 'text-warning-strong' : 'text-ink-secondary',
            )}
          >
            {reading.label}
          </p>
          <p
            className={cx(
              'flex items-center gap-1 text-body font-bold whitespace-nowrap',
              reading.isFlagged && 'text-warning-strong',
            )}
          >
            {reading.isFlagged ? (
              <Icon name="alert" className="size-3.5" />
            ) : null}
            {reading.value}
          </p>
        </li>
      ))}
    </ul>
  );
}
