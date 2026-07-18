import rateLimit, { type Options } from 'express-rate-limit';
import type { RequestHandler } from 'express';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 10;

export interface AuthRateLimiterOptions {
  windowMs?: number;
  max?: number;
}

/**
 * Rate limiter para endpoints de autenticación (login / register).
 * Default: 10 intentos por IP cada 15 minutos.
 */
export function createAuthRateLimiter(
  options: AuthRateLimiterOptions = {},
): RequestHandler {
  const config: Partial<Options> = {
    windowMs: options.windowMs ?? DEFAULT_WINDOW_MS,
    max: options.max ?? DEFAULT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Demasiados intentos. Inténtalo de nuevo más tarde.',
      code: 'RATE_LIMIT',
    },
    statusCode: 429,
  };

  return rateLimit(config);
}

export const authRateLimiter = createAuthRateLimiter();
