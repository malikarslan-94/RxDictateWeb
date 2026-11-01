import { z } from 'zod';

import {
  reportDetailViewSchema,
  reportViewSchema,
  uploadTicketSchema,
} from '@/contract';
import type {
  CreateReportBody,
  CreateUploadBody,
  ReportDetailView,
  ReportView,
  UploadTicket,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { REPORT_LIST_LIMIT } from './constants';
import { reportsCopy } from './copy';

const patientReportsTag = (patientId: string) => ({
  type: ApiTag.Report,
  id: `patient-${patientId}`,
});

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** A patient's reports. */
    listPatientReports: build.query<ReportView[], string>({
      query: (patientId) => ({
        url: `/patients/${patientId}/reports`,
        params: { limit: REPORT_LIST_LIMIT },
      }),
      rawResponseSchema: z.array(reportViewSchema),
      providesTags: (_result, _error, patientId) => [
        patientReportsTag(patientId),
      ],
    }),
    /**
     * One report with a short-lived link per page. Asked fresh each time
     * it's opened and dropped as soon as it closes, so links aren't kept.
     */
    getReport: build.query<ReportDetailView, string>({
      query: (id) => `/reports/${id}`,
      rawResponseSchema: reportDetailViewSchema,
      keepUnusedDataFor: 0,
    }),
    /** Step one: somewhere to PUT one page. */
    createUpload: build.mutation<UploadTicket, CreateUploadBody>({
      query: (body) => ({ url: '/reports/uploads', method: 'POST', body }),
      rawResponseSchema: uploadTicketSchema,
    }),
    /** Step two, once every page is up: the report itself. */
    createReport: build.mutation<
      ReportView,
      { patientId: string; body: CreateReportBody }
    >({
      extraOptions: { success: reportsCopy.toast.uploaded },
      query: ({ patientId, body }) => ({
        url: `/patients/${patientId}/reports`,
        method: 'POST',
        body,
      }),
      rawResponseSchema: reportViewSchema,
      // The doctor is told about a new report.
      invalidatesTags: (_result, _error, { patientId }) => [
        patientReportsTag(patientId),
        ApiTag.Notification,
        ApiTag.Patient,
      ],
    }),
    /**
     * The doctor has looked at it: "New" goes, and so does the patient from
     * the new-reports list. Idempotent on the server.
     */
    reviewReport: build.mutation<ReportView, string>({
      extraOptions: { quiet: true },
      query: (id) => ({ url: `/reports/${id}/review`, method: 'POST' }),
      rawResponseSchema: reportViewSchema,
      invalidatesTags: (result) =>
        result ? [patientReportsTag(result.patientId), ApiTag.Patient] : [],
    }),
  }),
});

export const {
  useListPatientReportsQuery,
  useGetReportQuery,
  useCreateUploadMutation,
  useCreateReportMutation,
  useReviewReportMutation,
} = reportsApi;
