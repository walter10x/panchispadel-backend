import { Notification } from '../../domain/notification.entity';
import { NotificationResponseDTO } from '../dtos/notification-response.dto';

export class NotificationMapper {
  static toResponse(notification: Notification): NotificationResponseDTO {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type.toString(),
      title: notification.title,
      message: notification.message,
      read: notification.read,
      matchId: notification.matchId,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
