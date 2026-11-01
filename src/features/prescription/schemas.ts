import { z } from 'zod';

import {
  dosePatternSchema,
  medicineFormSchema,
  medicineTimingSchema,
  objectIdSchema,
} from '@/contract';
import { templateNameField } from '@/features/templates';

import { rxCopy } from './copy';

const errors = rxCopy.errors;

/** Optional whole number of days: "" means none. */
const daysSchema = z
  .string()
  .trim()
  .regex(/^\d{0,4}$/, errors.daysInvalid)
  .transform((value) => (value === '' ? null : Number(value)));

export const medicineFormValuesSchema = z.object({
  name: z.string().trim().min(1, errors.nameRequired).max(200),
  strength: z.string().trim().max(60),
  form: medicineFormSchema,
  pattern: dosePatternSchema,
  timing: medicineTimingSchema,
  durationDays: daysSchema,
  drugId: objectIdSchema.nullable(),
});
export type MedicineFormInput = z.input<typeof medicineFormValuesSchema>;
export type MedicineFormValues = z.output<typeof medicineFormValuesSchema>;

export const textItemFormSchema = z.object({
  text: z.string().trim().min(1, errors.textRequired).max(2000),
});

export const followUpFormSchema = z.object({
  inDays: daysSchema,
  note: z.string().trim().max(500),
});
export type FollowUpFormInput = z.input<typeof followUpFormSchema>;

export const reviseFormSchema = z.object({
  reason: z.string().trim().max(500),
});

/** A template's name; its sections are edited beside it. */
export const templateEditorSchema = z.object({ name: templateNameField });
