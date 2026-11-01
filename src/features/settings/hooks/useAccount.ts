import { useState } from 'react';

import { APP_VERSION } from '@/constants/app';
import { locationStatusSchema } from '@/contract';
import { selectActiveMembership, selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatE164 } from '@/utils/phone';

import { settingsCopy } from '../copy';

const copy = settingsCopy.account;

/** The assistant's My account: who they are, where they work, log out. */
export function useAccount() {
  const user = useAppSelector(selectUser);
  const membership = useAppSelector(selectActiveMembership);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return {
    roleLine: copy.roleLine(user ? formatE164(user.phone) : ''),
    clinicName: membership?.practiceName ?? '',
    locations: (membership?.locations ?? [])
      .filter(
        (location) => location.status === locationStatusSchema.enum.active,
      )
      .map((location) => ({ id: location.id, name: location.name })),
    version: copy.version(APP_VERSION),
    isLoggingOut,
    askLogout: () => setIsLoggingOut(true),
    closeLogout: () => setIsLoggingOut(false),
  };
}
