import { createPortal } from 'react-dom';

import { selectToasts } from '@/lib/toast';
import { useAppSelector } from '@/store/hooks';

import { TimedToast } from './TimedToast';

/**
 * Where every success and failure is told, top right, newest at the bottom.
 * Above dialogs, so a failure inside one is still seen.
 */
export function Toaster() {
  const toasts = useAppSelector(selectToasts);
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 left-4 z-55 flex flex-col items-end gap-2"
    >
      {toasts.map((toast) => (
        <TimedToast key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
