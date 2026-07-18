import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors';

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  if (req.user.role !== 'admin') {
    next(new ForbiddenError('Se requiere rol de administrador'));
    return;
  }

  next();
}
