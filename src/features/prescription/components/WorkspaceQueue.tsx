import { HotkeyLabel } from '@/constants/keys';
import { Icon, Kbd, Spinner } from '@/ui';
import { cx } from '@/utils/classes';

import { rxCopy } from '../copy';
import type { useWorkspaceQueue } from '../hooks/useWorkspaceQueue';

export type WorkspaceQueueProps = {
  queue: ReturnType<typeof useWorkspaceQueue>;
};

/** Today's list down the side: pick a patient to move the prescription. */
export function WorkspaceQueue({ queue }: WorkspaceQueueProps) {
  return (
    <nav
      aria-label={queue.title}
      className="flex w-queue shrink-0 flex-col border-r border-border bg-surface"
    >
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <p className="text-label">{queue.title}</p>
        {queue.place ? (
          <p className="flex items-center gap-1 text-meta text-ink-secondary">
            <Icon name="mapPin" className="size-3.5" />
            <span className="max-w-20 truncate">{queue.place}</span>
          </p>
        ) : null}
      </div>
      {queue.isLoading ? (
        <div className="flex justify-center py-6 text-primary">
          <Spinner />
        </div>
      ) : null}
      <ol className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {queue.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-current={item.isCurrent ? 'page' : undefined}
              onClick={item.open}
              className={cx(
                'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                item.isCurrent ? 'bg-primary-soft' : 'hover:bg-primary-tint',
              )}
            >
              <span
                className={cx(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-meta font-bold',
                  item.isCurrent
                    ? 'bg-primary text-ink-on-primary'
                    : 'bg-primary-tint text-primary-strong',
                )}
              >
                {item.token}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-meta font-bold">
                  {item.name}
                </span>
                <span className="block truncate text-chip font-normal text-ink-secondary">
                  {item.line}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="flex items-center gap-2 border-t border-border px-4 py-3 text-meta text-ink-secondary">
        {rxCopy.workspace.nextPatient} <Kbd keys={HotkeyLabel.nextPatient} />
      </p>
    </nav>
  );
}
