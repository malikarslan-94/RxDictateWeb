import { useCallback, useEffect, useState } from 'react';

const TICK_MS = 250;
const MS_PER_SECOND = 1000;

/**
 * Seconds left until a deadline, e.g. "Resend in 0:42". Counts against the
 * clock rather than decrementing, so a backgrounded app is still right.
 */
export function useCountdown(seconds: number) {
  const [deadline, setDeadline] = useState(
    () => Date.now() + seconds * MS_PER_SECOND,
  );
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / MS_PER_SECOND),
      );
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    };
    const timer = setInterval(tick, TICK_MS);
    tick();
    return () => clearInterval(timer);
  }, [deadline]);

  /** Start again, from `seconds` unless told otherwise (e.g. the server's retryAfter). */
  const restart = useCallback(
    (from: number = seconds) => setDeadline(Date.now() + from * MS_PER_SECOND),
    [seconds],
  );

  return { remaining, isRunning: remaining > 0, restart };
}
