import { Repository } from 'typeorm';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '../domain/value-objects/notification-type';
import { NotificationOrmEntity } from './notification-orm.entity';

export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(private readonly ormRepo: Repository<NotificationOrmEntity>) {}

  async save(notification: Notification): Promise<void> {
    const orm = this.toOrm(notification);
    await this.ormRepo.save(orm);
  }

  async findById(id: string): Promise<Notification | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    if (orm === null) {
      return null;
    }
    return this.toDomain(orm);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const orms = await this.ormRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    const orms = await this.ormRepo.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
    return orms.map((o) => this.toDomain(o));
  }

  async markAsRead(id: string): Promise<void> {
    await this.ormRepo.update(id, { read: true });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  async countUnread(userId: string): Promise<number> {
    return this.ormRepo.count({ where: { userId, read: false } });
  }

  private toOrm(domain: Notification): NotificationOrmEntity {
    const orm = new NotificationOrmEntity();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.type = domain.type.toString();
    orm.title = domain.title;
    orm.message = domain.message;
    orm.matchId = domain.matchId ?? null;
    orm.playerName = domain.playerName ?? null;
    orm.read = domain.read;
    orm.createdAt = domain.createdAt;
    return orm;
  }

  private toDomain(orm: NotificationOrmEntity): Notification {
    return Notification.reconstitute({
      id: orm.id,
      userId: orm.userId,
      type: NotificationType.from(orm.type),
      title: orm.title,
      message: orm.message,
      read: orm.read,
      matchId: orm.matchId ?? undefined,
      playerName: orm.playerName ?? undefined,
      createdAt: orm.createdAt,
    });
  }
}
