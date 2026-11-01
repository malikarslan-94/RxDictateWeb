import type { PrescriptionSections } from '@/contract';
import { Icon, StatusChip } from '@/ui';

import { rxCopy } from '../copy';
import type { RxEditor } from '../hooks/useRxEditor';
import { allergyClashes } from '../utils';
import { MedicineRow } from './MedicineRow';
import { QuickMedicineLine } from './QuickMedicineLine';

const copy = rxCopy.editor;

export type MedicinesSectionProps = {
  medicines: PrescriptionSections['medicines'];
  allergies: readonly string[];
  editor: RxEditor;
  isEditable: boolean;
  highlightSpanIds: readonly string[];
};

/** The Rx table: every medicine, checked against the patient's allergies. */
export function MedicinesSection({
  medicines,
  allergies,
  editor,
  isEditable,
  highlightSpanIds,
}: MedicinesSectionProps) {
  const clashes = allergyClashes(medicines, allergies);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-group text-primary-strong uppercase">
          {rxCopy.count(copy.sections.medicines, medicines.length)}
        </h3>
        {medicines.length > 0 ? (
          <p className="flex items-center gap-2 text-meta text-ink-secondary">
            {copy.allergyCheck}
            {clashes.size > 0 ? (
              <StatusChip
                label={copy.conflicts(clashes.size)}
                tone="overdue"
                icon="alert"
              />
            ) : (
              <StatusChip label={copy.noConflicts} tone="active" icon="check" />
            )}
          </p>
        ) : null}
      </div>
      {medicines.length > 0 ? (
        <div className="grid grid-medicine items-center gap-4 border border-transparent px-4 text-group text-ink-secondary uppercase">
          <span />
          <span>{copy.columns.medicine}</span>
          <span>{copy.columns.dose}</span>
          <span>{copy.columns.when}</span>
          <span className="text-center">{copy.columns.days}</span>
          <span />
        </div>
      ) : null}
      <ul className="flex flex-col gap-2">
        {medicines.map((medicine) => (
          <MedicineRow
            key={medicine.id}
            medicine={medicine}
            editor={editor}
            isEditable={isEditable}
            allergyClash={clashes.get(medicine.id) ?? null}
            isHighlighted={medicine.sourceSpanIds.some((id) =>
              highlightSpanIds.includes(id),
            )}
          />
        ))}
      </ul>
      {isEditable ? <QuickMedicineLine editor={editor} /> : null}
      {!isEditable && medicines.length === 0 ? (
        <p className="flex items-center gap-2 text-meta text-ink-secondary">
          <Icon name="file" className="size-4" />
          {copy.noneYet}
        </p>
      ) : null}
    </section>
  );
}
