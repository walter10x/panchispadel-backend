import { INotificationRepository } from '../domain/notification.repository';
import { NotificationMapper } from './mappers/notification.mapper';
import { MarkAsReadDTO } from './dtos/mark-as-read.dto';
import { NotificationResponseDTO } from './dtos/notification-response.dto';
import { NotFoundError } from '../../../shared/domain/errors/not-found-error';
import { UnauthorizedError } from '../../../shared/domain/errors/unauthorized-error';

export class MarkAsReadUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(dto: MarkAsReadDTO): Promise<NotificationResponseDTO> {
    const notification = await this.repo.findById(dto.notificationId);

    if (notification === null) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== dto.userId) {
      throw new UnauthorizedError('Notification does not belong to this user');
    }

    notification.markAsRead();
    await this.repo.markAsRead(dto.notificationId);

    return NotificationMapper.toResponse(notification);
  }
}
