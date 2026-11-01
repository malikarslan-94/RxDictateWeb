import type {
  DosePattern,
  FollowUp,
  PrescriptionSections,
  PrescriptionView,
} from '@/contract';
import { addDays, formatLongDate, formatPrintDate } from '@/utils/date';

import { rxCopy } from './copy';
import type { PastRxItem } from './types';

type Medicine = PrescriptionSections['medicines'][number];

/** {m:1,a:0,n:1} -> "1 + 0 + 1"; {sos} -> "SOS". */
export function formatPattern(pattern: DosePattern): string {
  if ('sos' in pattern) return rxCopy.sos;
  return `${pattern.m} + ${pattern.a} + ${pattern.n}`;
}

export function samePattern(a: DosePattern, b: DosePattern): boolean {
  if ('sos' in a || 'sos' in b) return 'sos' in a && 'sos' in b;
  return a.m === b.m && a.a === b.a && a.n === b.n;
}

/** "Tablet · by mouth". */
export function medicineSubtitle(medicine: Medicine): string {
  return `${rxCopy.form[medicine.form]} · ${rxCopy.route[medicine.route]}`;
}

/** "Amlodipine 5 mg". */
export function medicineTitle(medicine: Pick<Medicine, 'name' | 'strength'>) {
  return [medicine.name, medicine.strength].filter(Boolean).join(' ');
}

export function hasFlags(sections: PrescriptionSections): boolean {
  return sections.medicines.some((medicine) => medicine.flags.length > 0);
}

export function isEmpty(sections: PrescriptionSections): boolean {
  const { followUp, ...lists } = sections;
  return Object.values(lists).every((items) => items.length === 0);
}

/**
 * The first allergy whose name appears in the medicine's name, or null. A
 * plain text match — the MVP has no drug database to know that, say,
 * Augmentin contains penicillin.
 */
export function allergyClash(
  medicine: Pick<Medicine, 'name'>,
  allergies: readonly string[],
): string | null {
  const name = medicine.name.toLowerCase();
  return (
    allergies.find((allergy) => {
      const needle = allergy.trim().toLowerCase();
      return (
        needle.length > 2 && (name.includes(needle) || needle.includes(name))
      );
    }) ?? null
  );
}

/** "In 2 weeks" over "Saturday, 10 October · with lab reports". */
export function followUpSummary(
  followUp: FollowUp,
  today: Date = new Date(),
): { title: string; subtitle: string } {
  if (followUp.inDays === null && followUp.date === null) {
    return { title: rxCopy.followUp.none, subtitle: followUp.note };
  }
  const due =
    followUp.date !== null
      ? new Date(followUp.date)
      : addDays(today, followUp.inDays ?? 0);
  const title =
    followUp.inDays !== null
      ? rxCopy.followUp.inDays(followUp.inDays)
      : formatLongDate(due);
  return {
    title,
    subtitle: [formatLongDate(due), followUp.note].filter(Boolean).join(' · '),
  };
}

/** An approved prescription as the Past Rx tab lists it. */
export function toPastRxItem(rx: PrescriptionView): PastRxItem {
  return {
    id: rx.id,
    title: rxCopy.pastRx.title(rx.number ?? ''),
    line: rxCopy.pastRx.line(
      formatPrintDate(rx.approvedAt ?? rx.createdAt),
      rx.sections.medicines.length,
    ),
    diagnosis: rx.sections.diagnosis.map((item) => item.text).join(', '),
  };
}

/** What the quick line understood: "metf 500 1-0-1 30d". */
export type QuickMedicine = {
  /** The words that name the drug, for the search. */
  name: string;
  strength: string;
  pattern: DosePattern | null;
  durationDays: number | null;
};

const DOSE_PATTERN = /^(\d{1,2})[-+](\d{1,2})[-+](\d{1,2})$/;
const DURATION = /^(\d{1,4})\s*(d|day|days)$/i;
const STRENGTH = /^\d+(\.\d+)?(mg|mcg|g|ml|iu|%)?$/i;
const SOS = /^sos$/i;

/**
 * Read a typed medicine line. Anything that isn't a dose, a duration or a
 * strength is the drug's name, in the order typed.
 */
export function parseQuickMedicine(text: string): QuickMedicine {
  const parsed: QuickMedicine = {
    name: '',
    strength: '',
    pattern: null,
    durationDays: null,
  };
  const names: string[] = [];
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .forEach((token) => {
      const dose = token.match(DOSE_PATTERN);
      const duration = token.match(DURATION);
      if (dose) {
        parsed.pattern = {
          m: Number(dose[1]),
          a: Number(dose[2]),
          n: Number(dose[3]),
        };
      } else if (SOS.test(token)) {
        parsed.pattern = { sos: true };
      } else if (duration) {
        parsed.durationDays = Number(duration[1]);
      } else if (STRENGTH.test(token) && names.length > 0 && !parsed.strength) {
        parsed.strength = token;
      } else {
        names.push(token);
      }
    });
  parsed.name = names.join(' ');
  return parsed;
}

/** A line the server wrote from dictation, rather than one the doctor typed. */
export function isDictated(item: {
  sourceSpanIds: readonly string[];
}): boolean {
  return item.sourceSpanIds.length > 0;
}

/** How many lines on the draft were typed, for "4 parts dictated, 1 typed". */
export function countTyped(sections: PrescriptionSections): number {
  const { followUp, ...lists } = sections;
  return Object.values(lists)
    .flat()
    .filter((item) => !isDictated(item)).length;
}

/** The allergies each medicine may clash with, by medicine id. */
export function allergyClashes(
  medicines: readonly Medicine[],
  allergies: readonly string[],
): Map<string, string> {
  const clashes = new Map<string, string>();
  medicines.forEach((medicine) => {
    const allergy = allergyClash(medicine, allergies);
    if (allergy) clashes.set(medicine.id, allergy);
  });
  return clashes;
}
