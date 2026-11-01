import { Banner, Button, Dialog } from '@/ui';

import { teamCopy } from '../copy';

const copy = teamCopy.removeDialog;

export type RemoveMemberDialogProps = {
  name: string;
  isRemoving: boolean;
  error?: string;
  onRemove: () => void;
  onClose: () => void;
};

/** Confirm before taking an assistant off the clinic. */
export function RemoveMemberDialog({
  name,
  isRemoving,
  error,
  onRemove,
  onClose,
}: RemoveMemberDialogProps) {
  return (
    <Dialog
      title={copy.title(name)}
      description={copy.subtitle}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.keep} variant="secondary" onClick={onClose} />
          <Button
            label={copy.confirm}
            variant="destructive"
            loading={isRemoving}
            onClick={onRemove}
          />
        </>
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
    </Dialog>
  );
}
