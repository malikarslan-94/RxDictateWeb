import { z } from 'zod';

import {
  patientCountsSchema,
  patientViewSchema,
  prescriptionStatusSchema,
  prescriptionViewSchema,
} from '@/contract';
import type {
  CreatePatientBody,
  PatientCounts,
  PatientSort,
  PatientView,
  PrescriptionView,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { PANEL_PRESCRIPTIONS } from './constants';
import { patientsCopy } from './copy';
import type { PatientRxSummary } from './types';

const pageMetaSchema = z.object({
  total: z.number().int(),
  totalPages: z.number().int(),
  counts: patientCountsSchema.optional(),
});

export type PatientPage = {
  patients: PatientView[];
  /** Every patient matching the search, not just this page. */
  total: number;
  totalPages: number;
  /** The clinic's filter counts, whatever this search: e.g. new reports. */
  counts: PatientCounts | null;
};

export type PatientSearch = {
  /** A name, an MR number, or an E.164 prefix such as "+92300". */
  q: string;
  limit: number;
  page?: number;
  sort?: PatientSort;
  /** Only patients with a report the doctor hasn't opened yet. */
  newReports?: boolean;
};

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchPatients: build.query<PatientPage, PatientSearch>({
      query: ({ q, ...params }) => ({
        url: '/patients',
        params: q ? { q, ...params } : params,
      }),
      rawResponseSchema: z.array(patientViewSchema),
      transformResponse: (patients: PatientView[], meta) => {
        const page = pageMetaSchema.safeParse(meta?.envelope);
        return {
          patients,
          total: page.success ? page.data.total : patients.length,
          totalPages: page.success ? page.data.totalPages : 1,
          counts: page.success ? (page.data.counts ?? null) : null,
        };
      },
      providesTags: [ApiTag.Patient],
    }),
    getPatient: build.query<PatientView, string>({
      query: (id) => `/patients/${id}`,
      rawResponseSchema: patientViewSchema,
      providesTags: (_result, _error, id) => [{ type: ApiTag.Patient, id }],
    }),
    /**
     * A patient's prescriptions, newest first, for the side panel. Its own
     * endpoint so this feature needn't import the prescription one, which
     * imports this.
     */
    listPatientPrescriptions: build.query<PrescriptionView[], string>({
      query: (patientId) => ({
        url: '/prescriptions',
        params: { patientId, limit: PANEL_PRESCRIPTIONS },
      }),
      rawResponseSchema: z.array(prescriptionViewSchema),
      providesTags: [{ type: ApiTag.Prescription, id: 'LIST' }],
    }),
    /**
     * A patient's newest approved prescription at this location and how
     * many there are: the diagnosis and the visit count on the list.
     * TODO(backend): one request per row until the patient itself carries
     * them (docs/backend-requests/web-client.md §10).
     */
    getPatientRxSummary: build.query<PatientRxSummary, string>({
      query: (patientId) => ({
        url: '/prescriptions',
        params: {
          patientId,
          status: prescriptionStatusSchema.enum.approved,
          limit: 1,
        },
      }),
      rawResponseSchema: z.array(prescriptionViewSchema),
      transformResponse: (items: PrescriptionView[], meta) => {
        const page = pageMetaSchema.safeParse(meta?.envelope);
        return {
          latest: items[0] ?? null,
          count: page.success ? page.data.total : items.length,
        };
      },
      providesTags: [{ type: ApiTag.Prescription, id: 'LIST' }],
    }),
    createPatient: build.mutation<PatientView, CreatePatientBody>({
      extraOptions: { success: patientsCopy.toast.added },
      query: (body) => ({ url: '/patients', method: 'POST', body }),
      rawResponseSchema: patientViewSchema,
      invalidatesTags: [ApiTag.Patient],
    }),
  }),
});

export const {
  useSearchPatientsQuery,
  useGetPatientQuery,
  useListPatientPrescriptionsQuery,
  useGetPatientRxSummaryQuery,
  useCreatePatientMutation,
} = patientsApi;
