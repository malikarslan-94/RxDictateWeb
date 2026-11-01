import { Button, Dialog } from '@/ui';

import { rxCopy } from '../copy';

const copy = rxCopy.discardDialog;

export type DiscardDialogProps = {
  isRevision: boolean;
  isDiscarding: boolean;
  onDiscard: () => void;
  onClose: () => void;
};

/** Confirm before throwing a draft away. */
export function DiscardDialog({
  isRevision,
  isDiscarding,
  onDiscard,
  onClose,
}: DiscardDialogProps) {
  return (
    <Dialog
      title={copy.title}
      description={isRevision ? copy.revision : copy.draft}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.keep} variant="secondary" onClick={onClose} />
          <Button
            label={copy.confirm}
            variant="destructive"
            loading={isDiscarding}
            onClick={onDiscard}
          />
        </>
      }
    />
  );
}
