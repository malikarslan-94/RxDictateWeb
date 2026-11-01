import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Role } from '@/constants/roles';
import { locationStatusSchema, membershipStatusSchema } from '@/contract';
import type { MemberView } from '@/contract';
import { useGetMeQuery, useListLocationsQuery } from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { selectActiveLocationId } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';
import { formatE164, toE164 } from '@/utils/phone';
import { firstName } from '@/utils/text';

import {
  useAddMemberMutation,
  useListMembersQuery,
  useUpdateMemberMutation,
} from '../api';
import { teamCopy } from '../copy';
import { assistantFormSchema } from '../schemas';
import type { AssistantFormInput } from '../schemas';

/**
 * Add an assistant, or change an existing one's name and locations. Always as
 * an assistant: a doctor adds no other doctor, and nobody's role changes.
 *
 * Adding a number that's already one of the clinic's assistants gives them
 * the locations ticked, on top of the ones they have: one person, one
 * membership, however many places they work.
 */
export function useAssistantDialog({
  member,
  onSaved,
}: {
  /** The assistant being edited, or null to add one. */
  member: MemberView | null;
  onSaved: () => void;
}) {
  const me = useGetMeQuery();
  const locations = useListLocationsQuery();
  const activeLocationId = useAppSelector(selectActiveLocationId);
  const [addMember, { isLoading: isAdding }] = useAddMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const members = useListMembersQuery();

  const activeLocations = (locations.data ?? []).filter(
    (location) => location.status === locationStatusSchema.enum.active,
  );
  const isActive = (id: string) =>
    activeLocations.some((location) => location.id === id);

  const defaults: AssistantFormInput = member
    ? {
        name: member.name,
        phone: member.phone,
        locationIds: member.locationIds.filter(isActive),
      }
    : {
        name: '',
        phone: '',
        locationIds: activeLocationId ? [activeLocationId] : [],
      };

  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(assistantFormSchema),
    defaultValues: defaults,
  });
  const typedPhone = useWatch({ control, name: 'phone' });
  const typedNumber = member ? null : toE164(typedPhone ?? '');
  const existing =
    (typedNumber &&
      members.data?.find(
        (item) =>
          item.phone === typedNumber &&
          item.role === Role.pa &&
          item.status === membershipStatusSchema.enum.active,
      )) ||
    null;

  const submit = handleSubmit(async (values) => {
    try {
      if (existing) {
        // Their name stays theirs; only the places they work grow.
        const locationIds = [
          ...new Set([
            ...existing.locationIds.filter(isActive),
            ...values.locationIds,
          ]),
        ];
        await updateMember({
          id: existing.id,
          body: { locationIds },
        }).unwrap();
      } else if (member) {
        await updateMember({
          id: member.id,
          body: { name: values.name, locationIds: values.locationIds },
        }).unwrap();
      } else {
        await addMember({
          name: values.name,
          phone: values.phone,
          role: Role.pa,
          locationIds: values.locationIds,
        }).unwrap();
      }
      onSaved();
    } catch (error) {
      setError('root', { message: messageFor(toApiError(error)) });
    }
  });

  return {
    isEditing: member !== null,
    title: member ? teamCopy.dialog.editTitle : teamCopy.dialog.addTitle,
    submitLabel: member
      ? teamCopy.dialog.save
      : existing
        ? teamCopy.dialog.addLocations
        : teamCopy.dialog.add,
    /** The number is already an assistant here: what saving will do. */
    existingNote: existing ? teamCopy.dialog.existing(existing.name) : null,
    control,
    submit,
    isSaving: isAdding || isUpdating,
    formError: formState.errors.root?.message,
    // Only someone new is texted; an existing assistant just gains places.
    smsPreview:
      member || existing
        ? null
        : teamCopy.fields.smsPreview(firstName(me.data?.name ?? '')),
    fixedPhone: member
      ? teamCopy.dialog.phoneFixed(formatE164(member.phone))
      : null,
    locationOptions: activeLocations.map((location) => ({
      value: location.id,
      label: location.name,
    })),
  };
}
