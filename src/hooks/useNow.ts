import { useEffect, useState } from 'react';

/** The time, moving on every `everyMs`: for "Saved 4 s ago", "Waiting 18 min". */
export function useNow(everyMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return now;
}
