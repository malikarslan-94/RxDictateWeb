import { StateMessage } from '@/components';
import { Button, Dialog, Icon } from '@/ui';

import { reportsCopy } from '../copy';
import { usePatientReportsDialog } from '../hooks/usePatientReportsDialog';
import type { ReportsStart } from '../hooks/usePatientReportsDialog';
import { ReportDialog } from './ReportDialog';
import { ReportRow } from './ReportRow';
import { UploadReportDialog } from './UploadReportDialog';

const copy = reportsCopy.list;

export type PatientReportsDialogProps = {
  patientId: string;
  /** Straight to the upload form, e.g. from "Upload report". */
  startWith?: ReportsStart;
  onClose: () => void;
};

/** A patient's reports, newest test first, and Upload. */
export function PatientReportsDialog({
  patientId,
  startWith = 'list',
  onClose,
}: PatientReportsDialogProps) {
  const dialog = usePatientReportsDialog({ patientId, startWith, onClose });
  const { list, view } = dialog;

  if (view.kind === 'report') {
    return <ReportDialog reportId={view.id} onClose={dialog.toList} />;
  }
  if (view.kind === 'upload') {
    return (
      <UploadReportDialog patientId={patientId} onClose={dialog.leaveUpload} />
    );
  }
  return (
    <Dialog
      title={copy.title}
      description={dialog.patientName}
      width="wide"
      onClose={onClose}
    >
      <Button
        label={copy.upload}
        variant="dashed"
        fullWidth
        icon={<Icon name="upload" className="size-4" />}
        onClick={dialog.upload}
      />
      {list.items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.items.map((item) => (
            <ReportRow
              key={item.id}
              item={item}
              onOpen={() => dialog.open(item.id)}
            />
          ))}
        </ul>
      ) : (
        <StateMessage
          isLoading={list.isLoading}
          error={list.error}
          onRetry={list.retry}
          empty={list.emptyText}
        />
      )}
    </Dialog>
  );
}
