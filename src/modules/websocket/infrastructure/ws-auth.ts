import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../../shared/infrastructure/http/auth-middleware';
import { env } from '../../../config/env';

export interface WsAuthResult {
  userId: string;
  email: string;
}

/**
 * Validates a JWT access token from a WebSocket connection handshake.
 * Returns the decoded payload on success, or null if invalid/expired.
 */
export function verifyWsToken(token: string | undefined): WsAuthResult | null {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    if (!payload.userId || !payload.email) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
