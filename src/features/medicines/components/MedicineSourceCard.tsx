import { Card, Segmented, Switch, TextLink } from '@/ui';

import { useMedicineSource } from '../hooks/useMedicineSource';

/** The mode: a doctor's own choice, or the clinic's with its lock. */
export function MedicineSourceCard() {
  const source = useMedicineSource();

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-section">{source.title}</h2>
        <p className="text-body text-ink-secondary">{source.hint}</p>
      </div>
      <div>
        <Segmented
          label={source.label}
          options={source.options}
          value={source.value}
          onChange={source.choose}
        />
      </div>
      <p className="text-body">{source.description}</p>
      {source.note ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-meta text-ink-secondary">{source.note}</p>
          {source.canUnlock ? (
            <TextLink
              label={source.unlockLabel}
              disabled={source.isSaving}
              onClick={source.unlock}
            />
          ) : null}
        </div>
      ) : null}
      {source.canLock ? (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-body">{source.lockLabel}</p>
          <Switch
            label={source.lockLabel}
            checked={source.isLocked}
            disabled={source.isSaving}
            onChange={source.setLocked}
          />
        </div>
      ) : null}
    </Card>
  );
}
