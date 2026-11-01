import { useEffect } from 'react';

import { toastHidden } from '@/lib/toast';
import type { ToastItem } from '@/lib/toast';
import { useAppDispatch } from '@/store/hooks';
import { Toast } from '@/ui';

/** A success is read at a glance; a failure gets longer. */
const SHOWN_MS = { success: 4000, danger: 7000 } as const;

/** One toast that leaves on its own, or when closed. */
export function TimedToast({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch();
  const { id, tone } = toast;

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastHidden(id)), SHOWN_MS[tone]);
    return () => clearTimeout(timer);
  }, [dispatch, id, tone]);

  return (
    <Toast
      tone={tone}
      messages={toast.messages}
      onClose={() => dispatch(toastHidden(id))}
    />
  );
}
