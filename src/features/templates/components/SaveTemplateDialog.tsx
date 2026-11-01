import { FormInput } from '@/components';
import { Banner, Button, Dialog } from '@/ui';

import { templatesCopy } from '../copy';
import { useSaveTemplate } from '../hooks/useSaveTemplate';
import type { UseSaveTemplateOptions } from '../hooks/useSaveTemplate';

const copy = templatesCopy.save;

export type SaveTemplateDialogProps = UseSaveTemplateOptions & {
  onClose: () => void;
};

/** Name an approved prescription, and it's kept as a template. */
export function SaveTemplateDialog({
  onClose,
  ...options
}: SaveTemplateDialogProps) {
  const save = useSaveTemplate(options);

  if (save.savedNote) {
    return (
      <Dialog
        title={copy.title}
        onClose={onClose}
        actions={<Button label={copy.done} onClick={onClose} />}
      >
        <Banner tone="success">{save.savedNote}</Banner>
      </Dialog>
    );
  }
  return (
    <Dialog
      title={copy.title}
      description={copy.description}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            label={copy.submit}
            loading={save.isSaving}
            onClick={save.submit}
          />
        </>
      }
    >
      <form onSubmit={save.submit} className="flex flex-col gap-4">
        <FormInput
          control={save.control}
          name="name"
          label={copy.name}
          placeholder={copy.namePlaceholder}
        />
        {save.formError ? (
          <Banner tone="danger">{save.formError}</Banner>
        ) : null}
      </form>
    </Dialog>
  );
}
