import { GetUnreadCountUseCase } from './get-unread-count.use-case';
import { INotificationRepository } from '../domain/notification.repository';

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

describe('GetUnreadCountUseCase', () => {
  it('devuelve el conteo de no leídas', async () => {
    const repo = createMockRepo();
    const useCase = new GetUnreadCountUseCase(repo);

    repo.countUnread.mockResolvedValue(5);

    const result = await useCase.execute('user-1');

    expect(repo.countUnread).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ count: 5 });
  });

  it('devuelve 0 si no hay no leídas', async () => {
    const repo = createMockRepo();
    const useCase = new GetUnreadCountUseCase(repo);

    repo.countUnread.mockResolvedValue(0);

    const result = await useCase.execute('user-1');

    expect(result).toEqual({ count: 0 });
  });
});
