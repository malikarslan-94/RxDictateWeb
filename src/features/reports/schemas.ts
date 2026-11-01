import { z } from 'zod';

import {
  dateStringSchema,
  reportContentTypeSchema,
  reportTypeSchema,
} from '@/contract';
import { toDateString } from '@/utils/date';

import { MAX_PAGES } from './constants';
import { reportsCopy } from './copy';

const errors = reportsCopy.errors;

const pageSchema = z.object({
  id: z.string(),
  file: z.instanceof(File),
  contentType: reportContentTypeSchema,
  previewUrl: z.string().nullable(),
});

/** A report as the assistant (or doctor) fills it in before sending. */
export const uploadReportSchema = z.object({
  patientId: z.string().min(1, errors.patientRequired),
  /** `null` until chosen: nothing is picked for them. */
  type: reportTypeSchema.nullable().transform((type, ctx) => {
    if (!type) {
      ctx.addIssue({ code: 'custom', message: errors.typeRequired });
      return z.NEVER;
    }
    return type;
  }),
  testName: z.string().trim().min(1, errors.testNameRequired).max(200),
  /** A test is done before it's brought in, never after. */
  testDate: z
    .string()
    .refine((value) => dateStringSchema.safeParse(value).success, {
      message: errors.testDateRequired,
    })
    .refine((value) => value <= toDateString(new Date()), {
      message: errors.testDateFuture,
    }),
  pages: z
    .array(pageSchema)
    .min(1, errors.pagesRequired)
    .max(MAX_PAGES, errors.tooManyPages(MAX_PAGES)),
});

export type UploadReportInput = z.input<typeof uploadReportSchema>;
