import { notificationTypeSchema } from '@/contract';
import type { NotificationType as AnyNotificationType } from '@/contract';
import type { IconName } from '@/ui';

/** `NotificationType['report.uploaded']`, … — straight from the contract. */
export const NotificationType = notificationTypeSchema.enum;
export type NotificationType = AnyNotificationType;

/** Fetched for the bell's unread count and the latest few. */
export const INBOX_PAGE_SIZE = 20;

/** How many the Activity card on Today shows. */
export const ACTIVITY_LIMIT = 4;

/** "5 min ago" in the bell and Activity moves on this often. */
export const INBOX_TICK_MS = 30_000;

const QUIET = 'bg-neutral-soft text-ink-secondary';

/** How each kind of notification is marked in a list: icon, and its circle. */
export const NOTIFICATION_ICON: Record<
  NotificationType,
  { icon: IconName; className: string }
> = {
  'patient.added': { icon: 'plus', className: QUIET },
  'visit.statusChanged': { icon: 'activity', className: QUIET },
  'prescription.approved': { icon: 'check', className: QUIET },
  'prescription.revised': { icon: 'file', className: QUIET },
  'member.added': { icon: 'users', className: QUIET },
  'member.removed': { icon: 'users', className: QUIET },
  'member.locationsChanged': { icon: 'users', className: QUIET },
  'location.added': { icon: 'mapPin', className: QUIET },
  'location.archived': { icon: 'mapPin', className: QUIET },
  'report.uploaded': { icon: 'file', className: QUIET },
  'vitals.recorded': { icon: 'activity', className: QUIET },
  'appointment.booked': { icon: 'calendar', className: QUIET },
  'voice.segmentFailed': {
    icon: 'alert',
    className: 'bg-danger-soft text-danger',
  },
};
