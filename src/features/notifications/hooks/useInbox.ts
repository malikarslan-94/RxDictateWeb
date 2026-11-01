import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Role } from '@/constants/roles';
import { useListTodayVisitsQuery } from '@/features/visits';
import { useNow } from '@/hooks/useNow';
import { selectActiveRole } from '@/lib/session';
import { useAppSelector } from '@/store/hooks';

import {
  useListNotificationsQuery,
  useMarkNotificationsReadMutation,
} from '../api';
import { INBOX_PAGE_SIZE, INBOX_POLL_MS } from '../constants';
import { notificationsCopy } from '../copy';
import { destinationOf, toNotificationItem } from '../utils';

/** The API marks at most this many read in one call. */
const MARK_READ_LIMIT = 200;

/**
 * The latest notifications, checked every half minute: the bell and its
 * list, and Today's Activity. Opening one marks it read and goes to what
 * it's about, if this role may see it. A failure just means an empty inbox,
 * not an error on every page.
 */
export function useInbox() {
  const navigate = useNavigate();
  const isDoctor = useAppSelector(selectActiveRole) === Role.doctor;
  const { data } = useListNotificationsQuery(INBOX_PAGE_SIZE, {
    pollingInterval: INBOX_POLL_MS,
  });
  const visits = useListTodayVisitsQuery();
  const [markRead] = useMarkNotificationsReadMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const now = useNow(INBOX_POLL_MS);
  const views = data?.items ?? [];
  const unreadIds = views.filter((view) => !view.readAt).map((view) => view.id);
  const unreadCount = data?.unread ?? 0;

  return {
    items: views.map((view) => ({
      ...toNotificationItem(view, now),
      open: () => {
        setIsOpen(false);
        // Marking read is a courtesy: a failure mustn't stop them going on.
        if (!view.readAt) markRead([view.id]).catch(() => undefined);
        const destination = destinationOf(view, isDoctor, visits.data ?? []);
        if (destination?.kind === 'report') setReportId(destination.reportId);
        if (destination?.kind === 'page') navigate(destination.path);
      },
    })),
    unreadCount,
    bellLabel: notificationsCopy.bell(unreadCount),
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    close: () => setIsOpen(false),
    canMarkAllRead: unreadIds.length > 0,
    markAllRead: () => {
      markRead(unreadIds.slice(0, MARK_READ_LIMIT)).catch(() => undefined);
    },
    /** The report a notification opened, read over the page. */
    reportId,
    closeReport: () => setReportId(null),
  };
}

export type Inbox = ReturnType<typeof useInbox>;
