import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { NotFoundError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { JoinMatchDTO } from './dtos/join-match.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_PLAYER_JOINED } from '../../websocket/domain/ws-events';
import type { MatchPlayerJoinedPayload } from '../../websocket/domain/ws-events';

export class JoinMatchUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: JoinMatchDTO,
    playerId: string,
    playerName: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(dto.matchId);

    if (!match) {
      throw new NotFoundError('Match no encontrado');
    }

    const wasFull = match.isFull;
    match.join(playerId, playerName);
    await this.matchRepository.save(match);

    if (match.creatorId !== playerId) {
      await this.notificationService.notifyPlayerJoined(
        match.id,
        match.creatorId,
        playerName,
        playerId,
      );
    }

    if (!wasFull && match.isFull) {
      await this.notificationService.notifyMatchFull(
        match.id,
        match.creatorId,
      );
    }

    const joinPayload: MatchPlayerJoinedPayload = {
      matchId: match.id,
      userId: playerId,
      userName: playerName,
      playersCount: match.players.length,
      maxPlayers: match.maxPlayers,
    };
    this.wsGateway?.emitToUser(
      match.creatorId,
      WS_EVENT_MATCH_PLAYER_JOINED,
      joinPayload,
    );

    return MatchMapper.toResponse(match);
  }
}
