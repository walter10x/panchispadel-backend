import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../domain/user.repository';
import { LoginUserDTO } from './dtos/login-user.dto';
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

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: LoginUserDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (user === null) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const email = user.email.toString();
    const payload = {
      userId: user.id,
      email,
      name: user.name,
      role: user.role.toString(),
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: parseSeconds(env.JWT_ACCESS_EXPIRES_IN),
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: parseSeconds(env.JWT_REFRESH_EXPIRES_IN),
    });

    return {
      user: UserMapper.toResponse(user),
      accessToken,
      refreshToken,
    };
  }
}
