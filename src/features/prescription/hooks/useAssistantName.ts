import { Role } from '@/constants/roles';
import { membershipStatusSchema } from '@/contract';
import { useListMembersQuery } from '@/features/team';
import { firstName } from '@/utils/text';

/**
 * The first name of the clinic's assistant, for "Ask Sana to book…". Null when
 * the clinic has no active assistant, so there's no one to ask.
 */
export function useAssistantName(): string | null {
  const { data } = useListMembersQuery();
  const assistant = data?.find(
    (member) =>
      member.role === Role.pa &&
      member.status === membershipStatusSchema.enum.active,
  );
  return assistant ? firstName(assistant.name) || null : null;
}
