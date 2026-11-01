import { VisitStatus } from '@/constants/visits';
import type { VisitView } from '@/contract';
import type { ChipTone as StatusTone } from '@/ui';
import { patientDetails } from '@/utils/patient';

import { VISIT_STATUS_TONE } from './constants';
import { visitsCopy } from './copy';
import type { QueueEntry } from './types';

/** Today's visits as queue entries, in arrival order. */
export function toQueue(visits: readonly VisitView[]): QueueEntry[] {
  return visits.map((visit) => ({
    id: visit.id,
    patientId: visit.patientId,
    token: visit.token,
    queuePosition: visit.queuePosition,
    name: visit.patient?.name ?? visitsCopy.unknownPatient,
    details: patientDetails(visit.patient),
    mrNo: visit.patient?.mrNo ?? '',
    reason: visit.reason,
    status: visit.status,
    hasVitals: visit.vitalsRecordedAt !== null,
    vitalsRecordedAt: visit.vitalsRecordedAt,
    arrivedAt: visit.createdAt,
    statusChangedAt: visit.statusChangedAt,
  }));
}

/** Who's with the doctor, then who's waiting, then who's been seen. */
const QUEUE_GROUP = {
  [VisitStatus.with_doctor]: 0,
  [VisitStatus.waiting]: 1,
  [VisitStatus.done]: 2,
} as const satisfies Record<QueueEntry['status'], number>;

/**
 * Today's list in one order on every screen, the assistant's and the
 * doctor's alike: with the doctor, then waiting in the order the assistant
 * set, then seen. The token stays the patient's number whatever the order.
 */
export function inQueueOrder(a: QueueEntry, b: QueueEntry): number {
  return (
    QUEUE_GROUP[a.status] - QUEUE_GROUP[b.status] ||
    a.queuePosition - b.queuePosition ||
    a.token - b.token
  );
}

/**
 * Where a moved visit lands, as the server places it: between the waiting
 * visit before `before` and `before`, or after the last one waiting when
 * `before` is null. Lets the list move the moment it's dropped.
 */
export function positionBefore(
  visits: readonly VisitView[],
  id: string,
  before: string | null,
): number {
  const waiting = visits
    .filter((visit) => visit.status === VisitStatus.waiting && visit.id !== id)
    .sort((a, b) => a.queuePosition - b.queuePosition);
  const current = visits.find((visit) => visit.id === id)?.queuePosition ?? 0;
  if (before === null) return (waiting.at(-1)?.queuePosition ?? current) + 1;
  const index = waiting.findIndex((visit) => visit.id === before);
  if (index < 0) return current;
  const previous = waiting[index - 1];
  return previous
    ? (previous.queuePosition + waiting[index].queuePosition) / 2
    : waiting[index].queuePosition - 1;
}

/** How many patients are in each state. */
export function countByStatus(queue: readonly QueueEntry[]) {
  const count = (status: QueueEntry['status']) =>
    queue.filter((entry) => entry.status === status).length;

  return {
    waiting: count(VisitStatus.waiting),
    withDoctor: count(VisitStatus.with_doctor),
    seen: count(VisitStatus.done),
  };
}

/** The chip for a visit: "Vitals done" beats "Waiting" once vitals are in. */
export function visitBadge(entry: QueueEntry): {
  label: string;
  tone: StatusTone;
} {
  if (entry.status === VisitStatus.waiting && entry.hasVitals) {
    return { label: visitsCopy.vitalsDone, tone: 'ready' };
  }
  return {
    label: visitsCopy.visitStatus[entry.status],
    tone: VISIT_STATUS_TONE[entry.status],
  };
}
