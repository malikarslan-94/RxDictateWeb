import type { ReactNode } from 'react';

import { useLockGate } from '../hooks/useLockGate';
import { LockScreen } from './LockScreen';
import { SetPinDialog } from './SetPinDialog';

/**
 * Around the signed-in app. Locked, the app stays mounted underneath (a
 * recording carries on) but is hidden and can't be reached.
 */
export function LockGate({ children }: { children: ReactNode }) {
  const gate = useLockGate();
  return (
    <>
      <div inert={gate.isLocked} aria-hidden={gate.isLocked || undefined}>
        {children}
      </div>
      {gate.isLocked ? <LockScreen gate={gate} /> : null}
      {!gate.isLocked && gate.showPinPrompt ? (
        <SetPinDialog onSaved={gate.pinSaved} onClose={gate.skipPinPrompt} />
      ) : null}
    </>
  );
}
