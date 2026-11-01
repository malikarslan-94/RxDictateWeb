import { useEffect } from 'react';

import { lostAccessShown, selectLostAccessTo } from '@/lib/session';
import { ToastTone, toastShown } from '@/lib/toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { authCopy } from '../copy';

/** "You no longer have access to …", after being removed from one clinic. */
export function useLostAccessToast() {
  const dispatch = useAppDispatch();
  const clinic = useAppSelector(selectLostAccessTo);

  useEffect(() => {
    if (clinic === null) return;
    dispatch(
      toastShown({
        tone: ToastTone.danger,
        message: authCopy.toast.removedOne(clinic),
      }),
    );
    dispatch(lostAccessShown());
  }, [clinic, dispatch]);
}
