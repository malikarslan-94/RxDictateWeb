import { useState } from 'react';

import { commonCopy } from '@/constants/copy';
import { selectActiveRole, selectUser } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { firstName } from '@/utils/text';

import { adminCopy } from '../copy';

/** Where RxDictate's own team lands until the admin console is built. */
export function useAdminHome() {
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectActiveRole);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return {
    title: adminCopy.title(firstName(user?.name ?? '')),
    role: role ? adminCopy.role(commonCopy.roles[role]) : '',
    isLoggingOut,
    askLogout: () => setIsLoggingOut(true),
    closeLogout: () => setIsLoggingOut(false),
  };
}
