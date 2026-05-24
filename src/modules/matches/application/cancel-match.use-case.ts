import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { NotFoundError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { CancelMatchDTO } from './dtos/cancel-match.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_CANCELLED } from '../../websocket/domain/ws-events';
import type { MatchCancelledPayload } from '../../websocket/domain/ws-events';

export class CancelMatchUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: CancelMatchDTO,
    playerId: string,
    creatorName: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(dto.matchId);

    if (!match) {
      throw new NotFoundError('Match no encontrado');
    }

    match.cancel(playerId);
    await this.matchRepository.save(match);

    const otherPlayerIds = match.players
      .map((p) => p.playerId)
      .filter((id) => id !== playerId);

    if (otherPlayerIds.length > 0) {
      await this.notificationService.notifyMatchCancelled(
        match.id,
        otherPlayerIds,
        creatorName,
      );
    }

    const cancelPayload: MatchCancelledPayload = { matchId: match.id };
    this.wsGateway?.emitToMatch(
      match.id,
      WS_EVENT_MATCH_CANCELLED,
      cancelPayload,
    );

    return MatchMapper.toResponse(match);
  }
}
