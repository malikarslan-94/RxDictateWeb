import { useState } from 'react';
import type { KeyboardEvent } from 'react';

import { medicineInstruction, medicineTimingSchema } from '@/contract';
import type { PrescriptionSections } from '@/contract';

import { DoseLang, SUGGESTED_DURATION_DAYS } from '../constants';
import { rxCopy } from '../copy';
import type { RxEditor } from './useRxEditor';

type Medicine = PrescriptionSections['medicines'][number];
const SLOTS = ['m', 'a', 'n'] as const;

/** Most doses are one to two of a thing; a third press goes back to none. */
const MAX_PER_SLOT = 2;

const daysText = (durationDays: number) =>
  durationDays > 0 ? String(durationDays) : '';

/** One medicine row: the dose chips, the timing, the days, and its warnings. */
export function useMedicineRow(medicine: Medicine, editor: RxEditor) {
  const [days, setDays] = useState(daysText(medicine.durationDays));
  // Dictation can change the days too: the field follows the saved line.
  const [savedDays, setSavedDays] = useState(medicine.durationDays);
  if (savedDays !== medicine.durationDays) {
    setSavedDays(medicine.durationDays);
    setDays(daysText(medicine.durationDays));
  }
  // An "as needed" dose has no morning, afternoon or night to count.
  const fixed = 'sos' in medicine.pattern ? null : medicine.pattern;
  const isMissingDuration =
    medicine.durationDays === 0 || medicine.flags.includes('duration_unclear');
  const otherFlags = medicine.flags.filter(
    (flag) => flag !== 'duration_unclear',
  );

  const saveDays = () => {
    const next = days.trim() === '' ? 0 : Number(days);
    if (Number.isFinite(next) && next !== medicine.durationDays) {
      editor.updateMedicine(medicine, { durationDays: next });
    }
  };

  return {
    instructionUr: medicineInstruction(medicine, DoseLang.ur),
    isSos: fixed === null,
    slots: fixed
      ? SLOTS.map((slot) => ({
          slot,
          count: fixed[slot],
          label: rxCopy.editor.doseLabel(
            rxCopy.editor.doseSlot[slot],
            fixed[slot],
          ),
          press: () =>
            editor.updateMedicine(medicine, {
              pattern: {
                ...fixed,
                [slot]: (fixed[slot] + 1) % (MAX_PER_SLOT + 1),
              },
            }),
        }))
      : [],
    timing: medicine.timing,
    timingOptions: medicineTimingSchema.options.map((value) => ({
      value,
      label: rxCopy.timing[value],
    })),
    setTiming: (value: string) => {
      const parsed = medicineTimingSchema.safeParse(value);
      if (parsed.success)
        editor.updateMedicine(medicine, { timing: parsed.data });
    },
    days,
    setDays,
    saveDays,
    onDaysKey: (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') event.currentTarget.blur();
    },
    // A dictated line with no duration offers the usual month in one click.
    durationFix:
      isMissingDuration && medicine.sourceSpanIds.length > 0
        ? {
            text: rxCopy.editor.noDuration,
            action: rxCopy.editor.setDays(SUGGESTED_DURATION_DAYS),
            apply: () => {
              setDays(String(SUGGESTED_DURATION_DAYS));
              editor.updateMedicine(medicine, {
                durationDays: SUGGESTED_DURATION_DAYS,
              });
            },
          }
        : null,
    flagNotes: otherFlags.map((flag) => rxCopy.flag[flag]),
    confirm:
      otherFlags.length > 0
        ? () => editor.confirmMedicine(medicine)
        : undefined,
    remove: () => editor.removeMedicine(medicine),
  };
}
