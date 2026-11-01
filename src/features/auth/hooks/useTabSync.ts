import { useEffect } from 'react';

import {
  SignOutReason,
  listenToOtherTabs,
  locationChosen,
} from '@/lib/session';
import { useAppDispatch } from '@/store/hooks';

import { signOut } from '../signOut';

/** Follow this browser's other tabs: their log out, their new location. */
export function useTabSync() {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      listenToOtherTabs((message) => {
        if (message.kind === 'signedOut') {
          dispatch(signOut({ reason: SignOutReason.User, fromOtherTab: true }));
        } else {
          dispatch(locationChosen(message.locationId));
        }
      }),
    [dispatch],
  );
}
