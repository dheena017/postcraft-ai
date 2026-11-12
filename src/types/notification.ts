export type NotificationType =
  | 'SYSTEM'
  | 'STUDIO'
  | 'QUEUE'
  | 'PIN'
  | 'ALERT'
  | 'SHEET';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
  totalCount: number;
}

