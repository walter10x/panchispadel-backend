import { Request, Response, NextFunction } from 'express';
import { CreateMatchUseCase } from '../application/create-match.use-case';
import { JoinMatchUseCase } from '../application/join-match.use-case';
import { LeaveMatchUseCase } from '../application/leave-match.use-case';
import { CancelMatchUseCase } from '../application/cancel-match.use-case';
import { ListMatchesUseCase } from '../application/list-matches.use-case';
import { ConfirmPlayerUseCase } from '../application/confirm-player.use-case';
import { RejectPlayerUseCase } from '../application/reject-player.use-case';
import { GetMatchUseCase } from '../application/get-match.use-case';
import { UpdateMatchUseCase } from '../application/update-match.use-case';
import { DeleteMatchUseCase } from '../application/delete-match.use-case';
import { CreateMatchDTO } from '../application/dtos/create-match.dto';
import { ListMatchesDTO } from '../application/dtos/list-matches.dto';
import { UpdateMatchDTO } from '../application/dtos/update-match.dto';

export class MatchController {
  constructor(
    private readonly createMatchUseCase: CreateMatchUseCase,
    private readonly joinMatchUseCase: JoinMatchUseCase,
    private readonly leaveMatchUseCase: LeaveMatchUseCase,
    private readonly cancelMatchUseCase: CancelMatchUseCase,
    private readonly listMatchesUseCase: ListMatchesUseCase,
    private readonly confirmPlayerUseCase: ConfirmPlayerUseCase,
    private readonly rejectPlayerUseCase: RejectPlayerUseCase,
    private readonly getMatchUseCase: GetMatchUseCase,
    private readonly updateMatchUseCase: UpdateMatchUseCase,
    private readonly deleteMatchUseCase: DeleteMatchUseCase,
  ) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreateMatchDTO = {
        clubId: req.body['clubId'],
        dateTime: req.body['dateTime'],
        title: req.body['title'],
        durationMinutes: req.body['durationMinutes'],
        maxPlayers: req.body['maxPlayers'],
        level: req.body['level'],
      };

      const result = await this.createMatchUseCase.execute(
        dto,
        req.user!.userId,
        req.user!.email,
        req.user!.name,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  join = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.joinMatchUseCase.execute(
        { matchId: req.params['matchId']! },
        req.user!.userId,
        req.user!.email,
        req.user!.name,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  leave = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.leaveMatchUseCase.execute(
        { matchId: req.params['matchId']! },
        req.user!.userId,
        req.user!.name,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.cancelMatchUseCase.execute(
        { matchId: req.params['matchId']! },
        req.user!.userId,
        req.user!.name,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  confirmPlayer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.confirmPlayerUseCase.execute(
        req.params['matchId']!,
        req.user!.userId,
        req.params['playerId']!,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  rejectPlayer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.rejectPlayerUseCase.execute(
        req.params['matchId']!,
        req.user!.userId,
        req.params['playerId']!,
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pageNum = Number(req.query['page']) || 1;
      const limitNum = Number(req.query['limit']) || 10;
      const filters: ListMatchesDTO['filters'] = {};

      const rawStatus: string | undefined = req.query['status'] as
        | string
        | undefined;
      if (rawStatus !== undefined) {
        filters.status = rawStatus;
      }

      const rawClubId: string | undefined = req.query['clubId'] as
        | string
        | undefined;
      if (rawClubId !== undefined) {
        filters.clubId = rawClubId;
      }

      const rawDateFrom: string | undefined = req.query['dateFrom'] as
        | string
        | undefined;
      if (rawDateFrom !== undefined) {
        filters.dateFrom = new Date(rawDateFrom);
      }

      const rawDateTo: string | undefined = req.query['dateTo'] as
        | string
        | undefined;
      if (rawDateTo !== undefined) {
        filters.dateTo = new Date(rawDateTo);
      }

      const hasFilters = Object.keys(filters).length > 0;

      const dto: ListMatchesDTO = { page: pageNum, limit: limitNum };
      if (hasFilters) {
        dto['filters'] = filters;
      }

      const result = await this.listMatchesUseCase.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  listMy = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pageNum = Number(req.query['page']) || 1;
      const limitNum = Number(req.query['limit']) || 10;

      const dto: ListMatchesDTO = {
        page: pageNum,
        limit: limitNum,
      };

      const result = await this.listMatchesUseCase.execute(dto);
      res.json(result);
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
      const result = await this.getMatchUseCase.execute(req.params['matchId']!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.deleteMatchUseCase.execute(
        req.params['matchId']!,
        req.user!.userId,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: UpdateMatchDTO = {
        matchId: req.params['matchId']!,
      };

      if (req.body['clubId'] !== undefined) {
        dto.clubId = req.body['clubId'];
      }
      if (req.body['dateTime'] !== undefined) {
        dto.dateTime = req.body['dateTime'];
      }
      if (req.body['title'] !== undefined) {
        dto.title = req.body['title'];
      }
      if (req.body['durationMinutes'] !== undefined) {
        dto.durationMinutes = req.body['durationMinutes'];
      }
      if (req.body['maxPlayers'] !== undefined) {
        dto.maxPlayers = req.body['maxPlayers'];
      }
      if (req.body['level'] !== undefined) {
        dto.level = req.body['level'];
      }

      const result = await this.updateMatchUseCase.execute(
        dto,
        req.user!.userId,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
