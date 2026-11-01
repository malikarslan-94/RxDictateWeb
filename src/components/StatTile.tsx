import { cx } from '@/utils/classes';

export type StatTileProps = {
  value: number;
  label: string;
  /** The status colour the number is drawn in, if any. */
  tone?: 'default' | 'warning' | 'primary';
};

/** A big number and what it counts: "3 Waiting". */
export function StatTile({ value, label, tone = 'default' }: StatTileProps) {
  return (
    <div className="flex-1 rounded-card border border-border bg-surface px-6 py-5">
      <p
        className={cx(
          'text-screen-title',
          tone === 'warning' && 'text-warning-strong',
          tone === 'primary' && 'text-primary-strong',
        )}
      >
        {value}
      </p>
      <p className="text-body text-ink-secondary">{label}</p>
    </div>
  );
}
