import { Request, Response, NextFunction } from 'express';
import { CreateClubUseCase } from '../../clubs/application/create-club.use-case';
import { UpdateClubUseCase } from '../../clubs/application/update-club.use-case';
import { DeleteClubUseCase } from '../../clubs/application/delete-club.use-case';
import { ListUsersUseCase } from '../../users/application/list-users.use-case';
import { UpdateUserRoleUseCase } from '../../users/application/update-user-role.use-case';
import { CreateClubDTO } from '../../clubs/application/dtos/create-club.dto';
import { UpdateClubDTO } from '../../clubs/application/dtos/update-club.dto';

export class AdminController {
  constructor(
    private readonly createClubUseCase: CreateClubUseCase,
    private readonly updateClubUseCase: UpdateClubUseCase,
    private readonly deleteClubUseCase: DeleteClubUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
  ) {}

  createClub = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: CreateClubDTO = {
        name: req.body['name'],
        address: req.body['address'],
        courtsCount: req.body['courtsCount'],
      };
      if (req.body['phone'] !== undefined) dto.phone = req.body['phone'];
      if (req.body['latitude'] !== undefined) dto.latitude = req.body['latitude'];
      if (req.body['longitude'] !== undefined) {
        dto.longitude = req.body['longitude'];
      }

      const result = await this.createClubUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateClub = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto: UpdateClubDTO = { clubId: req.params['clubId']! };
      if (req.body['name'] !== undefined) dto.name = req.body['name'];
      if (req.body['address'] !== undefined) dto.address = req.body['address'];
      if (req.body['phone'] !== undefined) dto.phone = req.body['phone'];
      if (req.body['courtsCount'] !== undefined) {
        dto.courtsCount = req.body['courtsCount'];
      }
      if (req.body['latitude'] !== undefined) dto.latitude = req.body['latitude'];
      if (req.body['longitude'] !== undefined) {
        dto.longitude = req.body['longitude'];
      }

      const result = await this.updateClubUseCase.execute(dto);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteClub = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.deleteClubUseCase.execute(req.params['clubId']!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.updateUserRoleUseCase.execute({
        userId: req.params['userId']!,
        role: req.body['role'],
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
