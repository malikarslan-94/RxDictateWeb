import type { LocationView } from '@/contract';
import { LocationFields } from '@/features/clinic';
import { Banner, Button, Dialog, Icon } from '@/ui';

import { LOCATION_FORM_ID } from '../constants';
import { settingsCopy } from '../copy';
import { useLocationDialog } from '../hooks/useLocationDialog';

const copy = settingsCopy.locations;

export type LocationDialogProps = {
  /** Null to add a new location. */
  location: LocationView | null;
  onClose: () => void;
};

/** Add or edit a location; from editing, make it the default or archive it. */
export function LocationDialog({ location, onClose }: LocationDialogProps) {
  const dialog = useLocationDialog(location, onClose);
  const error = dialog.formError ? (
    <Banner tone="danger">{dialog.formError}</Banner>
  ) : null;

  if (dialog.isConfirmingArchive) {
    return (
      <Dialog
        title={dialog.archiveTitle}
        description={copy.archiveBody}
        onClose={dialog.cancelArchive}
        actions={
          <>
            <Button
              label={copy.keep}
              variant="secondary"
              onClick={dialog.cancelArchive}
            />
            <Button
              label={copy.archiveConfirm}
              variant="destructive"
              loading={dialog.isArchiving}
              onClick={dialog.archive}
            />
          </>
        }
      >
        {error}
      </Dialog>
    );
  }

  return (
    <Dialog
      title={dialog.title}
      onClose={onClose}
      width="wide"
      actions={
        <>
          <Button label={copy.cancel} variant="secondary" onClick={onClose} />
          <Button
            type="submit"
            form={LOCATION_FORM_ID}
            label={copy.save}
            loading={dialog.isSaving}
          />
        </>
      }
    >
      <form
        id={LOCATION_FORM_ID}
        onSubmit={dialog.submit}
        noValidate
        className="flex flex-col gap-5"
      >
        <LocationFields control={dialog.control} />
      </form>
      {error}
      {location ? (
        <div className="flex flex-col items-start gap-2 border-t border-border pt-5">
          {dialog.makeDefault ? (
            <Button
              label={copy.makeDefault}
              variant="text"
              size="small"
              icon={<Icon name="check" className="size-4" />}
              onClick={dialog.makeDefault}
            />
          ) : (
            <p className="text-meta text-ink-secondary">{copy.isDefault}</p>
          )}
          {dialog.canArchive ? (
            <Button
              label={copy.archive}
              variant="text"
              size="small"
              icon={<Icon name="trash" className="size-4" />}
              onClick={dialog.askArchive}
            />
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
