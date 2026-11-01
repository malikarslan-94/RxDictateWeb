import type { PrescriptionSections } from '@/contract';
import { Card } from '@/ui';

import { EditorSection } from '../constants';
import { rxCopy } from '../copy';
import type { RxEditor as Editor } from '../hooks/useRxEditor';
import { FollowUpSection } from './FollowUpSection';
import { MedicinesSection } from './MedicinesSection';
import { TextSection } from './TextSection';

const copy = rxCopy.editor;

export type RxEditorProps = {
  sections: PrescriptionSections;
  allergies: readonly string[];
  editor: Editor;
  isEditable: boolean;
  highlightSpanIds: readonly string[];
  newSpanIds: readonly string[];
  /** Null for a template: no complaints, and no follow-up date. */
  followUpFrom: Date | null;
};

/**
 * The prescription itself, section by section, in print order. A template
 * (no follow-up date to count from) leaves out the complaints, which belong
 * to one patient.
 */
export function RxEditor({
  sections,
  allergies,
  editor,
  isEditable,
  highlightSpanIds,
  newSpanIds,
  followUpFrom,
}: RxEditorProps) {
  const text = (section: EditorSection) => (
    <TextSection
      title={copy.sections[section]}
      items={sections[section]}
      addLabel={copy.add[section]}
      onAdd={isEditable ? (line) => editor.addText(section, line) : undefined}
      onUpdate={
        isEditable
          ? (item, line) => editor.updateText(section, item, line)
          : undefined
      }
      onRemove={
        isEditable ? (item) => editor.removeText(section, item) : undefined
      }
      highlightSpanIds={highlightSpanIds}
      newSpanIds={newSpanIds}
    />
  );

  return (
    <Card className="flex flex-col divide-y divide-border p-0">
      {followUpFrom !== null ? (
        <div className="p-6">{text(EditorSection.complaints)}</div>
      ) : null}
      <div className="p-6">{text(EditorSection.diagnosis)}</div>
      <div className="p-6">
        <MedicinesSection
          medicines={sections.medicines}
          allergies={allergies}
          editor={editor}
          isEditable={isEditable}
          highlightSpanIds={highlightSpanIds}
        />
      </div>
      <div className="p-6">{text(EditorSection.labs)}</div>
      <div className="grid grid-cols-2 gap-6 p-6">
        {text(EditorSection.dietAvoid)}
        {text(EditorSection.dietEat)}
      </div>
      <div className="p-6">{text(EditorSection.advice)}</div>
      <div className="p-6">
        <FollowUpSection
          followUp={sections.followUp}
          editor={editor}
          isEditable={isEditable}
          from={followUpFrom}
        />
      </div>
    </Card>
  );
}
