import { z } from 'zod';

import {
  drugListItemViewSchema,
  drugSuggestionSchema,
  drugViewSchema,
} from '@/contract';
import type {
  createDrugBodySchema,
  DrugListItemView,
  DrugSuggestion,
  DrugView,
  UpdateDrugBody,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import type { DrugListOwner } from './constants';
import { medicinesCopy } from './copy';

export type DrugSearch = {
  q: string;
  limit: number;
  /** For this search only, look past the caller's `medicines.source`. */
  everywhere?: boolean;
};

export type DrugListSearch = {
  owner: DrugListOwner;
  q: string;
  page: number;
  limit: number;
};

export type DrugListPage = {
  items: DrugListItemView[];
  total: number;
};

const pageMetaSchema = z.object({ total: z.number().int() });
const removedSchema = z.object({ removed: z.boolean() });
const toast = medicinesCopy.toast;

/**
 * What a doctor is suggested and the lists behind it. The server applies the
 * mode, so a change to a list or to the setting refetches the suggestions.
 */
export const medicinesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchDrugs: build.query<DrugSuggestion[], DrugSearch>({
      query: ({ q, limit, everywhere }) => ({
        url: '/drugs',
        params: everywhere ? { q, limit, everywhere } : { q, limit },
      }),
      rawResponseSchema: z.array(drugSuggestionSchema),
      providesTags: [ApiTag.Medicine, ApiTag.Settings],
    }),
    listDrugList: build.query<DrugListPage, DrugListSearch>({
      query: ({ owner, q, ...params }) => ({
        url: `/drug-lists/${owner}`,
        params: q ? { q, ...params } : params,
      }),
      rawResponseSchema: z.array(drugListItemViewSchema),
      transformResponse: (items: DrugListItemView[], meta) => {
        const page = pageMetaSchema.safeParse(meta?.envelope);
        return { items, total: page.success ? page.data.total : items.length };
      },
      providesTags: [ApiTag.Medicine],
    }),
    /** Sending it twice changes nothing. */
    putDrugListItem: build.mutation<
      DrugListItemView,
      { owner: DrugListOwner; drugId: string }
    >({
      extraOptions: { success: toast.added },
      query: ({ owner, drugId }) => ({
        url: `/drug-lists/${owner}/items/${drugId}`,
        method: 'PUT',
        body: {},
      }),
      rawResponseSchema: drugListItemViewSchema,
      invalidatesTags: [ApiTag.Medicine],
    }),
    removeDrugListItem: build.mutation<
      z.infer<typeof removedSchema>,
      { owner: DrugListOwner; drugId: string }
    >({
      extraOptions: { success: toast.removed },
      query: ({ owner, drugId }) => ({
        url: `/drug-lists/${owner}/items/${drugId}`,
        method: 'DELETE',
      }),
      rawResponseSchema: removedSchema,
      invalidatesTags: [ApiTag.Medicine],
    }),
    /** A medicine nothing else has, put on that list. A duplicate is reused. */
    createDrug: build.mutation<
      DrugListItemView,
      z.input<typeof createDrugBodySchema>
    >({
      extraOptions: { success: toast.created },
      query: (body) => ({ url: '/drugs', method: 'POST', body }),
      rawResponseSchema: drugListItemViewSchema,
      invalidatesTags: [ApiTag.Medicine],
    }),
    updateDrug: build.mutation<DrugView, { id: string; body: UpdateDrugBody }>({
      extraOptions: { success: toast.saved },
      query: ({ id, body }) => ({
        url: `/drugs/${id}`,
        method: 'PATCH',
        body,
      }),
      rawResponseSchema: drugViewSchema,
      invalidatesTags: [ApiTag.Medicine],
    }),
  }),
});

export const {
  useSearchDrugsQuery,
  useListDrugListQuery,
  usePutDrugListItemMutation,
  useRemoveDrugListItemMutation,
  useCreateDrugMutation,
  useUpdateDrugMutation,
} = medicinesApi;
