import { Request, Response, NextFunction } from 'express';
import { RecordResultUseCase } from '../application/record-result.use-case';
import { ConfirmResultUseCase } from '../application/confirm-result.use-case';
import { GetResultUseCase } from '../application/get-result.use-case';
import { GetMatchResultUseCase } from '../application/get-match-result.use-case';
import { RecordResultDTO } from '../application/dtos/record-result.dto';
import { ConfirmResultDTO } from '../application/dtos/confirm-result.dto';
import {
  UnauthorizedError,
  ValidationError,
} from '../../../shared/domain/errors';

export class ResultController {
  constructor(
    private readonly recordResult: RecordResultUseCase,
    private readonly confirmResult: ConfirmResultUseCase,
    private readonly getResult: GetResultUseCase,
    private readonly getMatchResult: GetMatchResultUseCase,
  ) {}

  record = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const dto: RecordResultDTO = req.body;
      const result = await this.recordResult.execute(dto, req.user.userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirm = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const resultId = req.params['resultId'];
      if (!resultId) {
        next(new ValidationError('resultId is required'));
        return;
      }

      const dto: ConfirmResultDTO = { resultId };
      const result = await this.confirmResult.execute(dto, req.user.userId);
      res.status(200).json(result);
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
      const resultId = req.params['resultId'];
      if (!resultId) {
        next(new ValidationError('resultId is required'));
        return;
      }

      const result = await this.getResult.execute(resultId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getByMatch = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const matchId = req.params['matchId'];
      if (!matchId) {
        next(new ValidationError('matchId is required'));
        return;
      }

      const result = await this.getMatchResult.execute(matchId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
