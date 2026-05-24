import { Router } from 'express';
import { authMiddleware } from '../../../shared/infrastructure/http/auth-middleware';
import { NotificationController } from './notification.controller';

export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  router.get('/', authMiddleware, (req, res, next) => controller.list(req, res, next));
  router.get('/unread-count', authMiddleware, (req, res, next) =>
    controller.getUnreadCount(req, res, next),
  );
  router.patch('/:notificationId/read', authMiddleware, (req, res, next) =>
    controller.markAsRead(req, res, next),
  );

  return router;
}
