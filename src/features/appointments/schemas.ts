import { z } from 'zod';

import {
  appointmentKindSchema,
  dateStringSchema,
  timeStringSchema,
} from '@/contract';
import { toDateString } from '@/utils/date';

import { appointmentsCopy } from './copy';

const errors = appointmentsCopy.errors;

export const bookAppointmentSchema = z.object({
  patientId: z.string().min(1, errors.patientRequired),
  /** `YYYY-MM-DD` from the date field: today or later. */
  date: z
    .string()
    .refine((value) => dateStringSchema.safeParse(value).success, {
      message: errors.dateRequired,
    })
    .refine((value) => value >= toDateString(new Date()), {
      message: errors.datePast,
    }),
  /** `HH:mm` from the time field. */
  time: z
    .string()
    .refine((value) => timeStringSchema.safeParse(value).success, {
      message: errors.timeRequired,
    }),
  kind: appointmentKindSchema,
  note: z.string().trim().max(500),
});

export type BookAppointmentInput = z.input<typeof bookAppointmentSchema>;
