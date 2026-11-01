import { FormCheckboxGroup, FormInput, FormPhoneInput } from '@/components';
import type { MemberView } from '@/contract';
import { Banner, Button, Dialog } from '@/ui';

import { teamCopy } from '../copy';
import { useAssistantDialog } from '../hooks/useAssistantDialog';

export type AssistantDialogProps = {
  /** The assistant to edit, or null to add one. */
  member: MemberView | null;
  onClose: () => void;
};

/** Add an assistant by phone number, or change their name and locations. */
export function AssistantDialog({ member, onClose }: AssistantDialogProps) {
  const form = useAssistantDialog({ member, onSaved: onClose });
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
            form="assistant-form"
            label={form.submitLabel}
            loading={form.isSaving}
          />
        </>
      }
    >
      <form
        id="assistant-form"
        onSubmit={form.submit}
        className="flex flex-col gap-5"
        noValidate
      >
        <FormInput
          control={form.control}
          name="name"
          label={teamCopy.fields.name}
          placeholder={teamCopy.fields.namePlaceholder}
          autoFocus
        />
        {form.isEditing ? null : (
          <FormPhoneInput
            control={form.control}
            name="phone"
            label={teamCopy.fields.phone}
          />
        )}
        {form.existingNote ? (
          <Banner tone="info">{form.existingNote}</Banner>
        ) : null}
        <FormCheckboxGroup
          control={form.control}
          name="locationIds"
          label={teamCopy.fields.locations}
          options={form.locationOptions}
        />
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
