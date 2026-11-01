import type { NotificationType } from '@/contract';

/** One notification as a list shows it. */
export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** "5 min ago". */
  time: string;
  isUnread: boolean;
};

/** Where opening a notification goes, for the role that opened it. */
export type InboxDestination =
  { kind: 'report'; reportId: string } | { kind: 'page'; path: string };
