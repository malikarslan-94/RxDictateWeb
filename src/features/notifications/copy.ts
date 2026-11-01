export const notificationsCopy = {
  title: 'Notifications',
  activity: 'Activity',
  noActivity: 'Nothing yet today. Your assistant’s updates show up here.',
  empty: 'Nothing yet. Updates from your clinic show up here.',
  markAllRead: 'Mark all as read',
  unread: 'Unread',
  /** Past nine the exact number stops mattering. */
  badge: (count: number) => (count > 9 ? '9+' : String(count)),
  bell: (count: number) =>
    count === 0 ? 'Notifications' : `Notifications, ${count} unread`,
} as const;
