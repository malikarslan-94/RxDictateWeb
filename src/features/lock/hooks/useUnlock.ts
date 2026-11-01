import { useState } from 'react';

import { Role } from '@/constants/roles';
import {
  selectActiveLocationId,
  selectActiveMembership,
  selectUser,
} from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { firstName } from '@/utils/text';

import { MAX_PIN_TRIES, PIN_LENGTH } from '../constants';
import { lockCopy } from '../copy';
import { checkPin } from '../pinStore';
import type { LockGate } from './useLockGate';

/** The lock screen: who's signed in, and their PIN to get back in. */
export function useUnlock(gate: LockGate) {
  const user = useAppSelector(selectUser);
  const membership = useAppSelector(selectActiveMembership);
  const locationId = useAppSelector(selectActiveLocationId);
  const [pin, setPin] = useState('');
  const [tries, setTries] = useState(0);
  const [error, setError] = useState<string>();
  const place = membership?.locations.find(
    (location) => location.id === locationId,
  );

  const unlock = async (candidate: string = pin) => {
    if (!user || candidate.length !== PIN_LENGTH) return;
    if (await checkPin(user.id, candidate)) {
      gate.unlocked();
      return;
    }
    const used = tries + 1;
    setTries(used);
    setPin('');
    // Too many guesses: back to a code by SMS.
    if (used >= MAX_PIN_TRIES) gate.signOut();
    else setError(lockCopy.screen.wrong(MAX_PIN_TRIES - used));
  };

  return {
    name: user?.name ?? '',
    roleLine: lockCopy.screen.role(
      membership ? lockCopy.roles[membership.role] : '',
      place?.name ?? '',
    ),
    isWarm: membership?.role === Role.pa,
    body: lockCopy.screen.body(gate.minutes),
    pin,
    setPin: (next: string) => {
      setPin(next);
      setError(undefined);
    },
    unlock,
    error,
    switchUserLabel: lockCopy.screen.switchUser(firstName(user?.name ?? '')),
    signOut: gate.signOut,
  };
}
