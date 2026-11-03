import { createApi } from '@reduxjs/toolkit/query/react';

import { ClientErrorCode } from '@/constants/errorCodes';

import { baseQuery } from './baseQuery';

/** Cache tags. A mutation invalidates a tag; every query providing it refetches. */
export const ApiTag = {
  Me: 'Me',
  Practice: 'Practice',
  Location: 'Location',
  Member: 'Member',
  Visit: 'Visit',
  Patient: 'Patient',
  Prescription: 'Prescription',
  Vitals: 'Vitals',
  Voice: 'Voice',
  Notification: 'Notification',
  Report: 'Report',
  Appointment: 'Appointment',
  FollowUp: 'FollowUp',
  Template: 'Template',
  Settings: 'Settings',
  Medicine: 'Medicine',
  PatientPortal: 'PatientPortal',
} as const;

/** Every tag: invalidating them all refetches whatever is on screen. */
export const ALL_API_TAGS = Object.values(ApiTag);

/**
 * The single RTK Query API. It defines no endpoints itself: each feature adds
 * its own with `baseApi.injectEndpoints` in its `api.ts`.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ALL_API_TAGS,
  endpoints: () => ({}),
  // A response that doesn't match the contract is a server bug, not a crash.
  catchSchemaFailure: (error) => ({
    code: ClientErrorCode.INVALID_RESPONSE,
    message: error.message,
    status: 0,
  }),
});
