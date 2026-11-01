import { commonCopy } from '@/constants/copy';
import { Spinner, TextLink } from '@/ui';

export type StateMessageProps = {
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  /** Shown when it's neither loading nor failed. */
  empty?: string;
};

/** What a list says while loading, when it failed, or when it's empty. */
export function StateMessage({
  isLoading,
  error,
  onRetry,
  empty,
}: StateMessageProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-primary">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-start gap-1 py-4">
        <p className="text-body text-ink-secondary">{error}</p>
        {onRetry ? (
          <TextLink label={commonCopy.retry} onClick={onRetry} />
        ) : null}
      </div>
    );
  }
  return empty ? (
    <p className="py-4 text-body text-ink-secondary">{empty}</p>
  ) : null;
}
