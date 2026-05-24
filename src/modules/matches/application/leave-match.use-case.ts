import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { NotFoundError } from '../../../shared/domain/errors';
import { MatchMapper } from './mappers/match.mapper';
import { LeaveMatchDTO } from './dtos/leave-match.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_PLAYER_LEFT } from '../../websocket/domain/ws-events';
import type { MatchPlayerLeftPayload } from '../../websocket/domain/ws-events';

export class LeaveMatchUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: LeaveMatchDTO,
    playerId: string,
    playerName: string,
  ): Promise<MatchResponseDTO> {
    const match = await this.matchRepository.findById(dto.matchId);

    if (!match) {
      throw new NotFoundError('Match no encontrado');
    }

    match.leave(playerId);
    await this.matchRepository.save(match);

    if (match.creatorId !== playerId) {
      await this.notificationService.notifyPlayerLeft(
        match.id,
        match.creatorId,
        playerName,
      );
    }

    const leftPayload: MatchPlayerLeftPayload = {
      matchId: match.id,
      userId: playerId,
      userName: playerName,
      playersCount: match.players.length,
    };
    this.wsGateway?.emitToMatch(
      match.id,
      WS_EVENT_MATCH_PLAYER_LEFT,
      leftPayload,
    );

    return MatchMapper.toResponse(match);
  }
}
