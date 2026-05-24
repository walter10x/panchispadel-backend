import { IResultRepository } from '../domain/result.repository';
import { Result } from '../domain/result.entity';
import { RecordResultDTO } from './dtos/record-result.dto';
import { resultToResponse } from './mappers/result.mapper';
import { ConflictError } from '../../../shared/domain/errors';
import { ResultResponseDTO } from './dtos/result-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_RESULT_PENDING } from '../../websocket/domain/ws-events';
import type { ResultPendingPayload } from '../../websocket/domain/ws-events';

export class RecordResultUseCase {
  constructor(
    private readonly repository: IResultRepository,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: RecordResultDTO,
    registrarId: string,
  ): Promise<ResultResponseDTO> {
    const existing = await this.repository.findByMatch(dto.matchId);
    if (existing) {
      throw new ConflictError('A result already exists for this match');
    }

    const result = Result.create({
      matchId: dto.matchId,
      registrarId,
      team1Score: dto.team1Score,
      team2Score: dto.team2Score,
    });

    const saved = await this.repository.save(result);
    const response = resultToResponse(saved);

    const pendingPayload: ResultPendingPayload = {
      matchId: dto.matchId,
      resultId: saved.id,
      recordedBy: registrarId,
    };
    this.wsGateway?.emitToMatch(
      dto.matchId,
      WS_EVENT_RESULT_PENDING,
      pendingPayload,
    );

    return response;
  }
}
