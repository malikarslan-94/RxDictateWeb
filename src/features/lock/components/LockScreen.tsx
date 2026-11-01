import { Avatar, Button, CodeInput, Icon, TextLink } from '@/ui';

import { PIN_LENGTH } from '../constants';
import { lockCopy } from '../copy';
import type { LockGate } from '../hooks/useLockGate';
import { useUnlock } from '../hooks/useUnlock';

const copy = lockCopy.screen;

/** Over everything while locked: patient details stay hidden until the PIN. */
export function LockScreen({ gate }: { gate: LockGate }) {
  const screen = useUnlock(gate);
  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="lock-title"
      className="fixed inset-0 z-60 flex items-center justify-center bg-primary p-6"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-sheet bg-surface p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
          <Icon name="lock" />
        </span>
        <div>
          <h1 id="lock-title" className="text-title">
            {copy.title}
          </h1>
          <p className="mt-2 text-body text-ink-secondary">{screen.body}</p>
        </div>
        <div className="flex w-full items-center gap-3 rounded-card bg-primary-tint px-4 py-3 text-left">
          <Avatar name={screen.name} tone={screen.isWarm ? 'warm' : 'teal'} />
          <div>
            <p className="text-body font-bold">{screen.name}</p>
            <p className="text-meta text-ink-secondary">{screen.roleLine}</p>
          </div>
        </div>
        <p className="text-label">{copy.enterPin}</p>
        <CodeInput
          label={copy.pinLabel}
          length={PIN_LENGTH}
          value={screen.pin}
          onChange={screen.setPin}
          onComplete={screen.unlock}
          hasError={!!screen.error}
          masked
          autoFocus
        />
        {screen.error ? (
          <p role="alert" className="text-body text-danger">
            {screen.error}
          </p>
        ) : null}
        <Button label={copy.unlock} fullWidth onClick={() => screen.unlock()} />
        <div className="flex flex-col gap-1">
          <TextLink label={copy.forgot} underline onClick={screen.signOut} />
          <TextLink
            label={screen.switchUserLabel}
            tone="muted"
            underline
            onClick={screen.signOut}
          />
        </div>
      </div>
    </div>
  );
}
