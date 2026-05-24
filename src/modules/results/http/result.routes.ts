import { Router } from 'express';
import { authMiddleware } from '../../../shared/infrastructure/http/auth-middleware';
import { validateBody } from '../../../shared/infrastructure/http/validate-middleware';
import { recordResultSchema } from './validators/record-result.validator';
import { ResultController } from './result.controller';

export function createResultRoutes(controller: ResultController): Router {
  const router = Router();

  router.post(
    '/',
    authMiddleware,
    validateBody(recordResultSchema),
    controller.record,
  );

  router.post(
    '/:resultId/confirm',
    authMiddleware,
    controller.confirm,
  );

  router.get('/match/:matchId', authMiddleware, controller.getByMatch);

  router.get('/:resultId', authMiddleware, controller.getById);

  return router;
}
