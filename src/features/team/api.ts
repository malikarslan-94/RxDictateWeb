import { z } from 'zod';

import { memberViewSchema } from '@/contract';
import type { AddMemberBody, MemberView, UpdateMemberBody } from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { teamCopy } from './copy';

/** The clinic's team. Only a doctor reads or changes it; the server enforces it. */
export const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Everyone ever added, removed members included. */
    listMembers: build.query<MemberView[], void>({
      query: () => '/members',
      rawResponseSchema: z.array(memberViewSchema),
      providesTags: [ApiTag.Member],
    }),
    /** By phone number: the server finds or creates the account. */
    addMember: build.mutation<MemberView, AddMemberBody>({
      extraOptions: { success: teamCopy.toast.added },
      query: (body) => ({ url: '/members', method: 'POST', body }),
      rawResponseSchema: memberViewSchema,
      invalidatesTags: [ApiTag.Member],
    }),
    updateMember: build.mutation<
      MemberView,
      { id: string; body: UpdateMemberBody }
    >({
      extraOptions: { success: teamCopy.toast.updated },
      query: ({ id, body }) => ({
        url: `/members/${id}`,
        method: 'PATCH',
        body,
      }),
      rawResponseSchema: memberViewSchema,
      invalidatesTags: [ApiTag.Member],
    }),
    /** Access stops at once; what they did stays on record under their name. */
    removeMember: build.mutation<MemberView, string>({
      extraOptions: { success: teamCopy.toast.removed },
      query: (id) => ({ url: `/members/${id}`, method: 'DELETE' }),
      rawResponseSchema: memberViewSchema,
      invalidatesTags: [ApiTag.Member],
    }),
  }),
});

export const {
  useListMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} = teamApi;
