import { z } from 'zod';

import { TEMPLATE_NAME_MAX } from './constants';
import { templatesCopy } from './copy';

export const templateNameField = z
  .string()
  .trim()
  .min(1, templatesCopy.save.nameRequired)
  .max(TEMPLATE_NAME_MAX, templatesCopy.save.nameTooLong(TEMPLATE_NAME_MAX));

/** "Save as template": what to call it. */
export const saveTemplateSchema = z.object({ name: templateNameField });

/** "Use" on the Templates page: who it's for. */
export const useTemplateSchema = z.object({
  patientId: z.string().min(1, templatesCopy.use.patientRequired),
});
