import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '../domain/value-objects/notification-type';
import { NotificationMapper } from './mappers/notification.mapper';
import { CreateNotificationDTO } from './dtos/create-notification.dto';
import { NotificationResponseDTO } from './dtos/notification-response.dto';
import { IPushNotificationService } from '../../device-tokens/domain/push-notification-service';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_NOTIFICATION_NEW } from '../../websocket/domain/ws-events';
import type { NotificationNewPayload } from '../../websocket/domain/ws-events';

export class CreateNotificationUseCase {
  constructor(
    private readonly repo: INotificationRepository,
    private readonly pushService?: IPushNotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(dto: CreateNotificationDTO): Promise<NotificationResponseDTO> {
    const type = NotificationType.create(dto.type);

    const notification = Notification.create({
      userId: dto.userId,
      type,
      title: dto.title,
      message: dto.message,
      ...(dto.matchId !== undefined ? { matchId: dto.matchId } : {}),
    });

    await this.repo.save(notification);

    // Push notification (Firebase)
    if (this.pushService !== undefined) {
      await this.pushService.sendToUser(dto.userId, dto.title, dto.message, {
        type: dto.type,
        ...(dto.matchId !== undefined ? { matchId: dto.matchId } : {}),
      });
    }

    // Real-time WebSocket notification
    if (this.wsGateway !== undefined) {
      const payload: NotificationNewPayload = {
        notificationId: notification.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        ...(dto.matchId !== undefined ? { matchId: dto.matchId } : {}),
        ...(dto.playerId !== undefined ? { playerId: dto.playerId } : {}),
        timestamp: notification.createdAt.toISOString(),
      };
      this.wsGateway.emitToUser(dto.userId, WS_EVENT_NOTIFICATION_NEW, payload);
    }

    return NotificationMapper.toResponse(notification);
  }
}
