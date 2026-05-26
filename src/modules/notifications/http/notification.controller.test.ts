import { NotificationController } from './notification.controller';
import { GetUserNotificationsUseCase } from '../application/get-user-notifications.use-case';
import { MarkAsReadUseCase } from '../application/mark-as-read.use-case';
import { GetUnreadCountUseCase } from '../application/get-unread-count.use-case';
import { INotificationRepository } from '../domain/notification.repository';
import { Notification } from '../domain/notification.entity';
import { NotificationType } from '../domain/value-objects/notification-type';

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

function makeReq(userId: string, params?: Record<string, string>) {
  return {
    user: { userId, email: 'test@test.com' },
    params: params ?? {},
  } as any;
}

function makeRes() {
  const res: any = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function makeNext() {
  return jest.fn();
}

describe('NotificationController', () => {
  describe('list', () => {
    it('devuelve notificaciones del usuario autenticado', async () => {
      const repo = createMockRepo();
      const notifications = [
        Notification.reconstitute({
          id: 'n1', userId: 'user-1',
          type: NotificationType.from('match_created'),
          title: 'Título', message: 'Mensaje',
          read: false, matchId: undefined, playerName: undefined,
          createdAt: new Date(),
        }),
      ];
      repo.findByUser.mockResolvedValue(notifications);

      const getUseCase = new GetUserNotificationsUseCase(repo);
      const markUseCase = new MarkAsReadUseCase(repo);
      const countUseCase = new GetUnreadCountUseCase(repo);
      const controller = new NotificationController(getUseCase, markUseCase, countUseCase);

      const req = makeReq('user-1');
      const res = makeRes();
      const next = makeNext();

      await controller.list(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'n1', userId: 'user-1' }),
        ]),
      );
    });

    it('llama next con error si el caso de uso falla', async () => {
      const repo = createMockRepo();
      repo.findByUser.mockRejectedValue(new Error('DB error'));

      const getUseCase = new GetUserNotificationsUseCase(repo);
      const markUseCase = new MarkAsReadUseCase(repo);
      const countUseCase = new GetUnreadCountUseCase(repo);
      const controller = new NotificationController(getUseCase, markUseCase, countUseCase);

      const req = makeReq('user-1');
      const res = makeRes();
      const next = makeNext();

      await controller.list(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('markAsRead', () => {
    it('marca notificación como leída y devuelve 200', async () => {
      const repo = createMockRepo();
      const notification = Notification.reconstitute({
        id: 'n1', userId: 'user-1',
        type: NotificationType.from('match_created'),
        title: 'Título', message: 'Mensaje',
        read: false, matchId: undefined, playerName: undefined,
        createdAt: new Date(),
      });
      repo.findById.mockResolvedValue(notification);
      repo.markAsRead.mockResolvedValue();

      const getUseCase = new GetUserNotificationsUseCase(repo);
      const markUseCase = new MarkAsReadUseCase(repo);
      const countUseCase = new GetUnreadCountUseCase(repo);
      const controller = new NotificationController(getUseCase, markUseCase, countUseCase);

      const req = makeReq('user-1', { notificationId: 'n1' });
      const res = makeRes();
      const next = makeNext();

      await controller.markAsRead(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'n1', read: true }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('devuelve conteo de no leídas', async () => {
      const repo = createMockRepo();
      repo.countUnread.mockResolvedValue(3);

      const getUseCase = new GetUserNotificationsUseCase(repo);
      const markUseCase = new MarkAsReadUseCase(repo);
      const countUseCase = new GetUnreadCountUseCase(repo);
      const controller = new NotificationController(getUseCase, markUseCase, countUseCase);

      const req = makeReq('user-1');
      const res = makeRes();
      const next = makeNext();

      await controller.getUnreadCount(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ count: 3 });
    });
  });
});
