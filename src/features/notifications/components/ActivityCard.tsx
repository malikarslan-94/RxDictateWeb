import { Card } from '@/ui';

import { ACTIVITY_LIMIT } from '../constants';
import { notificationsCopy } from '../copy';
import type { Inbox } from '../hooks/useInbox';
import { NotificationRow } from './NotificationRow';

/** Today's side card: what the assistant and the clinic did lately. */
export function ActivityCard({ inbox }: { inbox: Inbox }) {
  const items = inbox.items.slice(0, ACTIVITY_LIMIT);
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-section">{notificationsCopy.activity}</h2>
      {items.length === 0 ? (
        <p className="text-meta text-ink-secondary">
          {notificationsCopy.noActivity}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} onOpen={item.open} />
          ))}
        </ul>
      )}
    </Card>
  );
}
