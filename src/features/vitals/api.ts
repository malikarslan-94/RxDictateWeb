import { vitalsViewSchema } from '@/contract';
import type { RecordVitalsBody, VitalsView } from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { vitalsCopy } from './copy';

const vitalsTag = (visitId: string) => ({ type: ApiTag.Vitals, id: visitId });

export const vitalsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * The visit's vitals. None recorded answers NOT_FOUND today; `null` once
     * the server change in docs/backend-requests/patients-and-visits.md ships.
     */
    getVisitVitals: build.query<VitalsView | null, string>({
      query: (visitId) => `/visits/${visitId}/vitals`,
      rawResponseSchema: vitalsViewSchema.nullable(),
      providesTags: (_result, _error, visitId) => [vitalsTag(visitId)],
    }),
    /** Record the visit's one set of readings, replacing any earlier set. */
    recordVitals: build.mutation<
      VitalsView,
      { visitId: string; body: RecordVitalsBody }
    >({
      extraOptions: { success: vitalsCopy.toast.saved },
      query: ({ visitId, body }) => ({
        url: `/visits/${visitId}/vitals`,
        method: 'PUT',
        body,
      }),
      rawResponseSchema: vitalsViewSchema,
      // Today's list shows "Vitals done" from the visit, so refresh it too.
      invalidatesTags: (_result, _error, { visitId }) => [
        vitalsTag(visitId),
        ApiTag.Visit,
      ],
    }),
  }),
});

export const { useGetVisitVitalsQuery, useRecordVitalsMutation } = vitalsApi;
