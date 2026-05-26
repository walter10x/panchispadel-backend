import { v4 as uuid } from 'uuid';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { NotificationType } from './value-objects/notification-type';

export interface NotificationCreateParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  matchId?: string;
  playerName?: string;
}

export interface NotificationReconstituteParams {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  matchId: string | undefined;
  playerName: string | undefined;
  createdAt: Date;
}

export class Notification extends BaseEntity {
  public readonly userId: string;
  public readonly type: NotificationType;
  public readonly title: string;
  public readonly message: string;
  public readonly matchId: string | undefined;
  public readonly playerName: string | undefined;
  public read: boolean;

  private constructor(
    id: string,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    read: boolean,
    matchId: string | undefined,
    playerName: string | undefined,
    createdAt: Date,
  ) {
    super(id, createdAt);
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.read = read;
    this.matchId = matchId;
    this.playerName = playerName;
  }

  static create(params: NotificationCreateParams): Notification {
    return new Notification(
      uuid(),
      params.userId,
      params.type,
      params.title,
      params.message,
      false,
      params.matchId,
      params.playerName,
      new Date(),
    );
  }

  static reconstitute(params: NotificationReconstituteParams): Notification {
    return new Notification(
      params.id,
      params.userId,
      params.type,
      params.title,
      params.message,
      params.read,
      params.matchId,
      params.playerName,
      params.createdAt,
    );
  }

  markAsRead(): void {
    this.read = true;
  }
}
