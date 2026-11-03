import type { DrugView } from '@/contract';
import type { ChipTone } from '@/ui';

/** A small label beside a medicine. */
export type MedicineMark = { label: string; tone: ChipTone };

/** One line of a medicine list, ready to show. */
export type DrugListRow = {
  id: string;
  title: string;
  generic: string;
  company: string;
  marks: MedicineMark[];
  /** The national catalog comes from the import; only own items can change. */
  canEdit: boolean;
  drug: DrugView;
};

/** Which dialog is open over a list. "Add yourself" swaps in for Add. */
export type MedicineDialog =
  | { kind: 'add' }
  | { kind: 'own'; name: string }
  | { kind: 'edit'; drug: DrugView };
