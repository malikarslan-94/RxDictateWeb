import type { TagDescription } from '@reduxjs/toolkit/query';

import type { RealtimeTopic } from '@/contract';
import { ApiTag } from '@/lib/api';

type Tag = TagDescription<(typeof ApiTag)[keyof typeof ApiTag]>;

/** The tag the prescription lists provide, as opposed to one prescription. */
const PRESCRIPTION_LISTS: Tag = { type: ApiTag.Prescription, id: 'LIST' };

/**
 * What to refetch for each kind of change. A message with an id refetches
 * just that one where the cache keeps them apart, so a prescription approved
 * elsewhere doesn't reload the draft open on this screen.
 */
const TOPIC_TAGS: Record<RealtimeTopic, (id: string | undefined) => Tag[]> = {
  visits: () => [ApiTag.Visit],
  vitals: (id) => [
    ApiTag.Visit,
    id ? { type: ApiTag.Vitals, id } : ApiTag.Vitals,
  ],
  prescriptions: (id) => [
    PRESCRIPTION_LISTS,
    ...(id ? [{ type: ApiTag.Prescription, id }] : []),
    ApiTag.FollowUp,
  ],
  appointments: () => [ApiTag.Appointment, ApiTag.FollowUp],
  patients: () => [ApiTag.Patient],
  // A report changes the patient lists too: their counts and "new reports".
  reports: () => [ApiTag.Report, ApiTag.Patient],
  notifications: () => [ApiTag.Notification],
  // Both change the memberships GET /me returns.
  team: () => [ApiTag.Member, ApiTag.Me],
  locations: () => [ApiTag.Location, ApiTag.Me],
  voice: (id) => [id ? { type: ApiTag.Voice, id } : ApiTag.Voice],
  settings: () => [ApiTag.Settings],
  medicines: () => [ApiTag.Medicine],
};

export function tagsFor(topic: RealtimeTopic, id: string | undefined): Tag[] {
  return TOPIC_TAGS[topic](id);
}
