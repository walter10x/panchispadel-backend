import { INotificationRepository } from '../domain/notification.repository';
import { NotificationMapper } from './mappers/notification.mapper';
import { NotificationResponseDTO } from './dtos/notification-response.dto';

export class GetUserNotificationsUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<NotificationResponseDTO[]> {
    const notifications = await this.repo.findByUser(userId);

    return notifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((n) => NotificationMapper.toResponse(n));
  }
}
