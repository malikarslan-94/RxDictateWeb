import { z } from 'zod';

import { commonCopy } from '@/constants/copy';
import { objectIdSchema } from '@/contract';
import { toE164 } from '@/utils/phone';

import { teamCopy } from './copy';

const errors = teamCopy.errors;

const nameField = z.string().trim().min(1, errors.nameRequired).max(120);

/** Required phone → E.164. */
const phoneField = z.string().transform((value, ctx) => {
  const e164 = toE164(value);
  if (!e164) {
    ctx.addIssue({ code: 'custom', message: commonCopy.errors.invalidPhone });
    return z.NEVER;
  }
  return e164;
});

const locationsField = z.array(objectIdSchema).min(1, errors.locationRequired);

/** Setup's "Do you have an assistant?": the person, at the first location. */
export const assistantSchema = z.object({
  name: nameField,
  phone: phoneField,
});

/**
 * Settings' add and edit. Editing starts from the stored number, which is
 * fixed once added: it is who signs in.
 */
export const assistantFormSchema = assistantSchema.extend({
  locationIds: locationsField,
});

export type AssistantFormInput = z.input<typeof assistantFormSchema>;
export type AssistantFormValues = z.output<typeof assistantFormSchema>;
