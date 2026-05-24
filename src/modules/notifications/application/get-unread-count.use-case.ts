import { INotificationRepository } from '../domain/notification.repository';

export class GetUnreadCountUseCase {
  constructor(private readonly repo: INotificationRepository) {}

  async execute(userId: string): Promise<{ count: number }> {
    const count = await this.repo.countUnread(userId);
    return { count };
  }
}
