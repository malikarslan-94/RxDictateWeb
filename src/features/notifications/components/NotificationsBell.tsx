import { ReportDialog } from '@/features/reports';
import { IconButton, Popover, TextLink } from '@/ui';

import { notificationsCopy } from '../copy';
import type { Inbox } from '../hooks/useInbox';
import { NotificationRow } from './NotificationRow';

/**
 * The bell at the top right, its unread count, and the latest updates. A
 * report one of them opens is read over the page; it's drawn here because
 * every page with an inbox has the bell, Activity rows included.
 */
export function NotificationsBell({ inbox }: { inbox: Inbox }) {
  return (
    <>
      <Popover
        isOpen={inbox.isOpen}
        onClose={inbox.close}
        align="end"
        className="w-96 p-4"
        anchor={
          <span className="relative inline-flex">
            <IconButton
              icon="bell"
              label={inbox.bellLabel}
              onClick={inbox.toggle}
            />
            {inbox.unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-badge px-1 text-chip text-ink-on-primary">
                {notificationsCopy.badge(inbox.unreadCount)}
              </span>
            ) : null}
          </span>
        }
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-section">{notificationsCopy.title}</p>
          {inbox.canMarkAllRead ? (
            <TextLink
              label={notificationsCopy.markAllRead}
              onClick={inbox.markAllRead}
            />
          ) : null}
        </div>
        {inbox.items.length === 0 ? (
          <p className="text-meta text-ink-secondary">
            {notificationsCopy.empty}
          </p>
        ) : (
          <ul className="flex max-h-96 flex-col gap-4 overflow-y-auto">
            {inbox.items.map((item) => (
              <NotificationRow key={item.id} item={item} onOpen={item.open} />
            ))}
          </ul>
        )}
      </Popover>
      {inbox.reportId ? (
        <ReportDialog reportId={inbox.reportId} onClose={inbox.closeReport} />
      ) : null}
    </>
  );
}
