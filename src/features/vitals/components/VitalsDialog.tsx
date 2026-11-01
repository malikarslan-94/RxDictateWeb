import type { VitalsView } from '@/contract';
import { Banner, Button, Dialog } from '@/ui';

import { vitalsCopy } from '../copy';
import { useVitalsDialog } from '../hooks/useVitalsDialog';
import { VitalsFields } from './VitalsFields';

export type VitalsDialogProps = {
  /** The visit's readings when editing, else null. */
  vitals: VitalsView | null;
  /** The visit to record against, started first if there isn't one yet. */
  getVisitId: () => Promise<string>;
  onClose: () => void;
};

/** BP, pulse, temperature, weight and SpO₂ for one visit. */
export function VitalsDialog({
  vitals,
  getVisitId,
  onClose,
}: VitalsDialogProps) {
  const dialog = useVitalsDialog({ vitals, getVisitId, onSaved: onClose });

  return (
    <Dialog
      title={dialog.title}
      description={vitalsCopy.subtitle}
      onClose={onClose}
      actions={
        <>
          <Button
            label={vitalsCopy.cancel}
            variant="secondary"
            disabled={dialog.isSaving}
            onClick={onClose}
          />
          <Button
            label={vitalsCopy.save}
            loading={dialog.isSaving}
            onClick={dialog.submit}
          />
        </>
      }
    >
      <form onSubmit={dialog.submit} noValidate>
        <VitalsFields control={dialog.control} warnings={dialog.warnings} />
        {/* Enter in any field saves. */}
        <button type="submit" hidden />
      </form>
      {dialog.error ? <Banner tone="danger">{dialog.error}</Banner> : null}
    </Dialog>
  );
}
