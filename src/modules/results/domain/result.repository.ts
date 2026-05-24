import { Result } from './result.entity';

export interface IResultRepository {
  save(result: Result): Promise<Result>;
  findById(id: string): Promise<Result | null>;
  findByMatch(matchId: string): Promise<Result | null>;
  findByPlayer(playerId: string): Promise<Result[]>;
  findAll(): Promise<Result[]>;
}
