import { Request, Response, NextFunction } from 'express';
import { requireAdmin } from './require-admin.middleware';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors';

describe('requireAdmin', () => {
  function run(user?: { userId: string; email: string; name: string; role: string }) {
    const req = { user } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    requireAdmin(req, res, next);
    return next;
  }

  it('pasa si el usuario es admin', () => {
    const next = run({
      userId: '1',
      email: 'a@test.com',
      name: 'Admin',
      role: 'admin',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('lanza UnauthorizedError si no hay usuario', () => {
    const next = run(undefined);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('lanza ForbiddenError si el rol no es admin', () => {
    const next = run({
      userId: '1',
      email: 'p@test.com',
      name: 'Player',
      role: 'player',
    });
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
