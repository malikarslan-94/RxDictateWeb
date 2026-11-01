import { BrandMark, Button, Spinner, Wordmark } from '@/ui';

import { authCopy } from '../copy';
import type { LaunchState } from '../hooks/useSessionRestore';

export type LaunchScreenProps = {
  state: Exclude<LaunchState, 'ready'>;
  onRetry: () => void;
  onSignInWithDifferentNumber: () => void;
};

/** While the stored session is checked, or when the server can't be reached. */
export function LaunchScreen({
  state,
  onRetry,
  onSignInWithDifferentNumber,
}: LaunchScreenProps) {
  const copy = authCopy.launch;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-8 text-center">
      <div className="mb-4 flex flex-col items-center gap-3">
        <BrandMark size="large" />
        <Wordmark size="large" />
      </div>
      {state === 'loading' ? (
        <>
          <Spinner className="size-8 text-primary" />
          <p className="text-body text-ink-secondary">{copy.opening}</p>
        </>
      ) : (
        <>
          <h1 className="text-title">{copy.unreachableTitle}</h1>
          <p className="max-w-readable text-body text-ink-secondary">
            {copy.unreachableBody}
          </p>
          <Button label={copy.tryAgain} onClick={onRetry} />
          <Button
            label={copy.differentNumber}
            variant="text"
            onClick={onSignInWithDifferentNumber}
          />
        </>
      )}
    </main>
  );
}
