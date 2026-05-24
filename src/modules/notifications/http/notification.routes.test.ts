import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { errorHandler } from '../../../shared/infrastructure/http/error-handler';
import { NotificationController } from './notification.controller';
import { createNotificationRoutes } from './notification.routes';
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

function generateToken(userId: string): string {
  return jwt.sign({ userId, email: `${userId}@test.com` }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

describe('NotificationRoutes', () => {
  let app: express.Express;
  let repo: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    const getUseCase = new GetUserNotificationsUseCase(repo);
    const markUseCase = new MarkAsReadUseCase(repo);
    const countUseCase = new GetUnreadCountUseCase(repo);
    const controller = new NotificationController(getUseCase, markUseCase, countUseCase);

    app = express();
    app.use(express.json());
    app.use('/api/notifications', createNotificationRoutes(controller));
    app.use(errorHandler);
  });

  describe('GET /api/notifications', () => {
    it('devuelve 200 con notificaciones del usuario', async () => {
      const notification = Notification.reconstitute({
        id: 'n1', userId: 'user-1',
        type: NotificationType.from('match_created'),
        title: 'Título', message: 'Mensaje',
        read: false, matchId: undefined,
        createdAt: new Date(),
      });
      repo.findByUser.mockResolvedValue([notification]);

      const token = generateToken('user-1');
      const res = await supertest(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]?.id).toBe('n1');
    });

    it('devuelve 401 sin token', async () => {
      const res = await supertest(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('devuelve 200 con conteo', async () => {
      repo.countUnread.mockResolvedValue(3);

      const token = generateToken('user-1');
      const res = await supertest(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 3 });
    });

    it('devuelve 401 sin token', async () => {
      const res = await supertest(app).get('/api/notifications/unread-count');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/notifications/:notificationId/read', () => {
    it('devuelve 200 después de marcar como leída', async () => {
      const notification = Notification.reconstitute({
        id: 'n1', userId: 'user-1',
        type: NotificationType.from('match_created'),
        title: 'Título', message: 'Mensaje',
        read: false, matchId: undefined,
        createdAt: new Date(),
      });
      repo.findById.mockResolvedValue(notification);
      repo.markAsRead.mockResolvedValue();

      const token = generateToken('user-1');
      const res = await supertest(app)
        .patch('/api/notifications/n1/read')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 'n1', read: true });
    });

    it('devuelve 401 sin token', async () => {
      const res = await supertest(app).patch('/api/notifications/n1/read');
      expect(res.status).toBe(401);
    });
  });
});
