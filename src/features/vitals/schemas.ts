import { z } from 'zod';

import { bloodPressureSchema, vitalsSchema } from '@/contract';

import { vitalsCopy } from './copy';

const errors = vitalsCopy.errors;
const limits = vitalsSchema.shape;

/** "" is "not measured"; anything else must be a number the server accepts. */
const reading = (schema: z.ZodNumber) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === '') return undefined;
      const parsed = schema.safeParse(Number(value));
      if (!parsed.success) {
        ctx.addIssue({
          code: 'custom',
          message: errors.outOfRange(schema.minValue, schema.maxValue),
        });
        return z.NEVER;
      }
      return parsed.data;
    });

/** One side of a blood pressure, checked with the contract's own pattern. */
const isBpSide = (side: string) =>
  bloodPressureSchema.safeParse(`${side}/${side}`).success;

/**
 * The vitals sheet. Blood pressure is typed as two numbers, because a number
 * pad has no "/", and sent as the contract's "120/80".
 */
export const vitalsFormSchema = z
  .object({
    systolic: z.string().trim(),
    diastolic: z.string().trim(),
    pulse: reading(limits.pulse.unwrap()),
    tempF: reading(limits.tempF.unwrap()),
    weightKg: reading(limits.weightKg.unwrap()),
    spo2: reading(limits.spo2.unwrap()),
  })
  .transform(({ systolic, diastolic, ...readings }, ctx) => {
    if (systolic === '' && diastolic === '') {
      return { ...readings, bp: undefined };
    }
    const sides = { systolic, diastolic };
    for (const [field, side] of Object.entries(sides)) {
      if (side === '' || !isBpSide(side)) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: side === '' ? errors.bpBoth : errors.bpInvalid,
        });
        return z.NEVER;
      }
    }
    return { ...readings, bp: `${systolic}/${diastolic}` };
  });

export type VitalsFormInput = z.input<typeof vitalsFormSchema>;
export type VitalsFormValues = z.output<typeof vitalsFormSchema>;
