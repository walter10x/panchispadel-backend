import { ValidationError } from '../../../../shared/domain/errors';

interface MatchScoreParams {
  team1Score: number;
  team2Score: number;
}

export class MatchScore {
  public readonly team1Score: number;
  public readonly team2Score: number;

  constructor(params: MatchScoreParams) {
    this.team1Score = params.team1Score;
    this.team2Score = params.team2Score;
    this.validate();
  }

  private validate(): void {
    if (this.team1Score < 0 || this.team2Score < 0) {
      throw new ValidationError('Scores must be greater than or equal to 0');
    }
    if (this.team1Score === this.team2Score) {
      throw new ValidationError(
        'Scores cannot be equal - there are no ties in pádel',
      );
    }
  }

  public equals(other: MatchScore): boolean {
    if (!(other instanceof MatchScore)) {
      return false;
    }
    return (
      this.team1Score === other.team1Score &&
      this.team2Score === other.team2Score
    );
  }

  public toString(): string {
    return `${this.team1Score}-${this.team2Score}`;
  }
}
