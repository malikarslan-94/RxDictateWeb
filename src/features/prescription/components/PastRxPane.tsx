import { PrintPreview, StateMessage } from '@/components';
import { Button, Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';
import type { usePastPrescriptions } from '../hooks/usePastPrescriptions';

const copy = rxCopy.pastRx;

export type PastRxPaneProps = {
  past: ReturnType<typeof usePastPrescriptions>;
  onSaveTemplate: () => void;
};

/** Earlier prescriptions on the left, the chosen one's page beside. */
export function PastRxPane({ past, onSaveTemplate }: PastRxPaneProps) {
  if (past.items.length === 0) {
    return (
      <StateMessage
        isLoading={past.isLoading}
        error={past.error}
        onRetry={past.retry}
        empty={past.emptyText}
      />
    );
  }
  return (
    <div className="flex items-start gap-6">
      <ul className="flex w-panel shrink-0 flex-col gap-2">
        {past.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={item.isSelected}
              onClick={item.select}
              className={cx(
                'flex w-full flex-col gap-1 rounded-card border p-4 text-left transition-colors',
                item.isSelected
                  ? 'border-primary bg-primary-tint'
                  : 'border-border hover:border-primary',
              )}
            >
              <span className="text-body font-bold">{item.title}</span>
              <span className="text-meta text-ink-secondary">{item.line}</span>
              {item.diagnosis ? (
                <span className="line-clamp-2 text-body">{item.diagnosis}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex justify-end gap-2">
          <Button
            label={copy.saveTemplate}
            variant="secondary"
            size="small"
            icon={<Icon name="template" className="size-4" />}
            onClick={onSaveTemplate}
          />
          {past.openPrint ? (
            <Button
              label={copy.printPreview}
              variant="secondary"
              size="small"
              icon={<Icon name="printer" className="size-4" />}
              onClick={past.openPrint}
            />
          ) : null}
        </div>
        <div className="rounded-sheet bg-primary-soft p-4">
          {past.printout ? (
            <PrintPreview printout={past.printout} options={past.options} />
          ) : (
            <StateMessage isLoading />
          )}
        </div>
      </div>
    </div>
  );
}
