import type { TemplateView } from '@/contract';
import { Banner, Button, Dialog } from '@/ui';

import { templatesCopy } from '../copy';
import { useDeleteTemplate } from '../hooks/useDeleteTemplate';

const copy = templatesCopy.remove;

export type DeleteTemplateDialogProps = {
  template: TemplateView;
  onClose: () => void;
};

/** Confirm before a template goes. */
export function DeleteTemplateDialog({
  template,
  onClose,
}: DeleteTemplateDialogProps) {
  const remove = useDeleteTemplate(template.id, onClose);
  return (
    <Dialog
      title={copy.title(template.name)}
      description={copy.body}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            label={copy.confirm}
            variant="destructive"
            loading={remove.isDeleting}
            onClick={remove.confirm}
          />
        </>
      }
    >
      {remove.error ? <Banner tone="danger">{remove.error}</Banner> : null}
    </Dialog>
  );
}
