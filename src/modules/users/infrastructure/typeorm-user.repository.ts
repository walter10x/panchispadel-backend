import { Repository } from 'typeorm';
import { IUserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';
import { UserOrmEntity } from './user-orm.entity';
import { UserMapper } from '../application/mappers/user.mapper';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(private readonly repo: Repository<UserOrmEntity>) {}

  async save(user: User): Promise<void> {
    const orm = UserMapper.toOrmEntity(user);
    await this.repo.save(orm);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    if (orm === null) {
      return null;
    }
    return UserMapper.toDomain(orm);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    if (orm === null) {
      return null;
    }
    return UserMapper.toDomain(orm);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map((e) => UserMapper.toDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
