import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors';
import { env } from '../../../config/env';

interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    const statusCode = getStatusCode(err.code);
    const body: ErrorResponse = {
      error: err.message,
      code: err.code,
    };
    res.status(statusCode).json(body);
    return;
  }

  console.error('Unhandled error:', err);

  const body: ErrorResponse = {
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  };
  res.status(500).json(body);
}

function getStatusCode(code: string): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    default:
      return 500;
  }
}
