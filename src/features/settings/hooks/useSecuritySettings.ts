import { useState } from 'react';

import { describeBrowser, isKeptSignedIn } from '@/lib/session';

import { settingsCopy } from '../copy';

const copy = settingsCopy.security;

/** Settings › Security: this computer's lock and sign-in, and logging out. */
export function useSecuritySettings() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return {
    device: copy.thisComputer(describeBrowser()),
    keptLine: isKeptSignedIn() ? copy.kept : copy.untilClose,
    isLoggingOut,
    askLogout: () => setIsLoggingOut(true),
    closeLogout: () => setIsLoggingOut(false),
  };
}
