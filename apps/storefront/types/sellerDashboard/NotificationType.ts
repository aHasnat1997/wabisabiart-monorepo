export type NotificationType = "warning" | "delay";

export interface NotificationData {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}
