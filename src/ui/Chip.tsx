import type { ReactNode } from 'react';

import { cx } from '@/utils/classes';

import { Icon } from './Icon';
import type { IconName } from './Icon';

/**
 * Status tones carry one meaning each, as on mobile:
 * ready (done, approved), waiting (needs attention), overdue (danger),
 * neutral (information), active (in progress, the primary colour).
 */
export type ChipTone = 'ready' | 'waiting' | 'overdue' | 'neutral' | 'active';

const TONE: Record<ChipTone, string> = {
  ready: 'bg-neutral-soft text-ink-secondary',
  waiting: 'bg-warning-soft text-warning-strong',
  overdue: 'bg-danger-soft text-danger',
  neutral: 'bg-neutral-soft text-ink-secondary',
  active: 'bg-primary-soft text-primary-strong',
};

export type StatusChipProps = {
  label: string;
  tone: ChipTone;
  icon?: IconName;
  /** A solid primary chip, e.g. "Ready to print" or "Listening". */
  solid?: boolean;
};

/** A small rounded label saying where something stands. */
export function StatusChip({ label, tone, icon, solid }: StatusChipProps) {
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-chip whitespace-nowrap',
        solid ? 'bg-primary text-ink-on-primary' : TONE[tone],
      )}
    >
      {icon ? <Icon name={icon} className="size-3.5" /> : null}
      {label}
    </span>
  );
}

export type FilterChipProps = {
  label: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  count?: number;
};

/** A choice in a row of chips. Without `onClick` it's a plain tag. */
export function FilterChip({
  label,
  selected = false,
  onClick,
  count,
}: FilterChipProps) {
  const className = cx(
    'inline-flex h-9 items-center gap-2 rounded-full border px-4 text-meta font-bold whitespace-nowrap transition-colors',
    selected
      ? 'border-primary bg-primary text-ink-on-primary'
      : 'border-border bg-surface text-ink',
    onClick && !selected && 'hover:border-primary',
  );
  const content = (
    <>
      {label}
      {count !== undefined ? (
        <span className={selected ? 'opacity-80' : 'text-ink-secondary'}>
          {count}
        </span>
      ) : null}
    </>
  );
  return onClick ? (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  ) : (
    <span className={className}>{content}</span>
  );
}
