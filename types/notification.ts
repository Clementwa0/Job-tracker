export type NotificationType =
  | "job.published"
  | "job.pending_review"
  | "job.approved"
  | "job.rejected"
  | "company.approved"
  | "company.suspended"
  | "interview.reminder";

export type NotificationChannel = "in_app" | "email";
export type NotificationStatus = "pending" | "sent" | "read" | "failed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  createdAt?: string;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}
