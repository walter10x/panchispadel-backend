import { Match } from './match.entity';

export interface IMatchRepository {
  save(match: Match): Promise<void>;
  findById(id: string): Promise<Match | null>;
  findByDateRange(from: Date, to: Date): Promise<Match[]>;
  findByPlayer(playerId: string): Promise<Match[]>;
  findOpen(): Promise<Match[]>;
  delete(id: string): Promise<void>;
}
