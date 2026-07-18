import { Router, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AdminController } from './admin.controller';
import {
  createClubSchema,
  updateClubSchema,
  updateUserRoleSchema,
} from './validators/admin.validators';

interface AdminMiddlewares {
  authMiddleware: RequestHandler;
  requireAdmin: RequestHandler;
  validateBody: (schema: ZodSchema) => RequestHandler;
}

export function createAdminRoutes(
  controller: AdminController,
  middlewares: AdminMiddlewares,
): Router {
  const router = Router();
  const guard = [middlewares.authMiddleware, middlewares.requireAdmin];

  router.post(
    '/clubs',
    ...guard,
    middlewares.validateBody(createClubSchema),
    controller.createClub,
  );

  router.patch(
    '/clubs/:clubId',
    ...guard,
    middlewares.validateBody(updateClubSchema),
    controller.updateClub,
  );

  router.delete('/clubs/:clubId', ...guard, controller.deleteClub);

  router.get('/users', ...guard, controller.listUsers);

  router.patch(
    '/users/:userId/role',
    ...guard,
    middlewares.validateBody(updateUserRoleSchema),
    controller.updateUserRole,
  );

  return router;
}
