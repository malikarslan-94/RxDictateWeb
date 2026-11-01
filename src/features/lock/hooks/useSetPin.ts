import { useState } from 'react';

import { selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { PIN_LENGTH } from '../constants';
import { lockCopy } from '../copy';
import { savePin } from '../pinStore';

/** Set or change this user's PIN on this computer: typed twice. */
export function useSetPin(onSaved: () => void) {
  const user = useAppSelector(selectUser);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  return {
    pin,
    setPin: (next: string) => {
      setPin(next);
      setError(undefined);
    },
    confirm,
    setConfirm: (next: string) => {
      setConfirm(next);
      setError(undefined);
    },
    error,
    isSaving,
    save: async () => {
      if (!user) return;
      if (pin.length !== PIN_LENGTH) {
        setError(lockCopy.setPin.tooShort);
        return;
      }
      if (pin !== confirm) {
        setError(lockCopy.setPin.mismatch);
        return;
      }
      setIsSaving(true);
      await savePin(user.id, pin);
      setIsSaving(false);
      onSaved();
    },
  };
}
