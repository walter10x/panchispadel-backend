import { IMatchRepository } from '../domain/match.repository';
import { INotificationService } from '../domain/notification-service';
import { Match } from '../domain/match.entity';
import { MatchMapper } from './mappers/match.mapper';
import { CreateMatchDTO } from './dtos/create-match.dto';
import { MatchResponseDTO } from './dtos/match-response.dto';
import type { IWsGateway } from '../../websocket/domain/ws-gateway';
import { WS_EVENT_MATCH_CREATED } from '../../websocket/domain/ws-events';
import type { MatchCreatedPayload } from '../../websocket/domain/ws-events';

export class CreateMatchUseCase {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly notificationService: INotificationService,
    private readonly wsGateway?: IWsGateway,
  ) {}

  async execute(
    dto: CreateMatchDTO,
    creatorId: string,
    creatorEmail: string,
  ): Promise<MatchResponseDTO> {
    const match = Match.create({
      creatorId,
      creatorEmail,
      clubId: dto.clubId,
      dateTime: dto.dateTime,
      title: dto.title,
      durationMinutes: dto.durationMinutes ?? 90,
      maxPlayers: dto.maxPlayers ?? 4,
      ...(dto.level !== undefined && { level: dto.level }),
    });

    await this.matchRepository.save(match);

    await this.notificationService.notifyMatchCreated(match.id, creatorId);

    const payload: MatchCreatedPayload = {
      matchId: match.id,
      creatorId,
      date: match.dateTime.toISOString(),
      clubId: dto.clubId,
    };
    this.wsGateway?.broadcast(WS_EVENT_MATCH_CREATED, payload);

    return MatchMapper.toResponse(match);
  }
}
