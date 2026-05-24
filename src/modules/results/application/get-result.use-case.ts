import { IResultRepository } from '../domain/result.repository';
import { resultToResponse } from './mappers/result.mapper';
import { NotFoundError } from '../../../shared/domain/errors';
import { ResultResponseDTO } from './dtos/result-response.dto';

export class GetResultUseCase {
  constructor(private readonly repository: IResultRepository) {}

  async execute(resultId: string): Promise<ResultResponseDTO> {
    const result = await this.repository.findById(resultId);
    if (!result) {
      throw new NotFoundError('Result not found');
    }

    return resultToResponse(result);
  }
}
