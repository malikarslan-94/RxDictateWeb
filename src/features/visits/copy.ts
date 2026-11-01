import type { VisitStatus } from '@/contract';

export const visitsCopy = {
  /** Said once the action works; failures speak for themselves. */
  toast: {
    addedToList: "Added to today's list",
  },
  visitStatus: {
    waiting: 'Waiting',
    with_doctor: 'With doctor',
    done: 'Seen',
  } satisfies Record<VisitStatus, string>,
  vitalsDone: 'Vitals done',
  unknownPatient: 'Unknown patient',
} as const;
