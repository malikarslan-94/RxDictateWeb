import {
  PageHeader,
  PrintDocument,
  PrintPreview,
  StateMessage,
} from '@/components';
import { Button, Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { PrintActions } from '../components/PrintActions';
import { PrintSettingsCard } from '../components/PrintSettingsCard';
import { printingCopy } from '../copy';
import { usePrintQueue } from '../hooks/usePrintQueue';

/** Approved prescriptions waiting at reception: print, mark, next. */
export function PrintQueueScreen() {
  const queue = usePrintQueue();
  const { printout } = queue;

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <PageHeader icon="printer" meta={queue.meta} title={queue.title} />
      <div className="flex items-start gap-6">
        <section className="flex w-56 shrink-0 flex-col gap-3">
          <h2 className="text-section">{queue.readyTitle}</h2>
          {queue.items.length === 0 ? (
            <StateMessage isLoading={queue.isLoading} empty={queue.emptyText} />
          ) : (
            <ul className="flex flex-col gap-1 rounded-card border border-border bg-surface p-2">
              {queue.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={item.isSelected ? 'true' : undefined}
                    onClick={item.select}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left',
                      item.isSelected
                        ? 'bg-primary-tint'
                        : 'hover:bg-primary-tint',
                    )}
                  >
                    <span
                      className={cx(
                        'flex size-9 shrink-0 items-center justify-center rounded-full text-meta font-bold',
                        item.isSelected
                          ? 'bg-primary text-ink-on-primary'
                          : 'bg-primary-tint text-primary-strong',
                      )}
                    >
                      {item.token}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-body font-bold">
                        {item.name}
                      </span>
                      <span className="block text-meta text-ink-secondary">
                        {item.approved}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {queue.printedNote ? (
            <p className="text-meta text-ink-secondary">{queue.printedNote}</p>
          ) : null}
        </section>

        <div className="min-w-0 flex-1 rounded-sheet bg-primary-soft p-8">
          {printout.printout ? (
            <div className="mx-auto max-w-a4-width">
              <PrintPreview
                printout={printout.printout}
                options={queue.settings.options}
              />
            </div>
          ) : (
            <StateMessage
              isLoading={printout.isLoading}
              error={printout.error}
            />
          )}
        </div>

        <div className="flex w-panel shrink-0 flex-col gap-4">
          <PrintSettingsCard settings={queue.settings} />
          <PrintActions printout={printout} />
          {queue.markPrintedNext ? (
            <Button
              label={printingCopy.actions.markPrinted}
              variant="tonal"
              fullWidth
              icon={<Icon name="check" className="size-4" />}
              onClick={queue.markPrintedNext}
            />
          ) : null}
        </div>
      </div>
      {printout.printout ? (
        <PrintDocument
          printout={printout.printout}
          options={queue.settings.options}
        />
      ) : null}
    </div>
  );
}
