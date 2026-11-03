import { IconButton, StatusChip, Td, TextLink, Tr } from '@/ui';

import { medicinesCopy } from '../copy';
import type { DrugListRow } from '../types';

const copy = medicinesCopy.lists;

export type DrugListRowViewProps = {
  row: DrugListRow;
  onEdit: () => void;
  onRemove: () => void;
};

/** One medicine on a list, with its marks and what can be done to it. */
export function DrugListRowView({
  row,
  onEdit,
  onRemove,
}: DrugListRowViewProps) {
  return (
    <Tr>
      <Td>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{row.title}</p>
          {row.marks.map((mark) => (
            <StatusChip key={mark.label} label={mark.label} tone={mark.tone} />
          ))}
        </div>
        <p className="text-meta text-ink-secondary">{row.generic}</p>
      </Td>
      <Td>{row.company}</Td>
      <Td className="text-right">
        <div className="flex items-center justify-end gap-4">
          {row.canEdit ? (
            <TextLink label={copy.edit} tone="muted" onClick={onEdit} />
          ) : null}
          <IconButton
            icon="trash"
            label={copy.remove(row.title)}
            tone="danger"
            onClick={onRemove}
          />
        </div>
      </Td>
    </Tr>
  );
}
