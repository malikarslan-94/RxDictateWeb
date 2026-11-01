import { z } from 'zod';

import { ageField, patientNameField, sexField } from '@/features/patients';

/** A patient not seen before, put straight on today's list. */
export const newPatientSchema = z.object({
  name: patientNameField,
  age: ageField,
  sex: sexField,
  reason: z.string().trim().max(500),
});

export type NewPatientInput = z.input<typeof newPatientSchema>;
