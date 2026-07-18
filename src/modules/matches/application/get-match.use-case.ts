import { IMatchRepository } from '../domain/match.repository';
import { NotFoundError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { MatchResponseDTO } from './dtos/match-response.dto';

export class GetMatchUseCase {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async execute(matchId: string): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundError('Partido no encontrado');
    }

    return MatchMapper.toResponse(match);
  }
}
