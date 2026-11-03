import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Role } from '@/constants/roles';
import type { MemberView } from '@/contract';
import { useGetMeQuery } from '@/features/clinic';
import { messageFor, toApiError } from '@/lib/api';
import { formatE164 } from '@/utils/phone';
import { firstName } from '@/utils/text';

import { useAddMemberMutation, useUpdateMemberMutation } from '../api';
import { teamCopy } from '../copy';
import { assistantSchema } from '../schemas';

/**
 * Add a medicine manager, or change an existing one's name. No locations to
 * pick: they look after the whole clinic's medicines.
 */
export function useMedicineManagerDialog({
  member,
  onSaved,
}: {
  /** The medicine manager being edited, or null to add one. */
  member: MemberView | null;
  onSaved: () => void;
}) {
  const me = useGetMeQuery();
  const [addMember, { isLoading: isAdding }] = useAddMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(assistantSchema),
    defaultValues: { name: member?.name ?? '', phone: member?.phone ?? '' },
  });

  return {
    isEditing: member !== null,
    title: member
      ? teamCopy.dialog.editManagerTitle
      : teamCopy.dialog.addManagerTitle,
    submitLabel: member ? teamCopy.dialog.save : teamCopy.dialog.addManager,
    control,
    submit: handleSubmit(async (values) => {
      try {
        if (member) {
          await updateMember({
            id: member.id,
            body: { name: values.name },
          }).unwrap();
        } else {
          await addMember({
            name: values.name,
            phone: values.phone,
            role: Role.medicineManager,
            locationIds: [],
          }).unwrap();
        }
        onSaved();
      } catch (error) {
        setError('root', { message: messageFor(toApiError(error)) });
      }
    }),
    isSaving: isAdding || isUpdating,
    formError: formState.errors.root?.message,
    smsPreview: member
      ? null
      : teamCopy.fields.smsPreview(firstName(me.data?.name ?? '')),
    fixedPhone: member
      ? teamCopy.dialog.phoneFixed(formatE164(member.phone))
      : null,
  };
}
