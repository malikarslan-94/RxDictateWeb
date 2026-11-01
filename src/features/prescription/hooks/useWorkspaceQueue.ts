import { useNavigate } from 'react-router';

import { Hotkeys } from '@/constants/keys';
import { consultPath } from '@/constants/routes';
import { VisitStatus } from '@/constants/visits';
import { selectActiveMembership, selectActiveLocationId } from '@/lib/session';
import {
  inQueueOrder,
  toQueue,
  useListTodayVisitsQuery,
} from '@/features/visits';
import type { QueueEntry } from '@/features/visits';
import { useHotkey } from '@/hooks/useHotkey';
import { useAppSelector } from '@/store/hooks';

import { QUEUE_POLL_MS } from '../constants';
import { rxCopy } from '../copy';

const copy = rxCopy.workspace;

/**
 * Today's list down the side of the workspace. Picking someone moves the
 * prescription to them without leaving the page; Ctrl ↓ opens the next one
 * waiting.
 */
export function useWorkspaceQueue(currentPatientId: string) {
  const navigate = useNavigate();
  const membership = useAppSelector(selectActiveMembership);
  const locationId = useAppSelector(selectActiveLocationId);
  const visits = useListTodayVisitsQuery(undefined, {
    pollingInterval: QUEUE_POLL_MS,
  });
  // The same order as the assistant's list.
  const entries = toQueue(visits.data ?? []).sort(inQueueOrder);
  const open = (entry: QueueEntry) =>
    navigate(consultPath(entry.patientId, entry.id));

  const next = entries.find(
    (entry) =>
      entry.status === VisitStatus.waiting &&
      entry.patientId !== currentPatientId,
  );
  useHotkey(Hotkeys.nextPatient, () => {
    if (next) open(next);
  });

  return {
    title: copy.today(entries.length),
    place:
      membership?.locations.find((location) => location.id === locationId)
        ?.name ?? '',
    items: entries.map((entry) => ({
      id: entry.id,
      token: entry.token,
      name: entry.name,
      line: [entry.details, copy.queueStatus[entry.status]]
        .filter(Boolean)
        .join(' · '),
      isCurrent: entry.patientId === currentPatientId,
      open: () => open(entry),
    })),
    isLoading: visits.isLoading,
    hasNext: !!next,
  };
}
