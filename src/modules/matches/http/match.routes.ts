import { Router } from 'express';
import { authMiddleware } from '../../../shared/infrastructure/http/auth-middleware';
import { validateBody } from '../../../shared/infrastructure/http/validate-middleware';
import { MatchController } from './match.controller';
import { createMatchSchema } from './validators/create-match.validator';
import { updateMatchSchema } from './validators/update-match.validator';

export function createMatchRoutes(controller: MatchController): Router {
  const router = Router();

  router.post(
    '/',
    authMiddleware,
    validateBody(createMatchSchema),
    controller.create,
  );

  router.get(
    '/my',
    authMiddleware,
    controller.listMy,
  );

  router.get(
    '/:matchId',
    authMiddleware,
    controller.getById,
  );

  router.put(
    '/:matchId',
    authMiddleware,
    validateBody(updateMatchSchema),
    controller.update,
  );

  router.delete(
    '/:matchId',
    authMiddleware,
    controller.delete,
  );

  router.post(
    '/:matchId/join',
    authMiddleware,
    controller.join,
  );

  router.post(
    '/:matchId/leave',
    authMiddleware,
    controller.leave,
  );

  router.post(
    '/:matchId/cancel',
    authMiddleware,
    controller.cancel,
  );

  router.post(
    '/:matchId/confirm/:playerId',
    authMiddleware,
    controller.confirmPlayer,
  );

  router.post(
    '/:matchId/reject/:playerId',
    authMiddleware,
    controller.rejectPlayer,
  );

  router.get(
    '/',
    authMiddleware,
    controller.list,
  );

  return router;
}
