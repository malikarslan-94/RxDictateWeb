import { doseInstruction } from '@/contract';
import type { VerifyView } from '@/contract';
import { printCopy } from '@/constants/printCopy';
import { DoseLang, rxCopy } from '@/features/prescription';

type CheckedMedicine = VerifyView['medicines'][number];

/** The doctor's own words if they typed some, else the dose as a sentence. */
function instruction(medicine: CheckedMedicine, lang: keyof typeof DoseLang) {
  const typed =
    lang === DoseLang.ur ? medicine.instructionUr : medicine.instructionEn;
  return typed.trim() || doseInstruction(medicine, DoseLang[lang]);
}

/** One medicine as the printout words it. */
export function toCheckedMedicine(medicine: CheckedMedicine, index: number) {
  return {
    key: `${index}-${medicine.name}`,
    title: [
      printCopy.formAbbrev[medicine.form],
      medicine.name,
      medicine.strength,
    ]
      .filter(Boolean)
      .join(' '),
    en: instruction(medicine, DoseLang.en),
    ur: instruction(medicine, DoseLang.ur),
    duration:
      medicine.durationDays > 0 ? rxCopy.days(medicine.durationDays) : '',
  };
}
