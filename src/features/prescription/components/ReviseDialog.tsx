import { useState } from 'react';

import { Button, Dialog, Input } from '@/ui';

import { rxCopy } from '../copy';

const copy = rxCopy.reviseDialog;

export type ReviseDialogProps = {
  isRevising: boolean;
  onRevise: (reason: string) => void;
  onClose: () => void;
};

/** Start version 2 of an approved prescription, with why. */
export function ReviseDialog({
  isRevising,
  onRevise,
  onClose,
}: ReviseDialogProps) {
  const [reason, setReason] = useState('');
  return (
    <Dialog
      title={copy.title}
      description={copy.subtitle}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            label={copy.submit}
            loading={isRevising}
            onClick={() => onRevise(reason.trim())}
          />
        </>
      }
    >
      <Input
        label={copy.reason}
        placeholder={copy.reasonPlaceholder}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        autoFocus
      />
    </Dialog>
  );
}
