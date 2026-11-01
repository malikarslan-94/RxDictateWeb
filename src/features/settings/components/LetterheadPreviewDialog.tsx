import { PrintPreview } from '@/components';
import type { LocationView } from '@/contract';
import { Button, Dialog } from '@/ui';

import { settingsCopy } from '../copy';
import { useLetterheadPreview } from '../hooks/useLetterheadPreview';

export type LetterheadPreviewDialogProps = {
  location: LocationView;
  onClose: () => void;
};

/** A sample prescription under this location's header. */
export function LetterheadPreviewDialog({
  location,
  onClose,
}: LetterheadPreviewDialogProps) {
  const preview = useLetterheadPreview(location);
  return (
    <Dialog
      title={preview.title}
      onClose={onClose}
      width="wide"
      actions={
        <Button
          label={settingsCopy.locations.close}
          variant="secondary"
          onClick={onClose}
        />
      }
    >
      {preview.printout ? (
        <div className="rounded-md border border-border">
          <PrintPreview printout={preview.printout} options={preview.options} />
        </div>
      ) : null}
    </Dialog>
  );
}
