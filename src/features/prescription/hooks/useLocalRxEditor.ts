import { useState } from 'react';

import {
  diagnosisItemSchema,
  medicineItemSchema,
  textItemSchema,
} from '@/contract';
import type { PrescriptionSections, TextItem } from '@/contract';
import { toDateString } from '@/utils/date';

import { EMPTY_SECTIONS } from '../constants';
import type { EditorSection } from '../constants';
import type { RxEditor } from './useRxEditor';

type Change = (sections: PrescriptionSections) => PrescriptionSections;

/** One plain section with new lines, diagnosis lines keeping their code. */
function withLines(
  sections: PrescriptionSections,
  section: EditorSection,
  lines: TextItem[],
): PrescriptionSections {
  if (section === 'diagnosis') {
    return {
      ...sections,
      diagnosis: lines.map((line) => diagnosisItemSchema.parse(line)),
    };
  }
  return { ...sections, [section]: lines };
}

const linesOf = (sections: PrescriptionSections, section: EditorSection) => {
  const lines: TextItem[] = sections[section];
  return lines;
};

/**
 * The prescription editor's every change, kept here instead of sent as ops:
 * a template is edited whole and saved at the end. The same shape as
 * `useRxEditor`, so the same sections and rows edit it.
 */
export function useLocalRxEditor() {
  const [sections, setSections] = useState(EMPTY_SECTIONS);
  const change = (update: Change) => {
    setSections(update);
    return Promise.resolve(true);
  };
  const newLine = (text: string) =>
    textItemSchema.parse({ id: crypto.randomUUID(), text });

  const editor: RxEditor = {
    addText: (section, text) =>
      change((current) =>
        withLines(current, section, [
          ...linesOf(current, section),
          newLine(text),
        ]),
      ),
    updateText: (section, item, text) =>
      change((current) =>
        withLines(
          current,
          section,
          linesOf(current, section).map((line) =>
            line.id === item.id ? { ...line, text } : line,
          ),
        ),
      ),
    removeText: (section, item) =>
      change((current) =>
        withLines(
          current,
          section,
          linesOf(current, section).filter((line) => line.id !== item.id),
        ),
      ),
    addMedicine: (fields) => {
      const medicine = medicineItemSchema.safeParse({
        id: crypto.randomUUID(),
        ...fields,
      });
      if (!medicine.success) return Promise.resolve(false);
      return change((current) => ({
        ...current,
        medicines: [...current.medicines, medicine.data],
      }));
    },
    updateMedicine: (item, fields) =>
      change((current) => ({
        ...current,
        medicines: current.medicines.map((medicine) =>
          medicine.id === item.id ? { ...medicine, ...fields } : medicine,
        ),
      })),
    removeMedicine: (item) =>
      change((current) => ({
        ...current,
        medicines: current.medicines.filter(
          (medicine) => medicine.id !== item.id,
        ),
      })),
    confirmMedicine: (item) =>
      change((current) => ({
        ...current,
        medicines: current.medicines.map((medicine) =>
          medicine.id === item.id ? { ...medicine, flags: [] } : medicine,
        ),
      })),
    setFollowUpDays: (inDays) =>
      change((current) => ({
        ...current,
        followUp: { ...current.followUp, inDays, date: null },
      })),
    setFollowUpDate: (date) =>
      change((current) => ({
        ...current,
        followUp: {
          ...current.followUp,
          inDays: null,
          date: toDateString(date),
        },
      })),
  };

  return { sections, editor, reset: setSections };
}
