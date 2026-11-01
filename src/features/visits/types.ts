import type { VisitStatus } from '@/contract';

/** One patient on today's list, ready to show. */
export type QueueEntry = {
  id: string;
  patientId: string;
  /** The number called out, issued by the server per location per day. */
  token: number;
  /** Its place in the list as the assistant arranged it; never shown. */
  queuePosition: number;
  name: string;
  /** "45 · M". */
  details: string;
  /** "MR-10231"; empty when the patient record didn't come with the visit. */
  mrNo: string;
  /** "Fever 3 days"; empty when none was given. */
  reason: string;
  status: VisitStatus;
  hasVitals: boolean;
  /** When vitals were last saved; null until they are. */
  vitalsRecordedAt: Date | null;
  arrivedAt: Date;
  /** When the visit entered its current status, e.g. went in to the doctor. */
  statusChangedAt: Date;
};
