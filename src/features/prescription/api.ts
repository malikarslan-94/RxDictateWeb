import { z } from 'zod';

import {
  drugViewSchema,
  historyItemViewSchema,
  prescriptionListItemSchema,
  prescriptionViewSchema,
  signedUrlViewSchema,
} from '@/contract';
import type {
  CreatePrescriptionBody,
  DrugView,
  HistoryItemView,
  Op,
  PrescriptionListItem,
  PrescriptionStatus,
  PrescriptionView,
  RevisePrescriptionBody,
  SignedUrlView,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { DRUG_SEARCH_LIMIT } from './constants';
import { rxCopy } from './copy';
import type {
  PatientHistoryPage,
  PatientHistoryQuery,
  PrescriptionLogPage,
  PrescriptionLogQuery,
} from './types';

const pageMetaSchema = z.object({
  total: z.number().int(),
  totalPages: z.number().int(),
});

const prescriptionTag = (id: string) => ({
  type: ApiTag.Prescription,
  id,
});

export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPrescriptions: build.query<
      PrescriptionView[],
      { patientId?: string; status: PrescriptionStatus; limit?: number }
    >({
      query: (params) => ({ url: '/prescriptions', params }),
      rawResponseSchema: z.array(prescriptionViewSchema),
      providesTags: [{ type: ApiTag.Prescription, id: 'LIST' }],
    }),
    /** Every prescription at this location, newest first, with its patient. */
    listPrescriptionLog: build.query<PrescriptionLogPage, PrescriptionLogQuery>(
      {
        query: (params) => ({ url: '/prescriptions', params }),
        rawResponseSchema: z.array(prescriptionListItemSchema),
        transformResponse: (items: PrescriptionListItem[], meta) => {
          const page = pageMetaSchema.safeParse(meta?.envelope);
          return {
            items,
            total: page.success ? page.data.total : items.length,
            totalPages: page.success ? page.data.totalPages : 1,
          };
        },
        providesTags: [{ type: ApiTag.Prescription, id: 'LIST' }],
      },
    ),
    /** A patient's timeline, newest first. Asked fresh each time it opens. */
    getPatientHistory: build.query<PatientHistoryPage, PatientHistoryQuery>({
      query: ({ patientId, ...params }) => ({
        url: `/patients/${patientId}/history`,
        params,
      }),
      rawResponseSchema: z.array(historyItemViewSchema),
      transformResponse: (items: HistoryItemView[], meta) => {
        const page = pageMetaSchema.safeParse(meta?.envelope);
        return { items, total: page.success ? page.data.total : items.length };
      },
      keepUnusedDataFor: 0,
    }),
    getPrescription: build.query<PrescriptionView, string>({
      query: (id) => `/prescriptions/${id}`,
      rawResponseSchema: prescriptionViewSchema,
      providesTags: (_result, _error, id) => [prescriptionTag(id)],
    }),
    createPrescription: build.mutation<
      PrescriptionView,
      CreatePrescriptionBody
    >({
      query: (body) => ({ url: '/prescriptions', method: 'POST', body }),
      rawResponseSchema: prescriptionViewSchema,
      // The visit is made or moved to "With doctor" on the server.
      invalidatesTags: [
        { type: ApiTag.Prescription, id: 'LIST' },
        ApiTag.Visit,
      ],
    }),
    /** Apply ops; the answer is the whole updated prescription. */
    patchPrescription: build.mutation<
      PrescriptionView,
      { id: string; ops: Op[] }
    >({
      query: ({ id, ops }) => ({
        url: `/prescriptions/${id}`,
        method: 'PATCH',
        body: { ops },
      }),
      rawResponseSchema: prescriptionViewSchema,
      // The answer is the new truth: put it straight into the cache.
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          prescriptionApi.util.upsertQueryData('getPrescription', id, data),
        );
      },
    }),
    approvePrescription: build.mutation<PrescriptionView, string>({
      extraOptions: { success: rxCopy.toast.approved },
      query: (id) => ({ url: `/prescriptions/${id}/approve`, method: 'POST' }),
      rawResponseSchema: prescriptionViewSchema,
      // Approving marks the visit seen, and tells the assistant.
      invalidatesTags: (_result, _error, id) => [
        prescriptionTag(id),
        { type: ApiTag.Prescription, id: 'LIST' },
        ApiTag.Notification,
        ApiTag.Visit,
      ],
    }),
    /** Makes a new draft from an approved prescription. */
    revisePrescription: build.mutation<
      PrescriptionView,
      { id: string; body: RevisePrescriptionBody }
    >({
      extraOptions: { success: rxCopy.toast.revising },
      query: ({ id, body }) => ({
        url: `/prescriptions/${id}/revise`,
        method: 'POST',
        body,
      }),
      rawResponseSchema: prescriptionViewSchema,
      invalidatesTags: (_result, _error, { id }) => [
        prescriptionTag(id),
        { type: ApiTag.Prescription, id: 'LIST' },
      ],
    }),
    /** Abandon a draft. A revision's approved version stays as it was. */
    cancelPrescription: build.mutation<PrescriptionView, string>({
      extraOptions: { success: rxCopy.toast.discarded },
      query: (id) => ({ url: `/prescriptions/${id}/cancel`, method: 'POST' }),
      rawResponseSchema: prescriptionViewSchema,
      invalidatesTags: (_result, _error, id) => [
        prescriptionTag(id),
        { type: ApiTag.Prescription, id: 'LIST' },
      ],
    }),
    /** A short-lived link to the printable page of an approved prescription. */
    getPrescriptionPdf: build.mutation<SignedUrlView, string>({
      query: (id) => `/prescriptions/${id}/pdf`,
      rawResponseSchema: signedUrlViewSchema,
    }),
    searchDrugs: build.query<DrugView[], string>({
      query: (q) => ({
        url: '/drugs',
        params: { q, limit: DRUG_SEARCH_LIMIT },
      }),
      rawResponseSchema: z.array(drugViewSchema),
    }),
  }),
});

export const {
  useListPrescriptionsQuery,
  useListPrescriptionLogQuery,
  useGetPatientHistoryQuery,
  useGetPrescriptionQuery,
  useLazyGetPrescriptionQuery,
  useCreatePrescriptionMutation,
  usePatchPrescriptionMutation,
  useApprovePrescriptionMutation,
  useCancelPrescriptionMutation,
  useRevisePrescriptionMutation,
  useGetPrescriptionPdfMutation,
  useSearchDrugsQuery,
} = prescriptionApi;
