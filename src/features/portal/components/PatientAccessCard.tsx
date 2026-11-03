import { Button, Dialog, Icon, Switch, TextLink } from '@/ui';

import { portalCopy } from '../copy';
import { usePatientAccess } from '../hooks/usePatientAccess';

const copy = portalCopy.patient;

export type PatientAccessCardProps = {
  patientId: string;
};

/** Whether a patient can see their records online, and what to do about it. */
export function PatientAccessCard({ patientId }: PatientAccessCardProps) {
  const access = usePatientAccess(patientId);
  if (!access.isShown) return null;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border p-4">
      <h3 className="text-section">{copy.title}</h3>
      <p className="text-body text-ink-secondary">{access.line}</p>
      {access.canInvite ? (
        <Button
          label={access.inviteLabel}
          variant="secondary"
          fullWidth
          icon={<Icon name="share" className="size-4" />}
          loading={access.isInviting}
          onClick={access.invite}
        />
      ) : null}
      {access.canManage ? (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body font-bold">{copy.block}</p>
            <p className="text-meta text-ink-secondary">{copy.blockHint}</p>
          </div>
          <Switch
            label={copy.block}
            checked={access.isBlocked}
            disabled={access.isUpdating}
            onChange={access.setBlocked}
          />
        </div>
      ) : null}
      {access.canRemove ? (
        <div>
          <TextLink
            label={copy.remove}
            tone="danger"
            onClick={access.askRemove}
          />
        </div>
      ) : null}
      {access.isConfirmingRemove ? (
        <Dialog
          title={copy.removeDialog.title}
          description={copy.removeDialog.body}
          onClose={access.keep}
          actions={
            <>
              <Button
                label={copy.removeDialog.keep}
                variant="secondary"
                onClick={access.keep}
              />
              <Button
                label={copy.removeDialog.confirm}
                variant="destructive"
                loading={access.isRemoving}
                onClick={access.remove}
              />
            </>
          }
        />
      ) : null}
    </section>
  );
}
