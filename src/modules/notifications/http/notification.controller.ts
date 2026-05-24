import { Request, Response, NextFunction } from 'express';
import { GetUserNotificationsUseCase } from '../application/get-user-notifications.use-case';
import { MarkAsReadUseCase } from '../application/mark-as-read.use-case';
import { GetUnreadCountUseCase } from '../application/get-unread-count.use-case';

export class NotificationController {
  constructor(
    private readonly getUseCase: GetUserNotificationsUseCase,
    private readonly markUseCase: MarkAsReadUseCase,
    private readonly countUseCase: GetUnreadCountUseCase,
  ) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await this.getUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params['notificationId']!;
      const result = await this.markUseCase.execute({ notificationId, userId });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await this.countUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
