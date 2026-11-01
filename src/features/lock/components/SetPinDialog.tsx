import { Banner, Button, CodeInput, Dialog } from '@/ui';

import { PIN_LENGTH } from '../constants';
import { lockCopy } from '../copy';
import { useSetPin } from '../hooks/useSetPin';

const copy = lockCopy.setPin;

export type SetPinDialogProps = {
  isChange?: boolean;
  onSaved: () => void;
  onClose: () => void;
};

/** A new unlock PIN for this computer, typed twice. */
export function SetPinDialog({
  isChange = false,
  onSaved,
  onClose,
}: SetPinDialogProps) {
  const form = useSetPin(onSaved);
  return (
    <Dialog
      title={isChange ? copy.changeTitle : copy.title}
      description={copy.body}
      onClose={onClose}
      actions={
        <>
          <Button label={copy.later} variant="secondary" onClick={onClose} />
          <Button
            label={copy.save}
            loading={form.isSaving}
            onClick={form.save}
          />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <p className="text-label">{copy.pin}</p>
        <CodeInput
          label={copy.pin}
          length={PIN_LENGTH}
          value={form.pin}
          onChange={form.setPin}
          masked
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-label">{copy.confirm}</p>
        <CodeInput
          label={copy.confirm}
          length={PIN_LENGTH}
          value={form.confirm}
          onChange={form.setConfirm}
          masked
        />
      </div>
      {form.error ? <Banner tone="danger">{form.error}</Banner> : null}
    </Dialog>
  );
}
