import { Button, Card, Segmented, Switch } from '@/ui';

import { lockCopy } from '../copy';
import { useLockSettingsCard } from '../hooks/useLockSettingsCard';
import { SetPinDialog } from './SetPinDialog';

const copy = lockCopy.settings;

/** "This computer": lock after inactivity, how soon, and the PIN. */
export function LockSettingsCard({
  canChangeTime,
}: {
  canChangeTime: boolean;
}) {
  const card = useLockSettingsCard();
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-section">{copy.title}</h2>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-body font-bold">
            {canChangeTime
              ? copy.lockAfterIdle
              : copy.assistantLock(card.minutes)}
          </p>
          <p className="text-meta text-ink-secondary">
            {canChangeTime ? copy.lockHint : copy.assistantHint}
          </p>
        </div>
        <Switch
          label={copy.lockAfterIdle}
          checked={card.isEnabled}
          onChange={card.setEnabled}
          disabled={!canChangeTime}
        />
      </div>
      {canChangeTime && card.isEnabled ? (
        <div>
          <p className="mb-2 text-label">{copy.lockAfter}</p>
          <Segmented
            fullWidth
            label={copy.lockAfter}
            options={card.minuteOptions}
            value={String(card.minutes)}
            onChange={card.chooseMinutes}
          />
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-body font-bold">{copy.pin}</p>
          <p className="text-meta text-ink-secondary">{copy.pinHint}</p>
        </div>
        <Button
          label={card.isPinSet ? copy.changePin : copy.setPin}
          variant="secondary"
          size="small"
          onClick={card.openPin}
        />
      </div>
      {card.isSettingPin ? (
        <SetPinDialog
          isChange={card.isPinSet}
          onSaved={card.pinSaved}
          onClose={card.closePin}
        />
      ) : null}
    </Card>
  );
}
