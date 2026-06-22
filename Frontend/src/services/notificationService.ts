import axiosInstance from "@/lib/axiosInstance";
import type { AppNotification, NotificationListMeta } from "@/types/notification";

interface ListResponse {
  success: boolean;
  data: AppNotification[];
  meta: NotificationListMeta;
}

interface UnreadResponse {
  success: boolean;
  data: { unreadCount: number };
}

export const notificationService = {
  async list(params?: { page?: number; limit?: number; unread?: boolean }) {
    const { data } = await axiosInstance.get<ListResponse>("/notifications", { params });
    return data;
  },

  async getUnreadCount() {
    const { data } = await axiosInstance.get<UnreadResponse>("/notifications/unread-count");
    return data.data.unreadCount;
  },

  async markRead(id: string) {
    const { data } = await axiosInstance.patch<{ success: boolean; data: AppNotification }>(
      `/notifications/${id}/read`,
    );
    return data.data;
  },

  async markAllRead() {
    const { data } = await axiosInstance.patch<{ success: boolean; data: { modified: number } }>(
      "/notifications/read-all",
    );
    return data.data.modified;
  },
};
