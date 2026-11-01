import { Avatar, Button, Dialog, Icon, SearchInput, Spinner } from '@/ui';

import { patientsCopy } from '../copy';
import { usePatientPicker } from '../hooks/usePatientPicker';
import type { PickerRow } from '../types';
import { AddPatientDialog } from './AddPatientDialog';

const copy = patientsCopy.picker;

function PickRow({ row }: { row: PickerRow }) {
  return (
    <li>
      <button
        type="button"
        onClick={row.pick}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-primary-tint"
      >
        {row.token !== null ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-body font-bold text-primary-strong">
            {row.token}
          </span>
        ) : (
          <Avatar name={row.name} />
        )}
        <span className="min-w-0">
          <span className="block truncate text-body font-bold">{row.name}</span>
          <span className="block truncate text-meta text-ink-secondary">
            {row.details}
          </span>
        </span>
      </button>
    </li>
  );
}

/** "New prescription": pick who it's for, or add them first. */
export function PatientPickerDialog({ onClose }: { onClose: () => void }) {
  const picker = usePatientPicker(onClose);
  if (picker.isAddingNew) {
    return <AddPatientDialog name={picker.addName} onClose={onClose} />;
  }
  return (
    <Dialog title={copy.title} description={copy.subtitle} onClose={onClose}>
      <SearchInput
        value={picker.text}
        onChange={(event) => picker.setText(event.target.value)}
        placeholder={copy.searchPlaceholder}
        aria-label={copy.searchPlaceholder}
        autoFocus
      />
      <Button
        label={picker.addName ? copy.addNamed(picker.addName) : copy.addNew}
        variant="dashed"
        fullWidth
        icon={<Icon name="plus" className="size-4" />}
        onClick={picker.addNew}
      />
      <section>
        <p className="mb-2 text-group text-ink-secondary uppercase">
          {picker.title}
        </p>
        {picker.isSearching ? (
          <div className="flex justify-center py-4 text-primary">
            <Spinner />
          </div>
        ) : null}
        <ul className="flex flex-col">
          {picker.rows.map((row) => (
            <PickRow key={row.id} row={row} />
          ))}
        </ul>
        {picker.emptyText ? (
          <p className="text-body text-ink-secondary">{picker.emptyText}</p>
        ) : null}
      </section>
    </Dialog>
  );
}
