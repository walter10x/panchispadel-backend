import { v4 as uuid } from 'uuid';
import { BaseEntity } from '../../../shared/domain/base.entity';
import { MatchScore } from './value-objects/match-score';

export interface CreateResultParams {
  matchId: string;
  registrarId: string;
  team1Score: number;
  team2Score: number;
}

export interface ReconstituteResultParams {
  id: string;
  matchId: string;
  team1Score: number;
  team2Score: number;
  confirmedBy: string[];
  createdAt: Date;
}

export class Result extends BaseEntity<string> {
  public readonly matchId: string;
  public readonly matchScore: MatchScore;
  private _confirmedBy: string[];

  private constructor(
    id: string,
    matchId: string,
    matchScore: MatchScore,
    confirmedBy: string[],
    createdAt: Date,
  ) {
    super(id, createdAt);
    this.matchId = matchId;
    this.matchScore = matchScore;
    this._confirmedBy = [...confirmedBy];
  }

  static create(params: CreateResultParams): Result {
    const matchScore = new MatchScore({
      team1Score: params.team1Score,
      team2Score: params.team2Score,
    });

    return new Result(
      uuid(),
      params.matchId,
      matchScore,
      [params.registrarId],
      new Date(),
    );
  }

  static reconstitute(params: ReconstituteResultParams): Result {
    const matchScore = new MatchScore({
      team1Score: params.team1Score,
      team2Score: params.team2Score,
    });

    return new Result(
      params.id,
      params.matchId,
      matchScore,
      [...params.confirmedBy],
      params.createdAt,
    );
  }

  get team1Score(): number {
    return this.matchScore.team1Score;
  }

  get team2Score(): number {
    return this.matchScore.team2Score;
  }

  get confirmedBy(): string[] {
    return [...this._confirmedBy];
  }

  confirm(playerId: string): void {
    if (this._confirmedBy.includes(playerId)) {
      return;
    }
    this._confirmedBy.push(playerId);
  }

  isConfirmedBy(playerId: string): boolean {
    return this._confirmedBy.includes(playerId);
  }

  get isFullyConfirmed(): boolean {
    return this._confirmedBy.length >= 2;
  }
}
