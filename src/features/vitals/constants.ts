import { VITAL_RANGES } from '@/contract';

import type { VitalsFormInput } from './schemas';

/** Weight is the one reading without a normal range, so its unit lives here. */
export const WEIGHT_UNIT = 'kg';

export type VitalsField = keyof VitalsFormInput;

type FieldSpec = {
  unit: string;
  /** The on-screen keyboard a touch screen offers. */
  inputMode: 'numeric' | 'decimal';
  maxLength: number;
};

/** How each reading is typed: its unit, keyboard, and longest value. */
export const VITALS_FIELDS: Record<VitalsField, FieldSpec> = {
  systolic: {
    unit: VITAL_RANGES.systolic.unit,
    inputMode: 'numeric',
    maxLength: 3,
  },
  diastolic: {
    unit: VITAL_RANGES.diastolic.unit,
    inputMode: 'numeric',
    maxLength: 3,
  },
  pulse: {
    unit: VITAL_RANGES.pulse.unit,
    inputMode: 'numeric',
    maxLength: 3,
  },
  tempF: {
    unit: VITAL_RANGES.tempF.unit,
    inputMode: 'decimal',
    maxLength: 5,
  },
  weightKg: { unit: WEIGHT_UNIT, inputMode: 'decimal', maxLength: 5 },
  spo2: {
    unit: VITAL_RANGES.spo2.unit,
    inputMode: 'numeric',
    maxLength: 3,
  },
};

/** The dialog's fields, two to a row. */
export const VITALS_ROWS = [
  ['systolic', 'diastolic'],
  ['pulse', 'tempF'],
  ['weightKg', 'spo2'],
] as const satisfies readonly (readonly VitalsField[])[];
