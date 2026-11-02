import { z } from 'zod';

import { commonCopy } from '@/constants/copy';
import { DAYS } from '@/constants/days';
import { PROVINCES, specialtySchema, timeStringSchema } from '@/contract';
import { toE164 } from '@/utils/phone';

import { clinicCopy } from './copy';

const errors = clinicCopy.errors;

/** Optional phone: empty stays empty, anything else must be valid. */
const optionalPhoneSchema = z.string().transform((value, ctx) => {
  if (value.trim() === '') return '';
  const e164 = toE164(value);
  if (!e164) {
    ctx.addIssue({ code: 'custom', message: commonCopy.errors.invalidPhone });
    return z.NEVER;
  }
  return e164;
});

/** An `HH:mm` from the time picker; empty until one is chosen. */
const timeField = z
  .string()
  .refine((value) => timeStringSchema.safeParse(value).success, {
    message: errors.timeRequired,
  });

/** A person's own name on their account: the doctor's or the assistant's. */
export const fullNameField = z
  .string()
  .trim()
  .min(1, errors.fullNameRequired)
  .max(120);

/**
 * The doctor's name on their account, and the credentials on the clinic.
 * `clinicName` is asked in Settings only; empty leaves the name as it is.
 */
export const profileSchema = z.object({
  fullName: fullNameField,
  qualifications: z.string().trim().max(200),
  speciality: z.string().trim().max(120),
  pmdcNo: z.string().trim().max(60),
  clinicName: z.string().trim().max(160),
  /** What the doctor practises, from the shared list; asked in Settings. */
  specialties: z.array(specialtySchema),
});

/** One location: where it is and when it's open. */
export const locationSchema = z
  .object({
    name: z.string().trim().min(1, errors.clinicNameRequired).max(160),
    address: z.string().trim().max(500),
    /** `''` until chosen. */
    province: z.enum(PROVINCES).or(z.literal('')),
    city: z.string().trim().max(80),
    phone: optionalPhoneSchema,
    days: z.array(z.enum(DAYS)).min(1, errors.daysRequired),
    opensAt: timeField,
    closesAt: timeField,
  })
  // HH:mm strings compare correctly as plain strings.
  .refine((location) => location.opensAt < location.closesAt, {
    message: errors.closesBeforeOpens,
    path: ['closesAt'],
  });

export type ProfileValues = z.output<typeof profileSchema>;
export type LocationFormInput = z.input<typeof locationSchema>;
export type LocationFormValues = z.output<typeof locationSchema>;
