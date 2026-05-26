import { Request, Response, NextFunction } from 'express';
import { CreateMatchUseCase } from '../application/create-match.use-case';
import { JoinMatchUseCase } from '../application/join-match.use-case';
import { LeaveMatchUseCase } from '../application/leave-match.use-case';
import { CancelMatchUseCase } from '../application/cancel-match.use-case';
import { ListMatchesUseCase } from '../application/list-matches.use-case';
import { ConfirmPlayerUseCase } from '../application/confirm-player.use-case';
import { RejectPlayerUseCase } from '../application/reject-player.use-case';
import { CreateMatchDTO } from '../application/dtos/create-match.dto';
import { ListMatchesDTO } from '../application/dtos/list-matches.dto';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { MatchMapper } from '../application/mappers/match.mapper';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';

export class MatchController {
  constructor(
    private readonly createMatchUseCase: CreateMatchUseCase,
    private readonly joinMatchUseCase: JoinMatchUseCase,
    private readonly leaveMatchUseCase: LeaveMatchUseCase,
    private readonly cancelMatchUseCase: CancelMatchUseCase,
    private readonly listMatchesUseCase: ListMatchesUseCase,
    private readonly confirmPlayerUseCase: ConfirmPlayerUseCase,
    private readonly rejectPlayerUseCase: RejectPlayerUseCase,
    private readonly matchRepository: IMatchRepository,
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
        req.user!.email,
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
        req.user!.email,
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

      const rawStatus: string | undefined = req.query['status'] as string | undefined;
      if (rawStatus !== undefined) {
        filters.status = rawStatus;
      }

      const rawClubId: string | undefined = req.query['clubId'] as string | undefined;
      if (rawClubId !== undefined) {
        filters.clubId = rawClubId;
      }

      const rawDateFrom: string | undefined = req.query['dateFrom'] as string | undefined;
      if (rawDateFrom !== undefined) {
        filters.dateFrom = new Date(rawDateFrom);
      }

      const rawDateTo: string | undefined = req.query['dateTo'] as string | undefined;
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
      const match = await this.matchRepository.findById(req.params['matchId']!);
      if (!match) {
        throw new NotFoundError('Partido no encontrado');
      }
      res.json(MatchMapper.toResponse(match));
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
      const match = await this.matchRepository.findById(req.params['matchId']!);
      if (!match) {
        throw new NotFoundError('Partido no encontrado');
      }
      if (match.creatorId !== req.user!.userId) {
        throw new ValidationError('Solo el creador puede eliminar el partido');
      }
      await this.matchRepository.delete(req.params['matchId']!);
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
      const match = await this.matchRepository.findById(req.params['matchId']!);
      if (!match) {
        throw new NotFoundError('Partido no encontrado');
      }
      if (match.creatorId !== req.user!.userId) {
        throw new ValidationError('Solo el creador puede editar el partido');
      }

      const updated = Match.reconstitute({
        id: match.id,
        creatorId: match.creatorId,
        creatorEmail: match.creatorEmail,
        clubId: req.body['clubId'] ?? match.clubId,
        dateTime: req.body['dateTime'] ?? match.dateTime,
        title: req.body['title'] ?? match.title,
        durationMinutes: req.body['durationMinutes'] ?? match.durationMinutes,
        status: match.status,
        maxPlayers: req.body['maxPlayers'] ?? match.maxPlayers,
        level: req.body['level'] ?? match.level,
        players: [...match.players],
        createdAt: match.createdAt,
      });

      await this.matchRepository.save(updated);
      res.json(MatchMapper.toResponse(updated));
    } catch (error) {
      next(error);
    }
  };
}
