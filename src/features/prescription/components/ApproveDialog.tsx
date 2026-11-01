import { Avatar, Banner, Button, Checkbox, Dialog, Icon } from '@/ui';

import { rxCopy } from '../copy';
import type { useApproveDialog } from '../hooks/useApproveDialog';

const copy = rxCopy.approveDialog;

export type ApproveDialogProps = {
  dialog: ReturnType<typeof useApproveDialog>;
  onClose: () => void;
  /** "Fix it": back to the editor at that medicine. */
  onFix: (medicineId: string) => void;
};

/** Before signing: what's on it, what was checked, what still looks off. */
export function ApproveDialog({ dialog, onClose, onFix }: ApproveDialogProps) {
  const counts = [
    [String(dialog.counts.medicines), copy.medicines],
    [String(dialog.counts.tests), copy.tests],
    [dialog.counts.followUp, copy.followUp],
  ];
  return (
    <Dialog
      title={copy.title}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.back} variant="secondary" onClick={onClose} />
          <Button
            label={copy.approve}
            icon={<Icon name="check" className="size-4" />}
            loading={dialog.isApproving}
            disabled={!dialog.canApprove}
            onClick={dialog.approve}
          />
        </>
      }
    >
      <div className="rounded-card bg-primary-tint p-5">
        <div className="flex items-center gap-3">
          <Avatar name={dialog.patientName} />
          <div>
            <p className="text-body font-bold">{dialog.patientName}</p>
            <p className="text-meta text-ink-secondary">{dialog.patientLine}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {counts.map(([value, label]) => (
            <div key={label}>
              <p className="text-title">{value}</p>
              <p className="text-meta text-ink-secondary">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {dialog.checks.map((check) =>
          check.tone === 'ok' ? (
            <li key={check.key} className="flex items-center gap-2 text-body">
              <Icon name="check" className="size-4 text-primary" />
              {check.text}
            </li>
          ) : (
            <li key={check.key}>
              <Banner
                tone={check.tone === 'blocking' ? 'danger' : 'warning'}
                action={
                  check.fixId ? (
                    <button
                      type="button"
                      onClick={() => onFix(check.fixId ?? '')}
                      className="font-bold underline"
                    >
                      {copy.fixIt}
                    </button>
                  ) : undefined
                }
              >
                {check.text}
              </Banner>
            </li>
          ),
        )}
      </ul>

      <p className="text-meta text-ink-secondary">{dialog.lockedNote}</p>
      <Checkbox
        label={copy.openPreview}
        checked={dialog.openPreview}
        onChange={dialog.setOpenPreview}
      />
      {dialog.error ? <Banner tone="danger">{dialog.error}</Banner> : null}
    </Dialog>
  );
}
