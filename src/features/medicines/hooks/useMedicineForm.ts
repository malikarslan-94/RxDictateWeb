import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { commonCopy } from '@/constants/copy';
import { medicineFormSchema } from '@/contract';
import type { DrugView } from '@/contract';
import { messageFor, toApiError } from '@/lib/api';

import { useCreateDrugMutation, useUpdateDrugMutation } from '../api';
import type { DrugListOwner } from '../constants';
import { medicinesCopy } from '../copy';
import { ownMedicineSchema } from '../schemas';
import type { OwnMedicineInput } from '../schemas';

const copy = medicinesCopy.form;

/**
 * A medicine of the clinic's or of this doctor's: a new one, starting from
 * what was typed, or a correction to one already there.
 */
export function useMedicineForm({
  owner,
  drug,
  name,
  onSaved,
}: {
  owner: DrugListOwner;
  /** The medicine being corrected, or null to add one. */
  drug: DrugView | null;
  name: string;
  onSaved: () => void;
}) {
  const [createDrug, creating] = useCreateDrugMutation();
  const [updateDrug, updating] = useUpdateDrugMutation();
  const defaults: OwnMedicineInput = {
    brand: drug?.brand ?? name,
    generic: drug?.generic ?? '',
    strength: drug?.strength ?? '',
    form: drug?.form ?? medicineFormSchema.enum.tab,
    pack: drug?.pack ?? '',
    company: drug?.company ?? '',
  };
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(ownMedicineSchema),
    defaultValues: defaults,
  });

  return {
    title: drug ? copy.editTitle : copy.addTitle,
    submitLabel: drug ? copy.save : copy.add,
    note: drug ? null : copy.note[owner],
    control,
    formOptions: medicineFormSchema.options.map((form) => ({
      value: form,
      label: commonCopy.medicineForms[form],
    })),
    submit: handleSubmit(async (values) => {
      try {
        if (drug) {
          await updateDrug({ id: drug.id, body: values }).unwrap();
        } else {
          await createDrug({ ...values, for: owner }).unwrap();
        }
        onSaved();
      } catch (error) {
        setError('root', { message: messageFor(toApiError(error)) });
      }
    }),
    isSaving: creating.isLoading || updating.isLoading,
    formError: formState.errors.root?.message,
  };
}
