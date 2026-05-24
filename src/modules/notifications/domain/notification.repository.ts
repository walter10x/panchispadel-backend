import { Notification } from './notification.entity';

export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findByUser(userId: string): Promise<Notification[]>;
  findUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
