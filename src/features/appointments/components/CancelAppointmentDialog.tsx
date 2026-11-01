import { Banner, Button, Dialog } from '@/ui';

import { appointmentsCopy } from '../copy';

const copy = appointmentsCopy.cancelDialog;

export type CancelAppointmentDialogProps = {
  name: string;
  /** "Tomorrow, 9:30 am". */
  when: string;
  isCancelling: boolean;
  error?: string;
  onCancel: () => void;
  onClose: () => void;
};

/** Asks before an appointment goes. A follow-up goes back on the list. */
export function CancelAppointmentDialog({
  name,
  when,
  isCancelling,
  error,
  onCancel,
  onClose,
}: CancelAppointmentDialogProps) {
  return (
    <Dialog
      title={copy.title(name)}
      description={copy.subtitle(when)}
      onClose={onClose}
      actions={
        <>
          <Button
            label={copy.keep}
            variant="secondary"
            disabled={isCancelling}
            onClick={onClose}
          />
          <Button
            label={copy.confirm}
            variant="destructive"
            loading={isCancelling}
            onClick={onCancel}
          />
        </>
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
    </Dialog>
  );
}
