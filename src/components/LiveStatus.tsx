import { cx } from '@/utils/classes';

export type LiveStatusProps = {
  label: string;
  /** The live connection is down: the list may be behind. */
  interrupted: boolean;
};

/** The dot and line beside a list that updates itself. */
export function LiveStatus({ label, interrupted }: LiveStatusProps) {
  return (
    <p
      className={cx(
        'flex items-center gap-2 text-meta font-bold',
        interrupted ? 'text-warning-strong' : 'text-primary-strong',
      )}
    >
      <span
        className={cx(
          'size-2 rounded-full',
          interrupted ? 'bg-warning' : 'bg-primary',
        )}
      />
      {label}
    </p>
  );
}
