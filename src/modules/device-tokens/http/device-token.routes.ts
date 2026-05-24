import { Router } from 'express';
import { authMiddleware } from '../../../shared/infrastructure/http/auth-middleware';
import { validateBody } from '../../../shared/infrastructure/http/validate-middleware';
import { registerDeviceTokenSchema } from '../application/dtos/register-device-token.dto';
import { DeviceTokenController } from './device-token.controller';

export function createDeviceTokenRoutes(controller: DeviceTokenController): Router {
  const router = Router();

  router.post(
    '/register-token',
    authMiddleware,
    validateBody(registerDeviceTokenSchema),
    (req, res, next) => controller.registerToken(req, res, next),
  );

  return router;
}
