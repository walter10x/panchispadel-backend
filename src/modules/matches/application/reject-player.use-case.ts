import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_PLAYER_REJECTED } from '../../websocket/domain/ws-events';
import type { MatchPlayerRejectedPayload } from '../../websocket/domain/ws-events';

export class RejectPlayerUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    matchId: string,
    creatorId: string,
    playerId: string,
    playerName: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new NotFoundError('Match no encontrado');
    }
    if (match.creatorId !== creatorId) {
      throw new ValidationError('Solo el creador puede rechazar jugadores');
    }

    match.rejectPlayer(playerId);
    await this.matchRepository.save(match);

    await this.notificationService.notifyPlayerRejected(
      matchId,
      playerId,
      playerName,
    );

    const rejectPayload: MatchPlayerRejectedPayload = {
      matchId,
      userId: playerId,
      userName: playerName,
    };
    this.wsGateway?.emitToUser(
      playerId,
      WS_EVENT_MATCH_PLAYER_REJECTED,
      rejectPayload,
    );

    return MatchMapper.toResponse(match);
  }
}
