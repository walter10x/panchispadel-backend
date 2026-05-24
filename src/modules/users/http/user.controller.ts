import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../application/register-user.use-case';
import { LoginUserUseCase } from '../application/login-user.use-case';
import { GetUserUseCase } from '../application/get-user.use-case';
import { RefreshTokenUseCase } from '../application/refresh-token.use-case';
import { UnauthorizedError } from '../../../shared/domain/errors';

export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.refreshTokenUseCase.execute(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (userId === undefined) {
        next(new UnauthorizedError('Not authenticated'));
        return;
      }
      const result = await this.getUserUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
