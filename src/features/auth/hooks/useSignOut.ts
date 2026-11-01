import { useState } from 'react';

import { useAppDispatch } from '@/store/hooks';

import { signOut } from '../signOut';
import type { SignOutOptions } from '../signOut';

/** signOut for a page, with a flag for its button. */
export function useSignOut() {
  const dispatch = useAppDispatch();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return {
    signOut: async (options: SignOutOptions) => {
      setIsSigningOut(true);
      // By the time this settles the router has moved to Sign in.
      await dispatch(signOut(options));
    },
    isSigningOut,
  };
}
