import { z } from 'zod';

import { commonCopy } from '@/constants/copy';
import { allergiesSchema, conditionsSchema, sexSchema } from '@/contract';
import { toE164 } from '@/utils/phone';
import { splitList } from '@/utils/text';

import { MAX_PATIENT_AGE } from './constants';
import { patientsCopy } from './copy';

const errors = patientsCopy.errors;

/** Fields shared by every "new patient" form (doctor's and assistant's). */
export const patientNameField = z
  .string()
  .trim()
  .min(1, errors.nameRequired)
  .max(160);

/** Optional; when given it must be a real number, sent as E.164. */
export const optionalPhoneField = z.string().transform((value, ctx) => {
  if (value.trim() === '') return undefined;
  const e164 = toE164(value);
  if (!e164) {
    ctx.addIssue({ code: 'custom', message: commonCopy.errors.invalidPhone });
    return z.NEVER;
  }
  return e164;
});

export const ageField = z
  .string()
  .trim()
  .min(1, errors.ageRequired)
  .regex(/^\d{1,3}$/, errors.ageInvalid)
  .transform(Number)
  .refine((age) => age <= MAX_PATIENT_AGE, errors.ageInvalid);

/** `null` until chosen: nothing is picked for the patient by default. */
export const sexField = sexSchema.nullable().transform((sex, ctx) => {
  if (!sex) {
    ctx.addIssue({ code: 'custom', message: errors.sexRequired });
    return z.NEVER;
  }
  return sex;
});

/** "Penicillin, sulfa" as typed, into the contract's list. */
const typedList = (schema: typeof allergiesSchema) =>
  z.string().transform(splitList).pipe(schema);

export const addPatientSchema = z.object({
  name: patientNameField,
  phone: optionalPhoneField,
  age: ageField,
  sex: sexField,
  allergies: typedList(allergiesSchema),
  noKnownAllergies: z.boolean(),
  conditions: typedList(conditionsSchema),
});

export type AddPatientInput = z.input<typeof addPatientSchema>;
