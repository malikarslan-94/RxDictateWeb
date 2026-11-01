import { z } from 'zod';

import { notificationsMetaSchema, notificationViewSchema } from '@/contract';
import type { NotificationView } from '@/contract';
import { ApiTag, baseApi } from '@/lib/api';

export type Inbox = {
  items: NotificationView[];
  /** Every unread notification for this person, not just this page. */
  unread: number;
  /** Every notification for this person, so the list knows if there's more. */
  total: number;
};

const markReadResultSchema = z.object({
  read: z.number().int(),
  unread: z.number().int(),
});

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Newest first, with the unread total in the envelope's meta. */
    listNotifications: build.query<Inbox, number>({
      query: (limit) => ({ url: '/notifications', params: { limit } }),
      rawResponseSchema: z.array(notificationViewSchema),
      transformResponse: (items: NotificationView[], meta) => {
        const parsed = notificationsMetaSchema.safeParse(meta?.envelope);
        return {
          items,
          unread: parsed.success
            ? parsed.data.unread
            : items.filter((item) => !item.readAt).length,
          total: parsed.success ? parsed.data.total : items.length,
        };
      },
      providesTags: [ApiTag.Notification],
    }),
    markNotificationsRead: build.mutation<
      z.infer<typeof markReadResultSchema>,
      string[]
    >({
      extraOptions: { quiet: true },
      query: (ids) => ({
        url: '/notifications/read',
        method: 'POST',
        body: { ids },
      }),
      rawResponseSchema: markReadResultSchema,
      invalidatesTags: [ApiTag.Notification],
    }),
  }),
});

export const { useListNotificationsQuery, useMarkNotificationsReadMutation } =
  notificationsApi;
