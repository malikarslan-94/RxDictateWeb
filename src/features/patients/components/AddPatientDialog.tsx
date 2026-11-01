import {
  FormCheckbox,
  FormInput,
  FormPhoneInput,
  FormSegmented,
} from '@/components';
import { commonCopy } from '@/constants/copy';
import { VitalsFields } from '@/features/vitals';
import { Banner, Button, Dialog, Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { patientsCopy } from '../copy';
import { useAddPatient } from '../hooks/useAddPatient';

const copy = patientsCopy.add;

export type AddPatientDialogProps = {
  /** Prefilled from a search that found no one. */
  name?: string;
  onClose: () => void;
};

/**
 * A new patient: who they are, their allergies and conditions, and for the
 * assistant, the vitals they've just taken.
 */
export function AddPatientDialog({ name, onClose }: AddPatientDialogProps) {
  const form = useAddPatient({ name, onSaved: onClose });
  return (
    <Dialog
      title={copy.title}
      onClose={onClose}
      // The assistant's vitals sit beside the patient, not under them.
      width={form.vitals ? 'large' : 'wide'}
      actions={
        <>
          <Button
            label={copy.saveOnly}
            variant="secondary"
            disabled={form.isSaving}
            onClick={form.saveOnly}
          />
          <Button
            label={form.continueLabel}
            loading={form.isSaving}
            onClick={form.saveAndContinue}
          />
        </>
      }
    >
      <form
        onSubmit={form.saveAndContinue}
        noValidate
        className="flex flex-col gap-5"
      >
        <div
          className={cx(
            'grid gap-6',
            form.vitals ? 'grid-cols-2 items-start' : 'grid-cols-1',
          )}
        >
          <div className="flex flex-col gap-5">
            <FormInput
              control={form.control}
              name="name"
              label={copy.fullName}
              placeholder={copy.fullNamePlaceholder}
              autoFocus
            />
            <FormPhoneInput
              control={form.control}
              name="phone"
              label={copy.phone}
              hint={copy.phoneHint}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="age"
                label={copy.age}
                inputMode="numeric"
                maxLength={3}
              />
              <div className="col-span-2">
                <FormSegmented
                  control={form.control}
                  name="sex"
                  label={copy.sex}
                  options={commonCopy.sexOptions}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <FormInput
                control={form.control}
                name="allergies"
                label={copy.allergies}
                placeholder={copy.allergiesPlaceholder}
                hint={copy.listHint}
                disabled={form.noKnownAllergies}
              />
              <FormCheckbox
                control={form.control}
                name="noKnownAllergies"
                label={copy.noKnownAllergies}
              />
            </div>
            <FormInput
              control={form.control}
              name="conditions"
              label={copy.conditions}
              placeholder={copy.conditionsPlaceholder}
              hint={copy.listHint}
            />
          </div>
          {form.vitals ? (
            <section className="flex flex-col gap-4 rounded-card bg-primary-tint p-5">
              <div>
                <h3 className="flex items-center gap-2 text-section">
                  <Icon
                    name="activity"
                    className="size-5 text-primary-strong"
                  />
                  {copy.vitals}
                </h3>
                <p className="mt-1 text-meta text-ink-secondary">
                  {copy.vitalsHint}
                </p>
              </div>
              <VitalsFields
                control={form.vitals.control}
                warnings={form.vitals.warnings}
              />
            </section>
          ) : null}
        </div>
        <p className="text-meta text-ink-secondary">{form.continueNote}</p>
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
      </form>
    </Dialog>
  );
}
