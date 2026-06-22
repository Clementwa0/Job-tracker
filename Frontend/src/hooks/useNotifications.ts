import { useCallback, useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import type { AppNotification } from "@/types/notification";

export function useNotifications(options?: { pollMs?: number }) {
  const pollMs = options?.pollMs ?? 60_000;
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [listRes, count] = await Promise.all([
        notificationService.list({ limit: 10 }),
        notificationService.getUnreadCount(),
      ]);
      setItems(listRes.data);
      setUnreadCount(count);
    } catch {
      // Scaffold — fail silently until notifications are wired end-to-end
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, pollMs);
    return () => window.clearInterval(id);
  }, [refresh, pollMs]);

  const markRead = useCallback(async (id: string) => {
    await notificationService.markRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" as const, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setItems((prev) =>
      prev.map((n) => ({ ...n, status: "read" as const, readAt: new Date().toISOString() })),
    );
    setUnreadCount(0);
  }, []);

  return { items, unreadCount, isLoading, refresh, markRead, markAllRead };
}
