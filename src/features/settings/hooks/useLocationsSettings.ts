import { useState } from 'react';

import { Role } from '@/constants/roles';
import { locationStatusSchema, membershipStatusSchema } from '@/contract';
import type { LocationView } from '@/contract';
import {
  scheduleLine,
  toLocationForm,
  useListLocationsQuery,
} from '@/features/clinic';
import { useListMembersQuery } from '@/features/team';
import { messageFor, toApiError } from '@/lib/api';

import { settingsCopy } from '../copy';
import type { LocationCardItem } from '../types';

const copy = settingsCopy.locations;

type LocationDialog =
  { kind: 'add' } | { kind: 'edit' | 'preview'; id: string };

/** Settings › Locations: each place, its hours and assistants, and its dialogs. */
export function useLocationsSettings() {
  const locations = useListLocationsQuery();
  const members = useListMembersQuery();
  const [dialog, setDialog] = useState<LocationDialog | null>(null);

  const find = (id: string): LocationView | null =>
    locations.data?.find((location) => location.id === id) ?? null;

  const assistantsAt = (id: string) =>
    (members.data ?? [])
      .filter(
        (member) =>
          member.role === Role.pa &&
          member.status === membershipStatusSchema.enum.active &&
          member.locationIds.includes(id),
      )
      .map((member) => member.name)
      .join(', ');

  const cards: LocationCardItem[] = (locations.data ?? [])
    .filter((location) => location.status === locationStatusSchema.enum.active)
    .map((location) => {
      const { days, opensAt, closesAt } = toLocationForm(location);
      return {
        id: location.id,
        name: location.name,
        isDefault: location.isDefault,
        address: location.address,
        hours:
          location.timings.length > 0
            ? scheduleLine(days, opensAt, closesAt)
            : copy.noHours,
        assistants: assistantsAt(location.id) || copy.noAssistant,
        edit: () => setDialog({ kind: 'edit', id: location.id }),
        preview: () => setDialog({ kind: 'preview', id: location.id }),
      };
    });

  return {
    cards,
    isLoading: locations.isLoading,
    error: locations.error
      ? messageFor(toApiError(locations.error))
      : undefined,
    retry: locations.refetch,
    isAdding: dialog?.kind === 'add',
    // Looked up each render, so a dialog shows the location as it is now
    // (made the default a moment ago, say), not as it was when opened.
    editing: dialog?.kind === 'edit' ? find(dialog.id) : null,
    previewing: dialog?.kind === 'preview' ? find(dialog.id) : null,
    add: () => setDialog({ kind: 'add' }),
    close: () => setDialog(null),
  };
}
