import { useState } from 'react';
import { useNavigate } from 'react-router';

import { commonCopy } from '@/constants/copy';
import { MINUTES_PER_HOUR, MS_PER_MINUTE } from '@/constants/dates';
import { Role } from '@/constants/roles';
import { consultPath } from '@/constants/routes';
import { VisitStatus } from '@/constants/visits';
import { membershipStatusSchema } from '@/contract';
import {
  scheduleLine,
  toLocationForm,
  useGetMeQuery,
  useListLocationsQuery,
} from '@/features/clinic';
import { useInbox } from '@/features/notifications';
import { useListMembersQuery } from '@/features/team';
import {
  countByStatus,
  inQueueOrder,
  toQueue,
  useListTodayVisitsQuery,
} from '@/features/visits';
import type { QueueEntry } from '@/features/visits';
import { useNow } from '@/hooks/useNow';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveLocationId } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatClockTime, formatLongDate } from '@/utils/date';
import { firstName } from '@/utils/text';

import { TODAY_POLL_MS, WAIT_TICK_MS } from '../constants';
import { todayCopy } from '../copy';
import type { TodayRow } from '../types';
import { greetingPeriod } from '../utils';

const copy = todayCopy.list;

/** The one with the doctor, then the waiting by token, then the seen. */
/**
 * The doctor's Today: who's waiting, who's in, what the assistant did, and
 * the next patient one click away. Ctrl K searches every patient.
 */
export function useToday() {
  const navigate = useNavigate();
  const now = useNow(WAIT_TICK_MS);
  const me = useGetMeQuery();
  const locations = useListLocationsQuery();
  const locationId = useAppSelector(selectActiveLocationId);
  const members = useListMembersQuery();
  const visits = useListTodayVisitsQuery(undefined, {
    pollingInterval: TODAY_POLL_MS,
  });
  const inbox = useInbox();
  const [isPicking, setIsPicking] = useState(false);

  const location = locations.data?.find((place) => place.id === locationId);
  const hours = location ? toLocationForm(location) : null;
  const assistant =
    members.data?.find(
      (member) =>
        member.role === Role.pa &&
        member.status === membershipStatusSchema.enum.active &&
        member.locationIds.includes(locationId ?? ''),
    ) ?? null;
  const assistantName = assistant ? firstName(assistant.name) : null;

  const queue = toQueue(visits.data ?? []);
  const counts = countByStatus(queue);
  const open = (entry: QueueEntry) =>
    navigate(consultPath(entry.patientId, entry.id));
  const waitedFor = (entry: QueueEntry) => {
    const minutes = Math.max(
      0,
      Math.floor(
        (now.getTime() - entry.statusChangedAt.getTime()) / MS_PER_MINUTE,
      ),
    );
    return minutes < MINUTES_PER_HOUR
      ? commonCopy.time.minutes(minutes)
      : formatClockTime(entry.statusChangedAt);
  };

  const rows: TodayRow[] = [...queue].sort(inQueueOrder).map((entry) => ({
    id: entry.id,
    token: entry.token,
    name: entry.name,
    details: [entry.details, entry.mrNo].filter(Boolean).join(' · '),
    added: formatClockTime(entry.arrivedAt),
    status:
      entry.status === VisitStatus.done
        ? { label: copy.approved, tone: 'ready', icon: 'check' }
        : entry.status === VisitStatus.with_doctor
          ? { label: copy.draftOpen, tone: 'active', icon: 'pencil' }
          : {
              label: copy.waiting(waitedFor(entry)),
              tone: 'waiting',
              icon: 'clock',
            },
    action: {
      label:
        entry.status === VisitStatus.done
          ? copy.view
          : entry.status === VisitStatus.with_doctor
            ? copy.continue
            : copy.start,
      kind:
        entry.status === VisitStatus.done
          ? 'view'
          : entry.status === VisitStatus.with_doctor
            ? 'continue'
            : 'start',
      open: () => open(entry),
    },
    isCurrent: entry.status === VisitStatus.with_doctor,
  }));

  const next =
    [...queue]
      .filter((entry) => entry.status === VisitStatus.waiting)
      .sort(inQueueOrder)[0] ?? null;
  const name = firstName(me.data?.name ?? '');

  return {
    meta: todayCopy.meta([
      formatLongDate(now),
      location?.name ?? '',
      hours && location?.timings.length
        ? scheduleLine([], hours.opensAt, hours.closesAt)
        : '',
    ]),
    greeting: todayCopy.greet(
      todayCopy.greeting[greetingPeriod(now)],
      name ? todayCopy.doctorName(name) : '',
    ),
    stats: [
      {
        key: 'today',
        value: queue.length,
        label: todayCopy.stats.today,
        tone: 'default',
      },
      {
        key: 'waiting',
        value: counts.waiting,
        label: todayCopy.stats.waiting,
        tone: 'warning',
      },
      {
        key: 'draft',
        value: counts.withDoctor,
        label: todayCopy.stats.draft,
        tone: 'primary',
      },
      {
        key: 'approved',
        value: counts.seen,
        label: todayCopy.stats.approved,
        tone: 'default',
      },
    ] as const,
    live: copy.live(assistantName),
    rows,
    isLoading: visits.isLoading,
    error: visits.error ? messageFor(toApiError(visits.error)) : undefined,
    retry: visits.refetch,
    next: next
      ? {
          name: next.name,
          line: [
            next.details,
            next.reason ? todayCopy.next.noted(next.reason, assistantName) : '',
          ]
            .filter(Boolean)
            .join(' · '),
          start: () => open(next),
        }
      : null,
    inbox,
    isPicking,
    openPicker: () => setIsPicking(true),
    closePicker: () => setIsPicking(false),
  };
}
