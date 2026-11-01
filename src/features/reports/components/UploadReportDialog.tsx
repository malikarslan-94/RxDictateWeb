import { Button, Dialog } from '@/ui';

import { reportsCopy } from '../copy';
import { useUploadReport } from '../hooks/useUploadReport';
import { UploadReportFields } from './UploadReportFields';

const copy = reportsCopy.upload;

export type UploadReportDialogProps = {
  /** Opened for one patient: theirs, and not changed. */
  patientId?: string;
  /** Called on cancel and once the report is up. */
  onClose: () => void;
};

/** Upload a report over the page it was asked for from. */
export function UploadReportDialog({
  patientId,
  onClose,
}: UploadReportDialogProps) {
  const upload = useUploadReport({ patientId, onUploaded: onClose });

  return (
    <Dialog
      title={copy.title}
      width="wide"
      onClose={onClose}
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            label={upload.submitLabel}
            loading={upload.isSending}
            onClick={upload.submit}
          />
        </>
      }
    >
      <UploadReportFields upload={upload} />
    </Dialog>
  );
}
