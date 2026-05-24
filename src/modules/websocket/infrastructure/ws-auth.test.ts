import jwt from 'jsonwebtoken';
import { verifyWsToken } from './ws-auth';

const TEST_SECRET = 'test-access-secret-12345';

function signToken(payload: Record<string, unknown>, options?: jwt.SignOptions): string {
  return jwt.sign(payload, TEST_SECRET, { ...options });
}

describe('verifyWsToken', () => {
  it('returns userId and email for a valid JWT', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' });
    const result = verifyWsToken(token);

    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user-1');
    expect(result!.email).toBe('test@example.com');
  });

  it('returns null when no token is provided', () => {
    expect(verifyWsToken(undefined)).toBeNull();
  });

  it('returns null when token is empty string', () => {
    expect(verifyWsToken('')).toBeNull();
  });

  it('returns null when token is malformed', () => {
    expect(verifyWsToken('not-a-valid-token')).toBeNull();
  });

  it('returns null when token payload is missing userId', () => {
    const token = signToken({ email: 'test@example.com' });
    expect(verifyWsToken(token)).toBeNull();
  });

  it('returns null when token payload is missing email', () => {
    const token = signToken({ userId: 'user-1' });
    expect(verifyWsToken(token)).toBeNull();
  });

  it('returns null for an expired token', () => {
    const token = signToken({ userId: 'user-1', email: 'test@example.com' }, { expiresIn: '0s' });
    // Wait a bit to ensure expiration
    expect(verifyWsToken(token)).toBeNull();
  });

  it('returns null when JWT_ACCESS_SECRET does not match', () => {
    const token = jwt.sign(
      { userId: 'user-1', email: 'test@example.com' },
      'different-secret',
    );
    expect(verifyWsToken(token)).toBeNull();
  });
});
