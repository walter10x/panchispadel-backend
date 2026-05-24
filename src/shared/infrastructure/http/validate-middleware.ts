import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../domain/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        );
        next(new ValidationError(messages.join('; ')));
        return;
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        );
        next(new ValidationError(messages.join('; ')));
        return;
      }
      next(error);
    }
  };
}
