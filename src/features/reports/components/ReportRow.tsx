import { Icon, StatusChip } from '@/ui';

import { reportsCopy } from '../copy';
import type { ReportItem } from '../types';

export type ReportRowProps = {
  item: ReportItem;
  onOpen: () => void;
};

/** One report: the test, its type, date and pages, and whether it's new. */
export function ReportRow({ item, onOpen }: ReportRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-label={reportsCopy.list.open(item.title)}
        className="flex w-full items-center gap-3 rounded-card border border-border p-4 text-left transition-colors hover:border-primary"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-strong">
          <Icon name="file" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-body font-bold">{item.title}</span>
            {item.isNew ? (
              <StatusChip label={reportsCopy.isNew} tone="waiting" />
            ) : null}
          </span>
          <span className="block text-meta text-ink-secondary">
            {item.line}
          </span>
        </span>
        <Icon name="chevronRight" className="size-4 text-ink-secondary" />
      </button>
    </li>
  );
}
