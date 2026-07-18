import { User } from '../../domain/user.entity';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { UserOrmEntity } from '../../infrastructure/user-orm.entity';

export class UserMapper {
  static toResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email.toString(),
      name: user.name,
      level: user.level.toString(),
      role: user.role.toString(),
      photoUrl: user.photoUrl,
      phone: user.phone,
      createdAt: user.createdAt,
    };
  }

  static toOrmEntity(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.email = user.email.toString();
    orm.passwordHash = user.passwordHash;
    orm.name = user.name;
    orm.level = user.level.toString();
    orm.role = user.role.toString();
    orm.photoUrl = user.photoUrl ?? null;
    orm.phone = user.phone ?? null;
    orm.createdAt = user.createdAt;
    return orm;
  }

  static toDomain(orm: UserOrmEntity): User {
    return User.reconstitute({
      id: orm.id,
      email: orm.email,
      passwordHash: orm.passwordHash,
      name: orm.name,
      level: orm.level,
      role: orm.role ?? 'player',
      photoUrl: orm.photoUrl ?? undefined,
      phone: orm.phone ?? undefined,
      createdAt: orm.createdAt,
    });
  }
}
