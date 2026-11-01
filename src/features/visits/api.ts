import { z } from 'zod';

import { visitViewSchema } from '@/contract';
import type {
  CreateVisitBody,
  MoveVisitBody,
  VisitStatus,
  VisitView,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { TODAY } from './constants';
import { visitsCopy } from './copy';
import { positionBefore } from './utils';

export const visitsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Today's list at the active location, in the order the assistant set. */
    listTodayVisits: build.query<VisitView[], void>({
      query: () => ({ url: '/visits', params: { date: TODAY } }),
      rawResponseSchema: z.array(visitViewSchema),
      providesTags: [ApiTag.Visit],
    }),
    /**
     * Put a patient on today's list. Asking twice for the same patient
     * returns the existing visit, so a double tap can't issue two tokens.
     */
    createVisit: build.mutation<VisitView, CreateVisitBody>({
      extraOptions: { success: visitsCopy.toast.addedToList },
      query: (body) => ({ url: '/visits', method: 'POST', body }),
      rawResponseSchema: visitViewSchema,
      invalidatesTags: [ApiTag.Visit],
    }),
    updateVisitStatus: build.mutation<
      VisitView,
      { id: string; status: VisitStatus }
    >({
      query: ({ id, status }) => ({
        url: `/visits/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      rawResponseSchema: visitViewSchema,
      invalidatesTags: [ApiTag.Visit],
    }),
    /**
     * The assistant moves a waiting patient before another, or to the end.
     * The list moves at once and the server's answer confirms it; the token
     * never changes. No toast when it works: the list moving says so.
     */
    moveVisit: build.mutation<VisitView, { id: string } & MoveVisitBody>({
      query: ({ id, before }) => ({
        url: `/visits/${id}/move`,
        method: 'POST',
        body: { before },
      }),
      rawResponseSchema: visitViewSchema,
      async onQueryStarted({ id, before }, { dispatch, queryFulfilled }) {
        const moved = dispatch(
          visitsApi.util.updateQueryData(
            'listTodayVisits',
            undefined,
            (visits) => {
              const visit = visits.find((item) => item.id === id);
              if (visit)
                visit.queuePosition = positionBefore(visits, id, before);
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          moved.undo();
        }
      },
      invalidatesTags: [ApiTag.Visit],
    }),
  }),
});

export const {
  useListTodayVisitsQuery,
  useCreateVisitMutation,
  useUpdateVisitStatusMutation,
  useMoveVisitMutation,
} = visitsApi;
