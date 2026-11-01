import { useState } from 'react';

import { selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { LOCK_CHOICES } from '../constants';
import { lockCopy } from '../copy';
import { hasPin } from '../pinStore';
import { useLockSettings } from './useLockSettings';

/** Settings › Security and My account: this computer's lock and the PIN. */
export function useLockSettingsCard() {
  const lock = useLockSettings();
  const user = useAppSelector(selectUser);
  const [isSettingPin, setIsSettingPin] = useState(false);
  // Bumped after saving, so the button reads "Change PIN" at once.
  const [, setSaves] = useState(0);
  const isPinSet = !!user && hasPin(user.id);

  return {
    ...lock,
    minuteOptions: LOCK_CHOICES.map((minutes) => ({
      label: lockCopy.settings.minutes(minutes),
      value: String(minutes),
    })),
    chooseMinutes: (value: string) => {
      const minutes = LOCK_CHOICES.find((choice) => String(choice) === value);
      if (minutes) lock.setMinutes(minutes);
    },
    isPinSet,
    isSettingPin,
    openPin: () => setIsSettingPin(true),
    closePin: () => setIsSettingPin(false),
    pinSaved: () => {
      setIsSettingPin(false);
      setSaves((count) => count + 1);
    },
  };
}
