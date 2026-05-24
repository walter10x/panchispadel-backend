import { IResultRepository } from '../domain/result.repository';
import { ConfirmResultDTO } from './dtos/confirm-result.dto';
import { resultToResponse } from './mappers/result.mapper';
import { NotFoundError } from '../../../shared/domain/errors';
import { ResultResponseDTO } from './dtos/result-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_RESULT_CONFIRMED } from '../../websocket/domain/ws-events';
import type { ResultConfirmedPayload } from '../../websocket/domain/ws-events';

export class ConfirmResultUseCase {
  constructor(
    private readonly repository: IResultRepository,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: ConfirmResultDTO,
    playerId: string,
  ): Promise<ResultResponseDTO> {
    const result = await this.repository.findById(dto.resultId);
    if (!result) {
      throw new NotFoundError('Result not found');
    }

    result.confirm(playerId);
    const saved = await this.repository.save(result);
    const response = resultToResponse(saved);

    const confirmedPayload: ResultConfirmedPayload = {
      matchId: saved.matchId,
      resultId: saved.id,
    };
    this.wsGateway?.emitToMatch(
      saved.matchId,
      WS_EVENT_RESULT_CONFIRMED,
      confirmedPayload,
    );

    return response;
  }
}
