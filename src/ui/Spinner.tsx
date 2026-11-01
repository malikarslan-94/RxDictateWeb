import { cx } from '@/utils/classes';

export type SpinnerProps = {
  className?: string;
  /** Read out instead of a silent spinner, e.g. "Loading patients". */
  label?: string;
};

/** A turning ring, in the colour of the text around it. */
export function Spinner({ className = 'size-5', label }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      className={cx(
        'inline-block animate-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
    />
  );
}
