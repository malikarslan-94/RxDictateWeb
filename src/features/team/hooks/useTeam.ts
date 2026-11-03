import { useState } from 'react';

import { commonCopy } from '@/constants/copy';
import { Role } from '@/constants/roles';
import { locationStatusSchema, membershipStatusSchema } from '@/contract';
import type { MemberView } from '@/contract';
import { useListLocationsQuery } from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { maskE164 } from '@/utils/phone';

import { useListMembersQuery, useRemoveMemberMutation } from '../api';
import { teamCopy } from '../copy';
import type { MemberItem, TeamDialog } from '../types';

/** Who's in the Team table: never another doctor, or someone removed. */
const TEAM_ROLES: readonly Role[] = [Role.pa, Role.medicineManager];

/**
 * Settings › Team: the clinic's assistants and medicine managers, and the
 * dialogs that change them. A doctor adds only these two, and nobody's role
 * changes once added.
 */
export function useTeam() {
  const members = useListMembersQuery();
  const locations = useListLocationsQuery();
  const [dialog, setDialog] = useState<TeamDialog | null>(null);
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const [removeError, setRemoveError] = useState<string>();

  const open = (next: TeamDialog | null) => {
    setRemoveError(undefined);
    setDialog(next);
  };

  const activeLocations = (locations.data ?? []).filter(
    (location) => location.status === locationStatusSchema.enum.active,
  );
  const placesOf = (member: MemberView) =>
    member.role === Role.medicineManager
      ? [teamCopy.allLocations]
      : activeLocations
          .filter((location) => member.locationIds.includes(location.id))
          .map((location) => location.name);

  const rows: MemberItem[] = (members.data ?? [])
    .filter(
      (member) =>
        TEAM_ROLES.includes(member.role) &&
        member.status === membershipStatusSchema.enum.active,
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => ({
      id: member.id,
      name: member.name,
      phone: maskE164(member.phone),
      role: commonCopy.roles[member.role],
      places: placesOf(member),
      member,
    }));

  return {
    rows,
    isLoading: members.isLoading,
    error: members.error ? messageFor(toApiError(members.error)) : undefined,
    retry: members.refetch,
    dialog,
    openAdd: () => open({ kind: 'add' }),
    openAddManager: () => open({ kind: 'addManager' }),
    openEdit: (member: MemberView) =>
      open({
        kind: member.role === Role.medicineManager ? 'editManager' : 'edit',
        member,
      }),
    openRemove: (member: MemberView) => open({ kind: 'remove', member }),
    closeDialog: () => open(null),
    remove: async (member: MemberView) => {
      setRemoveError(undefined);
      try {
        await removeMember(member.id).unwrap();
        setDialog(null);
      } catch (error) {
        setRemoveError(messageFor(toApiError(error)));
      }
    },
    isRemoving,
    removeError,
  };
}
