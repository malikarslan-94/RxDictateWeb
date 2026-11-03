import { commonCopy } from '@/constants/copy';
import type { DrugListItemView, DrugSuggestion, DrugView } from '@/contract';

import { DrugScope, DrugStatus } from './constants';
import { medicinesCopy } from './copy';
import type { DrugListRow, MedicineMark } from './types';

const marks = medicinesCopy.marks;

/** "Panadol 500mg tablet". */
export function medicineTitle(drug: DrugView): string {
  return [
    drug.brand || drug.generic,
    drug.strength,
    commonCopy.medicineForms[drug.form].toLowerCase(),
  ]
    .filter(Boolean)
    .join(' ');
}

const UNVERIFIED: MedicineMark = { label: marks.unverified, tone: 'waiting' };

/** What a suggestion says about itself: whose list it's on, and any doubt. */
export function suggestionMarks(drug: DrugSuggestion): MedicineMark[] {
  return [
    ...(drug.inMyList
      ? [{ label: marks.onMyList, tone: 'active' } as const]
      : []),
    ...(drug.inClinicList
      ? [{ label: marks.onClinicList, tone: 'neutral' } as const]
      : []),
    ...(drug.verified ? [] : [UNVERIFIED]),
  ];
}

function listMarks(drug: DrugView): MedicineMark[] {
  return [
    ...(drug.status === DrugStatus.discontinued
      ? [{ label: marks.discontinued, tone: 'overdue' } as const]
      : []),
    ...(drug.verified ? [] : [UNVERIFIED]),
    ...(drug.scope === DrugScope.clinic
      ? [{ label: marks.clinicOwn, tone: 'neutral' } as const]
      : []),
  ];
}

export function toListRow({ drug }: DrugListItemView): DrugListRow {
  return {
    id: drug.id,
    title: medicineTitle(drug),
    generic: drug.generic,
    company: drug.company,
    marks: listMarks(drug),
    canEdit: drug.scope !== DrugScope.national,
    drug,
  };
}
