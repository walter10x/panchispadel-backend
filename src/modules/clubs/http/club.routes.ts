import { Router } from 'express';
import { ClubController } from './club.controller';

interface ClubControllers {
  clubController: ClubController;
}

export function createClubRoutes(controllers: ClubControllers): Router {
  const { clubController } = controllers;
  const router = Router();

  router.get('/', clubController.list);
  router.get('/:clubId', clubController.getById);

  return router;
}
