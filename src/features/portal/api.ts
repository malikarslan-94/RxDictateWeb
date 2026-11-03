import { patientPortalViewSchema } from '@/contract';
import type { PatientPortalView } from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { portalCopy } from './copy';

const tagsFor = (id: string) => [{ type: ApiTag.PatientPortal, id }];

/** A patient's online access, as the clinic sees and controls it. */
export const portalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPatientPortal: build.query<PatientPortalView, string>({
      query: (patientId) => `/patients/${patientId}/portal`,
      rawResponseSchema: patientPortalViewSchema,
      providesTags: (_result, _error, patientId) => tagsFor(patientId),
    }),
    sendPatientInvite: build.mutation<PatientPortalView, string>({
      extraOptions: { success: portalCopy.toast.invited },
      query: (patientId) => ({
        url: `/patients/${patientId}/portal/invite`,
        method: 'POST',
      }),
      rawResponseSchema: patientPortalViewSchema,
      invalidatesTags: (_result, _error, patientId) => tagsFor(patientId),
    }),
    /** "Don't share online". Turning it on ends any link. */
    updatePatientPortal: build.mutation<
      PatientPortalView,
      { patientId: string; blocked: boolean }
    >({
      extraOptions: { success: portalCopy.toast.saved },
      query: ({ patientId, blocked }) => ({
        url: `/patients/${patientId}/portal`,
        method: 'PATCH',
        body: { blocked },
      }),
      rawResponseSchema: patientPortalViewSchema,
      invalidatesTags: (_result, _error, { patientId }) => tagsFor(patientId),
    }),
    removePatientLink: build.mutation<PatientPortalView, string>({
      extraOptions: { success: portalCopy.toast.removed },
      query: (patientId) => ({
        url: `/patients/${patientId}/portal/link`,
        method: 'DELETE',
      }),
      rawResponseSchema: patientPortalViewSchema,
      invalidatesTags: (_result, _error, patientId) => tagsFor(patientId),
    }),
  }),
});

export const {
  useGetPatientPortalQuery,
  useSendPatientInviteMutation,
  useUpdatePatientPortalMutation,
  useRemovePatientLinkMutation,
} = portalApi;
