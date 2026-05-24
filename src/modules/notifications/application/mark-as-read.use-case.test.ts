import { MarkAsReadUseCase } from './mark-as-read.use-case';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '../domain/value-objects/notification-type';
import { NotFoundError } from '../../../shared/domain/errors/not-found-error';
import { UnauthorizedError } from '../../../shared/domain/errors/unauthorized-error';

function createMockRepo(): jest.Mocked<INotificationRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findUnreadByUser: jest.fn(),
    markAsRead: jest.fn(),
    delete: jest.fn(),
    countUnread: jest.fn(),
  };
}

function makeNotification(
  id: string,
  userId: string,
  read: boolean,
): Notification {
  return Notification.reconstitute({
    id,
    userId,
    type: NotificationType.from('match_created'),
    title: 'Título',
    message: 'Mensaje',
    read,
    matchId: undefined,
    createdAt: new Date(),
  });
}

describe('MarkAsReadUseCase', () => {
  it('marca notificación como leída y devuelve response', async () => {
    const repo = createMockRepo();
    const useCase = new MarkAsReadUseCase(repo);

    const notification = makeNotification('n1', 'user-1', false);
    repo.findById.mockResolvedValue(notification);
    repo.markAsRead.mockResolvedValue();

    const result = await useCase.execute({ notificationId: 'n1', userId: 'user-1' });

    expect(repo.findById).toHaveBeenCalledWith('n1');
    expect(repo.markAsRead).toHaveBeenCalledWith('n1');
    expect(result.id).toBe('n1');
    expect(result.read).toBe(true);
  });

  it('lanza NotFoundError si la notificación no existe', async () => {
    const repo = createMockRepo();
    const useCase = new MarkAsReadUseCase(repo);

    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ notificationId: 'no-existe', userId: 'user-1' }),
    ).rejects.toThrow(NotFoundError);

    expect(repo.markAsRead).not.toHaveBeenCalled();
  });

  it('lanza UnauthorizedError si la notificación no pertenece al usuario', async () => {
    const repo = createMockRepo();
    const useCase = new MarkAsReadUseCase(repo);

    const notification = makeNotification('n1', 'user-other', false);
    repo.findById.mockResolvedValue(notification);

    await expect(
      useCase.execute({ notificationId: 'n1', userId: 'user-1' }),
    ).rejects.toThrow(UnauthorizedError);

    expect(repo.markAsRead).not.toHaveBeenCalled();
  });
});
