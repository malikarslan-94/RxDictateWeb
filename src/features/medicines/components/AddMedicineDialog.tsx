import { StateMessage } from '@/components';
import { Button, Dialog, SearchInput, StatusChip, TextLink } from '@/ui';

import type { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';
import { useAddMedicine } from '../hooks/useAddMedicine';

const copy = medicinesCopy.add;

export type AddMedicineDialogProps = {
  owner: DrugListOwner;
  /** Swap for the form, starting from what was typed. */
  onAddOwn: (name: string) => void;
  onClose: () => void;
};

/** Find a medicine in the whole catalog and put it on this list. */
export function AddMedicineDialog({
  owner,
  onAddOwn,
  onClose,
}: AddMedicineDialogProps) {
  const add = useAddMedicine(owner);

  return (
    <Dialog
      title={add.title}
      onClose={onClose}
      actions={
        <>
          <Button
            label={copy.addOwn}
            variant="secondary"
            onClick={() => onAddOwn(add.typed)}
          />
          <Button label={copy.close} onClick={onClose} />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SearchInput
          value={add.text}
          onChange={(event) => add.setText(event.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
          autoFocus
        />
        {add.results.length > 0 ? (
          <ul className="relative flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
            {add.results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-body font-bold">{result.title}</p>
                  <p className="truncate text-meta text-ink-secondary">
                    {result.detail}
                  </p>
                </div>
                {result.isOnList ? (
                  <StatusChip label={copy.onList} tone="active" />
                ) : (
                  <TextLink
                    label={copy.add}
                    disabled={result.isAdding}
                    onClick={result.add}
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <StateMessage isLoading={add.isLoading} empty={add.emptyText} />
        )}
      </div>
    </Dialog>
  );
}
