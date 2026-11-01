import { HistoryView } from '@/constants/routes';
import { SaveTemplateDialog } from '@/features/templates';
import { Dialog, Segmented } from '@/ui';

import { rxCopy } from '../copy';
import { useHistoryDialog } from '../hooks/useHistoryDialog';
import { usePastPrescriptions } from '../hooks/usePastPrescriptions';
import type { UsePastPrescriptionsOptions } from '../hooks/usePastPrescriptions';
import { HistoryTimeline } from './HistoryTimeline';
import { PastRxPane } from './PastRxPane';

export type PastRxDialogProps = UsePastPrescriptionsOptions & {
  /** The tab it opens on; past prescriptions unless told otherwise. */
  initialView?: HistoryView;
  onClose: () => void;
};

/**
 * History: earlier prescriptions beside the chosen one's page, and the
 * patient's whole timeline. "Save as template" takes the dialog's place
 * until it's done, rather than stacking a second one on top.
 */
export function PastRxDialog({
  initialView = HistoryView.prescriptions,
  onClose,
  ...options
}: PastRxDialogProps) {
  const past = usePastPrescriptions(options);
  const dialog = useHistoryDialog(initialView, past.select);

  if (dialog.isSavingTemplate && past.selectedId) {
    return (
      <SaveTemplateDialog
        prescriptionId={past.selectedId}
        suggestedName={past.suggestedName}
        onClose={dialog.stopSaving}
      />
    );
  }
  return (
    <Dialog
      title={rxCopy.pastRx.heading}
      description={past.patientName}
      width="large"
      onClose={onClose}
    >
      <Segmented
        label={rxCopy.timeline.tabsLabel}
        options={dialog.views}
        value={dialog.view}
        onChange={dialog.setView}
        size="small"
      />
      {dialog.view === HistoryView.prescriptions ? (
        <PastRxPane past={past} onSaveTemplate={dialog.saveTemplate} />
      ) : (
        <HistoryTimeline
          patientId={options.patientId}
          onOpenPrescription={dialog.openPrescription}
        />
      )}
    </Dialog>
  );
}
