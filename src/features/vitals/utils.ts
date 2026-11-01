import { VITAL_RANGES, parseBp, vitalFlags } from '@/contract';
import type {
  RecordVitalsBody,
  VitalField,
  VitalFlag,
  VitalRange,
  VitalsView,
} from '@/contract';

import { VITALS_FIELDS, WEIGHT_UNIT } from './constants';
import type { VitalsField } from './constants';
import { vitalsCopy } from './copy';
import type { VitalsFormInput, VitalsFormValues } from './schemas';
import type { VitalReading } from './types';

const asText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

/** The dialog's starting values: the visit's readings, or blank. */
export function toVitalsInput(vitals: VitalsView | null): VitalsFormInput {
  const bp = parseBp(vitals?.bp);
  return {
    systolic: asText(bp?.systolic),
    diastolic: asText(bp?.diastolic),
    pulse: asText(vitals?.pulse),
    tempF: asText(vitals?.tempF),
    weightKg: asText(vitals?.weightKg),
    spo2: asText(vitals?.spo2),
  };
}

/**
 * What to send. The server replaces the whole record, so what the dialog
 * doesn't show (blood sugar, the assistant's complaints) is carried over.
 */
export function toVitalsBody(
  values: VitalsFormValues,
  existing: VitalsView | null,
): RecordVitalsBody {
  return {
    ...values,
    bloodSugarRandom: existing?.bloodSugarRandom ?? undefined,
    complaints: existing?.complaints ?? '',
  };
}

/** A visit's readings in print order, each flagged when out of range. */
export function toVitalReadings(vitals: VitalsView): VitalReading[] {
  const flagged = new Set<VitalField>(
    vitalFlags(vitals).map((flag) => flag.field),
  );
  const labels = vitalsCopy.readings;
  const readings: (VitalReading | null)[] = [
    vitals.bp
      ? {
          key: 'bp',
          label: labels.bp,
          value: vitals.bp,
          isFlagged: flagged.has('systolic') || flagged.has('diastolic'),
        }
      : null,
    vitals.pulse !== null
      ? {
          key: 'pulse',
          label: labels.pulse,
          value: String(vitals.pulse),
          isFlagged: flagged.has('pulse'),
        }
      : null,
    vitals.tempF !== null
      ? {
          key: 'temp',
          label: labels.temp,
          value: `${vitals.tempF}${VITAL_RANGES.tempF.unit}`,
          isFlagged: flagged.has('tempF'),
        }
      : null,
    vitals.weightKg !== null
      ? {
          key: 'weight',
          label: labels.weight,
          value: `${vitals.weightKg} ${WEIGHT_UNIT}`,
          isFlagged: false,
        }
      : null,
    vitals.spo2 !== null
      ? {
          key: 'spo2',
          label: labels.spo2,
          value: `${vitals.spo2}${VITAL_RANGES.spo2.unit}`,
          isFlagged: flagged.has('spo2'),
        }
      : null,
  ];
  return readings.filter((reading): reading is VitalReading => !!reading);
}

/** "90–140 mmHg", "95 % or more". */
function normalRange({ min, max, unit }: VitalRange): string {
  const normal = vitalsCopy.normal;
  if (min !== undefined && max !== undefined) {
    return normal.between(min, max, unit);
  }
  if (min !== undefined) return normal.atLeast(min, unit);
  return max !== undefined ? normal.atMost(max, unit) : '';
}

const isFormField = (field: VitalField): field is VitalField & VitalsField =>
  field in VITALS_FIELDS;

/** A number as typed, or nothing while it's blank or half-typed. */
function typedNumber(text: string | undefined): number | undefined {
  const trimmed = text?.trim() ?? '';
  if (trimmed === '') return undefined;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * What to say under each field whose reading is outside the normal range,
 * as it's typed. Blood pressure is judged once both numbers are in.
 */
export function flagNotes(
  input: Partial<VitalsFormInput>,
): Partial<Record<VitalsField, string>> {
  const systolic = input.systolic?.trim() ?? '';
  const diastolic = input.diastolic?.trim() ?? '';
  const flags: VitalFlag[] = vitalFlags({
    bp: systolic && diastolic ? `${systolic}/${diastolic}` : undefined,
    pulse: typedNumber(input.pulse),
    tempF: typedNumber(input.tempF),
    spo2: typedNumber(input.spo2),
  });
  const notes: Partial<Record<VitalsField, string>> = {};
  flags.forEach((flag) => {
    if (isFormField(flag.field)) {
      notes[flag.field] = vitalsCopy.flag[flag.level](normalRange(flag.range));
    }
  });
  return notes;
}
