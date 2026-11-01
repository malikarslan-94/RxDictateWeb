import type { VisitStatus } from '@/contract';
import type { ChipTone as StatusTone } from '@/ui';

/** The API's keyword for the current day in the clinic's timezone. */
export const TODAY = 'today';

/** Status colour per visit state — one meaning each. */
export const VISIT_STATUS_TONE: Record<VisitStatus, StatusTone> = {
  waiting: 'waiting',
  with_doctor: 'ready',
  done: 'neutral',
};
