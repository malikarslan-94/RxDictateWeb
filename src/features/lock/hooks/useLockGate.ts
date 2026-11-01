import { useCallback, useEffect, useRef, useState } from 'react';

import { useSignOut } from '@/features/auth';
import { SignOutReason, registerSignOutTask, selectUser } from '@/lib/session';
import { StorageKey, readItem, removeItem, writeItem } from '@/lib/storage';
import { useAppSelector } from '@/store/hooks';

import { ACTIVITY_EVENTS, CHECK_EVERY_MS, MS_PER_MINUTE } from '../constants';
import { forgetPin, hasPin } from '../pinStore';
import { readLockSettings } from './useLockSettings';

const LOCKED = '1';

/**
 * Watches for a computer left alone. After the set time without a click or
 * a key, the page locks until the user's PIN is entered. A reload stays
 * locked. Without a PIN on this computer yet, it asks for one first.
 */
export function useLockGate() {
  const user = useAppSelector(selectUser);
  const { signOut } = useSignOut();
  const [isLocked, setIsLocked] = useState(
    () => readItem(StorageKey.locked, 'session') === LOCKED,
  );
  const [needsPin, setNeedsPin] = useState(false);
  const [isPinPromptSkipped, setIsPinPromptSkipped] = useState(false);
  const lastActive = useRef(Date.now());
  const userId = user?.id ?? null;

  const lock = useCallback(() => {
    writeItem(StorageKey.locked, LOCKED, 'session');
    setIsLocked(true);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setNeedsPin(readLockSettings().isEnabled && !hasPin(userId));
    // The PIN is this user's on this computer only: gone at sign-out.
    return registerSignOutTask(() => forgetPin(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const touch = () => {
      lastActive.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, touch, { passive: true }),
    );
    const timer = setInterval(() => {
      const settings = readLockSettings();
      const idle = Date.now() - lastActive.current;
      if (
        settings.isEnabled &&
        hasPin(userId) &&
        idle >= settings.minutes * MS_PER_MINUTE
      ) {
        lock();
      }
    }, CHECK_EVERY_MS);
    return () => {
      ACTIVITY_EVENTS.forEach((name) =>
        window.removeEventListener(name, touch),
      );
      clearInterval(timer);
    };
  }, [userId, lock]);

  return {
    isLocked: isLocked && !!userId && hasPin(userId),
    minutes: readLockSettings().minutes,
    unlocked: () => {
      removeItem(StorageKey.locked, 'session');
      lastActive.current = Date.now();
      setIsLocked(false);
    },
    showPinPrompt: needsPin && !isPinPromptSkipped,
    pinSaved: () => setNeedsPin(false),
    skipPinPrompt: () => setIsPinPromptSkipped(true),
    signOut: () => signOut({ reason: SignOutReason.User }),
  };
}

export type LockGate = ReturnType<typeof useLockGate>;
