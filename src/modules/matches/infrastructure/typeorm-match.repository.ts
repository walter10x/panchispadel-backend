import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { IMatchRepository } from '../domain/match.repository';
import { Match } from '../domain/match.entity';
import { MatchOrmEntity } from './match-orm.entity';
import { MatchMapper } from '../application/mappers/match.mapper';

export class TypeOrmMatchRepository implements IMatchRepository {
  constructor(
    private readonly ormRepository: Repository<MatchOrmEntity>,
  ) {}

  async save(match: Match): Promise<void> {
    const ormData = MatchMapper.toOrmEntity(match);
    await this.ormRepository.save(ormData as unknown as MatchOrmEntity);
  }

  async findById(id: string): Promise<Match | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    if (!orm) {
      return null;
    }
    return this.toDomain(orm);
  }

  async findByDateRange(from: Date, to: Date): Promise<Match[]> {
    const orms = await this.ormRepository.findBy({
      dateTime: Between(from, to),
    } as FindOptionsWhere<MatchOrmEntity>);
    return orms.map((o) => this.toDomain(o));
  }

  async findByPlayer(playerId: string): Promise<Match[]> {
    const orms = await this.ormRepository.find();
    return orms
      .filter((o) => {
        const players: Array<{ playerId: string }> = JSON.parse(o.players);
        return players.some((p) => p.playerId === playerId);
      })
      .map((o) => this.toDomain(o));
  }

  async findOpen(): Promise<Match[]> {
    const orms = await this.ormRepository.findBy({
      status: 'abierto',
    } as FindOptionsWhere<MatchOrmEntity>);
    return orms.map((o) => this.toDomain(o));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private toDomain(orm: MatchOrmEntity): Match {
    return MatchMapper.toDomain({
      id: orm.id,
      creatorId: orm.creatorId,
      creatorEmail: orm.creatorEmail,
      clubId: orm.clubId,
      dateTime: orm.dateTime,
      title: orm.title,
      durationMinutes: orm.durationMinutes,
      status: orm.status,
      maxPlayers: orm.maxPlayers,
      level: orm.level,
      players: orm.players,
      createdAt: orm.createdAt,
    });
  }
}
