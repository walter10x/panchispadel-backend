import { Request, Response, NextFunction } from 'express';
import { ListClubsUseCase } from '../application/list-clubs.use-case';
import { GetClubUseCase } from '../application/get-club.use-case';

export class ClubController {
  constructor(
    private readonly listClubs: ListClubsUseCase,
    private readonly getClub: GetClubUseCase,
  ) {}

  list = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const clubs = await this.listClubs.execute();
      res.json(clubs);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const clubId = req.params['clubId'];
      if (!clubId) {
        res.status(400).json({ error: 'clubId is required', code: 'VALIDATION_ERROR' });
        return;
      }
      const club = await this.getClub.execute(clubId);
      res.json(club);
    } catch (error) {
      next(error);
    }
  };
}
