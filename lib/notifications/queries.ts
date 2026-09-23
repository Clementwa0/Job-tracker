import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications, type Notification } from "@/lib/db/schema";
import type { AppNotification } from "@/types/notification";

/** In-app notifications that have been delivered (not scheduled-for-later or failed). */
const visibleTo = (userId: string) =>
  and(
    eq(notifications.userId, userId),
    eq(notifications.channel, "in_app"),
    inArray(notifications.status, ["sent", "read"]),
  );

export function toNotificationDto(row: Notification): AppNotification {
  return {
    id: row.id,
    type: row.type as AppNotification["type"],
    channel: row.channel,
    title: row.title,
    body: row.body,
    payload: row.payload,
    status: row.status,
    scheduledAt: row.scheduledAt?.toISOString(),
    sentAt: row.sentAt?.toISOString(),
    readAt: row.readAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function unreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(visibleTo(userId), eq(notifications.status, "sent")));
  return row.n;
}

export async function listNotifications(
  userId: string,
  options: { page: number; limit: number; unreadOnly: boolean },
) {
  const where = options.unreadOnly
    ? and(visibleTo(userId), eq(notifications.status, "sent"))
    : visibleTo(userId);

  const [rows, [total], unread] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(options.limit)
      .offset((options.page - 1) * options.limit),
    db.select({ n: count() }).from(notifications).where(where),
    unreadCount(userId),
  ]);

  return {
    data: rows.map(toNotificationDto),
    meta: {
      page: options.page,
      limit: options.limit,
      total: total.n,
      totalPages: Math.max(1, Math.ceil(total.n / options.limit)),
      unreadCount: unread,
    },
  };
}

/** Marks one of the caller's notifications read. Idempotent; null if it isn't theirs. */
export async function markRead(userId: string, id: string): Promise<AppNotification | null> {
  const now = new Date();
  const [updated] = await db
    .update(notifications)
    .set({ status: "read", readAt: now, updatedAt: now })
    .where(
      and(eq(notifications.id, id), eq(notifications.userId, userId), eq(notifications.status, "sent")),
    )
    .returning();
  if (updated) return toNotificationDto(updated);

  // Already read (or not theirs): return it if it's theirs.
  const [existing] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .limit(1);
  return existing ? toNotificationDto(existing) : null;
}

export async function markAllRead(userId: string): Promise<number> {
  const now = new Date();
  const updated = await db
    .update(notifications)
    .set({ status: "read", readAt: now, updatedAt: now })
    .where(and(visibleTo(userId), eq(notifications.status, "sent")))
    .returning({ id: notifications.id });
  return updated.length;
}
