import { Outlet } from 'react-router';

import { Toaster } from '@/components';

import { useLostAccessToast } from '../hooks/useLostAccessToast';
import { useSessionRestore } from '../hooks/useSessionRestore';
import { useTabSync } from '../hooks/useTabSync';
import { LaunchScreen } from '../screens/LaunchScreen';

/**
 * The root of every page: nothing shows until the stored session has been
 * checked. It also follows the other tabs, and holds the toasts that tell
 * of every success and failure, losing access to a clinic among them.
 */
export function SessionGate() {
  const launch = useSessionRestore();
  useLostAccessToast();
  useTabSync();

  if (launch.state !== 'ready') {
    return (
      <LaunchScreen
        state={launch.state}
        onRetry={launch.retry}
        onSignInWithDifferentNumber={launch.signInWithDifferentNumber}
      />
    );
  }
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
