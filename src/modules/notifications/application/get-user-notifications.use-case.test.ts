import { GetUserNotificationsUseCase } from './get-user-notifications.use-case';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '../domain/value-objects/notification-type';
import { NotificationResponseDTO } from './dtos/notification-response.dto';

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
  typeValue: string,
  read: boolean,
  createdAt: Date,
): Notification {
  return Notification.reconstitute({
    id,
    userId,
    type: NotificationType.from(typeValue),
    title: 'Título',
    message: 'Mensaje',
    read,
    matchId: undefined,
    createdAt,
  });
}

describe('GetUserNotificationsUseCase', () => {
  it('devuelve notificaciones del usuario ordenadas por createdAt DESC', async () => {
    const repo = createMockRepo();
    const useCase = new GetUserNotificationsUseCase(repo);

    const older = makeNotification('n1', 'user-1', 'match_created', false, new Date('2024-01-02'));
    const newer = makeNotification('n2', 'user-1', 'match_full', true, new Date('2024-01-03'));

    repo.findByUser.mockResolvedValue([older, newer]);

    const result = await useCase.execute('user-1');

    expect(repo.findByUser).toHaveBeenCalledWith('user-1');
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('n2');
    expect(result[1]?.id).toBe('n1');
  });

  it('devuelve array vacío si no hay notificaciones', async () => {
    const repo = createMockRepo();
    const useCase = new GetUserNotificationsUseCase(repo);

    repo.findByUser.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });

  it('mapea correctamente todos los campos', async () => {
    const repo = createMockRepo();
    const useCase = new GetUserNotificationsUseCase(repo);

    const date = new Date('2024-06-01T10:00:00Z');
    const notification = makeNotification('n1', 'user-1', 'player_joined', false, date);
    repo.findByUser.mockResolvedValue([notification]);

    const result = await useCase.execute('user-1');
    const dto = result[0] as NotificationResponseDTO;

    expect(dto.id).toBe('n1');
    expect(dto.userId).toBe('user-1');
    expect(dto.type).toBe('player_joined');
    expect(dto.title).toBe('Título');
    expect(dto.message).toBe('Mensaje');
    expect(dto.read).toBe(false);
    expect(dto.matchId).toBeUndefined();
    expect(dto.createdAt).toBe(date.toISOString());
  });
});
