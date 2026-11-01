import type { PrescriptionSections, TextItem } from '@/contract';
import { toDateString } from '@/utils/date';

import type { EditorSection } from '../constants';
import {
  addMedicineLine,
  addText,
  confirmMedicine,
  removeItem,
  updateFollowUp,
  updateMedicineFields,
  updateText,
} from '../ops';
import type { MedicineFields } from '../ops';
import type { PrescriptionDraft } from './usePrescriptionDraft';

type Medicine = PrescriptionSections['medicines'][number];

/**
 * Every change the editor makes, as the op that makes it. Each one creates
 * the draft first if there isn't one, and the server's answer replaces the
 * cached prescription.
 */
export function useRxEditor(rx: PrescriptionDraft) {
  return {
    addText: (section: EditorSection, text: string) =>
      rx.apply([addText(section, text)]),
    updateText: (section: EditorSection, item: TextItem, text: string) =>
      rx.apply([updateText(section, item.id, text)]),
    removeText: (section: EditorSection, item: TextItem) =>
      rx.apply([removeItem(section, item.id)]),
    addMedicine: (fields: MedicineFields) =>
      rx.apply([addMedicineLine(fields)]),
    updateMedicine: (item: Medicine, fields: MedicineFields) =>
      rx.apply([updateMedicineFields(item.id, fields)]),
    removeMedicine: (item: Medicine) =>
      rx.apply([removeItem('medicines', item.id)]),
    /** The doctor checked a flagged line and it's right as it is. */
    confirmMedicine: (item: Medicine) => rx.apply([confirmMedicine(item)]),
    setFollowUpDays: (inDays: number | null) =>
      rx.apply([updateFollowUp({ inDays, date: null })]),
    setFollowUpDate: (date: Date) =>
      rx.apply([updateFollowUp({ inDays: null, date: toDateString(date) })]),
  };
}

export type RxEditor = ReturnType<typeof useRxEditor>;
