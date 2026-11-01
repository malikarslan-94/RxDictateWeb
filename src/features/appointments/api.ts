import { z } from 'zod';

import {
  appointmentCountsByDaySchema,
  appointmentViewSchema,
  followUpViewSchema,
} from '@/contract';
import type {
  AppointmentCountsByDay,
  AppointmentView,
  CreateAppointmentBody,
  FollowUpView,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { appointmentsCopy } from './copy';

export type AppointmentsRange = {
  appointments: AppointmentView[];
  /** `{ "2026-09-26": 5 }`, for the week strip. */
  countsByDay: AppointmentCountsByDay;
};

const rangeMetaSchema = z.object({ countsByDay: appointmentCountsByDaySchema });

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Booked appointments between two days, inclusive, earliest first. */
    listAppointments: build.query<
      AppointmentsRange,
      { from: string; to: string }
    >({
      query: (params) => ({ url: '/appointments', params }),
      rawResponseSchema: z.array(appointmentViewSchema),
      transformResponse: (appointments: AppointmentView[], meta) => {
        const parsed = rangeMetaSchema.safeParse(meta?.envelope);
        return {
          appointments,
          countsByDay: parsed.success ? parsed.data.countsByDay : {},
        };
      },
      providesTags: [ApiTag.Appointment],
    }),
    createAppointment: build.mutation<AppointmentView, CreateAppointmentBody>({
      extraOptions: { success: appointmentsCopy.toast.booked },
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      rawResponseSchema: appointmentViewSchema,
      // Booking a follow-up takes it off the list of ones to book.
      invalidatesTags: [ApiTag.Appointment, ApiTag.FollowUp],
    }),
    cancelAppointment: build.mutation<AppointmentView, string>({
      extraOptions: { success: appointmentsCopy.toast.cancelled },
      query: (id) => ({ url: `/appointments/${id}/cancel`, method: 'POST' }),
      rawResponseSchema: appointmentViewSchema,
      // A cancelled follow-up goes back on the list to book.
      invalidatesTags: [ApiTag.Appointment, ApiTag.FollowUp],
    }),
    /** Follow-ups the doctor asked for that nobody has booked yet. */
    listFollowUps: build.query<FollowUpView[], void>({
      query: () => '/follow-ups',
      rawResponseSchema: z.array(followUpViewSchema),
      providesTags: [ApiTag.FollowUp],
    }),
  }),
});

export const {
  useListAppointmentsQuery,
  useCreateAppointmentMutation,
  useCancelAppointmentMutation,
  useListFollowUpsQuery,
} = appointmentsApi;
