import { z } from 'zod';

import { prescriptionViewSchema, templateViewSchema } from '@/contract';
import type {
  CreateFromTemplateBody,
  CreateTemplateBody,
  ListTemplatesQuery,
  PrescriptionView,
  TemplateView,
  UpdateTemplateBody,
} from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

import { templatesCopy } from './copy';
import type { TemplatePage } from './types';

const pageMetaSchema = z.object({ total: z.number().int() });
const templateTag = (id: string) => ({ type: ApiTag.Template, id });
const listTag = { type: ApiTag.Template, id: 'LIST' };

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** The doctor's own templates, most used first. */
    listTemplates: build.query<TemplatePage, Partial<ListTemplatesQuery>>({
      query: (params) => ({ url: '/templates', params }),
      rawResponseSchema: z.array(templateViewSchema),
      transformResponse: (templates: TemplateView[], meta) => {
        const page = pageMetaSchema.safeParse(meta?.envelope);
        return {
          templates,
          total: page.success ? page.data.total : templates.length,
        };
      },
      providesTags: [listTag],
    }),
    getTemplate: build.query<TemplateView, string>({
      query: (id) => `/templates/${id}`,
      rawResponseSchema: templateViewSchema,
      providesTags: (_result, _error, id) => [templateTag(id)],
    }),
    /** From sections, or "Save as template" with `fromPrescriptionId`. */
    createTemplate: build.mutation<TemplateView, CreateTemplateBody>({
      extraOptions: { success: templatesCopy.toast.saved },
      query: (body) => ({ url: '/templates', method: 'POST', body }),
      rawResponseSchema: templateViewSchema,
      invalidatesTags: [listTag],
    }),
    updateTemplate: build.mutation<
      TemplateView,
      { id: string; body: UpdateTemplateBody }
    >({
      extraOptions: { success: templatesCopy.toast.updated },
      query: ({ id, body }) => ({
        url: `/templates/${id}`,
        method: 'PATCH',
        body,
      }),
      rawResponseSchema: templateViewSchema,
      invalidatesTags: (_result, _error, { id }) => [templateTag(id), listTag],
    }),
    deleteTemplate: build.mutation<TemplateView, string>({
      extraOptions: { success: templatesCopy.toast.deleted },
      query: (id) => ({ url: `/templates/${id}`, method: 'DELETE' }),
      rawResponseSchema: templateViewSchema,
      invalidatesTags: (_result, _error, id) => [templateTag(id), listTag],
    }),
    /**
     * A draft from a template, or its lines added to the visit's open draft.
     * The patient goes on today's list if they weren't on it.
     */
    createFromTemplate: build.mutation<
      PrescriptionView,
      { templateId: string; body: CreateFromTemplateBody }
    >({
      extraOptions: { success: templatesCopy.toast.applied },
      query: ({ templateId, body }) => ({
        url: `/prescriptions/from-template/${templateId}`,
        method: 'POST',
        body,
      }),
      rawResponseSchema: prescriptionViewSchema,
      invalidatesTags: (result) => [
        listTag,
        { type: ApiTag.Prescription, id: 'LIST' },
        ...(result ? [{ type: ApiTag.Prescription, id: result.id }] : []),
        ApiTag.Visit,
      ],
    }),
  }),
});

export const {
  useListTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useCreateFromTemplateMutation,
} = templatesApi;
