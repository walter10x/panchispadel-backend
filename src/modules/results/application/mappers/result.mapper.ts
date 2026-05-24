import { Result } from '../../domain/result.entity';
import { ResultResponseDTO } from '../dtos/result-response.dto';

export function resultToResponse(result: Result): ResultResponseDTO {
  return {
    id: result.id,
    matchId: result.matchId,
    team1Score: result.team1Score,
    team2Score: result.team2Score,
    confirmedBy: result.confirmedBy,
    isFullyConfirmed: result.isFullyConfirmed,
    createdAt: result.createdAt,
  };
}
