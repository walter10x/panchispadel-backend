import { Repository } from 'typeorm';
import { ClubOrmEntity } from './club-orm.entity';
import { Club } from '../domain/club.entity';
import { IClubRepository } from '../domain/club.repository';

export class TypeOrmClubRepository implements IClubRepository {
  constructor(private readonly ormRepo: Repository<ClubOrmEntity>) {}

  async save(club: Club): Promise<void> {
    const orm = this.toOrm(club);
    await this.ormRepo.save(orm);
  }

  async findById(id: string): Promise<Club | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Club[]> {
    const orms = await this.ormRepo.find();
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByName(name: string): Promise<Club | null> {
    const orm = await this.ormRepo.findOne({ where: { name } });
    return orm ? this.toDomain(orm) : null;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toDomain(orm: ClubOrmEntity): Club {
    return Club.reconstitute({
      id: orm.id,
      name: orm.name,
      address: orm.address,
      courtsCount: orm.courtsCount,
      createdAt: orm.createdAt,
      ...(orm.phone ? { phone: orm.phone } : {}),
      ...(orm.latitude !== null ? { latitude: orm.latitude } : {}),
      ...(orm.longitude !== null ? { longitude: orm.longitude } : {}),
    });
  }

  private toOrm(club: Club): ClubOrmEntity {
    const orm = new ClubOrmEntity();
    orm.id = club.id;
    orm.name = club.name;
    orm.address = club.address;
    orm.phone = club.phone ?? null;
    orm.courtsCount = club.courtsCount;
    orm.latitude = club.latitude ?? null;
    orm.longitude = club.longitude ?? null;
    return orm;
  }
}
