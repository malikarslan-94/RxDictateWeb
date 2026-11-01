import { Icon } from '@/ui';

import { shellCopy } from '../copy';

/** A strip across the top of the page while live updates are down. */
export function LiveNotice() {
  return (
    <p
      role="status"
      className="flex items-center gap-2 bg-warning-soft px-8 py-2 text-meta font-bold text-warning-strong"
    >
      <Icon name="alert" className="size-4 shrink-0" />
      {shellCopy.liveInterrupted}
    </p>
  );
}
