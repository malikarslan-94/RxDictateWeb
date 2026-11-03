import type { DrugSuggestion } from '@/contract';
import { medicinesCopy, suggestionMarks } from '@/features/medicines';
import { StatusChip, TextLink } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';

export type QuickMedicineMatchProps = {
  drug: DrugSuggestion;
  selected: boolean;
  /** Absent once it's on the list, or for who keeps no list. */
  onAddToList?: () => void;
  onPick: () => void;
};

/** One suggestion: what it is, whose list it's on, and any doubt about it. */
export function QuickMedicineMatch({
  drug,
  selected,
  onAddToList,
  onPick,
}: QuickMedicineMatchProps) {
  return (
    <li
      role="option"
      aria-selected={selected}
      className={cx(
        'flex items-center gap-3 pr-4',
        selected && 'bg-primary-tint',
      )}
    >
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onPick}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2 pl-4 text-left"
      >
        <span className="shrink-0 text-body">
          <strong>{drug.brand || drug.generic}</strong> {drug.strength}{' '}
          {rxCopy.form[drug.form].toLowerCase()}
        </span>
        <span className="truncate text-meta text-ink-secondary">
          {drug.generic}
        </span>
      </button>
      {suggestionMarks(drug).map((mark) => (
        <StatusChip key={mark.label} label={mark.label} tone={mark.tone} />
      ))}
      {onAddToList ? (
        <TextLink
          label={medicinesCopy.quick.addToMyList}
          className="shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onAddToList}
        />
      ) : null}
    </li>
  );
}
