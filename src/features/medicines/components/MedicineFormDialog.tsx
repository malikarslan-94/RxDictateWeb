import { FormInput, FormSelect } from '@/components';
import type { DrugView } from '@/contract';
import { Banner, Button, Dialog } from '@/ui';

import { MEDICINE_FORM_ID } from '../constants';
import type { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';
import { useMedicineForm } from '../hooks/useMedicineForm';

const copy = medicinesCopy.form;

export type MedicineFormDialogProps = {
  owner: DrugListOwner;
  /** The medicine to correct, or null to add one. */
  drug: DrugView | null;
  /** What was typed, when adding one. */
  name: string;
  onClose: () => void;
};

/** A medicine of the clinic's or this doctor's own: its details. */
export function MedicineFormDialog({
  owner,
  drug,
  name,
  onClose,
}: MedicineFormDialogProps) {
  const form = useMedicineForm({ owner, drug, name, onSaved: onClose });

  return (
    <Dialog
      title={form.title}
      description={form.note ?? undefined}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            type="submit"
            form={MEDICINE_FORM_ID}
            label={form.submitLabel}
            loading={form.isSaving}
          />
        </>
      }
    >
      <form
        id={MEDICINE_FORM_ID}
        onSubmit={form.submit}
        className="flex flex-col gap-5"
        noValidate
      >
        <FormInput
          control={form.control}
          name="brand"
          label={copy.brand}
          placeholder={copy.brandPlaceholder}
          autoFocus
        />
        <FormInput
          control={form.control}
          name="generic"
          label={copy.generic}
          placeholder={copy.genericPlaceholder}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="strength"
            label={copy.strength}
            placeholder={copy.strengthPlaceholder}
          />
          <FormSelect
            control={form.control}
            name="form"
            label={copy.form}
            options={form.formOptions}
          />
          <FormInput
            control={form.control}
            name="pack"
            label={copy.pack}
            placeholder={copy.packPlaceholder}
          />
          <FormInput
            control={form.control}
            name="company"
            label={copy.company}
          />
        </div>
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
      </form>
    </Dialog>
  );
}
