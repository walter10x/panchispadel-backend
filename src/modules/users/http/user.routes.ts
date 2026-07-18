import { Router, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { registerUserSchema } from './validators/register-user.validator';
import { loginUserSchema } from './validators/login-user.validator';

import { refreshTokenSchema } from './validators/refresh-token.validator';

interface UserControllerHandlers {
  register: RequestHandler;
  login: RequestHandler;
  getProfile: RequestHandler;
  refreshToken: RequestHandler;
}

interface UserMiddlewares {
  validateBody: (schema: ZodSchema) => RequestHandler;
  authMiddleware: RequestHandler;
  authRateLimiter: RequestHandler;
}

export function createUserRoutes(
  controllers: UserControllerHandlers,
  middlewares: UserMiddlewares,
): Router {
  const router = Router();

  router.post(
    '/register',
    middlewares.authRateLimiter,
    middlewares.validateBody(registerUserSchema),
    controllers.register,
  );

  router.post(
    '/login',
    middlewares.authRateLimiter,
    middlewares.validateBody(loginUserSchema),
    controllers.login,
  );

  router.post(
    '/refresh',
    middlewares.validateBody(refreshTokenSchema),
    controllers.refreshToken,
  );

  router.get(
    '/me',
    middlewares.authMiddleware,
    controllers.getProfile,
  );

  return router;
}
