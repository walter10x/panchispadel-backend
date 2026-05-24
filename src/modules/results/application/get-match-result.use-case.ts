import { IResultRepository } from '../domain/result.repository';
import { resultToResponse } from './mappers/result.mapper';
import { NotFoundError } from '../../../shared/domain/errors';
import { ResultResponseDTO } from './dtos/result-response.dto';

export class GetMatchResultUseCase {
  constructor(private readonly repository: IResultRepository) {}

  async execute(matchId: string): Promise<ResultResponseDTO> {
    const result = await this.repository.findByMatch(matchId);
    if (!result) {
      throw new NotFoundError('Result not found for this match');
    }

    return resultToResponse(result);
  }
}
