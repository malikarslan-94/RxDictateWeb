import { z } from 'zod';

import {
  locationViewSchema,
  meViewSchema,
  practiceViewSchema,
} from '@/contract';
import type {
  CreateLocationBody,
  LocationView,
  MeView,
  PracticeView,
  UpdateLocationBody,
  UpdateMeBody,
  UpdatePracticeBody,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';
import { userUpdated } from '@/lib/session';

import { clinicCopy } from './copy';

/** Who the user is and the clinic they work in: profile, credentials, places. */
export const clinicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<MeView, void>({
      query: () => '/me',
      rawResponseSchema: meViewSchema,
      providesTags: [ApiTag.Me],
    }),
    updateMe: build.mutation<MeView, UpdateMeBody>({
      extraOptions: { success: clinicCopy.toast.nameSaved },
      query: (body) => ({ url: '/me', method: 'PATCH', body }),
      rawResponseSchema: meViewSchema,
      invalidatesTags: [ApiTag.Me],
      // The menu and My account read the name from the session.
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(userUpdated(data));
      },
    }),
    getPractice: build.query<PracticeView, void>({
      query: () => '/practice',
      rawResponseSchema: practiceViewSchema,
      providesTags: [ApiTag.Practice],
    }),
    updatePractice: build.mutation<PracticeView, UpdatePracticeBody>({
      extraOptions: { success: clinicCopy.toast.saved },
      query: (body) => ({ url: '/practice', method: 'PATCH', body }),
      rawResponseSchema: practiceViewSchema,
      // The clinic's name is on every membership GET /me returns.
      invalidatesTags: [ApiTag.Practice, ApiTag.Me],
    }),
    /** Every location, archived ones included, so Settings can show both. */
    listLocations: build.query<LocationView[], void>({
      query: () => '/locations',
      rawResponseSchema: z.array(locationViewSchema),
      providesTags: [ApiTag.Location],
    }),
    createLocation: build.mutation<LocationView, CreateLocationBody>({
      extraOptions: { success: clinicCopy.toast.locationAdded },
      query: (body) => ({ url: '/locations', method: 'POST', body }),
      rawResponseSchema: locationViewSchema,
      invalidatesTags: [ApiTag.Location, ApiTag.Me],
    }),
    updateLocation: build.mutation<
      LocationView,
      { id: string; body: UpdateLocationBody }
    >({
      extraOptions: { success: clinicCopy.toast.locationSaved },
      query: ({ id, body }) => ({
        url: `/locations/${id}`,
        method: 'PATCH',
        body,
      }),
      rawResponseSchema: locationViewSchema,
      invalidatesTags: [ApiTag.Location, ApiTag.Me],
    }),
    /** Stops new work there. Its prescriptions and visits stay on record. */
    archiveLocation: build.mutation<LocationView, string>({
      extraOptions: { success: clinicCopy.toast.locationArchived },
      query: (id) => ({ url: `/locations/${id}/archive`, method: 'POST' }),
      rawResponseSchema: locationViewSchema,
      invalidatesTags: [ApiTag.Location, ApiTag.Me, ApiTag.Member],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetPracticeQuery,
  useUpdatePracticeMutation,
  useListLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useArchiveLocationMutation,
} = clinicApi;
