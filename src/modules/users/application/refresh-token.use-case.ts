import jwt from 'jsonwebtoken';
import { IUserRepository } from '../domain/user.repository';
import { AuthResponseDTO } from './dtos/auth-response.dto';
import { UserMapper } from './mappers/user.mapper';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { env } from '../../../config/env';

function parseSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const num = parseInt(match[1]!, 10);
  const unit = match[2]!;
  const multipliers: Record<string, number> = {
    s: 1, m: 60, h: 3600, d: 86400,
  };
  return num * (multipliers[unit] ?? 1);
}

export class RefreshTokenUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        name?: string;
      };

      const user = await this.userRepository.findById(payload.userId);
      if (user === null) {
        throw new UnauthorizedError('User not found');
      }

      const email = user.email.toString();
      const name = (payload as Record<string, unknown>).name ?? user.name;
      const newPayload = { userId: user.id, email, name: name as string };

      const newAccessToken = jwt.sign(newPayload, env.JWT_ACCESS_SECRET, {
        expiresIn: parseSeconds(env.JWT_ACCESS_EXPIRES_IN),
      });

      const newRefreshToken = jwt.sign(newPayload, env.JWT_REFRESH_SECRET, {
        expiresIn: parseSeconds(env.JWT_REFRESH_EXPIRES_IN),
      });

      return {
        user: UserMapper.toResponse(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
