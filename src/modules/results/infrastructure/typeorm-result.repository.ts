import { Repository } from 'typeorm';
import { IResultRepository } from '../domain/result.repository';
import { Result } from '../domain/result.entity';
import { ResultOrmEntity } from './result-orm.entity';

export class TypeOrmResultRepository implements IResultRepository {
  constructor(private readonly repo: Repository<ResultOrmEntity>) {}

  async save(result: Result): Promise<Result> {
    const orm = this.toOrm(result);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Result | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByMatch(matchId: string): Promise<Result | null> {
    const orm = await this.repo.findOne({ where: { matchId } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByPlayer(playerId: string): Promise<Result[]> {
    const orms = await this.repo.find();
    return orms
      .filter((o): o is ResultOrmEntity =>
        o.confirmedBy.includes(playerId),
      )
      .map((o) => this.toDomain(o));
  }

  async findAll(): Promise<Result[]> {
    const orms = await this.repo.find();
    return orms.map((o) => this.toDomain(o));
  }

  private toOrm(result: Result): ResultOrmEntity {
    const orm = new ResultOrmEntity();
    orm.id = result.id;
    orm.matchId = result.matchId;
    orm.team1Score = result.team1Score;
    orm.team2Score = result.team2Score;
    orm.confirmedBy = result.confirmedBy;
    orm.createdAt = result.createdAt;
    return orm;
  }

  private toDomain(orm: ResultOrmEntity): Result {
    return Result.reconstitute({
      id: orm.id,
      matchId: orm.matchId,
      team1Score: orm.team1Score,
      team2Score: orm.team2Score,
      confirmedBy: orm.confirmedBy,
      createdAt: orm.createdAt,
    });
  }
}
