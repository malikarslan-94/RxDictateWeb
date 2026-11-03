import { useState } from 'react';

import { APP_VERSION } from '@/constants/app';
import { commonCopy } from '@/constants/copy';
import { Action } from '@/constants/roles';
import { locationStatusSchema } from '@/contract';
import { useCan } from '@/hooks/useCan';
import { selectActiveMembership, selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatE164 } from '@/utils/phone';

import { settingsCopy } from '../copy';

const copy = settingsCopy.account;

/** My account, for an assistant or a medicine manager: who they are, where they work, log out. */
export function useAccount() {
  const user = useAppSelector(selectUser);
  const membership = useAppSelector(selectActiveMembership);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isWholeClinic = useCan(Action['drugList.clinic.manage']);
  const role = membership ? commonCopy.roles[membership.role] : '';

  return {
    role,
    roleLine: copy.roleLine(user ? formatE164(user.phone) : '', role),
    worksAtHint: isWholeClinic ? copy.worksEverywhere : copy.worksAtHint,
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
