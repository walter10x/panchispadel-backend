import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { NotFoundError, ValidationError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_PLAYER_CONFIRMED } from '../../websocket/domain/ws-events';
import type { MatchPlayerConfirmedPayload } from '../../websocket/domain/ws-events';

export class ConfirmPlayerUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    matchId: string,
    creatorId: string,
    playerId: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new NotFoundError('Match no encontrado');
    }
    if (match.creatorId !== creatorId) {
      throw new ValidationError('Solo el creador puede confirmar jugadores');
    }

    const player = match.players.find((p) => p.playerId === playerId);
    const playerName = player?.email ?? playerId;

    match.confirmPlayer(playerId);
    await this.matchRepository.save(match);

    const otherPlayerIds = match.players
      .filter((p) => p.status === 'confirmado' && p.playerId !== playerId)
      .map((p) => p.playerId);

    await this.notificationService.notifyPlayerConfirmed(
      matchId,
      playerId,
      playerName,
      otherPlayerIds,
    );

    const confirmPayload: MatchPlayerConfirmedPayload = {
      matchId,
      userId: playerId,
      userName: playerName,
    };
    this.wsGateway?.emitToUser(
      playerId,
      WS_EVENT_MATCH_PLAYER_CONFIRMED,
      confirmPayload,
    );
    this.wsGateway?.emitToMatch(
      matchId,
      WS_EVENT_MATCH_PLAYER_CONFIRMED,
      confirmPayload,
    );

    return MatchMapper.toResponse(match);
  }
}
