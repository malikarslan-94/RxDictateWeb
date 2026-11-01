import { useState } from 'react';

import { Role } from '@/constants/roles';
import { countRecordings } from '@/lib/recordings';
import { SignOutReason, selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import { authCopy } from '../copy';
import { useSignOut } from './useSignOut';

/** "Log out of this computer?": what it warns about, and the button. */
export function useLogoutDialog(onClose: () => void) {
  const { signOut, isSigningOut } = useSignOut();
  const isAssistant = useAppSelector(selectActiveRole) === Role.pa;
  // Counted when the dialog opens: nothing records while it's up.
  const [pending] = useState(countRecordings);

  return {
    body: isAssistant ? authCopy.logout.bodyAssistant : authCopy.logout.body,
    pendingWarning: pending > 0 ? authCopy.logout.pendingAudio(pending) : null,
    confirm: () => signOut({ reason: SignOutReason.User }),
    isSigningOut,
    // Esc and the scrim can't interrupt a sign-out halfway.
    close: isSigningOut ? () => undefined : onClose,
  };
}
