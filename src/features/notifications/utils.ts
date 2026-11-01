import { Routes, consultPath, printPath } from '@/constants/routes';
import type { NotificationView, VisitView } from '@/contract';
import { formatTimeAgo } from '@/utils/date';

import { NotificationType } from './constants';
import type { InboxDestination, NotificationItem } from './types';

export function toNotificationItem(
  notification: NotificationView,
  now: Date = new Date(),
): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    time: formatTimeAgo(notification.createdAt, now),
    isUnread: notification.readAt === null,
  };
}

/**
 * What a notification is about, as a place this role may go. A visit's
 * news names the visit, so its patient comes from today's list; a visit
 * that isn't on it has nowhere to go.
 */
export function destinationOf(
  notification: Pick<NotificationView, 'type' | 'refId'>,
  isDoctor: boolean,
  todayVisits: readonly VisitView[],
): InboxDestination | null {
  const id = notification.refId;
  if (!id) return null;
  switch (notification.type) {
    case NotificationType['report.uploaded']:
      return { kind: 'report', reportId: id };
    case NotificationType['prescription.approved']:
    case NotificationType['prescription.revised']:
      return { kind: 'page', path: printPath(id) };
    case NotificationType['visit.statusChanged']:
    case NotificationType['vitals.recorded']: {
      if (!isDoctor) return null;
      const visit = todayVisits.find((item) => item.id === id);
      return visit
        ? { kind: 'page', path: consultPath(visit.patientId, visit.id) }
        : null;
    }
    case NotificationType['appointment.booked']:
      return isDoctor ? null : { kind: 'page', path: Routes.schedule };
    default:
      return null;
  }
}
