import { FormInput, FormPhoneInput } from '@/components';
import type { MemberView } from '@/contract';
import { Banner, Button, Dialog } from '@/ui';

import { teamCopy } from '../copy';
import { useMedicineManagerDialog } from '../hooks/useMedicineManagerDialog';

export type MedicineManagerDialogProps = {
  /** The medicine manager to edit, or null to add one. */
  member: MemberView | null;
  onClose: () => void;
};

/** Add a medicine manager by phone number, or change their name. */
export function MedicineManagerDialog({
  member,
  onClose,
}: MedicineManagerDialogProps) {
  const form = useMedicineManagerDialog({ member, onSaved: onClose });
  return (
    <Dialog
      title={form.title}
      description={form.fixedPhone ?? undefined}
      onClose={onClose}
      actions={
        <>
          <Button
            label={teamCopy.dialog.cancel}
            variant="secondary"
            onClick={onClose}
          />
          <Button
            type="submit"
            form="medicine-manager-form"
            label={form.submitLabel}
            loading={form.isSaving}
          />
        </>
      }
    >
      <form
        id="medicine-manager-form"
        onSubmit={form.submit}
        className="flex flex-col gap-5"
        noValidate
      >
        <FormInput
          control={form.control}
          name="name"
          label={teamCopy.fields.name}
          placeholder={teamCopy.fields.managerNamePlaceholder}
          autoFocus
        />
        {form.isEditing ? null : (
          <FormPhoneInput
            control={form.control}
            name="phone"
            label={teamCopy.fields.phone}
          />
        )}
        {form.smsPreview ? (
          <p className="text-meta text-ink-secondary">{form.smsPreview}</p>
        ) : null}
        {form.formError ? (
          <Banner tone="danger">{form.formError}</Banner>
        ) : null}
      </form>
    </Dialog>
  );
}
