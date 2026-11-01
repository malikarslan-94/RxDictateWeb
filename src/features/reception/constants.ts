import { VisitStatus } from '@/constants/visits';

/** Reception's list checks for the doctor's approvals this often. */
export const RECEPTION_POLL_MS = 15_000;

/** "Waiting 18 min" moves on every minute. */
export const WAIT_TICK_MS = 60_000;

/** Numbers sharing one phone: a family is rarely more. */
export const PHONE_MATCH_LIMIT = 10;

/**
 * Where a patient on the list stands: the visit's status, with a finished
 * visit split by whether its prescription has been printed here.
 */
export const ReceptionStage = {
  waiting: VisitStatus.waiting,
  with_doctor: VisitStatus.with_doctor,
  ready: 'ready',
  printed: 'printed',
} as const;
export type ReceptionStage =
  (typeof ReceptionStage)[keyof typeof ReceptionStage];
