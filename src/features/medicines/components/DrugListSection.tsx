import { StateMessage } from '@/components';
import { Button, Icon, SearchInput, Table, TableHead, Th } from '@/ui';

import type { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';
import { useDrugList } from '../hooks/useDrugList';
import { AddMedicineDialog } from './AddMedicineDialog';
import { DrugListRowView } from './DrugListRowView';
import { MedicineFormDialog } from './MedicineFormDialog';

const copy = medicinesCopy.lists;

export type DrugListSectionProps = {
  owner: DrugListOwner;
};

/** One list: search it, page through it, add to it, correct what's its own. */
export function DrugListSection({ owner }: DrugListSectionProps) {
  const list = useDrugList(owner);
  const dialog = list.dialog;

  return (
    <section className="flex flex-col gap-4">
      <p className="max-w-readable text-body text-ink-secondary">{list.hint}</p>
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={list.text}
          onChange={(event) => list.setText(event.target.value)}
          placeholder={copy.search}
          aria-label={copy.search}
          containerClassName="w-80"
        />
        <Button
          label={copy.add}
          icon={<Icon name="plus" className="size-4" />}
          onClick={list.openAdd}
        />
      </div>

      {list.rows.length > 0 ? (
        <Table>
          <TableHead>
            <Th>{copy.columns.medicine}</Th>
            <Th>{copy.columns.company}</Th>
            <Th />
          </TableHead>
          <tbody>
            {list.rows.map((row) => (
              <DrugListRowView
                key={row.id}
                row={row}
                onEdit={() => list.openEdit(row)}
                onRemove={() => list.remove(row)}
              />
            ))}
          </tbody>
        </Table>
      ) : (
        <StateMessage
          isLoading={list.isLoading}
          error={list.error}
          onRetry={list.retry}
          empty={list.emptyText}
        />
      )}

      {list.showing ? (
        <div className="flex items-center justify-between">
          <p className="text-meta text-ink-secondary">{list.showing}</p>
          <div className="flex gap-2">
            <Button
              label={copy.previous}
              variant="secondary"
              size="small"
              icon={<Icon name="chevronLeft" className="size-4" />}
              disabled={!list.canGoBack}
              onClick={list.previous}
            />
            <Button
              label={copy.next}
              variant="secondary"
              size="small"
              disabled={!list.canGoOn}
              onClick={list.next}
            />
          </div>
        </div>
      ) : null}

      {dialog?.kind === 'add' ? (
        <AddMedicineDialog
          owner={owner}
          onAddOwn={list.openOwn}
          onClose={list.closeDialog}
        />
      ) : null}
      {dialog?.kind === 'own' ? (
        <MedicineFormDialog
          owner={owner}
          drug={null}
          name={dialog.name}
          onClose={list.closeDialog}
        />
      ) : null}
      {dialog?.kind === 'edit' ? (
        <MedicineFormDialog
          owner={owner}
          drug={dialog.drug}
          name=""
          onClose={list.closeDialog}
        />
      ) : null}
    </section>
  );
}
