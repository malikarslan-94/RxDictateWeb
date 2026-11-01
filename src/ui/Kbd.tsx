import { cx } from '@/utils/classes';

export type KbdProps = {
  keys: string;
  /** For use on a dark or primary surface. */
  inverse?: boolean;
};

/** A keyboard shortcut, e.g. "Ctrl K". */
export function Kbd({ keys, inverse = false }: KbdProps) {
  return (
    <kbd
      className={cx(
        'inline-flex h-6 items-center rounded-xs border px-1.5 font-sans text-chip whitespace-nowrap',
        inverse
          ? 'border-console-muted bg-surface text-ink'
          : 'border-border bg-surface text-ink-secondary',
      )}
    >
      {keys}
    </kbd>
  );
}
