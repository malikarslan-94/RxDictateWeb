import { Icon } from '@/ui';
import { cx } from '@/utils/classes';

import { NOTIFICATION_ICON } from '../constants';
import type { NotificationItem } from '../types';

export type NotificationRowProps = {
  item: NotificationItem;
  /** Marks it read and goes to what it's about. */
  onOpen: () => void;
};

/** One update: what kind, what happened, when. Unread ones carry a dot. */
export function NotificationRow({ item, onOpen }: NotificationRowProps) {
  const marker = NOTIFICATION_ICON[item.type];
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-xs text-left transition-colors hover:bg-primary-tint"
      >
        <span
          className={cx(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            marker.className,
          )}
        >
          <Icon name={marker.icon} className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-meta">
            <strong>{item.title}</strong>
            {item.body ? ` ${item.body}` : ''}
          </span>
          <span className="block text-meta text-ink-secondary">
            {item.time}
          </span>
        </span>
        {item.isUnread ? (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-badge" />
        ) : null}
      </button>
    </li>
  );
}
