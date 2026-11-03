import { z } from 'zod';

import { medicineFormSchema } from '@/contract';

import { medicinesCopy } from './copy';

/** A medicine the catalog doesn't have, or a correction to one. */
export const ownMedicineSchema = z.object({
  brand: z.string().trim().min(1, medicinesCopy.form.brandRequired).max(200),
  generic: z.string().trim().max(500),
  strength: z.string().trim().max(60),
  form: medicineFormSchema,
  pack: z.string().trim().max(60),
  company: z.string().trim().max(200),
});

export type OwnMedicineInput = z.input<typeof ownMedicineSchema>;
